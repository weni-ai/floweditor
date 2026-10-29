import * as Sentry from '@sentry/react';
import { HttpResponse, http } from 'msw';
import { config } from 'test/config';
import { server } from 'test/mswServer';
import { MediaUrlSigner } from 'services/MediaUrlSigner';
import { openSignedMedia } from './openSignedMedia';

const endpoint = config.endpoints.media_urls as string;
const url =
  'https://weni-flows.s3.us-east-1.amazonaws.com/attachments/42/1337/steps/9c1d/report.pdf';
const options = { surface: 'sendmsg_download' as const };

const createTab = () => ({ opener: {}, closed: false, location: { href: '' } });

const stubOpen = (tab: ReturnType<typeof createTab> | null) =>
  vi.spyOn(window, 'open').mockReturnValue((tab as unknown) as Window | null);

describe('openSignedMedia', () => {
  beforeEach(() => {
    MediaUrlSigner.get().configure(endpoint);
  });

  afterEach(() => {
    MediaUrlSigner.get().configure(undefined);
    vi.restoreAllMocks();
    vi.mocked(Sentry.captureException).mockClear();
  });

  it('opens the tab synchronously and navigates it to the signed url', async () => {
    const tab = createTab();
    const openSpy = stubOpen(tab);

    const pending = openSignedMedia(url, options);

    // Before awaiting anything: the click's user activation is still valid.
    expect(openSpy).toHaveBeenCalledWith('', '_blank');
    expect(tab.opener).toBeNull();

    await pending;
    expect(tab.location.href).toBe(url + '?X-Amz-Signature=test');
  });

  it('navigates to the original url when signing fails', async () => {
    server.use(
      http.post(endpoint, () => new HttpResponse(null, { status: 500 })),
    );
    const tab = createTab();
    stubOpen(tab);

    await openSignedMedia(url, options);

    expect(tab.location.href).toBe(url);
  });

  it('reports popup_blocked and leaves the editor window alone', async () => {
    stubOpen(null);
    const hrefBefore = window.location.href;

    await openSignedMedia(url, options);

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Media URL signing failed: popup_blocked',
      }),
      {
        tags: {
          feature: 'media-signing',
          surface: 'sendmsg_download',
          reason: 'popup_blocked',
        },
        extra: { urlCount: 1 },
      },
    );
    expect(window.location.href).toBe(hrefBefore);
  });

  it('does not navigate a tab the user already closed', async () => {
    const tab = createTab();
    stubOpen(tab);

    const pending = openSignedMedia(url, options);
    tab.closed = true;
    await pending;

    expect(tab.location.href).toBe('');
  });

  it('never rejects', async () => {
    server.use(http.post(endpoint, () => HttpResponse.error()));
    stubOpen(createTab());

    await expect(openSignedMedia(url, options)).resolves.toBeUndefined();
  });
});
