---

description: "Task list for Signed Media URLs in the Flow Editor"
---

# Tasks: Signed Media URLs in the Flow Editor

**Input**: Design documents from `specs/001-signed-media-urls/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Requested. The spec's Test Strategy maps every acceptance criterion to a colocated Vitest file, and the AC-1 test must reproduce the bug before the fix. Tests are written first in each phase.

**Organization**: The spec defines acceptance criteria (AC-1 to AC-7) rather than user stories. The tasks group them by surface, in the order of the plan's Delivery Sequence:

| Story | Priority | Surface | Acceptance criteria |
|-------|----------|---------|---------------------|
| Foundational | — | Adapter and signing service, shared by every surface | AC-5, AC-6, AC-7 |
| US1 | P1 🎯 MVP | Send Message download and its translation form | AC-1, AC-4 (attachments) |
| US2 | P2 | Say Message audio player (`MediaPlayer`) | AC-3, AC-4 (`audio_url`) |
| US3 | P3 | Simulator image, video, document and audio | AC-2 |

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths are relative to the repository root (single frontend package, `src/`)

## Constraints that apply to every task

- **Syntax** ([R1](./research.md#r1-syntax-that-the-test-pipeline-accepts)): no `?.` and no `??`. Prettier is 1.18.2, so `import type` and `export type { ... }` also fail to parse. Import types by name from the module that defines them, and use `export type X = ...` aliases only. `vite-plugin-eslint` runs inside Vitest, so a parse error fails the whole test file before any test runs.
- **Types** (Principle X): new files are `.ts` or `.tsx`, with no `any`. Use `unknown` for untrusted response bodies.
- **Size** (Principle XI): each new module stays under 350 lines.
- **No console output** (Principle III). Failures go to Sentry only, through `MediaUrlSigner`.
- **Signer state in tests**: `MediaUrlSigner` is a singleton per test file. A suite that needs signing calls `MediaUrlSigner.get().configure(config.endpoints.media_urls)` in `beforeEach` and `MediaUrlSigner.get().configure(undefined)` in `afterEach`. Suites that never configure it stay disabled and keep today's behavior (AC-5).
- **Request counting in tests**: subscribe with `server.events.on('request:start', ({ request }) => ...)`, filter on `config.endpoints.media_urls`, and call `server.events.removeAllListeners()` in `afterEach`.
- **Sentry in tests**: `captureException` is mocked once in `src/vitest-setup.ts` (`vi.mock('@sentry/react', ...)` that keeps the other exports). A `vi.mock` inside a test file is too late: the setup file already loads `MediaUrlSigner` through `testUtils`, so the real Sentry would stay cached. Test files import `* as Sentry` and use `vi.mocked(Sentry.captureException)`. Nothing inside `MediaUrlSigner` is mocked.

---

## Phase 1: Setup (Test Harness)

**Purpose**: Let tests override msw handlers and stub the signing endpoint. No production behavior changes.

**Commit**: `test: export msw server for handler overrides`

- [X] T001 [P] Add the optional key `media_urls?: string;` to the `Endpoints` interface in `src/flowTypes.ts`, after `whatsapp_flows`, with no other change ([contracts §1](./contracts/editor-interfaces.md#1-public-host-configuration-srcflowtypests)). It ships in this commit so the test config in T002 type-checks.
- [X] T002 Add `media_urls: '/flow/media_urls/a4f64f1b-85bc-477e-b706-de313a022979/'` to `config.endpoints` in `src/test/config.ts` (depends on T001).
- [X] T003 [P] Create `src/test/mswServer.ts`. Move the `restHandlers` array and the `setupServer(...restHandlers)` call out of `src/vitest-setup.ts` into it, together with the imports they need (`setupServer`, `http`, `HttpResponse`, `config`), and export both `restHandlers` and `server`.
  - The default handlers must be the *initial* handlers passed to `setupServer(...)`. In msw 2.3.1, `server.resetHandlers()` with no arguments restores only the initial handlers, so handlers registered with `server.use(...)` from the setup file would be removed after the first test.
- [X] T004 Add the default signing handler to `restHandlers` in `src/test/mswServer.ts`: `http.post(endpoints.media_urls, async ({ request }) => ...)`. It reads `{ urls }` from the JSON body and answers `HttpResponse.json({ urls: { [url]: url + '?X-Amz-Signature=test' }, expires_in: 3600 })` for every requested URL ([R2](./research.md#r2-stubbing-the-signing-endpoint-per-test)). Build the map with `reduce` (depends on T002, T003).
- [X] T005 Update `src/vitest-setup.ts` to `import { server } from 'test/mswServer'`. Keep `beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))`, `afterEach` with `cleanup()` and `server.resetHandlers()`, and `afterAll(() => server.close())`. Remove the imports that are no longer used in this file (depends on T003).
- [X] T006 Run `yarn test run external simulator --coverage.enabled=false` and confirm that the suites that use msw still pass after the move (depends on T004, T005).

**Checkpoint**: Tests can `import { server } from 'test/mswServer'` and call `server.use(...)`. Commit Phase 1.

---

## Phase 2: Foundational (Adapter and Signing Service)

**Purpose**: The HTTP adapter and the stateful signing service that every surface uses. This phase proves AC-5, AC-6 and AC-7. With `media_urls` absent, shipping it is inert.

**⚠️ CRITICAL**: No surface work can begin until this phase is complete.

### Adapter

**Commit**: `feat: add media url signing adapter`

- [X] T007 [P] Write `src/external/media.test.ts` before the adapter. It uses `server.use(...)` from `test/mswServer` for every case except the timeout:
  - The POST goes to the endpoint with the body `{ urls: [...] }` and the headers `Content-Type: application/json` and `X-Requested-With: XMLHttpRequest`. When `document.cookie` holds `csrftoken=abc`, it also sends `X-CSRFToken: abc`.
  - 25 URLs send two requests of 20 and 5 URLs, in parallel, and return two chunks in input order.
  - A 200 response returns `{ isSigned: true, requestedUrls, signedUrls: Map, expiresInSeconds: 3600 }`, so `expires_in` never appears in the output.
  - A 500 response returns `{ isSigned: false, requestedUrls, failure: { reason: 'http_error', status: 500 } }`, and a 400 response is the same with `status: 400`.
  - `HttpResponse.error()` returns `reason: 'network'` and `status: null`.
  - These 2xx bodies each return `reason: 'invalid_response'` with `status: 200`: `urls` is an array, `urls` is `null`, a `urls` value is not a string, `expires_in` is `0`, `expires_in` is missing, and `expires_in` is a string.
  - When one chunk fails and the other succeeds, each gets its own outcome.
  - For the timeout ([R3](./research.md#r3-testing-the-10-second-timeout)), `vi.spyOn(axios, 'post').mockRejectedValueOnce(Object.assign(new Error('timeout of 10000ms exceeded'), { code: 'ECONNABORTED' }))` returns `reason: 'timeout'` with `status: null`.
  - The returned promise never rejects in any of these cases.
- [X] T008 Implement `src/external/media.ts` per [contracts §2](./contracts/editor-interfaces.md#2-internal-http-adapter-srcexternalmediats): `SIGNING_TIMEOUT_MS = 10000`, `SIGNING_CHUNK_SIZE = 20`, `MediaSigningFailureReason`, `MediaSigningFailure`, `SignedMediaChunk`, and `getSignedMediaUrls(endpoint, urls)` (depends on T007).
  - Call `axios.post(endpoint, { urls: chunk }, { headers, timeout: SIGNING_TIMEOUT_MS })` once per chunk of at most 20 URLs, in parallel. It must be `axios.post` so that the T007 spy intercepts it.
  - Set `Content-Type: application/json` explicitly, because `src/external/index.ts` sets `axios.defaults.headers.post['Content-Type'] = 'application/javascript'` globally ([R4](./research.md#r4-axios-0212-request-and-error-semantics)). Add `X-Requested-With: XMLHttpRequest`, and add `X-CSRFToken` only when `getCookie('csrftoken')` (from `external`) returns a value.
  - Classify failures in this order: `error.response` present gives `http_error` with `error.response.status`; `error.code === 'ECONNABORTED'` gives `timeout` with `status: null`; anything else gives `network` with `status: null`.
  - Validate a 2xx body as [data-model.md](./data-model.md#signingresponsebody) requires: "`urls` is a non-null object that is not an array, and every value in it is a string" and "`expires_in` is a finite number greater than 0". A body that fails gives `invalid_response` with the 2xx status.
  - Each chunk promise catches its own failure, so the function never rejects. Neither the axios error nor the raw body leaves the module, because the error's `config.data` holds every original URL ([R8](./research.md#r8-what-reaches-sentry)).

### Signing service

**Commit**: `feat: add MediaUrlSigner service`

- [X] T009 [P] Write `src/services/MediaUrlSigner.test.ts` before the service, using the shared constraints above (Sentry mock, configure in `beforeEach`, request counting):
  - **AC-5**: after `configure(undefined)` or `configure('')`, `resolve(url, { surface: 'simulator' })` and `getResolvedUrl(url)` both return `url`, and no request is sent.
  - **Not signable**: while signing is enabled, `geo:-1.2,3.4`, a `data:` URL, a `blob:` URL, `/relative/image.png` and `@fields.photo` are returned unchanged with no request.
  - **AC-7, cache**:
    - two sequential `resolve` calls for one URL send one request, and both return `<url>?X-Amz-Signature=test`;
    - `getResolvedUrl` returns `null` before resolution and the signed URL after;
    - a URL that Flows returns unchanged is cached and not requested again.
  - **AC-7, deduplication and batching**:
    - two concurrent calls for the same URL send one request;
    - three different URLs resolved in the same tick send one request with all three;
    - 25 distinct URLs in one tick send two requests (20 and 5);
    - `resolveMany` keeps input order and length, duplicates included.
  - **Expiry**: use `vi.useFakeTimers({ toFake: ['Date'] })` so that only `Date` is faked and msw, XHR and microtasks keep running.
    - With `expires_in: 3600`, a call just before `(3600 - 60) * 1000` ms reuses the cache, and a call after it sends a new request.
    - With `expires_in: 100`, the entry expires at 50 s, because `max(100 - 60, 100 / 2)` is 50.
  - **AC-6, failures**: cover a 500, `HttpResponse.error()`, an invalid body, and a timeout (through the `axios.post` spy from T007). In each case:
    - the original URL is returned;
    - `Sentry.captureException` is called once with an error whose message is `Media URL signing failed: <reason>`, `tags: { feature: 'media-signing', surface: 'simulator', reason }` and `extra: { status, urlCount: 1 }`, with `status` omitted for `network` and `timeout`;
    - `JSON.stringify` of the mock's calls does not contain the requested URL;
    - the next call sends a new request.
  - **AC-6, a URL missing from the response**:
    - the URL comes back as the original, and `resolveWithOutcome` reports `failureReason: 'invalid_response'`;
    - one report is sent with `urlCount` set to the number of missing URLs;
    - the URLs that were present in the same chunk are still cached.
  - **AC-6, partial failure**: 21 URLs where the first chunk gets a 400 and the second succeeds. Only the 20 URLs of the first chunk fall back, and one report is sent with `extra: { status: 400, urlCount: 20 }`.
  - **AC-6, surface tagging**: a `simulator` caller starts a request, a `say_msg_audio` caller joins it, and the request fails. Exactly one report is sent, tagged `surface: 'simulator'`.
  - **`reportFailure('popup_blocked', 'sendmsg_download')`**: one report with `tags.reason: 'popup_blocked'` and `extra: { urlCount: 1 }`, without `status`.
  - **`configure(endpoint)` clears the cache**: a URL cached before the call is requested again after it.
- [X] T010 Implement `src/services/MediaUrlSigner.ts` per [contracts §3](./contracts/editor-interfaces.md#3-internal-signing-service-srcservicesmediaurlsignerts) and the [data model](./data-model.md#service-types-srcservicesmediaurlsignerts) (depends on T008, T009).
  - **Exports and singleton**:
    - export `MediaSurface`, `ResolveOptions`, `MediaUrlResolution`, `MediaSigningError` and `MediaUrlSigner`, and import `MediaSigningFailureReason` from `external/media` instead of re-exporting it;
    - the singleton follows `FlowStore.get()` in `src/services/FlowStore.ts`;
    - `MediaSigningError` sets `name = 'MediaSigningError'` and uses the fixed message `Media URL signing failed: <reason>`.
  - **State**: `endpoint: string | null` (`null` means disabled), `cache: Map<string, SignedUrlCacheEntry>`, `inFlight: Map<string, Promise<MediaUrlResolution>>`, and a queue of URLs plus the `surface` of the first queued caller.
  - **Signable URL**: `new URL(value)` with no base parses inside `try`/`catch`, and `protocol` is `http:` or `https:`. There is no length check.
  - **`getResolvedUrl(url)`** returns the original when signing is disabled or the URL isn't signable, and the cached `signedUrl` while `Date.now() < expiresAt`. Otherwise it returns `null`.
  - **`resolveWithOutcome`** uses `getResolvedUrl`, then the in-flight promise (a joining caller adds no report), then the queue. The first queued call schedules `Promise.resolve().then(flush)` ([R6](./research.md#r6-same-tick-batching)). `resolve` is `resolveWithOutcome(...).then(result => result.url)`. `resolveMany` is `Promise.all` over `resolve`, which batches in the same tick.
  - **`flush`** drains the queue into one deduplicated `getSignedMediaUrls` call, then settles each chunk on its own:
    - **Signed chunk**: cache every URL present with `expiresAt = Date.now() + Math.max(expiresInSeconds - 60, expiresInSeconds / 2) * 1000`. Settle missing URLs with the original and `invalid_response`, and send one report per chunk with `urlCount` set to the number missing. Omit `status`, because the signed chunk variant does not carry one.
    - **Failed chunk**: settle every URL with the original, cache nothing, and send one report with `extra.status` (only when it isn't `null`) and `extra.urlCount: requestedUrls.length`.
    - Remove the in-flight entries of each chunk when it settles.
  - **`reportFailure(reason, surface)`** reports with `extra: { urlCount: 1 }`.
  - **Reporting**: always call `Sentry.captureException(new MediaSigningError(reason), { tags: { feature: 'media-signing', surface, reason }, extra })`. Never pass a URL or the axios error.
  - **Comments** (Principle IX): explain why entries expire early, and why signed URLs never leave memory.
- [X] T011 In `src/main.jsx`, import `MediaUrlSigner` from `services/MediaUrlSigner` and call `MediaUrlSigner.get().configure(config.endpoints.media_urls)` inside `window.showFlowEditor`, after the `setHTTPTimeout` block and before `ReactDOM.render` (depends on T010).
- [X] T012 Run `yarn test run services/MediaUrlSigner external/media --coverage.enabled=false` and confirm everything passes with no unhandled rejection (depends on T010, T011).

**Checkpoint**: The service is complete, and it is inert while `media_urls` is absent. Commit the adapter (T007, T008), then the service (T009 to T011).

---

## Phase 3: User Story 1 - Send Message download opens a signed URL (Priority: P1) 🎯 MVP

**Goal**: Clicking the download icon of an uploaded attachment, in the Send Message form or in its translation form, opens the file through a presigned URL. The definition keeps the canonical URL.

**Independent Test**: In `attachments.test.tsx`, with signing configured and `window.open` stubbed, clicking download navigates the stubbed tab to `<url>?X-Amz-Signature=test`, and `onAttachmentChanged` is never called. This test fails on the current `renderUpload`.

**Commit**: `fix: sign attachment downloads`. The failing test and the fix go in one commit so every commit stays green for bisecting (Principle VII).

### Tests for User Story 1

> Write these first. T013 must fail against the current `renderUpload` before T018.

- [X] T013 [P] [US1] Create `src/components/flow/actions/sendmsg/attachments.test.tsx` (AC-1 bug reproduction, AC-4).
  - **Test hook first**: in `renderUpload` in `src/components/flow/actions/sendmsg/attachments.tsx`, add `data-testid={`download-attachment-${index}`}` to the download `UnnnicIcon` (`icon="download-bottom-1"`). This mirrors `remove-attachment-${index}` on the remove icon, which `MsgLocalizationForm.test.tsx` already clicks with `fireEvent.click(getByTestId(...))` through veaury. It changes no behavior, so the test still fails for the real reason.
  - **Setup**: render `renderAttachments(config.endpoints.attachments, [{ type: 'application/pdf', url: 'https://weni-flows.s3.us-east-1.amazonaws.com/attachments/42/1337/steps/9c1d/report.pdf', uploaded: true }], onUploaded, onAttachmentChanged, onAttachmentRemoved)` inside a fragment with RTL `render` from `test/utils`. Configure the signer, and stub `vi.spyOn(window, 'open').mockReturnValue(tab)` with `tab = { opener: {}, closed: false, location: { href: '' } }`.
  - **Click**: `fireEvent.click(getByTestId('download-attachment-0'))`.
  - **Assertions**:
    - after the click, `window.open` was called with `('', '_blank')`;
    - `tab.opener` is `null`;
    - `await waitFor(() => expect(tab.location.href).toBe(url + '?X-Amz-Signature=test'))`;
    - `onAttachmentChanged` and `onUploaded` were not called.
  - Run it, and confirm that it fails before T018 on the `window.open('', '_blank')` assertion, because the current handler calls `window.open(attachment.url, '_blank')`.
- [X] T014 [P] [US1] Create `src/utils/openSignedMedia.test.ts` ([R10](./research.md#r10-opensignedmedia-under-jsdom-and-in-browsers)):
  - `window.open('', '_blank')` is called synchronously, so assert it right after `openSignedMedia(...)` returns and before awaiting the promise;
  - `opener` is cleared, and the tab is navigated to the signed URL;
  - when the endpoint answers 500, the tab is navigated to the original URL;
  - when `window.open` returns `null`, one `popup_blocked` report is sent with `tags: { feature: 'media-signing', surface: 'sendmsg_download', reason: 'popup_blocked' }` and `extra: { urlCount: 1 }`, and `window.location.href` is unchanged;
  - when `tab.closed` becomes `true` before resolution, `location.href` is never set;
  - the promise never rejects.
  - `vite.config.js` excludes `utils/**` from coverage ([R12](./research.md#r12-coverage-reporting-for-srcutils)). Write the tests anyway.
- [X] T015 [US1] Add an AC-4 case to `src/components/flow/actions/sendmsg/SendMsgForm.test.ts` (depends on T013 for the `data-testid`).
  - **File stays `.ts`**: the existing cases use Enzyme `shallow`, which never renders the attachments tab. Add a separate `describe('download with signing')` that renders with RTL through `render(React.createElement(SendMsgForm, props))` from `test/utils`. That helper wraps the `ConfigProvider` that `this.context.config.endpoints` needs and the Redux `Provider`. Import `* as React from 'react'`. Do not rename the file, so its snapshot file keeps its name.
  - **Setup**: build the props with `getActionFormProps(createSendMsgAction({ attachments: ['application/pdf:<canonical url>'] }))`. The `/` in the type makes the attachment `uploaded`, as in `sendmsg/helpers.ts`. Configure the signer, and stub `window.open` as in T013.
  - **Steps**, following the pattern in `MsgLocalizationForm.test.tsx`:
    - `fireEvent.click(getByText('Attachments'))`;
    - `fireEvent.click(getByTestId('download-attachment-0'))`;
    - `await waitFor(...)` until the stub tab's `location.href` is signed;
    - `fireEvent.click(getByText('Ok'))`.
  - **Assertion**: `props.updateAction` receives `attachments: ['application/pdf:<canonical url>']`, and `JSON.stringify` of its calls contains no `X-Amz-Signature`.
- [X] T016 [US1] Add an AC-1 translation case to `src/components/flow/actions/localization/MsgLocalizationForm.test.tsx` (depends on T013 for the `data-testid`).
  - **Setup**: use `createSendMsgAction({ attachments: ['application/pdf:<canonical url>'] })`, with the Spanish translation holding the same uploaded attachment. Configure the signer and stub `window.open` as in T013.
  - **axios is mocked here**: this file calls `vi.mock('axios')`, which uses `src/__mocks__/axios.ts`, so msw never sees the signing request. Before clicking, stub the call at the client boundary the way the file's `say_msg` case already does: `// @ts-expect-error` followed by `axios.post.mockResolvedValueOnce({ status: 200, data: { urls: { [url]: url + '?X-Amz-Signature=test' }, expires_in: 3600 } })`.
  - **Steps**: `fireEvent.click(getByText('Attachments'))`, then `fireEvent.click(getByTestId('download-attachment-0'))`.
  - **Assertions**: the tab navigates to the signed URL, and `props.updateLocalizations` is not called.

### Implementation for User Story 1

- [X] T017 [US1] Create `src/utils/openSignedMedia.ts` per [contracts §4](./contracts/editor-interfaces.md#4-internal-click-time-opening-srcutilsopensignedmediats) (depends on T010, T014).
  - `openSignedMedia(url, options): Promise<void>` calls `const tab = window.open('', '_blank')` synchronously, before any `await`.
  - When `tab` is `null`, it calls `MediaUrlSigner.get().reportFailure('popup_blocked', options.surface)` and returns.
  - Otherwise it sets `tab.opener = null`, awaits `MediaUrlSigner.get().resolve(url, options)`, and sets `tab.location.href` unless `tab.closed`.
  - It never navigates `window.location`, never shows a message, and never rejects.
  - Add a comment explaining that the tab opens synchronously to keep the click's user activation and avoid popup blockers.
- [X] T018 [US1] In `renderUpload` in `src/components/flow/actions/sendmsg/attachments.tsx`, replace `window.open(attachment.url, '_blank')` with `openSignedMedia(attachment.url, { surface: 'sendmsg_download' })` (depends on T017).
  - Keep the rest of the `UnnnicIcon` markup as it is: the `data-testid` from T013 is the only other change. This is the accessibility exception in the plan's Complexity Tracking.
  - Do not touch the upload code, which keeps its existing direct `axios` use under the Principle XVIII exception.
- [X] T019 [US1] Run `yarn test run sendmsg/attachments sendmsg/SendMsgForm localization/MsgLocalizationForm utils/openSignedMedia --coverage.enabled=false`. Confirm that T013 now passes. Existing snapshots should be unchanged. If one renders an uploaded attachment, the only diff allowed is the new `data-testid` (depends on T013 to T018).

**Checkpoint**: AC-1 and the attachment half of AC-4 pass. This is the MVP. Commit Phase 3.

---

## Phase 4: User Story 2 - Say Message audio plays through a signed URL (Priority: P2)

**Goal**: The audio player signs the recording on its first play, keeps playback state stable, and reuses the cached URL afterwards. `audio_url` is never changed.

**Independent Test**: In `MediaPlayer.test.tsx`, with signing configured, the first toggle leaves `audio.src` as the signed URL with `play` called once, and a second toggle while resolving sends no second request.

**Commit**: `fix: sign media player audio`. This must land before Phase 5, because `SimulatorAttachment` renders `MediaPlayer` with `surface="simulator"`.

### Tests for User Story 2

- [X] T020 [US2] Extend `src/components/mediaplayer/MediaPlayer.test.tsx` (AC-3).
  - **Existing cases**: add `surface: 'say_msg_audio'` to `baseProps`. They keep passing unchanged while the signer is disabled, because `getResolvedUrl` answers synchronously ([R7](./research.md#r7-synchronous-lookup)). Update the snapshots with `-u` and confirm that the only diffs are the new `surface` prop and, in Enzyme snapshots, an `aria-busy={undefined}` prop if `enzyme-to-json` prints it. The RTL `baseElement` snapshots must not change.
  - **New `describe('with signing configured')`**: configure the signer, and stub `HTMLMediaElement.prototype.load` with `vi.fn()` and `play` with `vi.fn().mockResolvedValue(undefined)`.
    - **First `mouseDown`**: after `waitFor`, `audio.src` is `<url>?X-Amz-Signature=test`, and `load` then `play` ran once each.
    - **Busy while resolving** (Principle XVIII): right after the first `mouseDown` and before the response, the icon text is `hourglass_empty` and the `mediaplayer` element has `aria-busy="true"`. After resolution, the icon is no longer `hourglass_empty` and the element has no `aria-busy` attribute.
    - **Second `mouseDown` while resolving**: one `media_urls` request in total, and `play` ran once.
    - **Re-render with the same `url` after play**: `audio.src` is still the signed URL ([R9](./research.md#r9-mediaplayer-owns-src-after-resolution)).
    - **Stop, then play again**: `load` and `play` run synchronously inside the `mouseDown`, from the cache.
    - **`play` rejects** (the Safari case, and also an S3 `403` on a fallback URL): the player returns to stopped (icon `play_arrow`, no `aria-busy`), with no `captureException` and no unhandled rejection.
    - **`url` prop changes while resolving**: the late result is dropped, `play` is not called, and `audio.src` is the new URL.
    - **Unmount while resolving**: `play` is not called.
    - **Signing answers 500**: the player plays the original URL.
- [X] T021 [P] [US2] In `src/components/flow/actions/saymsg/SayMsg.test.ts`, add a case with `createSayMsgAction({ audio_url: '<canonical url>' })`.
  - The file uses Enzyme `shallow`, which renders the `MediaPlayer` element and not its `<audio>`. Assert on the element instead: `wrapper.find(MediaPlayer).props()` has `url` equal to the canonical `audio_url` and `surface` equal to `'say_msg_audio'`. This shows the card passes the original URL and signing happens inside the player.
  - Update the existing snapshots with `-u`. The only diff allowed is the new `surface` prop.
- [X] T022 [US2] Add an AC-4 playback case to `src/components/flow/actions/saymsg/SayMsg.test.ts` (depends on T021, same file).
  - **Why here and not in `SayMsgForm.test.ts`**: `SayMsgForm` renders only `UploadButton` and never plays audio. A test there would not run any signing code, and it would keep passing if the player wrote a signed URL back.
  - **Setup**: configure the signer and stub `HTMLMediaElement.prototype.load` and `play` as in T020. Build `action = createSayMsgAction({ audio_url: '<canonical url>' })` and keep `const before = JSON.stringify(store.getState())`, using `store` from `test/utils`. Render with `render(React.createElement(SayMsgComp, action))` from `test/utils`, which wraps the Redux `Provider`. The file stays `.ts`.
  - **Steps**: `fireEvent.mouseDown(getByTestId('mediaplayer'))`, then `await waitFor(...)` until `getByTestId('audio').src` is `<canonical url>?X-Amz-Signature=test`.
  - **Assertions**:
    - `action.audio_url` is still the canonical URL;
    - `JSON.stringify(store.getState())` equals `before` and contains no `X-Amz-Signature`.

### Implementation for User Story 2

- [X] T023 [US2] Change `src/components/mediaplayer/MediaPlayer.tsx` per [contracts §6](./contracts/editor-interfaces.md#6-internal-components) and [R9](./research.md#r9-mediaplayer-owns-src-after-resolution) (depends on T010, T020).
  - **Props, state and flags**: add the required prop `surface: MediaSurface`, imported from `services/MediaUrlSigner`. Add `isLoading: boolean` to `MediaPlayerState`, initially `false`. Add the instance flag `isUnmounted`, and set it to `true` in a new `componentWillUnmount`.
  - **`handleTogglePlay`, when playing**: unchanged.
  - **`handleTogglePlay`, when stopped**:
    - return when `this.state.isLoading` is `true`;
    - when `MediaUrlSigner.get().getResolvedUrl(this.props.url)` returns a URL, start playback synchronously without touching `isLoading`;
    - otherwise `setState({ isLoading: true })` and await `resolve(this.props.url, { surface: this.props.surface })`. If the component unmounted, stop there without calling `setState`. If `props.url` changed, `setState({ isLoading: false })` and drop the result. Otherwise `setState({ isLoading: false })` and start playback.
  - **`componentDidUpdate`**: when `props.url` changes, also reset `isLoading` to `false`.
  - **Starting playback**: assign `this.ele.src` when the URL differs from it, call `load()`, then `play()`. Catch the promise that `play()` returns, and on rejection reset to stopped with nothing reported.
  - **Render**:
    - Name the icon choice in a derived value before the JSX (Principle XI): `hourglass_empty` while `isLoading`, otherwise `stop` or `play_arrow` as today.
    - Set `aria-busy={this.state.isLoading ? true : undefined}` on the `mediaplayer` element. React then omits the attribute when idle, so the DOM snapshots in `LogEvent.test.tsx` stay identical, as T033 requires.
    - Add no CSS class. `MediaPlayer.module.scss` is a legacy non-BEM module that Principle XV forbids extending.
    - Keep `src={this.props.url}`. Add a comment explaining why the player assigns `src` itself: React only rewrites the attribute when the prop changes, and `preload="none"` means the canonical URL is never fetched before play.
- [X] T024 [P] [US2] Pass `surface="say_msg_audio"` to `MediaPlayer` in `src/components/flow/actions/saymsg/SayMsg.tsx`, with `url={action.audio_url}` unchanged (depends on T023).
- [X] T025 [P] [US2] Pass `surface="simulator"` to the existing `<MediaPlayer url={url} />` in `renderAttachment` in `src/components/simulator/LogEvent.tsx`, so the required prop type-checks in this commit. Phase 5 moves this call into `SimulatorAttachment` (depends on T023).
- [X] T026 [US2] Run `yarn test run mediaplayer/MediaPlayer saymsg/SayMsg simulator/LogEvent --coverage.enabled=false` (depends on T020 to T025).

**Checkpoint**: AC-3 and the `audio_url` half of AC-4 pass. US1 still passes. Commit Phase 4.

---

## Phase 5: User Story 3 - Simulator media loads through signed URLs (Priority: P3)

**Goal**: Simulator images and videos render from signed URLs, documents open in a signed tab, and audio plays through the signing `MediaPlayer`. Media in one simulator response shares one signing request.

**Independent Test**: In `SimulatorAttachment.test.tsx`, with signing configured, `img.src` and `video.src` become signed, a click on the document button navigates the stubbed tab to the signed URL, and an image and a video rendered together send one `media_urls` request.

**Depends on**: US1 (`openSignedMedia`, T017) and US2 (the `MediaPlayer` `surface` prop, T023).

**Commit**: `fix: sign simulator attachments`

### Tests for User Story 3

- [X] T027 [P] [US3] Create `src/components/simulator/useSignedMediaUrl.test.ts`. RTL 12.1.5 has no `renderHook`, so render a small test component that prints the hook's result.
  - **Disabled**: the first render is `{ url: original, isLoading: false, error: null }`.
  - **Enabled and uncached**: the first render is `{ url: null, isLoading: true, error: null }`, then `{ url: signed, isLoading: false, error: null }`.
  - **Cached**: the signed URL is there on the first render, with no request.
  - **500**: the result is `{ url: original, isLoading: false, error: 'http_error' }`.
  - **Input `url` changes mid-flight**: the stale result is discarded.
  - **Unmount mid-flight**: no state update and no React warning.
- [X] T028 [P] [US3] Create `src/components/simulator/SimulatorAttachment.test.tsx` (AC-2), with the signer configured and `window.open` stubbed as in T013. Each case renders `<SimulatorAttachment attachment="<type>:<url>" />`:
  - **Image** `image/jpeg:<url>`: a placeholder `img` with `alt=""` while loading, then `img[alt="Attachment"]` whose `src` is signed.
  - **Video** `video/mp4:<url>`: `video.src` becomes signed.
  - **Document** `application/pdf:<url>`: `getByRole('button')` has `type="button"`, and a click navigates the tab to the signed URL.
  - **Audio** `audio/mp3:<url>`: renders `MediaPlayer`, `audio.src` is the original URL, and rendering sends no `media_urls` request.
  - **Geo** `geo:-1.2,3.4`: renders the map thumbnail with no request.
  - **No `:` or an unknown type**: renders nothing.
  - **Signing answers 500**: `img.src` is the original URL.
  - **Batching**: an image and a video rendered in one `render` send exactly one `media_urls` request carrying both URLs.

### Implementation for User Story 3

- [X] T029 [US3] Create `src/components/simulator/useSignedMediaUrl.ts` per [contracts §5](./contracts/editor-interfaces.md#5-internal-render-time-hook-srccomponentssimulatorusesignedmediaurlts) and the [data model](./data-model.md#usesignedmediaurlurl-result) (depends on T010, T027).
  - Export `SignedMediaUrlState` and `useSignedMediaUrl(url)`.
  - The initial state comes from `MediaUrlSigner.get().getResolvedUrl(url)`. A non-null value gives `{ url, isLoading: false, error: null }`, and `null` gives `{ url: null, isLoading: true, error: null }`.
  - A `useEffect` keyed on `url` calls `resolveWithOutcome(url, { surface: 'simulator' })` when needed, and maps `failureReason` to `error`.
  - A cancelled flag in the effect cleanup discards results that arrive after the URL changed or the component unmounted.
  - Invariants: "`url` is `null` only while `isLoading`", and "`error` is non-null only when `isLoading` is `false`, and then `url` is the original".
- [X] T030 [P] [US3] Create `src/components/simulator/SimulatorAttachment.module.scss`. Start it with `@import 'src/variables.module.scss';` and use BEM classes with Unnnic `$unnnic-*` tokens (Principles XIV and XV).
  - The block is `.simulator-attachment`, with the elements `__document` and `__document-label`.
  - Move the inline document styles from `LogEvent.tsx` here, mapped to the nearest tokens: `cursor: pointer`, `padding: 10px 12px`, `background: #e6e6e6`, `color: #666`, a flex row with centered items, and a label with `margin-left: 5px` and `line-height: 16px`.
  - Reset the native button styles (border, font and full width) and keep a visible `:focus-visible` outline.
  - Do not add classes to `LogEvent.module.scss`.
- [X] T031 [US3] Create `src/components/simulator/SimulatorAttachment.tsx` per [contracts §6](./contracts/editor-interfaces.md#6-internal-components) (depends on T017, T023, T029, T030).
  - **Props and parsing**: export `SimulatorAttachmentProps { attachment: string }`. Parse `<type>:<url>` at the first `:`, exactly as `renderAttachment` does today, and render `null` when there is no `:` or the type is unknown.
  - **Hooks**: hooks can't be called conditionally, and documents and audio must not be signed at render, so put the hook in small inner components (`SignedImage`, `SignedVideo`) that only the image and video branches render.
  - **Unchanged markup** (keeps the `LogEvent` snapshots identical while the signer is disabled):
    - image: `<img src={url} alt="Attachment" />`, behind a named condition such as `isSignedUrlReady`, with a decorative `<img alt="" />` placeholder while loading;
    - video: `<div className={styles.video_attachment}><video controls={true} src={url} /></div>`;
    - audio: the `audio_attachment`, `media_player` and `audio_text` wrappers, reusing the classes from `components/simulator/LogEvent.module.scss`, with `<MediaPlayer url={url} surface="simulator" />`;
    - geo: `<img src={MAP_THUMB} alt="Attachment" />`.
  - **Document**: render `<button type="button" className="simulator-attachment__document ..." onClick={handleOpenDocument}>`, which calls `openSignedMedia(url, { surface: 'simulator' })`. Inside it go the `picture_as_pdf` `UnnnicIcon` and `i18n.t('document', 'Document')`, an existing key, so no new string is added.
- [X] T032 [US3] In `src/components/simulator/LogEvent.tsx`, delete `renderAttachment` and render `<SimulatorAttachment attachment={attachment} />` inside the existing keyed `<div>` in `renderMessage`. Remove the `MediaPlayer` and `MAP_THUMB` imports, and keep `UnnnicIcon` and `i18n`, which other parts of the file still use (depends on T031).
- [X] T033 [US3] Run `yarn test run simulator/LogEvent -u --coverage.enabled=false` to update `src/components/simulator/__snapshots__/LogEvent.test.tsx.snap`. Review the diff: only the document element may change, from the inline-styled `<div>` to `<button type="button">` with BEM classes. Image, video and audio markup must be identical, which shows AC-5 for the simulator (depends on T032).
- [X] T034 [US3] Run `yarn test run simulator/SimulatorAttachment simulator/useSignedMediaUrl simulator/LogEvent simulator/Simulator --coverage.enabled=false` (depends on T027 to T033).

**Checkpoint**: AC-2 passes, and US1 and US2 still pass. Commit Phase 5.

---

## Phase 6: Polish & Release

**Purpose**: Cross-cutting review, the full gate, and the 3.7.0 release commit.

- [ ] T035 [P] Audit the new and changed files: `src/external/media.ts`, `src/services/MediaUrlSigner.ts`, `src/utils/openSignedMedia.ts`, `src/components/simulator/useSignedMediaUrl.ts`, `src/components/simulator/SimulatorAttachment.tsx` and `src/components/mediaplayer/MediaPlayer.tsx`.
  - No `?.`, `??`, `import type`, `export type {`, `any` or `console.` appears.
  - Each new module is under 350 lines.
  - The four comments the spec requires are present: the synchronous tab in `openSignedMedia.ts`, the early expiry and memory-only signed URLs in `MediaUrlSigner.ts`, and the player assigning `src` in `MediaPlayer.tsx`.
  - No signed URL is written to Redux, `localStorage` or any `on*Changed` callback.
- [ ] T036 Run `npx eslint -c .eslintrc.json` on every file touched in Phases 1 to 5, and fix any error. Prefer this to `yarn lint`, which runs `--fix` across all of `src/`.
- [ ] T037 Release commit `chore: release 3.7.0` ([R13](./research.md#r13-release-mechanics), plan Complexity Tracking for Principle IV). Edit these files by hand.
  - Do not run `yarn version` in any form, including `--no-git-tag-version`. Its `postversion` script runs `git push --tags && git push origin main`, and its `version` script writes `CHANGELOG.md`.
  - Do not push, tag or open the PR. The developer pushes the branch when it is ready.
  - In `package.json`, set `"version": "3.7.0"`.
  - At the top of `WENI-CHANGELOG.md`, add a `3.7.0` block in the file's existing `version` / `----------` header style, with a `### Fixed` entry: `- fix: open, play and render stored media through presigned URLs from endpoints.media_urls`.
- [ ] T038 Run the PR gate, `yarn build && yarn test run`. Both must pass with no unhandled rejection (Principle I).
- [ ] T039 Run the local manual check in [quickstart.md §2](./quickstart.md#2-local-manual-check-no-backend): with the dev config, which has no `media_urls`, the simulator's sample image, video and audio render and play as on `main`, and the Network tab shows no `media_urls` request (AC-5).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Phase 1, and blocks every user story.
- **US1 (Phase 3)**: depends on Phase 2.
- **US2 (Phase 4)**: depends on Phase 2. It is independent of US1 and can run in parallel with it.
- **US3 (Phase 5)**: depends on Phase 2, on US1 (`openSignedMedia`, T017) and on US2 (`MediaPlayer` `surface`, T023).
- **Polish (Phase 6)**: depends on every story included in the release.

### Story Completion Order

```text
Phase 1 ─▶ Phase 2 ─┬─▶ US1 (P1, MVP) ─┐
                    └─▶ US2 (P2) ──────┴─▶ US3 (P3) ─▶ Phase 6
```

### Within Each Phase

- Tests come before implementation, and the AC-1 test (T013) must fail before T018.
- Adapter (T008) → service (T010) → surfaces.
- One commit per phase checkpoint, matching the plan's Delivery Sequence. US1's test and fix share a commit.

### Parallel Opportunities

- **Phase 1**: T001 and T003 touch different files.
- **Phase 2**: T007 and T009 (the two test files) can be written together. T009's run waits for T010.
- **US1**: T013 and T014 can be written together. T015 and T016 can be written together once T013 has added the `data-testid`.
- **US2**: T020 and T021 can be written together. T022 follows T021 in the same file. T024 and T025 can run together once T023 lands.
- **US3**: T027, T028 and T030 can run together.
- **Across stories**: US1 and US2 can proceed in parallel after Phase 2.

---

## Parallel Example: User Story 1

```bash
# Write the first two US1 test files together:
Task: "Create the AC-1 bug reproduction in src/components/flow/actions/sendmsg/attachments.test.tsx"
Task: "Create src/utils/openSignedMedia.test.ts"

# Then, once T013 has added the data-testid:
Task: "Add the AC-4 case to src/components/flow/actions/sendmsg/SendMsgForm.test.ts"
Task: "Add the translation case to src/components/flow/actions/localization/MsgLocalizationForm.test.tsx"

# Then implement in order:
Task: "Create src/utils/openSignedMedia.ts"
Task: "Use openSignedMedia in renderUpload in src/components/flow/actions/sendmsg/attachments.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Create src/components/simulator/useSignedMediaUrl.test.ts"
Task: "Create src/components/simulator/SimulatorAttachment.test.tsx"
Task: "Create src/components/simulator/SimulatorAttachment.module.scss"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (test harness) and Phase 2 (adapter and service).
2. Complete Phase 3 (Send Message download).
3. **Stop and validate**: T019 passes, and T013 failed before the fix.
4. The Send Message download fix can ship alone, and it stays inert until Flows adds `media_urls`.

### Incremental Delivery

1. Phases 1 and 2: the service is inert, so the build is safe to merge.
2. US1: Send Message downloads are fixed.
3. US2: Say Message audio is fixed.
4. US3: simulator media is fixed.
5. Phase 6: release 3.7.0.

### Parallel Team Strategy

After Phase 2, one developer takes US1 and another takes US2. US3 starts when both have landed.

---

## Notes

- **Done by the developer, outside this task list**:
  - push the branch and open the PR;
  - after merge, push the `v3.7.0` tag to trigger `.github/workflows/publish.yml`;
  - open the Flows PR that bumps `@weni/flow-editor` to 3.7.0 ([flows#904](https://github.com/weni-ai/flows/pull/904) ships the endpoint and the `media_urls` key without it);
  - run the staging checks in [quickstart.md §3](./quickstart.md#3-staging-check-against-the-private-bucket).
- **Status for missing URLs, recorded in T010 and [data-model.md](./data-model.md#report-shape-mediasigningerror)**: for a URL missing from a *successful* chunk, the signed `SignedMediaChunk` variant carries no status, so that report omits `status`. If the status is wanted there, add `status` to the signed variant in [contracts §2](./contracts/editor-interfaces.md#2-internal-http-adapter-srcexternalmediats) first.
- [P] tasks touch different files and have no dependency on an incomplete task.
- Commit messages follow Principle VII, with descriptions of 50 characters or fewer.
