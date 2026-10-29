import axios, { AxiosResponse } from 'axios';
import { getCookie } from 'external';

export const SIGNING_TIMEOUT_MS = 10000;
export const SIGNING_CHUNK_SIZE = 20;

export type MediaSigningFailureReason =
  | 'timeout'
  | 'network'
  | 'http_error'
  | 'invalid_response'
  | 'popup_blocked';

export interface MediaSigningFailure {
  reason: MediaSigningFailureReason;
  status: number | null;
}

export type SignedMediaChunk =
  | {
      isSigned: true;
      requestedUrls: string[];
      signedUrls: Map<string, string>;
      expiresInSeconds: number;
    }
  | {
      isSigned: false;
      requestedUrls: string[];
      failure: MediaSigningFailure;
    };

interface SigningResponseBody {
  urls: { [originalUrl: string]: string };
  expires_in: number;
}

const isSigningResponseBody = (body: unknown): body is SigningResponseBody => {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const { urls, expires_in } = body as { [key: string]: unknown };
  if (typeof urls !== 'object' || urls === null || Array.isArray(urls)) {
    return false;
  }

  const allValuesAreStrings = Object.keys(urls).every(
    key => typeof (urls as { [key: string]: unknown })[key] === 'string',
  );

  return (
    allValuesAreStrings &&
    typeof expires_in === 'number' &&
    isFinite(expires_in) &&
    expires_in > 0
  );
};

const buildHeaders = (): { [header: string]: string } => {
  // The module-wide axios default is application/javascript, which Flows
  // would not parse as JSON.
  const headers: { [header: string]: string } = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const csrf = getCookie('csrftoken');
  if (csrf) {
    headers['X-CSRFToken'] = csrf;
  }

  return headers;
};

const toChunks = (urls: string[]): string[][] => {
  const chunks: string[][] = [];
  for (let start = 0; start < urls.length; start += SIGNING_CHUNK_SIZE) {
    chunks.push(urls.slice(start, start + SIGNING_CHUNK_SIZE));
  }
  return chunks;
};

const toFailure = (error: unknown): MediaSigningFailure => {
  const { response, code } = error as {
    response?: { status: number };
    code?: string;
  };

  if (response) {
    return { reason: 'http_error', status: response.status };
  }

  if (code === 'ECONNABORTED') {
    return { reason: 'timeout', status: null };
  }

  return { reason: 'network', status: null };
};

const toSignedChunk = (
  requestedUrls: string[],
  response: AxiosResponse<unknown>,
): SignedMediaChunk => {
  const body = response.data;
  if (!isSigningResponseBody(body)) {
    return {
      isSigned: false,
      requestedUrls,
      failure: { reason: 'invalid_response', status: response.status },
    };
  }

  const signedUrls = new Map<string, string>();
  Object.keys(body.urls).forEach(url => signedUrls.set(url, body.urls[url]));

  return {
    isSigned: true,
    requestedUrls,
    signedUrls,
    expiresInSeconds: body.expires_in,
  };
};

const signChunk = (
  endpoint: string,
  requestedUrls: string[],
): Promise<SignedMediaChunk> =>
  axios
    .post(
      endpoint,
      { urls: requestedUrls },
      { headers: buildHeaders(), timeout: SIGNING_TIMEOUT_MS },
    )
    .then(response => toSignedChunk(requestedUrls, response))
    // The axios error is dropped here on purpose: its config holds every
    // original URL and must never reach error reporting.
    .catch(
      (error: unknown): SignedMediaChunk => ({
        isSigned: false,
        requestedUrls,
        failure: toFailure(error),
      }),
    );

/** Sends one POST per chunk of at most 20 URLs. Never rejects. */
export const getSignedMediaUrls = (
  endpoint: string,
  urls: string[],
): Promise<SignedMediaChunk[]> =>
  Promise.all(toChunks(urls).map(chunk => signChunk(endpoint, chunk)));
