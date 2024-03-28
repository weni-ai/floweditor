import * as React from 'react';
import { renderAssetList } from 'components/flow/actions/helpers';
import { fakePropType } from 'config/ConfigProvider';
import { StartFlow } from 'flowTypes';
import { AssetType } from 'store/flowContext';
import styles from './StartFlow.module.scss';

const StartFlowComp: React.SFC<StartFlow> = (
  { flow: { name, uuid } }: StartFlow,
  context: any,
): JSX.Element => (
  <div className={styles.start_flow}>
    {renderAssetList(
      [{ name, id: uuid, type: AssetType.Flow }],
      3,
      context.config.endpoints,
    )}
  </div>
);

StartFlowComp.contextTypes = {
  config: fakePropType,
};

export default StartFlowComp;
