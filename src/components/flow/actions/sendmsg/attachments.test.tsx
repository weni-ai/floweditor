import * as React from 'react';
import { config } from 'test/config';
import { fireEvent, render, waitFor } from 'test/utils';
import { MediaUrlSigner } from 'services/MediaUrlSigner';
import { renderAttachments } from './attachments';

const canonicalUrl =
  'https://weni-flows.s3.us-east-1.amazonaws.com/attachments/42/1337/steps/9c1d/report.pdf';

describe('attachments download', () => {
  beforeEach(() => {
    MediaUrlSigner.get().configure(config.endpoints.media_urls);
  });

  afterEach(() => {
    MediaUrlSigner.get().configure(undefined);
    vi.restoreAllMocks();
  });

  it('opens the signed url without changing the definition', async () => {
    const tab = { opener: {}, closed: false, location: { href: '' } };
    const openSpy = vi
      .spyOn(window, 'open')
      .mockReturnValue((tab as unknown) as Window);
    const onUploaded = vi.fn();
    const onAttachmentChanged = vi.fn();
    const onAttachmentRemoved = vi.fn();

    const { getByTestId } = render(
      <>
        {renderAttachments(
          config.endpoints.attachments,
          [{ type: 'application/pdf', url: canonicalUrl, uploaded: true }],
          onUploaded,
          onAttachmentChanged,
          onAttachmentRemoved,
        )}
      </>,
    );

    fireEvent.click(getByTestId('download-attachment-0'));

    expect(openSpy).toHaveBeenCalledWith('', '_blank');
    expect(tab.opener).toBeNull();
    await waitFor(() =>
      expect(tab.location.href).toBe(canonicalUrl + '?X-Amz-Signature=test'),
    );
    expect(onAttachmentChanged).not.toHaveBeenCalled();
    expect(onUploaded).not.toHaveBeenCalled();
  });
});
