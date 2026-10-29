# Research: Signed Media URLs in the Flow Editor

**Feature**: `001-signed-media-urls` | **Date**: 2026-10-29 | **Spec**: [spec.md](./spec.md)

The spec closed its own open questions, so the Technical Context has no `NEEDS CLARIFICATION`. This file records the toolchain facts that constrain the implementation. They were checked on 2026-10-29 with a throwaway Vitest file that has since been deleted, and with a reading of the code the spec touches. Each entry gives the decision, the evidence and the alternatives rejected.

## R1. Syntax that the test pipeline accepts

- **Decision**: New code does not use optional chaining (`?.`) or nullish coalescing (`??`). It uses explicit checks such as `value !== undefined && value !== null`, or `||` when an empty string or `0` would also count as missing.
- **Rationale**: `vite.config.js` runs `vite-plugin-eslint` inside Vitest. The `prettier/prettier` rule's parser rejects both operators with `Parsing error: Expression expected`, which fails the whole test file before any test runs. Both failures were reproduced. `src/` does not use either operator today.
- **Alternatives considered**: Upgrading prettier or the ESLint parser. Rejected because it is a toolchain change unrelated to this fix.

## R2. Stubbing the signing endpoint per test

- **Decision**: Move the msw server and its default handlers out of `src/vitest-setup.ts` into `src/test/mswServer.ts`, which exports `restHandlers` and `server`. The defaults are the initial handlers passed to `setupServer(...)`, because in msw 2.3.1 `server.resetHandlers()` restores only those. `vitest-setup.ts` keeps only its lifecycle hooks (`listen` with `onUnhandledRequest: 'error'`, `resetHandlers`, `close`). Tests import `server` and call `server.use(...)` for failure cases.
- **Default handler**: `restHandlers` gains `http.post(endpoints.media_urls, ...)`. It answers every requested URL with `<url>?X-Amz-Signature=test` and `expires_in: 3600`, so component tests have a deterministic signed URL.
- **Test config**: `src/test/config.ts` gains `media_urls: '/flow/media_urls/a4f64f1b-85bc-477e-b706-de313a022979/'`.
- **Rationale**: No test overrides a handler today, and `server` is not exported. A second `setupServer()` in a test file conflicts with the global one, so unmatched requests hit the global `error` strategy. Sharing one exported server was checked in the spike: a POST to a relative path is intercepted and the JSON body is readable.
- **Alternatives considered**: Exporting `server` from `vitest-setup.ts` itself. Rejected because tests would import the setup file, mixing global setup with test helpers.

## R3. Testing the 10-second timeout

- **Decision**: The adapter uses axios's native per-request `timeout: SIGNING_TIMEOUT_MS` (10 000). It maps `error.code === 'ECONNABORTED'` to the `timeout` reason. The service test for the timeout case alone uses `vi.spyOn(axios, 'post')` to reject with an `ECONNABORTED`-shaped error, which stubs at the HTTP client boundary. The 500, network and malformed-body cases go through msw.
- **Rationale**: The spike showed that msw's XMLHttpRequest interceptor ignores `xhr.timeout`: a 50 ms timeout against a 500 ms delayed handler resolved normally. Vitest fake timers do not drive jsdom's XHR either. A real timeout cannot be produced through msw.
- **Alternatives considered**:
  - A timer of our own with an axios `CancelToken`, which fake timers would drive. Rejected because it reimplements an axios feature only for testability.
  - Making the timeout configurable through `configure()`. Rejected because it adds a production option only tests would use, and the msw interceptor would still ignore it.

## R4. axios 0.21.2 request and error semantics

- **Decision**: The adapter sets `Content-Type: application/json` explicitly. It classifies failures like this:

  | Observed | Reason | `status` extra |
  |----------|--------|----------------|
  | `error.response` present (any 4xx or 5xx) | `http_error` | `error.response.status` |
  | `error.code === 'ECONNABORTED'` | `timeout` | none |
  | no `error.response` (`Network Error`) | `network` | none |
  | 2xx body that fails validation (see [data-model.md](./data-model.md#signingresponsebody)) | `invalid_response` | the 2xx status |

- **Rationale**: `src/external/index.ts` sets `axios.defaults.headers.post['Content-Type'] = 'application/javascript'` globally, so a JSON POST that does not override it reaches Flows with the wrong content type. In axios 0.21 a timeout rejects with `code: 'ECONNABORTED'`. The spike showed that a network failure rejects with `message: 'Network Error'`, no `code` and no `response`. A per-request `timeout` overrides both the global 30 s default and `setHTTPTimeout`.
- **Alternatives considered**: `fetch`. Rejected because the rest of `src/external/` uses axios, and Sentry's XHR instrumentation already covers it.

## R5. Chunking and partial failure

- **Decision**: `getSignedMediaUrls(endpoint, urls)` splits `urls` into chunks of at most 20 and sends them in parallel. It returns one outcome per chunk and never rejects: either `{ isSigned: true, requestedUrls, signedUrls, expiresInSeconds }` or `{ isSigned: false, requestedUrls, failure }`. The service settles the URLs of each chunk on their own and sends one Sentry report per failed chunk.
- **Rationale**: The spec puts chunking in the adapter (Flow, step 3) but also says that a `400` makes only *that chunk* fall back, and that reports are sent "once per failed request". If the adapter rejected the whole batch when one chunk failed, URLs from chunks that succeeded would fall back too. Per-chunk outcomes satisfy both statements. `Promise.allSettled` is available in this test runtime and in the browsers Flows supports, but it is not needed because each chunk promise already maps its own failure to an outcome.
- **Alternatives considered**: Chunking in the service, with one adapter call per chunk. Rejected because it contradicts the spec's split of responsibilities.

## R6. Same-tick batching

- **Decision**: The first `resolve` in a tick that needs a request queues its URL and schedules a flush with `Promise.resolve().then(flush)`. Later calls in the same tick add to the queue. The flush sends one deduplicated adapter call.
- **Rationale**: In React 16, the passive effects (`useEffect`) of one commit run together in a single scheduler task. Every `SimulatorAttachment` rendered in one simulator update therefore calls `resolve` before the microtask runs. Vitest fake timers do not fake microtasks by default, so `MediaPlayer.test.tsx` and other suites that call `vi.useFakeTimers()` still flush without manual timer steps.
- **Alternatives considered**: A `setTimeout(0)` flush. Rejected because it adds a macrotask of latency to every click, and fake timers would capture it in existing suites.

## R7. Synchronous lookup

- **Decision**: The service exposes `getResolvedUrl(url): string | null`. It returns the URL to use when no request is needed: the original when signing is disabled or the URL is not absolute http(s), or the cached signed URL while it is fresh. Otherwise it returns `null`.
- **Rationale**: Three spec requirements need a synchronous answer:
  - AC-5 says that without `media_urls` the editor behaves exactly as today. `useSignedMediaUrl` uses `getResolvedUrl` for its initial state, so simulator images render on the first render with no placeholder flash. The `LogEvent` snapshots change only where the markup really changes.
  - The Implementation Decisions say that after Safari rejects `play()`, the next click plays synchronously from the cache. `MediaPlayer` needs a synchronous path to keep the user's activation.
  - The existing `MediaPlayer.test.tsx` cases assert that `load` and `play` run synchronously on `mouseDown`. They keep passing unchanged while the signer is disabled.
- **Alternatives considered**: Making `resolve` return the value synchronously when possible, as a `string | Promise<string>` union. Rejected because the union leaks into every caller.

## R8. What reaches Sentry

- **Decision**: The service reports `new MediaSigningError(reason)`, whose message is the fixed text `Media URL signing failed: <reason>`. It calls `Sentry.captureException(error, { tags, extra })` with the tags and extras the spec defines. The axios error object is never passed to Sentry.
- **Rationale**: An axios error carries `config.data`, the JSON body holding every original URL, and `config.url`. Passing it would put file names and object keys into the report, which the spec forbids. `captureException` is a no-op when `initSentry` was never called (the host gave no `sentryDSN`), so the service needs no guard.
- **Known duplication**: For 4xx and 5xx responses, `httpClientIntegration` already sends its own event with the endpoint path and status, and without the request body. The service's report adds the `surface` and `reason` tags. Both are kept, as the spec's Observability section states.

## R9. `MediaPlayer` owns `src` after resolution

- **Decision**: The render keeps `src={this.props.url}`. On the first play the player obtains the playback URL, synchronously through `getResolvedUrl` or after awaiting `resolve`. When the URL differs from the element's current `src`, the player assigns `this.ele.src` directly, then calls `load()` and `play()`. An `isLoading` state ignores toggles while a resolution is pending and shows the `hourglass_empty` icon with `aria-busy`. It changes only the icon and an attribute, not `src`, so the re-render it causes does not touch the audio element. A late result is dropped when `props.url` changed or the component unmounted. The promise returned by `play()` is caught, and a rejection resets the player to stopped. Nothing is reported for a rejected `play()`, because it is a browser autoplay policy and not a signing failure.
- **Rationale**: Under the HTML spec, setting `src`, even to the same value, restarts the media load algorithm and stops playback. If the resolved URL were rendered from React state, the commit that follows `play()` would reset the element. React writes the attribute only when the prop changes between renders, so an unchanged `props.url` never overwrites the imperatively assigned signed URL. With `preload="none"`, the canonical URL left in the attribute is never fetched before play. When `props.url` changes, React writes the new URL, which stops playback as it does today, and `componentDidUpdate` already resets the playing state.
- **Alternatives considered**: Rendering no `src` and managing it fully by hand. Rejected because it changes every snapshot and requires reimplementing the reset on URL change.

## R10. `openSignedMedia` under jsdom and in browsers

- **Decision**: Synchronously inside the click handler, the function calls `const tab = window.open('', '_blank')`. When `tab` is `null` it reports `popup_blocked` and returns. Otherwise it sets `tab.opener = null`, awaits `resolve(url, { surface })`, and sets `tab.location.href` unless `tab.closed`. It returns `Promise<void>` and never rejects.
- **Rationale**: Opening the tab synchronously keeps the click's user activation, as the spec's Rejected Alternatives explain. jsdom does not implement `window.open`, so tests stub it with `vi.spyOn(window, 'open')` returning `{ opener, closed: false, location: { href: '' } }`, or `null` for the blocked case.
- **Alternatives considered**: `window.open(url, '_blank', 'noopener')`. Rejected because with `noopener` the call always returns `null`, which makes a blocked popup undetectable, and the tab could not be navigated after the await.

## R11. Hook outcome and failure detail

- **Decision**: The service exposes `resolveWithOutcome(url, options): Promise<MediaUrlResolution>`, where `MediaUrlResolution` is `{ url: string; failureReason: MediaSigningFailureReason | null }`. `resolve` is `resolveWithOutcome(...).then(result => result.url)`. `useSignedMediaUrl` maps `failureReason` to its `error` field.
- **Rationale**: The spec requires the hook to return `{ url, isLoading, error }`, and Principle XVII asks for distinct loading, success and error states. `resolve` always settles with a usable URL, so callers can't tell a fallback from a success. The outcome method exposes the reason without making any promise reject.

## R12. Coverage reporting for `src/utils/`

- **Observation**: `vite.config.js` excludes `utils/**` from coverage, so `src/utils/openSignedMedia.ts` will not appear in Codecov even with its colocated tests.
- **Decision**: Keep the location the spec chose and write its tests anyway, because the tests exist to prove behavior, not to raise coverage. Moving the module is a separate decision for the spec owner.

## R13. Release mechanics

- **Decision**: The release is a separate commit, `chore: release 3.7.0`. It sets `"version": "3.7.0"` in `package.json` by hand and adds a `3.7.0` block to `WENI-CHANGELOG.md` with a `### Fixed` entry. `yarn version` is never run. Nothing is pushed or tagged as part of the implementation: the developer pushes the branch when it is ready and pushes the `v3.7.0` tag after the PR merges, which triggers `.github/workflows/publish.yml`. The deviation from Principle IV's "through `yarn version`" is recorded in the plan's Complexity Tracking.
- **Rationale**: History shows `release: 3.6.x` commits that edit those two files by hand. `yarn version` runs a `postversion` script that pushes directly to `main`, which Principle I forbids, and its `version` script writes to `CHANGELOG.md`, which Principle VIII reserves for upstream history. `chore:` keeps the commit within Principle VII's allowed types; `release:` is the deviation tracked under TODO(COMMIT_TYPES).
- **Alternatives considered**:
  - `yarn version --minor`, which Principle IV names. Kept only in its SemVer sense, a minor bump, because running it breaks Principles I and VIII.
  - `yarn version --no-git-tag-version`. Rejected because it still runs the `version` and `postversion` scripts, so it still pushes to `main`.
