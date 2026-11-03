# Implementation Plan: Signed Media URLs in the Flow Editor

**Branch**: `001-signed-media-urls` | **Date**: 2026-10-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-signed-media-urls/spec.md`

## Summary

The buckets behind Flows are now private, so the editor's stored canonical S3 URLs return `403`. The editor will ask Flows for presigned URLs through a new optional config endpoint, `endpoints.media_urls`, whenever it renders or opens stored media. This covers the Send Message download and its translation form, simulator images, videos, documents and audio, and the Say Message player. The definition never stores a signed URL.

The work splits into three parts:

- **Adapter**: `src/external/media.ts` sends chunked POSTs that never reject.
- **Service**: the singleton `src/services/MediaUrlSigner.ts` owns the expiry-aware cache, in-flight deduplication, microtask batching, the fallback to the original URL, and Sentry reporting.
- **Surfaces**: a hook, a click-time opener and changes to `MediaPlayer` consume the service.

[research.md](./research.md) records the toolchain constraints found while planning. Three of them shape the code:

- The lint parser rejects `?.` and `??`.
- The msw server has to be exported so tests can override handlers.
- The timeout case can't be produced through msw.

## Technical Context

**Language/Version**: TypeScript 3.9 (`strict`, with the recorded `strictNullChecks: false` exception) and React 16.8. No `?.` or `??` ([R1](./research.md#r1-syntax-that-the-test-pipeline-accepts)).

**Primary Dependencies**: axios 0.21.2 (per-request timeout, `ECONNABORTED` semantics), `@sentry/react` 8.51.0, and veaury with `@weni/unnnic-system` (the existing icons). No new dependency.

**Storage**: N/A. The cache is in memory only, in a service `Map`, and is never written to Redux, `localStorage` or the definition.

**Testing**: Vitest 2.0.5 with jsdom, React Testing Library 12.1.5, msw 2.3.1 (the server moves to `src/test/mswServer.ts` and gains a default `media_urls` handler, see [R2](./research.md#r2-stubbing-the-signing-endpoint-per-test)), and `vi.mock('@sentry/react')`. `window.open` and `HTMLMediaElement` `load` and `play` are stubbed.

**Target Platform**: Evergreen browsers. The editor ships as an IIFE bundle inside the Flows module.

**Project Type**: Frontend library, the npm package `@weni/flow-editor`.

**Performance Goals**: No request on canvas load. At most one request per tick of renders, one per further 20 URLs, and one per distinct click or play within the validity window. A cache hit costs nothing.

**Constraints**:

- 10 s signing timeout.
- Opening a tab must keep the user's activation, so the tab is opened synchronously.
- Audio must not lose playback state because React rewrote `src` ([R9](./research.md#r9-mediaplayer-owns-src-after-resolution)).
- With the endpoint absent, behavior is identical to today (AC-5).

**Scale/Scope**: About 6 new and 8 modified source files, plus tests. Each new module stays under 350 lines.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Gate | Pre-research | Post-design | Evidence |
|---|------|--------------|-------------|----------|
| I | PR to `main`, green `Build` | PASS | PASS | Delivered by PR. The release commit does not run `yarn version`, whose `postversion` script pushes to `main` ([R13](./research.md#r13-release-mechanics)). |
| II | No secrets, trusted dependencies, least privilege | PASS, with a justified exception | PASS, with a justified exception | No new secret or dependency. Signed URLs are memory-only. Exception: Sentry's automatic media recording, under `TODO(SENTRY_SIGNED_URLS)`. See Complexity Tracking. |
| III | Structured Sentry, no secrets or PII, correlation | PASS, with a justified exception | PASS, with a justified exception | `MediaSigningError` has a fixed message, and the tags and extras follow the [data model](./data-model.md#report-shape-mediasigningerror). The axios error is never forwarded ([R8](./research.md#r8-what-reaches-sentry)). `sentry-trace` and `baggage` come from `browserTracingIntegration`. Same exception as II. |
| IV | SemVer and backward compatible contracts | PASS, with a justified exception | PASS, with a justified exception | The `media_urls?` key is optional: minor bump to 3.7.0, edited by hand instead of through `yarn version` (see Complexity Tracking). The definition format and `SPEC_VERSION` are unchanged. The consumed endpoint is in [contracts/signing-endpoint.openapi.yaml](./contracts/signing-endpoint.openapi.yaml). |
| V | Origin section format | PASS | PASS | The spec opens with `## Origin Without Product Spec`. |
| VI | No silent divergence | N/A | N/A | No product spec, so nothing is inherited. |
| VII | Conventional commits, 50 characters or fewer, atomic | PASS | PASS | See the commit sequence under Delivery Sequence. The release uses `chore:`, not `release:`. |
| VIII | `WENI-CHANGELOG.md`, Keep a Changelog | PASS, with a recorded exception | PASS, with a recorded exception | `### Fixed` under 3.7.0. The legacy file format stays under TODO(CHANGELOG_FORMAT), as the spec records. |
| IX | English, comments explain why | PASS | PASS | The comments the spec names: why the tab opens synchronously, why the cache expires early, why the player assigns `src` itself, and why signed URLs never leave memory. |
| X | New code in TypeScript, no `any` | PASS, with a justified exception | PASS, with a justified exception | All new files are `.ts` or `.tsx`, and the wire types are explicit. `main.jsx` gains one call, which counts as a small change. |
| XI | 350 lines or fewer, single responsibility, named JSX conditions | PASS, with a justified exception | PASS, with a justified exception | New modules are small. `LogEvent.tsx` shrinks. `SendMsgForm.tsx` and `LogEvent.tsx` stay above 350 lines. |
| XII | Naming | PASS, with a justified exception | PASS, with a justified exception | `MediaUrlSigner.ts`, `SimulatorAttachment.tsx`, `useSignedMediaUrl.ts`, `media.ts`, `openSignedMedia.ts`, `mswServer.ts`. `media_urls` stays snake_case as part of the host contract. |
| XIII | Component architecture | PASS | PASS | `SimulatorAttachment` lives in `components/simulator/`, with `handle*` methods and `isLoading` and `error` state. |
| XIV–XV | SCSS modules, Unnnic tokens, BEM | PASS | PASS | The inline document styles move to `SimulatorAttachment.module.scss` with BEM classes and Unnnic tokens. Legacy `LogEvent.module.scss` classes are reused but not extended. |
| XVI | Redux for global state only | PASS | PASS | The cache is a service. Resolution state is local to components. |
| XVII | Distinct async states, double-submit guard | PASS | PASS | The hook's states can't contradict each other ([data-model](./data-model.md#usesignedmediaurlurl-result)). The player's `isLoading` state ignores toggles while resolving. The service deduplicates in-flight URLs. |
| XVIII | HTTP only in `src/external` and `src/services`, no unhandled rejections, loading and error states reflected in the UI | PASS, with a justified exception | PASS, with a justified exception | Components never import axios for this. Every promise resolves. `play()` rejections are caught. Loading shows on every surface: the blank tab opens at once, images and videos render a placeholder, and the player shows `hourglass_empty` with `aria-busy`. A failure shows only as the fallback to the original URL, with no message (see Complexity Tracking). |
| XIX | Normalize at the adapter | PASS | PASS | `expires_in` becomes `expiresInSeconds` and the body is validated in `media.ts`. |
| QS | Testing, accessibility, performance, i18n, defensive programming | PASS, with a justified exception | PASS, with a justified exception | Colocated Vitest and RTL tests. The AC-1 test reproduces the bug. The document opener becomes a `<button type="button">`, and the Send Message download icon stays as it is (see Complexity Tracking). Signing is lazy and batched. No new strings. Fallbacks only for reachable states. |

**Result**: every gate passes. The exceptions are the ones the spec already justifies, and they are restated under Complexity Tracking. Design added no new violation.

## Project Structure

### Documentation (this feature)

```text
specs/001-signed-media-urls/
├── spec.md
├── plan.md                         # this file
├── research.md                     # Phase 0
├── data-model.md                   # Phase 1
├── quickstart.md                   # Phase 1
├── contracts/
│   ├── signing-endpoint.openapi.yaml   # consumed Flows endpoint
│   └── editor-interfaces.md            # config key + internal module boundaries
├── checklists/requirements.md
└── tasks.md                        # Phase 2 (/speckit-tasks, not created here)
```

### Source Code (repository root)

```text
src/
├── flowTypes.ts                                   # M: Endpoints.media_urls?
├── main.jsx                                       # M: MediaUrlSigner.get().configure(...)
├── external/
│   ├── media.ts                                   # N: adapter (chunks, timeout, validation)
│   └── media.test.ts                              # N
├── services/
│   ├── MediaUrlSigner.ts                          # N: cache, dedupe, batching, fallback, Sentry
│   └── MediaUrlSigner.test.ts                     # N
├── utils/
│   ├── openSignedMedia.ts                         # N: synchronous tab, then navigate
│   └── openSignedMedia.test.ts                    # N
├── test/
│   ├── config.ts                                  # M: media_urls
│   └── mswServer.ts                               # N: exported msw server
├── vitest-setup.ts                                # M: uses mswServer, default media_urls handler
└── components/
    ├── flow/actions/sendmsg/
    │   ├── attachments.tsx                        # M: download → openSignedMedia
    │   ├── attachments.test.tsx                   # N: AC-1 bug reproduction, AC-4
    │   └── SendMsgForm.test.ts                    # M: AC-4
    ├── flow/actions/localization/
    │   └── MsgLocalizationForm.test.tsx           # M: AC-1 translation form
    ├── flow/actions/saymsg/
    │   ├── SayMsg.tsx                             # M: surface="say_msg_audio"
    │   └── SayMsg.test.ts                         # M: surface prop, AC-4 audio_url unchanged after play
    ├── mediaplayer/
    │   ├── MediaPlayer.tsx                        # M: surface prop, isLoading, resolve before load/play
    │   └── MediaPlayer.test.tsx                   # M: AC-3, busy icon, double toggle, Safari reject
    └── simulator/
        ├── SimulatorAttachment.tsx                # N: moved from LogEvent.renderAttachment
        ├── SimulatorAttachment.module.scss        # N: BEM document button
        ├── SimulatorAttachment.test.tsx           # N: AC-2
        ├── useSignedMediaUrl.ts                   # N
        ├── useSignedMediaUrl.test.ts              # N
        ├── LogEvent.tsx                           # M: delegate to SimulatorAttachment
        └── __snapshots__/LogEvent.test.tsx.snap   # M: document <button>
WENI-CHANGELOG.md, package.json                    # M: 3.7.0 (release commit)
```

**Structure Decision**: This is a single frontend package, so the existing `src/` layout is used without new top-level directories. Each module goes where the constitution puts its kind: HTTP in `src/external/`, stateful logic in `src/services/`, and components and hooks next to their surface.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| II and III: Sentry Replay and tracing record loaded signed media URLs (`TODO(SENTRY_SIGNED_URLS)`) | Media must load from the signed URL, and `@sentry/react` 8.51 records the resource URLs a page loads. | Scrubbing in `src/utils/sentry.ts` (`beforeSendSpan` and Replay `networkDetailAllowUrls` and filters) is a separate change with its own test surface. The signatures expire in about an hour and are visible only to members of the Sentry project. |
| X: `main.jsx` stays JavaScript | It gains one `configure` call. | Migrating the entry point to TypeScript is unrelated to the fix. |
| XI: `SendMsgForm.tsx` (727 lines) and `LogEvent.tsx` stay above 350 lines | Only small edits are needed there. `LogEvent.tsx` shrinks. | A full split is a separate refactor and would inflate this security fix's diff. |
| IV: the 3.7.0 bump does not go through `yarn version` | The constitution names `yarn version`, but its `postversion` script runs `git push --tags && git push origin main`, which bypasses the PR that Principle I requires, and its `version` script writes `CHANGELOG.md`, which Principle VIII reserves for upstream history. The developer pushes the branch and the `v3.7.0` tag by hand when the release is ready. | `yarn version --no-git-tag-version` still runs the `version` and `postversion` scripts. Changing those scripts is a tooling change outside this fix. The SemVer requirement itself is kept. |
| XVIII: failures show only as the fallback, with no message | Every surface falls back to the original URL, so the user sees the same result as before this change (a broken image, an S3 error page, or a player that returns to stopped), and the failure goes to Sentry. | A visible error message would add a user-facing string, which the spec's clarification session ruled out, and it would show on public media that never needed signing. |
| XVIII: `attachments.tsx` and `UploadButton.tsx` call `axios` directly for uploads | Pre-existing code that this change does not touch. | Moving the upload calls into `src/external/` is unrelated to signing and would widen this security fix. |
| Accessibility: the Unnnic download icon in `renderUpload` is not keyboard-focusable | Only its click handler changes, plus a `data-testid`. | Making `UnnnicIcon clickable` focusable is a design system change in `@weni/unnnic-system`. |
| VIII: `WENI-CHANGELOG.md` predates Keep a Changelog | The 3.7.0 entry uses a `### Fixed` category inside the file's existing header style. | Migrating the whole file is tracked under TODO(CHANGELOG_FORMAT) and is not part of this fix. |
| XII: `media_urls` in snake_case | It sits next to the host-provided keys `ticketer_queues` and `whatsapp_flows`, under the external-contract allowance of Principle XIX. | Renaming the key would break the convention the Flows template already uses. |

## Inherited Context

- Product Spec: none
- Engineering Spec: [specs/001-signed-media-urls/spec.md](./spec.md)
- Paired spec (server side): weni-ai/flows `specs/010-signed-media-urls/spec.md`

## Delivery Sequence

1. **Test harness** (`test: export msw server for handler overrides`). Move the server into `src/test/mswServer.ts`, add `media_urls` to the test config, and add the default handler. Every later test depends on it, and it changes no production code.
2. **Config type and adapter** (`feat: add media url signing adapter`). Add `Endpoints.media_urls?` and `src/external/media.ts` with its tests. Nothing calls them yet.
3. **Signing service** (`feat: add MediaUrlSigner service`). Add `src/services/MediaUrlSigner.ts` with its tests for AC-5, AC-6 and AC-7, and wire `configure` into `main.jsx`. The service is disabled when the key is absent, so shipping it is inert.
4. **Send Message download** (`fix: sign attachment downloads`). First write `attachments.test.tsx`, asserting that the opened tab navigates to the signed URL, and confirm it fails against the current `renderUpload` (AC-1 bug reproduction). Then add `openSignedMedia`, use it in `renderUpload`, and add the AC-4 assertions to `SendMsgForm.test.ts` and `MsgLocalizationForm.test.tsx`. The test and the fix go in one commit so every commit stays green for bisecting (Principle VII).
5. **Media player** (`fix: sign media player audio`). Add the `surface` prop, resolution before playback, the `isLoading` state with its busy icon and double-toggle guard, and the `play()` rejection handling. `SayMsg` passes `say_msg_audio`. This must land before step 6, because `SimulatorAttachment` renders `MediaPlayer` with `surface="simulator"`.
6. **Simulator** (`fix: sign simulator attachments`). Add `useSignedMediaUrl` and `SimulatorAttachment` with its SCSS module, make `LogEvent` delegate to it, and update the snapshots.
7. **Release** (`chore: release 3.7.0`). Edit `package.json` and `WENI-CHANGELOG.md` by hand, adding a `### Fixed` entry, without running `yarn version`. Nothing is pushed or tagged automatically. The developer pushes the branch when it is ready and pushes the `v3.7.0` tag after merge to publish ([R13](./research.md#r13-release-mechanics)).

**Cross-repository coordination**: none blocks this repository. The editor ships first and stays inert until Flows turns it on. [flows#904](https://github.com/weni-ai/flows/pull/904) adds the endpoint and `media_urls: '/flow/media_urls/{{object.uuid}}/'` to `flow_editor.haml`. A separate Flows PR bumps `@weni/flow-editor` to 3.7.0 once it is published. These can merge in either order (spec, Rollout step 2).

## Peak Load Plan

- **Declared peak**: in this spec, per editor tab within a validity window: one request per distinct clicked attachment or document, one per simulator render tick (plus one per further 20 URLs), and one per distinct recording played. The Flows spec sizes the endpoint at 600 requests per hour platform-wide, with bursts of 5 requests per second from one tab.
- **How this plan sustains it**:
  - There is no pre-signing on canvas load.
  - Microtask batching collapses one render's attachments into one request ([R6](./research.md#r6-same-tick-batching)).
  - In-flight deduplication stops repeated clicks and re-renders from sending more requests.
  - Cache entries live until `expires_in - 60 s`.
  - Failures are not retried automatically, so an outage does not amplify traffic.
- **How it is verified**:
  - The AC-7 tests assert the request counts: one for repeated access, one for three URLs in a tick, two for 25 URLs, and one after a concurrent join.
  - In staging, quickstart step 4 shows one `media_urls` request for a multi-media simulator response, and step 2 shows none on a repeated download.

## Observability Plan

- **Structured logs added**: none in the console (Principle III). Sentry events come from `MediaUrlSigner` only, through `captureException(new MediaSigningError(reason), { tags: { feature, surface, reason }, extra: { status, urlCount } })`: one per failed chunk, per missing-URL response and per blocked popup.
- **Correlation identifier**: `browserTracingIntegration` adds `sentry-trace` and `baggage` to the same-origin POST. The Flows side continues the trace, so an editor report links to the Flows request span.
- **Error reports**: they carry only opaque values: the `surface`, the `reason`, the HTTP `status` and the `urlCount`. They never carry a URL, an object key or a file name.
- **Signals watched after rollout**:
  - The Sentry issue count for `feature:media-signing`, broken down by `reason`. A rise in `http_error` 403 or 404 points to a permission or template problem in Flows. A rise in `invalid_response` points to contract drift. `popup_blocked` measures how many users are affected by popup blockers.
  - `httpClientIntegration` events on `/flow/media_urls/`.
  - The absence of new S3 `403 AccessDenied` reports from users on the three surfaces.

## Rollout and Rollback Plan

- **Rollout**: a direct deploy, with the config key acting as the flag. Publish 3.7.0 first. It is inert without `media_urls` (AC-5). Flows then adds the key and bumps the dependency. After that, run the staging checks in [quickstart.md §3](./quickstart.md#3-staging-check-against-the-private-bucket) before production.
- **Backward compatibility window**: open-ended in both directions. Editor 3.6.5 ignores the key, and editor 3.7.0 without the key behaves like 3.6.5.
- **Rollback**: remove `media_urls` from `flow_editor.haml` (runtime disable, no editor redeploy), or pin `@weni/flow-editor` back to 3.6.5. Both are safe because nothing signed is ever persisted.
- **Migration reversibility**: no migration. The definition format and `SPEC_VERSION` are unchanged.
