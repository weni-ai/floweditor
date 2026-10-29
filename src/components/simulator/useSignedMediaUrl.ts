import { useEffect, useState } from 'react';
import { MediaSigningFailureReason } from 'external/media';
import { MediaUrlSigner } from 'services/MediaUrlSigner';

export interface SignedMediaUrlState {
  url: string | null;
  isLoading: boolean;
  error: MediaSigningFailureReason | null;
}

interface ResolvedResult {
  source: string;
  state: SignedMediaUrlState;
}

const getImmediateState = (url: string): SignedMediaUrlState => {
  const resolvedUrl = MediaUrlSigner.get().getResolvedUrl(url);

  return resolvedUrl !== null
    ? { url: resolvedUrl, isLoading: false, error: null }
    : { url: null, isLoading: true, error: null };
};

/**
 * Signs a stored media url for rendering. The state is derived from the url
 * it was resolved for, so a new url never shows the previous one's result.
 */
export function useSignedMediaUrl(url: string): SignedMediaUrlState {
  const [result, setResult] = useState<ResolvedResult>(null);

  useEffect(() => {
    if (MediaUrlSigner.get().getResolvedUrl(url) !== null) {
      return undefined;
    }

    let isCancelled = false;

    MediaUrlSigner.get()
      .resolveWithOutcome(url, { surface: 'simulator' })
      .then(resolution => {
        if (!isCancelled) {
          setResult({
            source: url,
            state: {
              url: resolution.url,
              isLoading: false,
              error: resolution.failureReason,
            },
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [url]);

  return result !== null && result.source === url
    ? result.state
    : getImmediateState(url);
}
