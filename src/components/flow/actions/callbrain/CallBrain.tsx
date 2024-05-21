import * as React from 'react';
import { CallBrain } from 'flowTypes';

import styles from './CallBrain.module.scss';
import { applyVueInReact } from 'vuereact-combined';
// @ts-ignore
import { unnnicIcon } from '@weni/unnnic-system';
const UnnnicIcon = applyVueInReact(unnnicIcon);

const CallBrainComp: React.FunctionComponent<CallBrain> = (
  props: CallBrain,
): JSX.Element => {
  return (
    <div className={styles.content}>
      <UnnnicIcon icon="hub" size="sm" scheme={'neutral-cloudy'} />
      <span className={styles.brain_info}>
        {props.brainInfo.name} - {props.brainInfo.occupation}
      </span>
    </div>
  );
};

export default CallBrainComp;
