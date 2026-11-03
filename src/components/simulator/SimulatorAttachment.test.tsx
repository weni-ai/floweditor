import * as React from 'react';
import { HttpResponse, http } from 'msw';
import { config } from 'test/config';
import { server } from 'test/mswServer';
import { fireEvent, render, waitFor } from 'test/utils';
import { MediaUrlSigner } from 'services/MediaUrlSigner';
import SimulatorAttachment from './SimulatorAttachment';

const baseUrl = 'https://weni-flows.s3.us-east-1.amazonaws.com/attachments/42';
const imageUrl = baseUrl + '/photo.jpg';
const videoUrl = baseUrl + '/clip.mp4';
const documentUrl = baseUrl + '/report.pdf';
const audioUrl = baseUrl + '/voice.mp3';
const signedSuffix = '?X-Amz-Signature=test';

const countSigningRequests = () => {
  const bodies: Promise<string[]>[] = [];
  server.events.on('request:start', ({ request }) => {
    if (request.url.endsWith(config.endpoints.media_urls)) {
      bodies.push(
        request
          .clone()
          .json()
          .then((body: { urls: string[] }) => body.urls),
      );
    }
  });
  return bodies;
};

describe('SimulatorAttachment', () => {
  beforeEach(() => {
    MediaUrlSigner.get().configure(config.endpoints.media_urls);
  });

  afterEach(() => {
    MediaUrlSigner.get().configure(undefined);
    server.events.removeAllListeners();
    vi.restoreAllMocks();
  });

  it('renders an image through its signed url', async () => {
    const { container } = render(
      <SimulatorAttachment attachment={'image/jpeg:' + imageUrl} />,
    );

    expect(container.querySelector('img[alt=""]')).not.toBeNull();

    await waitFor(() =>
      expect(container.querySelector('img[alt="Attachment"]')).not.toBeNull(),
    );
    expect(
      container.querySelector('img[alt="Attachment"]').getAttribute('src'),
    ).toBe(imageUrl + signedSuffix);
  });

  it('renders a video through its signed url', async () => {
    const { container } = render(
      <SimulatorAttachment attachment={'video/mp4:' + videoUrl} />,
    );

    await waitFor(() =>
      expect(container.querySelector('video').getAttribute('src')).toBe(
        videoUrl + signedSuffix,
      ),
    );
  });

  it('opens a document in a tab with its signed url', async () => {
    const tab = { opener: {}, closed: false, location: { href: '' } };
    const openSpy = vi
      .spyOn(window, 'open')
      .mockReturnValue((tab as unknown) as Window);
    const requests = countSigningRequests();

    const { getByRole } = render(
      <SimulatorAttachment attachment={'application/pdf:' + documentUrl} />,
    );

    const button = getByRole('button');
    expect(button.getAttribute('type')).toBe('button');
    expect(requests).toHaveLength(0);

    fireEvent.click(button);

    expect(openSpy).toHaveBeenCalledWith('', '_blank');
    expect(tab.opener).toBeNull();
    await waitFor(() =>
      expect(tab.location.href).toBe(documentUrl + signedSuffix),
    );
  });

  it('renders audio with the player and signs nothing at render', async () => {
    const requests = countSigningRequests();

    const { getByTestId } = render(
      <SimulatorAttachment attachment={'audio/mp3:' + audioUrl} />,
    );

    expect(getByTestId('mediaplayer')).not.toBeNull();
    expect(getByTestId('audio').getAttribute('src')).toBe(audioUrl);
    await Promise.resolve();
    expect(requests).toHaveLength(0);
  });

  it('renders the map thumbnail for a location without a request', async () => {
    const requests = countSigningRequests();

    const { container } = render(
      <SimulatorAttachment attachment="geo:-1.2,3.4" />,
    );

    expect(container.querySelector('img[alt="Attachment"]')).not.toBeNull();
    await Promise.resolve();
    expect(requests).toHaveLength(0);
  });

  it('renders nothing without a separator or with an unknown type', () => {
    const noSeparator = render(
      <SimulatorAttachment attachment="no-separator" />,
    );
    expect(noSeparator.container.innerHTML).toBe('');

    const unknownType = render(
      <SimulatorAttachment attachment={'text/plain:' + documentUrl} />,
    );
    expect(unknownType.container.innerHTML).toBe('');
  });

  it('falls back to the original url when signing answers 500', async () => {
    server.use(
      http.post(config.endpoints.media_urls, () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );

    const { container } = render(
      <SimulatorAttachment attachment={'image/jpeg:' + imageUrl} />,
    );

    await waitFor(() =>
      expect(container.querySelector('img[alt="Attachment"]')).not.toBeNull(),
    );
    expect(
      container.querySelector('img[alt="Attachment"]').getAttribute('src'),
    ).toBe(imageUrl);
  });

  it('signs an image and a video with one request', async () => {
    const requests = countSigningRequests();

    const { container } = render(
      <>
        <SimulatorAttachment attachment={'image/jpeg:' + imageUrl} />
        <SimulatorAttachment attachment={'video/mp4:' + videoUrl} />
      </>,
    );

    await waitFor(() =>
      expect(container.querySelector('video').getAttribute('src')).toBe(
        videoUrl + signedSuffix,
      ),
    );

    expect(requests).toHaveLength(1);
    const urls = await requests[0];
    expect(urls.sort()).toEqual([imageUrl, videoUrl].sort());
  });
});
