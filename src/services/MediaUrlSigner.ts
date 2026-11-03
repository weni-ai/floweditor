import * as Sentry from '@sentry/react';
import {
  MediaSigningFailureReason,
  SignedMediaChunk,
  getSignedMediaUrls,
} from 'external/media';

export type MediaSurface = 'sendmsg_download' | 'simulator' | 'say_msg_audio';

export interface ResolveOptions {
  surface: MediaSurface;
}

export interface MediaUrlResolution {
  url: string;
  failureReason: MediaSigningFailureReason | null;
}

interface SignedUrlCacheEntry {
  signedUrl: string;
  expiresAt: number;
}

interface ReportExtra {
  status?: number;
  urlCount: number;
}

const EXPIRY_MARGIN_SECONDS = 60;

export class MediaSigningError extends Error {
  constructor(reason: MediaSigningFailureReason) {
    super(`Media URL signing failed: ${reason}`);
    this.name = 'MediaSigningError';
    Object.setPrototypeOf(this, MediaSigningError.prototype);
  }
}

const isSignableUrl = (value: string): boolean => {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch (error) {
    return false;
  }
};

/**
 * Turns the canonical media URLs stored in a flow into short-lived presigned
 * URLs. The signed URLs only ever live in this service's memory: they are
 * never written to Redux, the flow definition or any storage, so a flow can
 * not be saved with an expiring URL in it.
 */
export class MediaUrlSigner {
  private static singleton: MediaUrlSigner = new MediaUrlSigner();

  static get(): MediaUrlSigner {
    return MediaUrlSigner.singleton;
  }

  private endpoint: string | null = null;
  private generation = 0;
  private cache = new Map<string, SignedUrlCacheEntry>();
  private inFlight = new Map<string, Promise<MediaUrlResolution>>();
  private settlers = new Map<
    string,
    (resolution: MediaUrlResolution) => void
  >();
  private queue: string[] = [];
  private queueSurface: MediaSurface | null = null;

  private constructor() {}

  /** Sets the endpoint and clears the cache. `undefined` or `''` disables signing. */
  configure(endpoint: string | undefined): void {
    this.endpoint = endpoint ? endpoint : null;
    this.generation += 1;
    this.cache.clear();
  }

  /** Answers without a request when possible, otherwise returns null. */
  getResolvedUrl(url: string): string | null {
    if (this.endpoint === null || !isSignableUrl(url)) {
      return url;
    }

    const entry = this.cache.get(url);
    if (entry !== undefined && Date.now() < entry.expiresAt) {
      return entry.signedUrl;
    }
    return null;
  }

  resolve(url: string, options: ResolveOptions): Promise<string> {
    return this.resolveWithOutcome(url, options).then(result => result.url);
  }

  resolveWithOutcome(
    url: string,
    options: ResolveOptions,
  ): Promise<MediaUrlResolution> {
    const resolvedUrl = this.getResolvedUrl(url);
    if (resolvedUrl !== null) {
      return Promise.resolve({ url: resolvedUrl, failureReason: null });
    }

    // A caller that joins a pending request adds no report of its own.
    const pending = this.inFlight.get(url);
    if (pending !== undefined) {
      return pending;
    }

    const resolution = new Promise<MediaUrlResolution>(settle => {
      this.settlers.set(url, settle);
    });
    this.inFlight.set(url, resolution);
    this.enqueue(url, options.surface);
    return resolution;
  }

  resolveMany(urls: string[], options: ResolveOptions): Promise<string[]> {
    return Promise.all(urls.map(url => this.resolve(url, options)));
  }

  /** Reports a failure that happened outside a signing request, such as popup_blocked. */
  reportFailure(reason: MediaSigningFailureReason, surface: MediaSurface) {
    this.report(reason, surface, { urlCount: 1 });
  }

  private enqueue(url: string, surface: MediaSurface) {
    if (this.queue.length === 0) {
      this.queueSurface = surface;
      // Everything requested in the same tick shares one request.
      Promise.resolve().then(() => this.flush());
    }
    this.queue.push(url);
  }

  private flush() {
    const urls = this.queue;
    const surface = this.queueSurface as MediaSurface;
    const { endpoint, generation } = this;
    this.queue = [];
    this.queueSurface = null;

    if (endpoint === null) {
      urls.forEach(url => this.settle(url, { url, failureReason: null }));
      return;
    }

    getSignedMediaUrls(endpoint, urls).then(chunks =>
      chunks.forEach(chunk => this.settleChunk(chunk, surface, generation)),
    );
  }

  private settleChunk(
    chunk: SignedMediaChunk,
    surface: MediaSurface,
    generation: number,
  ) {
    if (!chunk.isSigned) {
      const { reason, status } = chunk.failure;
      chunk.requestedUrls.forEach(url =>
        this.settle(url, { url, failureReason: reason }),
      );
      const urlCount = chunk.requestedUrls.length;
      this.report(
        reason,
        surface,
        status === null ? { urlCount } : { status, urlCount },
      );
      return;
    }

    // Entries expire before the signature does, so a URL taken from the cache
    // never dies in the middle of a download or while audio is buffering.
    const { expiresInSeconds } = chunk;
    const lifetimeSeconds = Math.max(
      expiresInSeconds - EXPIRY_MARGIN_SECONDS,
      expiresInSeconds / 2,
    );
    const expiresAt = Date.now() + lifetimeSeconds * 1000;
    const isCurrent = generation === this.generation;
    let missingCount = 0;

    chunk.requestedUrls.forEach(url => {
      const signedUrl = chunk.signedUrls.get(url);
      if (signedUrl === undefined) {
        missingCount += 1;
        this.settle(url, { url, failureReason: 'invalid_response' });
        return;
      }
      if (isCurrent) {
        this.cache.set(url, { signedUrl, expiresAt });
      }
      this.settle(url, { url: signedUrl, failureReason: null });
    });

    if (missingCount > 0) {
      this.report('invalid_response', surface, { urlCount: missingCount });
    }
  }

  private settle(url: string, resolution: MediaUrlResolution) {
    const settleResolution = this.settlers.get(url);
    this.settlers.delete(url);
    this.inFlight.delete(url);
    if (settleResolution !== undefined) {
      settleResolution(resolution);
    }
  }

  // Only the reason, the surface and counts are reported: a URL, an object key
  // or the axios error would leak file names into Sentry.
  private report(
    reason: MediaSigningFailureReason,
    surface: MediaSurface,
    extra: ReportExtra,
  ) {
    Sentry.captureException(new MediaSigningError(reason), {
      tags: { feature: 'media-signing', surface, reason },
      extra,
    });
  }
}
