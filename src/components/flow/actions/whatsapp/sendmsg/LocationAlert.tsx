import * as React from 'react';

import styles from './LocationAlert.module.scss';

import { applyVueInReact } from 'vuereact-combined';

// @ts-ignore
import { unnnicIcon } from '@weni/unnnic-system';
import { Trans } from 'react-i18next';

const UnnnicIcon = applyVueInReact(unnnicIcon);

export const leadInSpecId = 'lead-in';

export default class LocationAlert extends React.Component {
  public render(): JSX.Element {
    return (
      <div className={styles.alert}>
        <UnnnicIcon
          className={styles.icon}
          icon="info"
          size="sm"
          scheme="aux-blue-500"
          filled={true}
        />
        <span className={styles.alert_text}>
          <Trans i18nKey="whatsapp_msg.location_alert">
            <b>Info:</b> The text message is required and will be sent with the
            location request
          </Trans>
        </span>
      </div>
    );
  }
}
