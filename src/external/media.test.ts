import axios from 'axios';
import { HttpResponse, http } from 'msw';
import { config } from 'test/config';
import { server } from 'test/mswServer';
import { getSignedMediaUrls } from './media';

const endpoint = config.endpoints.media_urls as string;

const urlAt = (index: number) =>
  `https://bucket.s3.amazonaws.com/attachments/${index}/file.png`;

const respondWith = (body: unknown, status = 200) =>
  server.use(http.post(endpoint, () => HttpResponse.json(body, { status })));

describe('getSignedMediaUrls', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  describe('request', () => {
    it('posts the urls as json with the ajax headers', async () => {
      const received: { body: unknown; headers: Headers }[] = [];
      server.use(
        http.post(endpoint, async ({ request }) => {
          received.push({
            body: await request.json(),
            headers: request.headers,
          });
          return HttpResponse.json({ urls: {}, expires_in: 3600 });
        }),
      );

      await getSignedMediaUrls(endpoint, [urlAt(1)]);

      expect(received).toHaveLength(1);
      expect(received[0].body).toEqual({ urls: [urlAt(1)] });
      expect(received[0].headers.get('Content-Type')).toContain(
        'application/json',
      );
      expect(received[0].headers.get('X-Requested-With')).toBe(
        'XMLHttpRequest',
      );
      expect(received[0].headers.get('X-CSRFToken')).toBeNull();
    });

    it('sends the csrf token when the cookie exists', async () => {
      document.cookie = 'csrftoken=abc';
      const tokens: (string | null)[] = [];
      server.use(
        http.post(endpoint, ({ request }) => {
          tokens.push(request.headers.get('X-CSRFToken'));
          return HttpResponse.json({ urls: {}, expires_in: 3600 });
        }),
      );

      await getSignedMediaUrls(endpoint, [urlAt(1)]);

      expect(tokens).toEqual(['abc']);
    });

    it('splits 25 urls into parallel chunks of 20 and 5', async () => {
      const sizes: number[] = [];
      server.use(
        http.post(endpoint, async ({ request }) => {
          const body = (await request.json()) as { urls: string[] };
          sizes.push(body.urls.length);
          return HttpResponse.json({ urls: {}, expires_in: 3600 });
        }),
      );
      const urls = Array.from({ length: 25 }, (_, index) => urlAt(index));

      const chunks = await getSignedMediaUrls(endpoint, urls);

      expect(sizes.sort((a, b) => b - a)).toEqual([20, 5]);
      expect(chunks.map(chunk => chunk.requestedUrls)).toEqual([
        urls.slice(0, 20),
        urls.slice(20),
      ]);
    });
  });

  describe('success', () => {
    it('returns the signed urls and the lifetime in seconds', async () => {
      respondWith({
        urls: { [urlAt(1)]: urlAt(1) + '?sig=1' },
        expires_in: 3600,
      });

      const chunks = await getSignedMediaUrls(endpoint, [urlAt(1)]);

      expect(chunks).toEqual([
        {
          isSigned: true,
          requestedUrls: [urlAt(1)],
          signedUrls: new Map([[urlAt(1), urlAt(1) + '?sig=1']]),
          expiresInSeconds: 3600,
        },
      ]);
    });
  });

  describe('failure', () => {
    it.each([500, 400])('reports an http_error for a %i', async status => {
      respondWith({ detail: 'nope' }, status);

      const chunks = await getSignedMediaUrls(endpoint, [urlAt(1)]);

      expect(chunks).toEqual([
        {
          isSigned: false,
          requestedUrls: [urlAt(1)],
          failure: { reason: 'http_error', status },
        },
      ]);
    });

    it('reports a network failure without a status', async () => {
      server.use(http.post(endpoint, () => HttpResponse.error()));

      const chunks = await getSignedMediaUrls(endpoint, [urlAt(1)]);

      expect(chunks).toEqual([
        {
          isSigned: false,
          requestedUrls: [urlAt(1)],
          failure: { reason: 'network', status: null },
        },
      ]);
    });

    it('reports a timeout without a status', async () => {
      vi.spyOn(axios, 'post').mockRejectedValueOnce(
        Object.assign(new Error('timeout of 10000ms exceeded'), {
          code: 'ECONNABORTED',
        }),
      );

      const chunks = await getSignedMediaUrls(endpoint, [urlAt(1)]);

      expect(chunks).toEqual([
        {
          isSigned: false,
          requestedUrls: [urlAt(1)],
          failure: { reason: 'timeout', status: null },
        },
      ]);
    });

    it.each([
      ['urls is an array', { urls: [], expires_in: 3600 }],
      ['urls is null', { urls: null, expires_in: 3600 }],
      [
        'a url value is not a string',
        { urls: { [urlAt(1)]: 42 }, expires_in: 3600 },
      ],
      ['expires_in is 0', { urls: {}, expires_in: 0 }],
      ['expires_in is missing', { urls: {} }],
      ['expires_in is a string', { urls: {}, expires_in: '3600' }],
    ])('reports invalid_response when %s', async (_, body) => {
      respondWith(body);

      const chunks = await getSignedMediaUrls(endpoint, [urlAt(1)]);

      expect(chunks).toEqual([
        {
          isSigned: false,
          requestedUrls: [urlAt(1)],
          failure: { reason: 'invalid_response', status: 200 },
        },
      ]);
    });

    it('gives each chunk its own outcome', async () => {
      server.use(
        http.post(endpoint, async ({ request }) => {
          const body = (await request.json()) as { urls: string[] };
          if (body.urls.length === 20) {
            return HttpResponse.json({ detail: 'bad' }, { status: 400 });
          }
          return HttpResponse.json({
            urls: { [body.urls[0]]: body.urls[0] + '?sig=1' },
            expires_in: 3600,
          });
        }),
      );
      const urls = Array.from({ length: 21 }, (_, index) => urlAt(index));

      const chunks = await getSignedMediaUrls(endpoint, urls);

      expect(chunks[0].isSigned).toBe(false);
      expect(chunks[1].isSigned).toBe(true);
      expect(chunks[1].requestedUrls).toEqual([urlAt(20)]);
    });
  });
});
