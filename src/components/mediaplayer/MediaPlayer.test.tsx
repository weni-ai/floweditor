import * as React from 'react';
import {
  MediaPlayer,
  MediaPlayerProps,
} from 'components/mediaplayer/MediaPlayer';
import { composeComponentTestUtils } from 'testUtils';
import { shallowToJson } from 'enzyme-to-json';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { render } from 'test/utils';
import * as Sentry from '@sentry/react';
import { HttpResponse, http } from 'msw';
import { config } from 'test/config';
import { server } from 'test/mswServer';
import { MediaUrlSigner } from 'services/MediaUrlSigner';

const baseProps: MediaPlayerProps = {
  url: 'https://valid-link.to/audio.mp3',
  surface: 'say_msg_audio',
  triggered: false,
};

const { setup } = composeComponentTestUtils(MediaPlayer, baseProps);

describe(MediaPlayer.name, () => {
  const audioLoadMock = vi.fn();
  const audioPlayMock = vi.fn();
  const audioPauseMock = vi.fn();
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.spyOn(window.HTMLMediaElement.prototype, 'load').mockImplementation(() =>
      audioLoadMock(),
    );
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() =>
      audioPlayMock(),
    );
    vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(
      () => audioPauseMock(),
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('render', () => {
    it('should render', () => {
      const { wrapper } = setup(false);
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it('should render with triggered', () => {
      const { setup } = composeComponentTestUtils(MediaPlayer, {
        ...baseProps,
        triggered: true,
      });
      const { wrapper } = setup(false);

      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
  });

  it('should start playing on mediaplayer click', async () => {
    const { getByTestId } = render(<MediaPlayer {...baseProps} />);
    vi.clearAllMocks();

    const mediaplayer = getByTestId('mediaplayer');
    expect(audioLoadMock).not.toHaveBeenCalled();
    expect(audioPlayMock).not.toHaveBeenCalled();
    expect(audioPauseMock).not.toHaveBeenCalled();
    fireEvent.mouseDown(mediaplayer);
    fireEvent.mouseUp(mediaplayer);
    expect(audioLoadMock).toHaveBeenCalled();
    expect(audioPlayMock).toHaveBeenCalled();
    expect(audioPauseMock).not.toHaveBeenCalled();
  });

  it('should not start playing on mediaplayer click if already playing and pause it instead', async () => {
    const { getByTestId } = render(<MediaPlayer {...baseProps} />);
    audioLoadMock.mockClear();
    audioPlayMock.mockClear();

    const mediaplayer = getByTestId('mediaplayer');
    fireEvent.mouseDown(mediaplayer);

    // Simulate time update to make sure audio is playing
    const audio = getByTestId('audio') as HTMLAudioElement;
    audio.currentTime = 1;
    await act(async () => {
      fireEvent.timeUpdate(audio);
    });

    // First click should play the audio
    expect(audioLoadMock).toHaveBeenCalledTimes(1);
    expect(audioPlayMock).toHaveBeenCalledTimes(1);
    expect(audioPauseMock).not.toHaveBeenCalled();

    // Second click should pause the audio
    fireEvent.mouseDown(mediaplayer);
    expect(audioLoadMock).toHaveBeenCalledTimes(1);
    expect(audioPlayMock).toHaveBeenCalledTimes(1);
    expect(audioPauseMock).toHaveBeenCalledTimes(1);
  });

  it('should update playing state if audio has stopped', async () => {
    const { baseElement, getByTestId, rerender } = render(
      <MediaPlayer {...baseProps} />,
    );
    audioLoadMock.mockClear();
    audioPlayMock.mockClear();

    const mediaplayer = getByTestId('mediaplayer');
    fireEvent.mouseDown(mediaplayer);

    // Simulate time update to make sure audio is playing
    const audio = getByTestId('audio') as HTMLAudioElement;
    audio.currentTime = 1;
    fireEvent.timeUpdate(audio);

    // Simulate audio progressed
    audio.currentTime = 2;
    await act(async () => {
      fireEvent.timeUpdate(audio);
    });
    vi.runAllTimers();

    // Component must be in playing state
    expect(baseElement).toMatchSnapshot();

    // Simulate audio ended
    audio.currentTime = 0;
    await act(async () => {
      fireEvent.timeUpdate(audio);
    });
    vi.runAllTimers();

    rerender(
      <MediaPlayer {...baseProps} url="https://valid-link.to/audio2.mp3" />,
    );
    // Component must be in stopped state
    expect(baseElement).toMatchSnapshot();
  });
  describe('with signing configured', () => {
    const endpoint = config.endpoints.media_urls as string;
    const signedUrl = baseProps.url + '?X-Amz-Signature=test';
    const anotherUrl = 'https://valid-link.to/audio2.mp3';
    let signingRequests: string[];

    const signingBody = (urls: string[]) =>
      HttpResponse.json({
        urls: urls.reduce(
          (map: { [url: string]: string }, url) => ({
            ...map,
            [url]: url + '?X-Amz-Signature=test',
          }),
          {},
        ),
        expires_in: 3600,
      });

    /** Holds the signing response until the returned function is called. */
    const holdSigningResponse = () => {
      let release: () => void = () => undefined;
      const gate = new Promise<void>(resolve => {
        release = resolve;
      });
      server.use(
        http.post(endpoint, async ({ request }) => {
          const body = (await request.json()) as { urls: string[] };
          await gate;
          return signingBody(body.urls);
        }),
      );
      return release;
    };

    const settle = async () => {
      await waitFor(() =>
        expect(MediaUrlSigner.get().getResolvedUrl(baseProps.url)).toBe(
          signedUrl,
        ),
      );
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    };

    const iconText = (element: HTMLElement) => element.textContent;

    beforeEach(() => {
      vi.useRealTimers();
      MediaUrlSigner.get().configure(endpoint);
      audioPlayMock.mockResolvedValue(undefined);
      signingRequests = [];
      server.events.on('request:start', ({ request }) => {
        if (request.url.indexOf(endpoint) !== -1) {
          signingRequests.push(request.url);
        }
      });
    });

    afterEach(() => {
      MediaUrlSigner.get().configure(undefined);
      server.events.removeAllListeners();
      audioPlayMock.mockReset();
      vi.mocked(Sentry.captureException).mockClear();
    });

    it('plays the signed url on the first click', async () => {
      const { getByTestId } = render(<MediaPlayer {...baseProps} />);
      vi.clearAllMocks();

      fireEvent.mouseDown(getByTestId('mediaplayer'));

      const audio = getByTestId('audio') as HTMLAudioElement;
      await waitFor(() => expect(audioPlayMock).toHaveBeenCalledTimes(1));
      expect(audio.src).toBe(signedUrl);
      expect(audioLoadMock).toHaveBeenCalledTimes(1);
      expect(audioLoadMock.mock.invocationCallOrder[0]).toBeLessThan(
        audioPlayMock.mock.invocationCallOrder[0],
      );
    });

    it('shows a busy state only while the url is resolving', async () => {
      const release = holdSigningResponse();
      const { getByTestId } = render(<MediaPlayer {...baseProps} />);
      const mediaplayer = getByTestId('mediaplayer');
      expect(mediaplayer.hasAttribute('aria-busy')).toBe(false);

      fireEvent.mouseDown(mediaplayer);

      await waitFor(() =>
        expect(iconText(mediaplayer)).toContain('hourglass_empty'),
      );
      expect(mediaplayer.getAttribute('aria-busy')).toBe('true');

      release();
      await settle();

      await waitFor(() =>
        expect(iconText(mediaplayer)).not.toContain('hourglass_empty'),
      );
      expect(mediaplayer.hasAttribute('aria-busy')).toBe(false);
    });

    it('ignores a second click while the url is resolving', async () => {
      const release = holdSigningResponse();
      const { getByTestId } = render(<MediaPlayer {...baseProps} />);
      const mediaplayer = getByTestId('mediaplayer');
      vi.clearAllMocks();

      fireEvent.mouseDown(mediaplayer);
      fireEvent.mouseDown(mediaplayer);
      release();
      await settle();

      expect(signingRequests).toHaveLength(1);
      expect(audioPlayMock).toHaveBeenCalledTimes(1);
    });

    it('keeps the signed url when re-rendered with the same url', async () => {
      const { getByTestId, rerender } = render(<MediaPlayer {...baseProps} />);

      fireEvent.mouseDown(getByTestId('mediaplayer'));
      await settle();
      rerender(<MediaPlayer {...baseProps} />);

      expect((getByTestId('audio') as HTMLAudioElement).src).toBe(signedUrl);
    });

    it('plays again synchronously from the cache after stopping', async () => {
      const { getByTestId } = render(<MediaPlayer {...baseProps} />);
      const mediaplayer = getByTestId('mediaplayer');
      const audio = getByTestId('audio') as HTMLAudioElement;

      fireEvent.mouseDown(mediaplayer);
      await settle();
      audio.currentTime = 1;
      await act(async () => {
        fireEvent.timeUpdate(audio);
      });
      fireEvent.mouseDown(mediaplayer);
      expect(audioPauseMock).toHaveBeenCalledTimes(1);
      audio.currentTime = 0;
      await act(async () => {
        fireEvent.timeUpdate(audio);
      });
      audioLoadMock.mockClear();
      audioPlayMock.mockClear();

      fireEvent.mouseDown(mediaplayer);

      expect(audioLoadMock).toHaveBeenCalledTimes(1);
      expect(audioPlayMock).toHaveBeenCalledTimes(1);
      expect(signingRequests).toHaveLength(1);
    });

    it('returns to stopped without reporting when play is rejected', async () => {
      audioPlayMock.mockRejectedValueOnce(new Error('NotAllowedError'));
      const { getByTestId } = render(<MediaPlayer {...baseProps} />);
      const mediaplayer = getByTestId('mediaplayer');

      fireEvent.mouseDown(mediaplayer);
      await settle();

      await waitFor(() =>
        expect(iconText(mediaplayer)).toContain('play_arrow'),
      );
      expect(mediaplayer.hasAttribute('aria-busy')).toBe(false);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('drops the result when the url changes while resolving', async () => {
      const release = holdSigningResponse();
      const { getByTestId, rerender } = render(<MediaPlayer {...baseProps} />);
      vi.clearAllMocks();

      fireEvent.mouseDown(getByTestId('mediaplayer'));
      rerender(<MediaPlayer {...baseProps} url={anotherUrl} />);
      release();
      await settle();

      expect(audioPlayMock).not.toHaveBeenCalled();
      expect((getByTestId('audio') as HTMLAudioElement).src).toBe(anotherUrl);
    });

    it('does not play when unmounted while resolving', async () => {
      const release = holdSigningResponse();
      const { getByTestId, unmount } = render(<MediaPlayer {...baseProps} />);
      vi.clearAllMocks();

      fireEvent.mouseDown(getByTestId('mediaplayer'));
      unmount();
      release();
      await settle();

      expect(audioPlayMock).not.toHaveBeenCalled();
    });

    it('plays the original url when signing fails', async () => {
      server.use(
        http.post(endpoint, () => new HttpResponse(null, { status: 500 })),
      );
      const { getByTestId } = render(<MediaPlayer {...baseProps} />);
      vi.clearAllMocks();

      fireEvent.mouseDown(getByTestId('mediaplayer'));

      await waitFor(() => expect(audioPlayMock).toHaveBeenCalledTimes(1));
      expect(
        (getByTestId('audio') as HTMLAudioElement).getAttribute('src'),
      ).toBe(baseProps.url);
    });
  });
});
