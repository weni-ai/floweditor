# Engineering Specification: Signed Media URLs in the Flow Editor

**Repository**: weni-ai/floweditor (`@weni/flow-editor`) — frontend

**Feature Branch**: `001-signed-media-urls`

**Created**: 2026-10-28

**Status**: Draft

## Origin Without Product Spec

- Product Spec: none
- Problem: The buckets used by Flows and its services are now private, but the editor still loads and opens the canonical, unsigned S3 URLs it stores in the flow definition, so S3 answers `403 AccessDenied` and users cannot view, play or download media they uploaded or that appears in the simulator.
- Acceptance criteria:
  - AC-1: Clicking the download icon of an uploaded attachment in the Send Message form, and in its translation form, opens the file through a presigned URL obtained from Flows.
  - AC-2: Images and videos in simulator messages load through presigned URLs, simulator documents open through a presigned URL, and simulator audio plays through a presigned URL.
  - AC-3: The audio player on a Say Message card (IVR flows) plays the recording through a presigned URL.
  - AC-4: Flow definitions saved by the editor never contain a presigned URL. Attachment strings and `audio_url` keep the canonical URL returned by the upload endpoint.
  - AC-5: When the host does not configure the signing endpoint, the editor behaves exactly as it does today and uses the stored URLs as they are.
  - AC-6: When signing fails, the editor falls back to the original URL, reports the failure to Sentry without the URL or signature, and raises no unhandled promise rejection.
  - AC-7: Within the validity window, accessing the same media again reuses the signed URL already obtained instead of requesting a new one.

## Clarifications

### Session 2026-10-29

- Q: When a stored media URL is longer than 2048 characters, should the editor skip signing it on its own side instead of sending it to Flows? → A: No. The editor sends it anyway; when Flows answers `400`, the whole chunk falls back to the original URLs and the failure is reported.
- Q: When the browser's popup blocker stops the download tab from opening, should the user see a message in the editor? → A: No. The editor stays silent and only reports `popup_blocked` to Sentry. The claim that the user can click again is removed, because the blocker usually stops later clicks too.
- Q: How should the signing service know which surface to put in the Sentry `surface` tag when a request fails? → A: `resolve`, `resolveMany` and `openSignedMedia` take `{ surface }`. A failed request is reported once, tagged with the surface of the caller that started it. Callers that join an in-flight request don't add a tag.
- Q: How should images and videos in one simulator message be combined into a single signing request, given that the hook signs one URL at a time? → A: The service gathers every `resolve` call made in the same tick that needs a request into one call, split into chunks of 20. The hook keeps its single-URL signature.
- Q: Should the editor remove the signature from signed S3 URLs that Sentry records on its own, through Replay and tracing? → A: No. The spec's claim is narrowed to "the editor's own reports never contain URLs". Sentry's automatic recording of loaded media URLs is accepted and tracked under `TODO(SENTRY_SIGNED_URLS)`.

## Scope in This Repository

**This repository implements**:

- An HTTP adapter for a new Flows endpoint that turns canonical media URLs into presigned URLs.
- A stateful signing service that caches each signed URL until shortly before it expires, shares in-flight requests for the same URL, skips URLs that cannot be signed, and falls back to the original URL on failure.
- Use of that service at every editor surface that renders or opens stored media:
  - the Send Message attachments tab and the translation form that shares it;
  - the simulator, for image, video, audio and document attachments;
  - the Say Message card's audio player.
- A new optional configuration entry, `endpoints.media_urls`, in `FlowEditorConfig`.

**Out of scope here**:

- **The signing endpoint itself** is owned by `weni-ai/flows` and specified in that repository. This includes the endpoint's authorization, the org-ownership check on object keys, the presigning, and adding `media_urls` to the `endpoints` block in `templates/flows/flow_editor.haml`.
- **Signing at send time** in `weni-ai/mailroom`, `weni-ai/courier` and `weni-ai/gocommon` is already merged ([mailroom#404](https://github.com/weni-ai/mailroom/pull/404), [mailroom#403](https://github.com/weni-ai/mailroom/pull/403), [courier#243](https://github.com/weni-ai/courier/pull/243), [gocommon#2](https://github.com/weni-ai/gocommon/pull/2)). The Flows dashboard's message history is covered by [flows#899](https://github.com/weni-ai/flows/pull/899) and the `presign_attachment` call sites.
- **Surfaces that do not load media:** the WhatsApp Send Message form and its translation form show only the file name, and the Play Audio card shows `audio_url` as text. They need no change.
- **Changing the upload response:** `UploadMediaAction` keeps returning the canonical URL, which is correct because that URL is persisted.

**Depends on**: `weni-ai/flows` must expose the endpoint described in **Contracts → Signing endpoint** and inject its path as `endpoints.media_urls` in the editor config. Until it does, the editor keeps today's behavior (AC-5).

## Current State

- `src/components/flow/actions/sendmsg/attachments.tsx`: `renderUpload` renders the download icon and calls `window.open(attachment.url, '_blank')` on the URL it stored. `renderAttachments` is shared by `SendMsgForm.tsx` (line 621) and `localization/MsgLocalizationForm.tsx` (line 292). This change makes the click open a presigned URL.
- `src/components/flow/actions/sendmsg/helpers.ts`: this file serializes attachments as `"<mime>:<url>"` into the definition and parses them back. It does not change, and AC-4 depends on that.
- `src/components/simulator/LogEvent.tsx` (689 lines): `renderAttachment` parses `"<type>:<url>"` and renders four cases:
  - `<MediaPlayer url>` for audio;
  - `<img src={url}>` for images;
  - a clickable `<div>` that calls `window.open(url)` for documents;
  - `<video src={url}>` for videos.

  The URLs come from the `msg_created` events returned by `endpoints.simulateStart` and `endpoints.simulateResume`, which are proxied by Flows to mailroom's simulator and are not signed. This change moves attachment rendering into a new component that resolves signed URLs.
- `src/components/simulator/Simulator.tsx`: the sample media users can send (`IMAGE_A`, `AUDIO_A`, `VIDEO_A` and others) lives in the public `floweditor-assets.temba.io` bucket. Flows returns those URLs unchanged, so they keep working.
- `src/components/mediaplayer/MediaPlayer.tsx`: an `<audio preload="none" src={url}>` element. `handleTogglePlay` calls `ele.load()` and then `ele.play()`. It is used by `LogEvent.tsx` and by `flow/actions/saymsg/SayMsg.tsx`, where it plays `action.audio_url`. This change resolves the signed URL before the first `load()`.
- `src/components/flow/actions/saymsg/SayMsgForm.tsx` and `src/components/uploadbutton/UploadButton.tsx`: these upload the recording to `endpoints.attachments` and store `response.data.url` in `audio_url`. They do not change.
- `src/external/index.ts` (540 lines): the asset server calls. It sends CSRF using `getCookie('csrftoken')` and an `X-CSRFToken` header, and sets `axios.defaults.timeout = 30000`. The new adapter lives in its own module so this file does not grow.
- `src/flowTypes.ts`: the `Endpoints` and `FlowEditorConfig` interfaces. The optional `media_urls` key is added here.
- `src/main.jsx`: `window.showFlowEditor` initializes Sentry and the HTTP timeout from the config before rendering. The signing service is configured here as well.
- `src/utils/sentry.ts`: Sentry is set up with `browserTracingIntegration` (which propagates `sentry-trace` and `baggage` headers to same-origin requests), `httpClientIntegration` (which records 4xx and 5xx responses), and Replay. No `captureException` call exists yet.
- `src/vitest-setup.ts` and `src/test/config.ts`: msw handlers and the test editor config. These provide the boundary stubs.
- Flows backend, for reference only: `UploadMediaAction.save_media_upload` in `temba/flows/views.py` stores objects at `attachments/<org_id>/<flow_id>/steps/<uuid>/<name>` and returns `f"{STORAGE_URL}/{path}"`. `temba/utils/s3.presign_url` signs only buckets in `signable_buckets()`, with a default expiry of `S3_PRESIGNED_URL_EXPIRES = 3600` seconds. The existing `S3MediaProxyView` requires a Keycloak bearer token, so the editor cannot use it, because the editor authenticates with the Django session.

## Technical Approach

### Components Affected

| Component | Change | Why |
|-----------|--------|-----|
| `src/flowTypes.ts` | modified | Add the optional `media_urls?: string` to `Endpoints`. |
| `src/external/media.ts` | new | The HTTP adapter for the signing endpoint. It adds CSRF and `X-Requested-With`, sets an explicit timeout, and normalizes the response to `camelCase`. |
| `src/services/MediaUrlSigner.ts` | new | A stateful service for configuration, the expiry-aware cache, in-flight deduplication, same-tick batching of `resolve` calls, the signable-URL filter, the fallback, and Sentry reporting. |
| `src/components/simulator/useSignedMediaUrl.ts` | new | A hook for render-time signing that returns `{ url, isLoading, error }`. |
| `src/utils/openSignedMedia.ts` | new | Click-time opening. It opens a blank tab synchronously, clears `opener`, and navigates the tab to the signed URL, falling back to the original. |
| `src/main.jsx` | modified | Call `MediaUrlSigner.configure(config.endpoints.media_urls)` at boot. |
| `src/components/flow/actions/sendmsg/attachments.tsx` | modified | The download click calls `openSignedMedia(attachment.url, { surface: 'sendmsg_download' })`. |
| `src/components/simulator/SimulatorAttachment.tsx` | new | Attachment rendering moved out of `LogEvent.tsx`. It signs images and videos at render, opens documents on click, and leaves audio to `MediaPlayer`. |
| `src/components/simulator/LogEvent.tsx` | modified | Delegate to `SimulatorAttachment`. This also shrinks a file that is over the size limit. |
| `src/components/mediaplayer/MediaPlayer.tsx` | modified | Resolve the signed URL before the first `load()` and `play()`, then reuse the cached URL. A new required `surface` prop is passed to the service: `simulator` from `SimulatorAttachment`, `say_msg_audio` from `SayMsg.tsx`. |
| `src/components/flow/actions/saymsg/SayMsg.tsx` | modified | Pass `surface="say_msg_audio"` to `MediaPlayer`. `audio_url` is passed unchanged. |
| `WENI-CHANGELOG.md`, `package.json` | modified | Release 3.7.0 with a `### Fixed` entry. |

### Flow

1. **Boot.** Flows renders `flow_editor.haml` with `endpoints.media_urls = '/flow/media_urls/<flow_uuid>/'`. `window.showFlowEditor` calls `MediaUrlSigner.configure(endpoint)`. If the value is missing or empty, the service is disabled and `resolve(url, { surface })` returns `url`.
2. **Resolve request.** A surface calls `MediaUrlSigner.resolve(url, { surface })` or `resolveMany(urls, { surface })`, where `surface` is `sendmsg_download`, `simulator` or `say_msg_audio`. The service filters first:
   - It returns these unchanged without any HTTP call: anything that is not an absolute `http:` or `https:` URL, which covers `geo:`, `data:`, `blob:`, relative paths and unevaluated `@` expressions.
   - It returns a cached entry whose `expiresAt` is still in the future.
   - It reuses the pending promise when the same URL is already being signed.
   - Every remaining URL is queued. All `resolve` and `resolveMany` calls made in the same tick are combined, without duplicates, into one adapter call, which the adapter splits into chunks of 20. Several attachments that render together, including media from several messages in one simulator response, therefore cause one request. The batch's report surface is that of the first queued caller.
3. **Adapter call.** `getSignedMediaUrls(endpoint, urls)` in `src/external/media.ts` sends `POST {endpoint}` with the body `{"urls": [...]}` and these headers: `X-CSRFToken`, `X-Requested-With: XMLHttpRequest`, and `Content-Type: application/json`. It sets a 10 s timeout, splits batches into chunks of at most 20 URLs, and maps `expires_in` to `expiresInSeconds`.
4. **Cache.** Each returned pair is cached as `{ signedUrl, expiresAt }`, where `expiresAt = now + max(expiresInSeconds - 60, expiresInSeconds / 2)` seconds. The cache key is the original URL. URLs that Flows returned unchanged are cached the same way, so public media is not asked for again.
5. **Surface effect.** Signed URLs are only ever held in component state or the service cache. They are never written back through `onAttachmentChanged`, `onUploadChanged` or any store mutator (AC-4).
   - **Send Message download:** `openSignedMedia(url, { surface })` calls `const tab = window.open('', '_blank')` synchronously inside the click handler, sets `tab.opener = null`, awaits `resolve`, then sets `tab.location.href`. If `window.open` returns `null` because a popup blocker stopped it, the function reports `popup_blocked` and does nothing else. It never navigates the editor's own window away from unsaved work.
   - **Simulator image and video:** `useSignedMediaUrl(url)` renders an empty placeholder while `isLoading` is true, then the element with the signed `src`. On `error`, it renders the original URL.
   - **Simulator document:** a `<button type="button">` calls `openSignedMedia(url, { surface: 'simulator' })`.
   - **Audio (simulator and Say Message):** on the first `handleTogglePlay`, `MediaPlayer` awaits `resolve(this.props.url, { surface: this.props.surface })`, assigns `ele.src`, then calls `load()` and `play()`. It guards against a second toggle while resolving. When `props.url` changes, it clears the resolved URL.
6. **Failure.** When the adapter rejects, every waiting caller receives the original URL. Nothing is cached, so the next access retries. `MediaUrlSigner` calls `Sentry.captureException` once per failed request, tagged with the surface of the caller that started it, as described under **Observability**.

### Rejected Alternatives

- **Reuse `S3MediaProxyView` (`/api/v2/internals/media/download/...`):** it authenticates with a Keycloak bearer token, which the editor does not have, because it runs on the Django session. Accepting session auth there would mix two trust models in one internal API, and the editor would have to reconstruct object keys and the `project_uuid` itself.
- **Presign inside existing Flows responses** (the upload response and simulator events): this does not cover URLs already persisted in flow definitions or Say Message recordings, so an endpoint is needed anyway. It would also risk persisting signed URLs that expire, through the upload response.
- **A redirect endpoint used directly as `src`:** the Keycloak proxy documents that following a cross-origin 302 from the browser sends `Origin: null` to S3. It also gives no expiry to cache against, and it would cost one backend round trip for every image load and every audio range request.
- **Pre-signing every media URL when the canvas loads:** a large IVR flow with many Say Message cards would send requests for audio nobody plays. Signing lazily on click or render keeps the load proportional to actual use.
- **Keeping the cache in Redux:** signed URLs are transient credentials that do not drive canvas rendering or flow state. Storing them in the store would also put them in the state snapshots captured by Sentry Replay and redux devtools. `src/services/` is the constitution's place for stateful services.
- **Calling `window.open(signedUrl)` after `await`:** browsers treat a `window.open` after an async gap as not user-initiated, and popup blockers stop it. That is why the tab is opened synchronously and navigated later.

## Contracts

| Interface | Change | Version impact | Backward compatible |
|-----------|--------|----------------|---------------------|
| `FlowEditorConfig.endpoints.media_urls?: string` | added (optional) | minor (3.6.5 → 3.7.0) | yes. When absent, the editor uses stored URLs as it does today (AC-5). |
| Asset-server endpoint `POST endpoints.media_urls` | added (consumed from Flows) | minor | yes. The editor tolerates the endpoint being absent, and older editors ignore the extra config key. |
| Flow definition format / `SPEC_VERSION` | unchanged | none | yes. No signed URL is ever persisted (AC-4). |
| `MediaPlayer` props (`url`, `triggered`, `surface`) | `surface` added (required) | none | yes. This is an internal component, not exported. Both call sites are updated in this change. |

**Signing endpoint** (implemented by `weni-ai/flows`; this is the contract the editor needs):

- **Request:** `POST /flow/media_urls/<flow_uuid>/`, authenticated with the Django session and a CSRF token (`X-CSRFToken`). The body is `{"urls": ["https://<bucket>.s3.<region>.amazonaws.com/attachments/<org_id>/..."]}`, with 1 to 20 URLs of at most 2048 characters each.
- **Response 200:**

  ```json
  {
    "urls": { "<original url>": "<presigned or unchanged url>" },
    "expires_in": 3600
  }
  ```

  Every requested URL appears as a key. A URL that Flows will not sign is returned unchanged, whether it is not in a signable bucket, not owned by the flow's org, or not an S3 URL.
- **Response 400:** `{"error": "Invalid request"}` when the body is malformed, the list is empty or has more than 20 URLs, or any URL is longer than 2048 characters. One long URL rejects the whole request.
- **Response 403 or 404:** `{"error": "Forbidden"}` when the user lacks permission on the flow, or `{"error": "Not found"}` when the flow is unknown or inactive. Both are JSON responses, not the login redirect or HTML page that `OrgObjPermsMixin` produces by default.
- **Server-side requirements the editor relies on:**
  - Authorization is enforced on the flow's org.
  - An object key that belongs to a different org is never signed.
  - Signed URLs are not logged.
  - `Cache-Control: no-store` is set on the response.

**Consumers affected**: the Flows module is the only consumer of the npm package. It is told through the changelog entry and through the paired flows PR that adds the endpoint and the `media_urls` config key.

## Non-Functional Requirements

### Peak Load

The editor sends signing requests only when someone uses a surface, so the load is bounded per open editor tab. These are the peak per tab within a signed URL's validity window (3600 s by default):

- **Click actions:** at most one request per distinct uploaded attachment or document that is clicked.
- **Simulator:** one request per simulator response that renders images or videos, plus one more for each further 20 distinct URLs. Simulator documents and audio count under click actions and audio, because they are signed on click or play.
- **Audio:** one request per distinct recording that is played.

Repeated access hits the cache. Across the platform, the planning peak is the busiest weekday hour of `/flow/simulate/` traffic on Flows, multiplied by the share of simulator messages that carry media, plus Send Message form opens followed by a download click. The Flows spec MUST size the endpoint against that peak. On the editor side, the cost is small and fixed: one JSON request of at most 20 URLs, plus an in-memory map that holds one entry per media URL seen in the tab.

### Observability

- **Sentry events:** `MediaUrlSigner` calls `Sentry.captureException` for each failed signing request. Structure:
  - tags: `feature: media-signing`, `surface: sendmsg_download | simulator | say_msg_audio`, `reason: timeout | network | http_error | invalid_response | popup_blocked`;
  - the `surface` value comes from the `{ surface }` option of the caller that started the HTTP request. Callers that join a request already in flight share its single report and add no tag. `popup_blocked` takes the surface passed to `openSignedMedia`;
  - extras: `status` (the HTTP status when there is one) and `urlCount`.
- **What the editor's own reports never contain:** no original URL, object key, file name or signed URL appears in a tag, extra or breadcrumb that `MediaUrlSigner` or `openSignedMedia` adds. Signed URLs are bearer credentials, and file names may contain personal data.
- **Known gap, `TODO(SENTRY_SIGNED_URLS)`:** `@sentry/react` 8.51.0 records the full URL, query string included, of every image, video and audio file the page loads. Replay stores it as a performance entry, and tracing stores it as the name of a resource span. Media loaded from a signed URL therefore reaches Sentry with its signature, which stays usable until it expires (about an hour by default). Canonical URLs already reach Sentry the same way today. This change does not scrub them, and a follow-up tracked under the TODO can do so in `src/utils/sentry.ts`.
- **Correlation:** a signing request carries the Sentry `sentry-trace` and `baggage` headers that `browserTracingIntegration` already adds to same-origin requests. That links an editor error to the Flows request that caused it. `httpClientIntegration` already records 4xx and 5xx responses on the endpoint, so the service adds no `console` output.
- **Replay:** keeps text and input masking enabled. No signed URL is rendered as visible text. Replay's performance entries do contain loaded media URLs, as described under the known gap above.

### Failure Handling

- **Timeout:** an explicit 10 s timeout on the adapter call, overriding the global 30 s axios default, because the caller is waiting on a click or on media loading.
- **Signing endpoint missing** (`media_urls` not configured): the service is disabled and the original URLs are used (AC-5). This is not reported, because it is a supported configuration.
- **Network error, timeout, 5xx, 4xx or a malformed body:** every waiting caller receives the original URL and the failure is reported once (AC-6). There is no automatic retry. The failure is not cached, so the next click, render or play retries. The operation only reads and signs, so it is idempotent and a repeat causes no side effects.
- **A URL missing from the response map:** that URL is treated as unchanged, and an `invalid_response` report is sent.
- **A URL longer than 2048 characters:** the editor does not filter by length. Flows answers `400` for the whole chunk, so every URL in that chunk falls back to its original and one `http_error` report with `status: 400` is sent. The next access retries and fails the same way. Canonical upload and media URLs are far shorter than the limit, so this is accepted.
- **A signed URL expiring while in use:** cache entries expire before the signature does. The next `resolve` signs again, and `useSignedMediaUrl` updates `src`. A video that is already streaming may fail on range requests made after the expiry, which takes about an hour by default. This is accepted.
- **Popup blocked** (`window.open` returns `null`): the editor reports `popup_blocked` to Sentry and shows no message, so no new user-facing string is added. A popup blocker that stopped a direct click usually stops later clicks too, so the download does nothing for that user until they allow popups for the site. This is accepted. The editor never navigates its own window instead.
- **No unhandled rejections:** every promise returned by the service resolves. Errors are absorbed inside the service (AC-6).

### Security and Authorization

- **Trust boundary:** the editor sends URLs that the browser holds to Flows. Flows validates them and decides what to sign. The editor never computes signatures and never sees AWS credentials.
- **Authorization:** enforced server-side by Flows on the session user's permission for the flow, plus its org-ownership check on the object key. The editor applies no access control of its own.
- **Handling of signed URLs:**
  - They live only in memory, in the service cache and component state.
  - They are never persisted in the definition, `localStorage`, revisions or the Redux store.
  - The editor's code never logs them or adds them to a Sentry report. Sentry's automatic media recording is the exception, accepted under `TODO(SENTRY_SIGNED_URLS)` (see **Observability**).
- **New tabs:** tabs opened for media have `opener` cleared before navigation.
- **CSRF:** the POST carries `X-CSRFToken` from the `csrftoken` cookie, following the pattern used by `saveRevision` and `postNewAsset`.
- **Secrets:** this change needs no new secret.

## Test Strategy

| Success / acceptance criterion | How this repository proves it |
|--------------------------------|-------------------------------|
| AC-1: The Send Message download opens a signed URL. This test reproduces the bug. | `attachments.test.tsx` (new): render `renderAttachments` with an uploaded attachment and an msw handler for `media_urls`. Click the download icon and assert that the opened tab navigates to the signed URL and not the stored one. This test fails on the current code. A case through `MsgLocalizationForm.test.tsx` covers the translation form. |
| AC-2: Simulator media is signed | `SimulatorAttachment.test.tsx` (new): one case each for image (`img.src` is the signed URL after loading), video (`video.src`), document (a button click navigates the opened tab to the signed URL) and audio (it renders `MediaPlayer` with the original URL, and signing happens inside the player). `LogEvent.test.tsx` snapshots are updated. |
| AC-3: The Say Message audio is signed | `MediaPlayer.test.tsx`: after the first toggle, `audio.src` is the signed URL and `play` is called once. A second toggle while resolving does not start a second request. The `SayMsg` render passes the original `audio_url`. |
| AC-4: No signed URL is persisted | `attachments.test.tsx` and `SendMsgForm.test.ts`: after a download click, `onAttachmentChanged` is not called and the saved `attachments` keep the canonical URL. `SayMsgForm.test.ts`: playback leaves `audio_url` unchanged. |
| AC-5: No endpoint configured | `MediaUrlSigner.test.ts`: when `configure(undefined)` is called, `resolve(url, { surface: 'simulator' })` returns `url` and msw records no request. |
| AC-6: Fallback and reporting | `MediaUrlSigner.test.ts`: msw returns 500, a timeout and a malformed body. Each time the original URL is returned, `Sentry.captureException` is called once with the expected tags and with no URL in the payload, and the next call retries. When a `simulator` caller starts a request and a `say_msg_audio` caller joins it before it fails, exactly one report is sent, tagged `surface: simulator`. |
| AC-7: Cache reuse | `MediaUrlSigner.test.ts`: two `resolve` calls on the same URL within the validity window cause one request. Concurrent calls share one request. `resolve` calls for three different URLs in the same tick cause one request carrying all three, and 25 distinct URLs in one tick cause two requests (20 and 5). After the clock passes `expiresAt` (fake timers), a new request is made. URLs that are not http(s) cause no request. |

**Flow coverage**: complete use cases from user action to visible effect.

- Open the Send Message form with an uploaded attachment, click download, and the tab is navigated to the signed URL.
- The simulator receives a `msg_created` event with attachments and renders them with signed URLs.
- Click play on a Say Message card, and audio plays from the signed URL.

**Failure paths covered**:

- the endpoint is missing;
- HTTP 4xx and 5xx responses, including a `400` for a chunk that contains a URL longer than 2048 characters, where every URL in the chunk falls back;
- a timeout;
- a malformed response, or a URL missing from the response map;
- a popup is blocked;
- a double toggle while resolving;
- an expired cache entry.

**Stubbed at the boundary**:

- The Flows signing endpoint is stubbed with msw at the HTTP layer (`src/vitest-setup.ts`), with `src/test/config.ts` gaining `media_urls`.
- `@sentry/react` is mocked with `vi.mock`.
- `window.open` and `HTMLMediaElement.prototype.load` and `play` are stubbed, because jsdom does not implement them.
- Nothing inside `MediaUrlSigner` is mocked.

## Rollout and Rollback

1. **Release floweditor 3.7.0** with this change. It is safe to deploy first: without `media_urls` in the config, the editor behaves as 3.6.5 does (AC-5).
2. **Flows ships its endpoint**, adds `media_urls: '/flow/media_urls/{{object.uuid}}/'` to `templates/flows/flow_editor.haml`, and bumps `@weni/flow-editor` to 3.7.0. These can go in one PR or in either order: an older editor ignores the extra key, and a newer editor without the key keeps today's behavior.
3. **Validate in staging against the private bucket:**
   - download an uploaded attachment;
   - run the simulator with an image, video, document and audio sent by the flow;
   - play a Say Message recording;
   - inspect a saved revision to confirm the canonical URLs are kept.
4. **Rollback:** revert the Flows dependency to `@weni/flow-editor` 3.6.5, or remove the `media_urls` key, which disables signing at runtime with no redeploy of the editor package. Nothing is persisted, so rollback leaves no data to clean up.

## Constitution Alignment

| Principle | How this spec complies | Exception + justification |
|-----------|------------------------|---------------------------|
| I. Version Control and Review | Delivered through a PR to `main` with a green `Build`. | none |
| II. Security and Secrets | No new secret. Signed URLs are treated as credentials: kept in memory only, never persisted, never logged by the editor's code, and tabs opened with `opener` cleared. No new dependency. | Sentry's automatic Replay and tracing instrumentation records loaded media URLs with their signature. Accepted under `TODO(SENTRY_SIGNED_URLS)`: signatures expire after about an hour, only people with access to the Sentry project can see them, and scrubbing is left to a follow-up in `src/utils/sentry.ts`. |
| III. Observability | Failures go to Sentry with structured tags and extras, correlated through `sentry-trace`. The editor's own reports contain no URL, key or file name. There is no `console` output. | Same exception as Principle II: automatic instrumentation can send signed media URLs, which the principle counts as secrets. Tracked under `TODO(SENTRY_SIGNED_URLS)`. |
| IV. Versioned Contracts | The new optional config key and the consumed endpoint are listed under Contracts. The minor bump goes through `yarn version --minor`. Backward compatible in both directions. | none |
| V. Specification Traceability | Opens with `## Origin Without Product Spec` in the mandated format. | none |
| VII. Commit Messages | Atomic `fix:`, `feat:` and `test:` commits, each with a description of at most 50 characters. | none |
| VIII. Changelog Maintenance | Adds 3.7.0 to `WENI-CHANGELOG.md` under a `### Fixed` category. | The rest of the file still predates Keep a Changelog. Migrating it stays tracked under TODO(CHANGELOG_FORMAT) and is not part of this fix. |
| IX. Code as Documentation | English only. Comments explain the reasons that are not visible in the code: opening the tab synchronously to avoid popup blockers, why cache entries expire early, and why signed URLs never leave memory. | none |
| X. Type Safety | Every new file is `.ts` or `.tsx`, with explicit types for the request, the response and the cache entry, and no `any`. | `main.jsx` stays JavaScript. It gets a single added call, which counts as a small change. |
| XI. Single Responsibility | New modules are under 350 lines, with one responsibility each. Moving simulator attachments out shrinks `LogEvent.tsx` (689 lines). Boolean conditions in JSX are named, such as `isSignedUrlReady`. | `SendMsgForm.tsx` (727 lines) and `LogEvent.tsx` stay over the limit after this change. Fully splitting them is a separate refactor. |
| XII. Naming Conventions | `MediaUrlSigner.ts` (class), `SimulatorAttachment.tsx` (component), `useSignedMediaUrl.ts` (hook), and `media.ts` and `openSignedMedia.ts` (modules). | `media_urls` is snake_case in `Endpoints` to match the host-provided keys next to it (`ticketer_queues`, `whatsapp_flows`). That object is an external contract under Principle XIX. |
| XIII. Component Architecture | `SimulatorAttachment` lives in `components/simulator/`. Handlers use the `handle*` prefix, and state names are `isLoading` and `error`. | none |
| XIV and XV. Styling and BEM | No new styles are expected. `SimulatorAttachment` reuses the existing `LogEvent.module.scss` classes without adding to them. If a style is needed, it goes in a new BEM `SimulatorAttachment.module.scss`. The inline styles on the document element move into that module. | none |
| XVI. State Management | Nothing goes into Redux. The cache is a service in `src/services/`, and per-element resolution state is local to the component. | Signed URLs are transient credentials that are not app state. See Rejected Alternatives. |
| XVII. Async State Correctness | `useSignedMediaUrl` tracks loading, success and error separately, so they can never contradict each other. `MediaPlayer` guards against double toggles and the service deduplicates in-flight requests. There is no optimistic update to roll back. | none |
| XVIII. API Integration | The HTTP call lives only in `src/external/media.ts`, and the stateful logic in `src/services/MediaUrlSigner.ts`. Components never import `axios` for this. Errors are explicit, with no unhandled rejections. | `attachments.tsx` and `UploadButton.tsx` already call `axios` directly for uploads. This change does not touch that code, and moving it is out of scope. |
| XIX. API and Data Boundaries | `expires_in` becomes `expiresInSeconds` in the adapter. Components only ever receive URL strings. | none |
| Testing | Vitest with jsdom, React Testing Library and msw, in colocated `*.test.ts(x)` files. The AC-1 test reproduces the bug. | none |
| Accessibility | The simulator document opener becomes a `<button type="button">`, which is reachable by keyboard and has a visible focus. Images keep their `alt` text, and the loading placeholder is decorative (`alt=""`). | The Unnnic download icon in `renderUpload` keeps its current markup, and only its click handler changes. Making `UnnnicIcon clickable` keyboard-focusable is a design system issue and is not part of this fix. |
| Performance | No new dependency. Signing is lazy, results are cached, requests made in the same tick are batched, and nothing is pre-signed when the canvas loads. | none |
| Internationalization | No new user-facing string is expected. If one is added, it goes only into `src/config/i18n/defaults.json`. | none |
| Defensive Programming | The fallbacks cover states that can realistically happen: a host without the endpoint, network or backend failures, and popup blockers. | none |

## Implementation Decisions

- **Batch POST instead of a GET per URL:** signed URLs and S3 keys can be long, a simulator message can carry several attachments, and a JSON body keeps URLs out of access logs. The batch is capped at 20 URLs.
- **The endpoint is scoped by flow UUID** (`/flow/media_urls/<flow_uuid>/`). It reuses the same `OrgObjPermsMixin` authorization as `upload_media_action`, so the editor needs no project UUID and Flows can check that keys belong to the flow's org.
- **The service is configured once at boot**, not passed through the legacy `contextTypes`. `renderUpload` and `renderAttachment` are plain functions and `SayMsg` is a function component, none of which can read the legacy context. This follows the existing `setHTTPTimeout` pattern in `main.jsx`.
- **Cache entries expire early:** an entry expires at `expiresIn - 60 s`, or at half its lifetime for short TTLs. That way a URL handed to `<img>` or to a new tab is never about to expire. The default is 3600 s from Flows.
- **The editor sends only absolute http(s) URLs**, and Flows decides what is signable. The editor does not know the private bucket list, so the public `floweditor-assets.temba.io` sample media is returned unchanged and then cached.
- **The audio player signs on its first play, not on mount.** That avoids requests for every Say Message card on the canvas. Chrome and Firefox keep the user's activation across the short await, so `play()` is allowed. Safari may reject `play()` after an async gap. The player then resets to stopped, and the next click plays synchronously from the cached URL. This is accepted and called out in the PR.
- **The download keeps its current "open in a new tab" behavior.** It does not request `response-content-disposition=attachment`, so this change does not alter what the user sees.

## Open Questions

None. The origin, the signing mechanism and the surfaces in scope were decided with the developer before this spec was written.
