# Data Model: Signed Media URLs in the Flow Editor

**Feature**: `001-signed-media-urls` | **Date**: 2026-10-29 | **Spec**: [spec.md](./spec.md)

Nothing here is persisted. Every entity lives in browser memory for the life of the editor tab, and none of them enters the Redux store, the flow definition, `localStorage` or a revision (AC-4). Wire-format names are `snake_case` only in the adapter (Principle XIX).

## Configuration

### `Endpoints.media_urls` (in `src/flowTypes.ts`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `media_urls` | `string` | no | The path of the signing endpoint, for example `/flow/media_urls/<flow_uuid>/`. When it is absent or `''`, signing is disabled (AC-5). It is `snake_case` because it is part of the host contract, next to `ticketer_queues` and `whatsapp_flows`. |

## Service types (`src/services/MediaUrlSigner.ts`)

### `MediaSurface`

`'sendmsg_download' | 'simulator' | 'say_msg_audio'`. It identifies the caller in Sentry tags.

### `ResolveOptions`

| Field | Type | Notes |
|-------|------|-------|
| `surface` | `MediaSurface` | Required. It tags a report only when this call started the HTTP request. |

### `SignedUrlCacheEntry`

The value stored in the cache map, keyed by the **original** URL.

| Field | Type | Rule |
|-------|------|------|
| `signedUrl` | `string` | The URL Flows returned, which may equal the key when Flows declined to sign it. |
| `expiresAt` | `number` | Epoch milliseconds: `Date.now() + max(expiresInSeconds - 60, expiresInSeconds / 2) * 1000`. |

An entry is **fresh** while `Date.now() < expiresAt`. A stale entry is ignored and replaced on the next resolution. Nothing is cached when a request fails (AC-6).

### `MediaSigningFailureReason`

`'timeout' | 'network' | 'http_error' | 'invalid_response' | 'popup_blocked'`. The mapping from axios errors is in [research.md R4](./research.md#r4-axios-0212-request-and-error-semantics).

### `MediaUrlResolution`

| Field | Type | Rule |
|-------|------|------|
| `url` | `string` | Always usable: the signed URL, or the original on fallback. |
| `failureReason` | `MediaSigningFailureReason \| null` | `null` on success, cache hit, disabled signer or a URL that is not signable. When a URL is missing from a successful response, the reason is `invalid_response` and `url` is the original. |

### Service state

| Member | Type | Lifecycle |
|--------|------|-----------|
| endpoint | `string \| null` | Set by `configure()`. `null` means disabled. |
| cache | `Map<string, SignedUrlCacheEntry>` | Filled from successful chunks. `configure()` clears it. |
| in-flight | `Map<string, Promise<MediaUrlResolution>>` | One promise per URL that is queued or being sent. The entry is removed when its chunk settles. |
| queue | ordered set of URLs plus the `surface` of the first caller | Filled during one tick and drained by the microtask flush ([research.md R6](./research.md#r6-same-tick-batching)). |

**Per-URL states**: a URL is resolved by the first of these that applies.

```text
not signable ─────────────────────────────────▶ returned as is (no request)
disabled ─────────────────────────────────────▶ returned as is (no request)
cached + fresh ───────────────────────────────▶ cached signedUrl
in flight ────────────────────────────────────▶ joins the existing promise (no extra report)
otherwise ─▶ queued ─▶ sent ─┬─ chunk ok, URL present ─▶ cached, signedUrl returned
                              ├─ chunk ok, URL missing ─▶ original returned, invalid_response reported
                              └─ chunk failed ──────────▶ original returned, one report per chunk, nothing cached
```

**Signable URL**: a string that `new URL(value)`, with no base, parses and whose `protocol` is `http:` or `https:`. Everything else is returned unchanged: `geo:`, `data:`, `blob:`, relative paths, and unevaluated `@` expressions, which the constructor rejects. The editor does not check length (spec, Failure Handling).

## Adapter types (`src/external/media.ts`)

### `SigningRequestBody` (wire format)

```text
{ "urls": string[] }   // 1..20 items per request
```

### `SigningResponseBody` (wire format)

```text
{ "urls": { [originalUrl: string]: string }, "expires_in": number }
```

**Validation**: a 2xx response is valid only when all of these hold. Anything else is `invalid_response`.

- `urls` is a non-null object that is not an array, and every value in it is a string.
- `expires_in` is a finite number greater than 0.

### `SignedMediaChunk`

The adapter returns `Promise<SignedMediaChunk[]>`, one item per request sent, and never rejects.

| Variant | Fields |
|---------|--------|
| signed | `isSigned: true`, `requestedUrls: string[]`, `signedUrls: Map<string, string>`, `expiresInSeconds: number` |
| failed | `isSigned: false`, `requestedUrls: string[]`, `failure: { reason: MediaSigningFailureReason; status: number \| null }` |

`expires_in` becomes `expiresInSeconds` here and the raw body never leaves the adapter.

## Report shape (`MediaSigningError`)

| Part | Content |
|------|---------|
| `error.message` | `Media URL signing failed: <reason>`, with no URL in it. |
| `tags.feature` | `media-signing` |
| `tags.surface` | The `MediaSurface` of the caller that started the request, or the one passed to `openSignedMedia`. |
| `tags.reason` | A `MediaSigningFailureReason` value. |
| `extra.status` | The HTTP status of a failed request, or the 2xx status of a body that failed validation. Omitted for `network`, `timeout` and `popup_blocked`, and for URLs missing from a valid response, because the signed chunk carries no status. |
| `extra.urlCount` | The number of URLs in the failed chunk, or the number missing for `invalid_response`, or `1` for `popup_blocked`. |

**Never present**: an original URL, an object key, a file name, a signed URL, or the axios error object ([research.md R8](./research.md#r8-what-reaches-sentry)).

## Component state

### `useSignedMediaUrl(url)` result

The hook lives in `components/simulator/` and always resolves with `surface: 'simulator'`.

| Field | Type | Invariant |
|-------|------|-----------|
| `url` | `string \| null` | `null` only while `isLoading`. |
| `isLoading` | `boolean` | `true` from a URL change until its resolution settles. It is `false` on the first render when `getResolvedUrl` answers synchronously. |
| `error` | `MediaSigningFailureReason \| null` | Non-null only when `isLoading` is `false`. In that case `url` is the original. |

A result that arrives after the input `url` changed or the component unmounted is discarded.

### `MediaPlayer` additions

| Member | Kind | Rule |
|--------|------|------|
| `surface: MediaSurface` | required prop | `simulator` from `SimulatorAttachment`, `say_msg_audio` from `SayMsg`. |
| `isLoading` | state | `true` between the first toggle and the end of its resolution. While it is `true`, the icon is `hourglass_empty`, the root element has `aria-busy="true"` (the attribute is omitted otherwise), and toggles are ignored. It is never `true` together with `playing`. It is state rather than an instance flag so the UI reflects it (Principle XVIII). React 16 flushes the update at the end of each discrete event, so a second `mouseDown` already sees it. |
| `isUnmounted` | instance flag | Set in `componentWillUnmount`. A late resolution is then dropped. |
