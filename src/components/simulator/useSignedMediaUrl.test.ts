import * as React from 'react';
import { HttpResponse, http } from 'msw';
import { config } from 'test/config';
import { server } from 'test/mswServer';
import { act, render, waitFor } from 'test/utils';
import { MediaUrlSigner } from 'services/MediaUrlSigner';
import { SignedMediaUrlState, useSignedMediaUrl } from './useSignedMediaUrl';

const imageUrl = 'https://weni-flows.s3.us-east-1.amazonaws.com/a/image.jpg';
const otherUrl = 'https://weni-flows.s3.us-east-1.amazonaws.com/a/other.jpg';
const signedSuffix = '?X-Amz-Signature=test';

const renderHook = (initialUrl: string) => {
  const states: SignedMediaUrlState[] = [];

  const Probe = ({ url }: { url: string }) => {
    const state = useSignedMediaUrl(url);
    states.push(state);
    return React.createElement('span', { 'data-testid': 'probe' }, state.url);
  };

  const view = render(React.createElement(Probe, { url: initialUrl }));
  const rerender = (url: string) =>
    view.rerender(React.createElement(Probe, { url }));

  return { states, rerender, unmount: view.unmount };
};

const countSigningRequests = () => {
  const requests: string[] = [];
  server.events.on('request:start', ({ request }) => {
    if (request.url.endsWith(config.endpoints.media_urls)) {
      requests.push(request.url);
    }
  });
  return requests;
};

describe('useSignedMediaUrl', () => {
  afterEach(() => {
    MediaUrlSigner.get().configure(undefined);
    server.events.removeAllListeners();
    vi.restoreAllMocks();
  });

  describe('with signing disabled', () => {
    it('returns the original url on the first render', () => {
      const requests = countSigningRequests();
      const { states } = renderHook(imageUrl);

      expect(states[0]).toEqual({
        url: imageUrl,
        isLoading: false,
        error: null,
      });
      expect(states).toHaveLength(1);
      expect(requests).toHaveLength(0);
    });
  });

  describe('with signing enabled', () => {
    beforeEach(() => {
      MediaUrlSigner.get().configure(config.endpoints.media_urls);
    });

    it('loads and then returns the signed url', async () => {
      const { states } = renderHook(imageUrl);

      expect(states[0]).toEqual({ url: null, isLoading: true, error: null });

      await waitFor(() =>
        expect(states[states.length - 1]).toEqual({
          url: imageUrl + signedSuffix,
          isLoading: false,
          error: null,
        }),
      );
    });

    it('returns a cached url on the first render without a request', async () => {
      await MediaUrlSigner.get().resolve(imageUrl, { surface: 'simulator' });
      const requests = countSigningRequests();

      const { states } = renderHook(imageUrl);

      expect(states[0]).toEqual({
        url: imageUrl + signedSuffix,
        isLoading: false,
        error: null,
      });
      expect(requests).toHaveLength(0);
    });

    it('falls back to the original url when signing answers 500', async () => {
      server.use(
        http.post(config.endpoints.media_urls, () =>
          HttpResponse.json({}, { status: 500 }),
        ),
      );

      const { states } = renderHook(imageUrl);

      await waitFor(() =>
        expect(states[states.length - 1]).toEqual({
          url: imageUrl,
          isLoading: false,
          error: 'http_error',
        }),
      );
    });

    it('discards the stale result when the url changes mid-flight', async () => {
      let releaseFirst: () => void = () => undefined;
      const firstGate = new Promise<void>(resolve => {
        releaseFirst = resolve;
      });
      server.use(
        http.post(config.endpoints.media_urls, async ({ request }) => {
          const { urls } = (await request.json()) as { urls: string[] };
          if (urls.indexOf(imageUrl) > -1) {
            await firstGate;
          }
          return HttpResponse.json({
            urls: urls.reduce(
              (signed: { [url: string]: string }, url: string) => {
                signed[url] = url + signedSuffix;
                return signed;
              },
              {},
            ),
            expires_in: 3600,
          });
        }),
      );

      const requests = countSigningRequests();
      const { states, rerender } = renderHook(imageUrl);

      // Different ticks, so that the two urls are signed in separate requests.
      await waitFor(() => expect(requests).toHaveLength(1));
      rerender(otherUrl);

      await waitFor(() =>
        expect(states[states.length - 1].url).toBe(otherUrl + signedSuffix),
      );

      await act(async () => {
        releaseFirst();
        await firstGate;
      });

      const last = states[states.length - 1];
      expect(last.url).toBe(otherUrl + signedSuffix);
      expect(states.some(state => state.url === imageUrl + signedSuffix)).toBe(
        false,
      );
    });

    it('does not update state after unmounting mid-flight', async () => {
      const errorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const { states, unmount } = renderHook(imageUrl);
      const renderCount = states.length;

      unmount();
      await MediaUrlSigner.get().resolve(imageUrl, { surface: 'simulator' });
      await act(async () => {
        await Promise.resolve();
      });

      expect(states).toHaveLength(renderCount);
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
