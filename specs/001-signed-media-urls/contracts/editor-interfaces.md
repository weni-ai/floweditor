# Editor Interfaces: Signed Media URLs

The TypeScript surface this feature adds or changes. Only the first section is a public contract of the npm package (Principle IV). The other sections are internal module boundaries, recorded so that the tasks and the reviewers share one shape. Entity rules are in [data-model.md](../data-model.md).

## 1. Public: host configuration (`src/flowTypes.ts`)

```ts
export interface Endpoints {
  // ...existing keys unchanged...
  media_urls?: string;
}
```

- **Version impact**: minor (3.6.5 → 3.7.0). The key is optional and backward compatible in both directions.
- **Read once at boot**: `window.showFlowEditor(ele, config)` in `src/main.jsx` calls `MediaUrlSigner.get().configure(config.endpoints.media_urls)` before `ReactDOM.render`.

## 2. Internal: HTTP adapter (`src/external/media.ts`)

```ts
export const SIGNING_TIMEOUT_MS = 10000;
export const SIGNING_CHUNK_SIZE = 20;

export type MediaSigningFailureReason =
  | 'timeout'
  | 'network'
  | 'http_error'
  | 'invalid_response'
  | 'popup_blocked';

export interface MediaSigningFailure {
  reason: MediaSigningFailureReason;
  status: number | null;
}

export type SignedMediaChunk =
  | {
      isSigned: true;
      requestedUrls: string[];
      signedUrls: Map<string, string>;
      expiresInSeconds: number;
    }
  | {
      isSigned: false;
      requestedUrls: string[];
      failure: MediaSigningFailure;
    };

/** Sends one POST per chunk of at most 20 URLs. Never rejects. */
export function getSignedMediaUrls(
  endpoint: string,
  urls: string[],
): Promise<SignedMediaChunk[]>;
```

The headers are `X-CSRFToken` (when the cookie exists, through `getCookie('csrftoken')`), `X-Requested-With: XMLHttpRequest` and `Content-Type: application/json`, with `timeout: SIGNING_TIMEOUT_MS`.

## 3. Internal: signing service (`src/services/MediaUrlSigner.ts`)

```ts
export type MediaSurface = 'sendmsg_download' | 'simulator' | 'say_msg_audio';

export interface ResolveOptions {
  surface: MediaSurface;
}

export interface MediaUrlResolution {
  url: string;
  failureReason: MediaSigningFailureReason | null;
}

export class MediaSigningError extends Error {
  constructor(reason: MediaSigningFailureReason);
}

export class MediaUrlSigner {
  static get(): MediaUrlSigner;

  /** Sets the endpoint and clears the cache. `undefined` or `''` disables signing. */
  configure(endpoint: string | undefined): void;

  /** Answers without a request when possible, otherwise returns null. */
  getResolvedUrl(url: string): string | null;

  resolve(url: string, options: ResolveOptions): Promise<string>;
  resolveWithOutcome(url: string, options: ResolveOptions): Promise<MediaUrlResolution>;
  resolveMany(urls: string[], options: ResolveOptions): Promise<string[]>;

  /** Reports a failure that happened outside a signing request, such as popup_blocked. */
  reportFailure(reason: MediaSigningFailureReason, surface: MediaSurface): void;
}
```

- **Singleton**: the service follows `FlowStore.get()` in `src/services/FlowStore.ts`. The spec's shorthand `MediaUrlSigner.configure(...)` refers to this instance.
- **Never rejects**: every returned promise resolves (AC-6).
- `resolveMany` preserves input order and length, duplicates included.

## 4. Internal: click-time opening (`src/utils/openSignedMedia.ts`)

```ts
export function openSignedMedia(
  url: string,
  options: ResolveOptions,
): Promise<void>;
```

It must be called synchronously from the click handler, before any `await` ([research.md R10](../research.md#r10-opensignedmedia-under-jsdom-and-in-browsers)). It never rejects, never navigates the editor's own window, and never shows a message.

## 5. Internal: render-time hook (`src/components/simulator/useSignedMediaUrl.ts`)

```ts
export interface SignedMediaUrlState {
  url: string | null;
  isLoading: boolean;
  error: MediaSigningFailureReason | null;
}

export function useSignedMediaUrl(url: string): SignedMediaUrlState;
```

## 6. Internal: components

```ts
// src/components/mediaplayer/MediaPlayer.tsx
export interface MediaPlayerProps {
  url: string;
  surface: MediaSurface; // new, required
  triggered?: boolean;
}

// src/components/simulator/SimulatorAttachment.tsx
export interface SimulatorAttachmentProps {
  attachment: string; // "<content type>:<url>", as in msg_created events
}
```

`SimulatorAttachment` renders the same cases as the current `renderAttachment` in `LogEvent.tsx`: audio, image, application, geo and video. It renders `null` for a string without `:` or with an unknown type.
