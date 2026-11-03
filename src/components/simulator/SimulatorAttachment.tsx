import { MediaPlayer } from 'components/mediaplayer/MediaPlayer';
import logStyles from 'components/simulator/LogEvent.module.scss';
import { useSignedMediaUrl } from 'components/simulator/useSignedMediaUrl';
import i18n from 'config/i18n';
import * as React from 'react';
import { openSignedMedia } from 'utils/openSignedMedia';
import { applyVueInReact } from 'veaury';

// @ts-ignore
import Unnnic from '@weni/unnnic-system';

import MAP_THUMB from 'static/images/map.jpg';

import styles from './SimulatorAttachment.module.scss';

const UnnnicIcon = applyVueInReact(Unnnic.unnnicIcon, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      style: {
        all: '',
      },
    },
  },
});

export interface SimulatorAttachmentProps {
  attachment: string;
}

interface SignedMediaProps {
  url: string;
}

const SignedImage = ({ url }: SignedMediaProps): JSX.Element => {
  const { url: signedUrl, isLoading } = useSignedMediaUrl(url);
  const isSignedUrlReady = !isLoading && signedUrl !== null;

  return isSignedUrlReady ? (
    <img src={signedUrl} alt="Attachment" />
  ) : (
    <img alt="" />
  );
};

const SignedVideo = ({ url }: SignedMediaProps): JSX.Element => {
  const { url: signedUrl } = useSignedMediaUrl(url);

  return (
    <div className={logStyles.video_attachment}>
      <video controls={true} src={signedUrl} />
    </div>
  );
};

const SimulatorAttachment = ({
  attachment,
}: SimulatorAttachmentProps): JSX.Element => {
  const separatorIndex = attachment.indexOf(':');
  if (separatorIndex === -1) {
    return null;
  }

  const type = attachment.substr(0, separatorIndex);
  const url = attachment.substr(separatorIndex + 1);

  if (type.startsWith('audio')) {
    return (
      <div className={logStyles.audio_attachment}>
        <div className={logStyles.media_player}>
          <MediaPlayer url={url} surface="simulator" />
        </div>
        <div className={logStyles.audio_text}>Audio Recording</div>
      </div>
    );
  }

  if (type.startsWith('image')) {
    return <SignedImage url={url} />;
  }

  if (type.startsWith('application')) {
    return (
      <button
        type="button"
        className={styles['simulator-attachment__document']}
        onClick={() => {
          openSignedMedia(url, { surface: 'simulator' });
        }}
      >
        <UnnnicIcon icon={'picture_as_pdf'} size="md" scheme="neutral-cloudy" />
        <span className={styles['simulator-attachment__document-label']}>
          {i18n.t('document', 'Document')}
        </span>
      </button>
    );
  }

  if (type.startsWith('geo')) {
    return <img src={MAP_THUMB} alt="Attachment" />;
  }

  if (type.startsWith('video')) {
    return <SignedVideo url={url} />;
  }

  return null;
};

export default SimulatorAttachment;
