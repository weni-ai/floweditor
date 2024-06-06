import * as React from 'react';
import { RunCodeAction } from 'flowTypes';
import { renderAssetList } from 'components/flow/actions/helpers';
import { fakePropType } from 'config/ConfigProvider';
import { AssetType } from 'store/flowContext';

const RunCodeActionComp: React.SFC<RunCodeAction> = ({
  codeaction,
}: RunCodeAction): JSX.Element => {
  return (
    <div style={{ fontSize: '80%', textAlign: 'center' }}>
      {renderAssetList(
        [
          {
            name: codeaction.name,
            id: codeaction.id,
            type: AssetType.CodeAction,
          },
        ],
        3,
        null,
      )}
    </div>
  );
};

RunCodeActionComp.contextTypes = {
  config: fakePropType,
};

export default RunCodeActionComp;
