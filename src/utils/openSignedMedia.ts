import { MediaUrlSigner, ResolveOptions } from 'services/MediaUrlSigner';

/**
 * Opens a stored media file in a new tab through a signed URL.
 *
 * Must be called synchronously from a click handler. The tab is opened right
 * away, before the signing request, so the click's user activation is still
 * valid and popup blockers let it through. The tab is pointed at the signed
 * URL once the service answers.
 */
export function openSignedMedia(
  url: string,
  options: ResolveOptions,
): Promise<void> {
  const tab = window.open('', '_blank');

  if (tab === null) {
    MediaUrlSigner.get().reportFailure('popup_blocked', options.surface);
    return Promise.resolve();
  }

  // The opened page must not be able to reach back into the editor.
  tab.opener = null;

  return MediaUrlSigner.get()
    .resolve(url, options)
    .then(resolvedUrl => {
      if (!tab.closed) {
        tab.location.href = resolvedUrl;
      }
    });
}
