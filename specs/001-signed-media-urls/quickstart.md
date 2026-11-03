# Quickstart: Validating Signed Media URLs

**Feature**: `001-signed-media-urls` | **Spec**: [spec.md](./spec.md) | **Contracts**: [contracts/](./contracts/)

This guide shows how to prove that each acceptance criterion holds. It does not describe the implementation.

## Prerequisites

- Node.js 18+ and Yarn, then run `yarn install` in the repository root.
- Branch `001-signed-media-urls` checked out.
- For the staging checks only:
  - a Flows deploy that serves `POST /flow/media_urls/<flow_uuid>/` ([flows#904](https://github.com/weni-ai/flows/pull/904), `specs/010-signed-media-urls`), with the Flows PR that bumps `@weni/flow-editor` to 3.7.0;
  - a private attachments bucket;
  - `S3_ORG_SCOPED_KEY_PREFIXES` in the Flows environment covering the `S3MediaPrefix` used by Courier and Mailroom. Otherwise Flows returns their media unsigned and it stays broken in the editor (spec, Failure Handling).

## 1. Automated checks

Run these from the repository root. `--coverage.enabled=false` keeps the targeted runs quiet. The last command is the full gate.

```bash
# Service and adapter: AC-5, AC-6, AC-7
yarn test run services/MediaUrlSigner external/media --coverage.enabled=false

# Surfaces: AC-1, AC-2, AC-3, AC-4
yarn test run sendmsg/attachments localization/MsgLocalizationForm sendmsg/SendMsgForm \
  simulator/SimulatorAttachment simulator/useSignedMediaUrl simulator/LogEvent \
  mediaplayer/MediaPlayer saymsg/SayMsg utils/openSignedMedia --coverage.enabled=false

# PR gate (Principle I)
yarn build && yarn test run
```

**Expected outcomes**:

| AC | Proven by | Passes when |
|----|-----------|-------------|
| AC-1 | `attachments.test.tsx`, `MsgLocalizationForm.test.tsx` | The stubbed tab's `location.href` is the signed URL (`...?X-Amz-Signature=test`) after a click on the download icon. Before the fix, this test fails. |
| AC-2 | `SimulatorAttachment.test.tsx` | `img.src` and `video.src` are signed after loading. A document click navigates the stubbed tab to the signed URL. Audio renders `MediaPlayer` with the original URL. |
| AC-3 | `MediaPlayer.test.tsx` | After the first toggle, `audio.src` is signed and `play` was called once. During resolution the icon is `hourglass_empty` with `aria-busy="true"`, and a second toggle sends no second request. |
| AC-4 | `attachments.test.tsx`, `SendMsgForm.test.ts`, `SayMsg.test.ts` | `onAttachmentChanged` is not called, and the saved attachments keep the canonical URL. After playback on the Say Message card, the action keeps its canonical `audio_url` and the Redux state holds no `X-Amz-Signature`. |
| AC-5 | `MediaUrlSigner.test.ts` | With `configure(undefined)`, `resolve` returns the input and msw records no request. The existing `LogEvent` and `MediaPlayer` snapshots differ only where the markup changed (the document `<button>`). |
| AC-6 | `MediaUrlSigner.test.ts` | For 500, network, timeout and malformed bodies, the original is returned, `Sentry.captureException` is called once with the [report shape](./data-model.md#report-shape-mediasigningerror) and no URL, and the next call sends a new request. A caller that joins an in-flight request adds no second report. |
| AC-7 | `MediaUrlSigner.test.ts` | Two calls within the validity window send one request. Three URLs in one tick send one request. 25 URLs send two (20 and 5). After `expiresAt` (fake `Date`), a new request is sent. |

Lint has to pass as part of the test run, because `vite-plugin-eslint` fails a file that the parser rejects ([research.md R1](./research.md#r1-syntax-that-the-test-pipeline-accepts)). Also run `yarn lint` on the touched files.

## 2. Local manual check (no backend)

1. Run `yarn start` and open `http://localhost:3000`.
2. With the default dev config, which has no `media_urls`, open the simulator and send the sample image, video and audio. They render and play as on `main` (AC-5). The DevTools Network tab shows no request to `media_urls`.

## 3. Staging check against the private bucket

Run this after Flows ships the endpoint and the `media_urls` config key, as described in the spec's Rollout and Rollback, step 3.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open a messaging flow, add Send Message, upload a PDF, then click the download icon. | A new tab opens on a URL with `X-Amz-Signature` and the file is shown. A `POST .../media_urls/...` returns `200` with `Cache-Control: no-store`. |
| 2 | Click download again within an hour. | There is no new `media_urls` request (AC-7). |
| 3 | Open the translation form for the same message and click download. | Same as step 1, served from the cache. |
| 4 | Run the simulator on a flow that sends an image, a video, a PDF and an audio from the private bucket. | The image and video load. The PDF opens in a signed tab. The audio plays. The image and video share one `media_urls` request (AC-2). |
| 5 | In an IVR flow with a Say Message recording, click play on the card. | The icon shows an hourglass while signing, then audio plays from a signed URL (AC-3). In Safari, if the first click stops immediately, the second click plays. |
| 6 | Save the flow, then inspect the latest revision JSON. | Attachments and `audio_url` hold canonical URLs with no `X-Amz-` parameters (AC-4). |
| 7 | Block the endpoint in DevTools (Network request blocking), then click download. | The tab opens on the original URL (S3 returns `403`), and the editor raises no console error or unhandled rejection. Sentry receives `feature: media-signing`, `reason: network` with no URL in tags or extras (AC-6). |
| 8 | Enable the browser's popup blocker for the site, then click download. | Nothing opens, the editor shows no message, and Sentry receives `reason: popup_blocked`. |

## 4. Rollback check

Remove `media_urls` from the Flows template, or pin `@weni/flow-editor` to 3.6.5, and reload. The editor uses stored URLs and sends no `media_urls` requests. No data cleanup is needed, because nothing was persisted.
