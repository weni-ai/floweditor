import axios from 'axios';
import * as Sentry from '@sentry/react';
import { HttpResponse, delay, http } from 'msw';
import { config } from 'test/config';
import { server } from 'test/mswServer';
import { MediaUrlSigner } from './MediaUrlSigner';

vi.mock('@sentry/react', () => ({ captureException: vi.fn() }));

const endpoint = config.endpoints.media_urls as string;
const signer = MediaUrlSigner.get();
const simulator = { surface: 'simulator' as const };

const urlAt = (index: number) =>
  `https://bucket.s3.amazonaws.com/attachments/${index}/file.png`;
const signed = (url: string) => url + '?X-Amz-Signature=test';

const signAll = (urls: string[], expiresIn = 3600) =>
  HttpResponse.json({
    urls: urls.reduce(
      (map: { [url: string]: string }, url) => ({ ...map, [url]: signed(url) }),
      {},
    ),
    expires_in: expiresIn,
  });

type Responder = (urls: string[]) => Response | Promise<Response>;

/** Overrides the endpoint and records the urls of each request it receives. */
const trackRequests = (respond: Responder = urls => signAll(urls)) => {
  const requests: string[][] = [];
  server.use(
    http.post(endpoint, async ({ request }) => {
      const body = (await request.json()) as { urls: string[] };
      requests.push(body.urls);
      return respond(body.urls);
    }),
  );
  return requests;
};

const captured = () => vi.mocked(Sentry.captureException);

const reportFor = (
  reason: string,
  extra: { status?: number; urlCount: number },
  surface = 'simulator',
) => [
  expect.objectContaining({
    name: 'MediaSigningError',
    message: `Media URL signing failed: ${reason}`,
  }),
  { tags: { feature: 'media-signing', surface, reason }, extra },
];

describe('MediaUrlSigner', () => {
  beforeEach(() => {
    signer.configure(endpoint);
  });

  afterEach(() => {
    signer.configure(undefined);
    server.events.removeAllListeners();
    vi.useRealTimers();
    vi.restoreAllMocks();
    captured().mockClear();
  });

  describe('when signing is disabled (AC-5)', () => {
    it.each([undefined, ''])('returns urls untouched for %p', async value => {
      signer.configure(value);
      const requests = trackRequests();

      expect(await signer.resolve(urlAt(1), simulator)).toBe(urlAt(1));
      expect(signer.getResolvedUrl(urlAt(1))).toBe(urlAt(1));
      expect(requests).toEqual([]);
    });
  });

  describe('urls that cannot be signed', () => {
    it.each([
      'geo:-1.2,3.4',
      'data:image/png;base64,AAAA',
      'blob:https://example.com/1234',
      '/relative/image.png',
      '@fields.photo',
    ])('returns %s unchanged with no request', async value => {
      const requests = trackRequests();

      expect(signer.getResolvedUrl(value)).toBe(value);
      expect(await signer.resolve(value, simulator)).toBe(value);
      expect(requests).toEqual([]);
    });
  });

  describe('cache (AC-7)', () => {
    it('requests a url once for sequential calls', async () => {
      const requests = trackRequests();

      expect(await signer.resolve(urlAt(1), simulator)).toBe(signed(urlAt(1)));
      expect(await signer.resolve(urlAt(1), simulator)).toBe(signed(urlAt(1)));
      expect(requests).toEqual([[urlAt(1)]]);
    });

    it('answers getResolvedUrl only after resolution', async () => {
      expect(signer.getResolvedUrl(urlAt(1))).toBeNull();

      await signer.resolve(urlAt(1), simulator);

      expect(signer.getResolvedUrl(urlAt(1))).toBe(signed(urlAt(1)));
    });

    it('caches a url that Flows returns unchanged', async () => {
      const requests = trackRequests(urls =>
        HttpResponse.json({
          urls: { [urls[0]]: urls[0] },
          expires_in: 3600,
        }),
      );

      expect(await signer.resolve(urlAt(1), simulator)).toBe(urlAt(1));
      expect(await signer.resolve(urlAt(1), simulator)).toBe(urlAt(1));
      expect(requests).toHaveLength(1);
    });

    it('clears the cache when configured again', async () => {
      const requests = trackRequests();
      await signer.resolve(urlAt(1), simulator);

      signer.configure(endpoint);
      await signer.resolve(urlAt(1), simulator);

      expect(requests).toHaveLength(2);
    });
  });

  describe('deduplication and batching (AC-7)', () => {
    it('sends one request for concurrent calls of one url', async () => {
      const requests = trackRequests();

      const results = await Promise.all([
        signer.resolve(urlAt(1), simulator),
        signer.resolve(urlAt(1), simulator),
      ]);

      expect(results).toEqual([signed(urlAt(1)), signed(urlAt(1))]);
      expect(requests).toEqual([[urlAt(1)]]);
    });

    it('sends one request for different urls in the same tick', async () => {
      const requests = trackRequests();

      await Promise.all([
        signer.resolve(urlAt(1), simulator),
        signer.resolve(urlAt(2), simulator),
        signer.resolve(urlAt(3), simulator),
      ]);

      expect(requests).toEqual([[urlAt(1), urlAt(2), urlAt(3)]]);
    });

    it('splits 25 distinct urls into requests of 20 and 5', async () => {
      const requests = trackRequests();
      const urls = Array.from({ length: 25 }, (_, index) => urlAt(index));

      await signer.resolveMany(urls, simulator);

      expect(
        requests.map(request => request.length).sort((a, b) => b - a),
      ).toEqual([20, 5]);
    });

    it('keeps order and length in resolveMany, duplicates included', async () => {
      const requests = trackRequests();

      const results = await signer.resolveMany(
        [urlAt(1), urlAt(2), urlAt(1)],
        simulator,
      );

      expect(results).toEqual([
        signed(urlAt(1)),
        signed(urlAt(2)),
        signed(urlAt(1)),
      ]);
      expect(requests).toEqual([[urlAt(1), urlAt(2)]]);
    });
  });

  describe('expiry', () => {
    const lifetimeMs = (expiresIn: number) => expiresIn * 1000;

    it('expires an entry 60 seconds before the signature does', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      const start = Date.now();
      const requests = trackRequests();
      await signer.resolve(urlAt(1), simulator);
      const earlyBy = 60 * 1000;

      vi.setSystemTime(start + lifetimeMs(3600) - earlyBy - 1);
      expect(signer.getResolvedUrl(urlAt(1))).toBe(signed(urlAt(1)));
      await signer.resolve(urlAt(1), simulator);
      expect(requests).toHaveLength(1);

      vi.setSystemTime(start + lifetimeMs(3600) - earlyBy + 1);
      expect(signer.getResolvedUrl(urlAt(1))).toBeNull();
      await signer.resolve(urlAt(1), simulator);
      expect(requests).toHaveLength(2);
    });

    it('expires a short lived entry at half of its lifetime', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      const start = Date.now();
      trackRequests(urls => signAll(urls, 100));
      await signer.resolve(urlAt(1), simulator);

      vi.setSystemTime(start + 50 * 1000 - 1);
      expect(signer.getResolvedUrl(urlAt(1))).toBe(signed(urlAt(1)));

      vi.setSystemTime(start + 50 * 1000 + 1);
      expect(signer.getResolvedUrl(urlAt(1))).toBeNull();
    });
  });

  describe('failures (AC-6)', () => {
    const failures: [string, string, number | undefined, () => void][] = [
      [
        'a 500',
        'http_error',
        500,
        () =>
          server.use(
            http.post(endpoint, () =>
              HttpResponse.json({ detail: 'boom' }, { status: 500 }),
            ),
          ),
      ],
      [
        'a network error',
        'network',
        undefined,
        () => server.use(http.post(endpoint, () => HttpResponse.error())),
      ],
      [
        'an invalid body',
        'invalid_response',
        200,
        () =>
          server.use(
            http.post(endpoint, () => HttpResponse.json({ urls: [] })),
          ),
      ],
      [
        'a timeout',
        'timeout',
        undefined,
        () => {
          vi.spyOn(axios, 'post').mockRejectedValueOnce(
            Object.assign(new Error('timeout of 10000ms exceeded'), {
              code: 'ECONNABORTED',
            }),
          );
        },
      ],
    ];

    it.each(failures)(
      'falls back and reports once for %s',
      async (_, reason, status, arrange) => {
        arrange();

        const result = await signer.resolve(urlAt(1), simulator);

        expect(result).toBe(urlAt(1));
        expect(captured()).toHaveBeenCalledTimes(1);
        const extra =
          status === undefined ? { urlCount: 1 } : { status, urlCount: 1 };
        expect(captured().mock.calls[0]).toEqual(reportFor(reason, extra));
        expect(JSON.stringify(captured().mock.calls)).not.toContain(urlAt(1));
      },
    );

    it.each(failures)(
      'does not cache the fallback for %s',
      async (_, __, ___, arrange) => {
        arrange();
        await signer.resolve(urlAt(1), simulator);
        server.resetHandlers();
        const requests = trackRequests();

        const result = await signer.resolve(urlAt(1), simulator);

        expect(requests).toEqual([[urlAt(1)]]);
        expect(result).toBe(signed(urlAt(1)));
      },
    );

    it('falls back for a url missing from the response', async () => {
      trackRequests(urls =>
        HttpResponse.json({
          urls: { [urls[1]]: signed(urls[1]) },
          expires_in: 3600,
        }),
      );

      const [missing, present] = await Promise.all([
        signer.resolveWithOutcome(urlAt(1), simulator),
        signer.resolveWithOutcome(urlAt(2), simulator),
      ]);

      expect(missing).toEqual({
        url: urlAt(1),
        failureReason: 'invalid_response',
      });
      expect(present).toEqual({ url: signed(urlAt(2)), failureReason: null });
      expect(signer.getResolvedUrl(urlAt(2))).toBe(signed(urlAt(2)));
      expect(signer.getResolvedUrl(urlAt(1))).toBeNull();
      expect(captured()).toHaveBeenCalledTimes(1);
      expect(captured().mock.calls[0]).toEqual(
        reportFor('invalid_response', { urlCount: 1 }),
      );
    });

    it('only falls back the urls of the chunk that failed', async () => {
      trackRequests(urls =>
        urls.length === 20
          ? HttpResponse.json({ detail: 'bad' }, { status: 400 })
          : signAll(urls),
      );
      const urls = Array.from({ length: 21 }, (_, index) => urlAt(index));

      const results = await signer.resolveMany(urls, simulator);

      expect(results.slice(0, 20)).toEqual(urls.slice(0, 20));
      expect(results[20]).toBe(signed(urlAt(20)));
      expect(captured()).toHaveBeenCalledTimes(1);
      expect(captured().mock.calls[0]).toEqual(
        reportFor('http_error', { status: 400, urlCount: 20 }),
      );
    });

    it('tags the report with the surface that started the request', async () => {
      server.use(
        http.post(endpoint, async () => {
          await delay(20);
          return HttpResponse.json({ detail: 'boom' }, { status: 500 });
        }),
      );

      const starter = signer.resolve(urlAt(1), simulator);
      await new Promise(resolve => setTimeout(resolve, 0));
      const joiner = signer.resolve(urlAt(1), { surface: 'say_msg_audio' });
      await Promise.all([starter, joiner]);

      expect(captured()).toHaveBeenCalledTimes(1);
      expect(captured().mock.calls[0]).toEqual(
        reportFor('http_error', { status: 500, urlCount: 1 }, 'simulator'),
      );
    });
  });

  describe('reportFailure', () => {
    it('reports a failure that happened outside a request', () => {
      signer.reportFailure('popup_blocked', 'sendmsg_download');

      expect(captured()).toHaveBeenCalledTimes(1);
      expect(captured().mock.calls[0]).toEqual(
        reportFor('popup_blocked', { urlCount: 1 }, 'sendmsg_download'),
      );
    });
  });
});
