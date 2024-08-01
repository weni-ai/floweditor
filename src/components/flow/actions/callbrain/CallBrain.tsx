import * as React from 'react';
import { CallBrain } from 'flowTypes';

import styles from './CallBrain.module.scss';
import { applyVueInReact } from 'veaury';
// @ts-ignore
import Unnnic from '@weni/unnnic-system';
import { BrainInfo } from '../../../../store/flowContext';
const UnnnicIcon = applyVueInReact(Unnnic.unnnicIcon);

export const getBrainInfoPlaceholder = (brainInfo: BrainInfo): JSX.Element => (
  <span className={styles.brain_info}>
    {brainInfo.name} - {brainInfo.occupation}
  </span>
);

const CallBrainComp: React.FunctionComponent<CallBrain> = (
  props: CallBrain,
): JSX.Element => {
  return (
    <div className={styles.content}>
      <UnnnicIcon icon="hub" size="sm" scheme={'neutral-cloudy'} />
      {getBrainInfoPlaceholder(props.brainInfo)}
    </div>
  );
};

export default CallBrainComp;
