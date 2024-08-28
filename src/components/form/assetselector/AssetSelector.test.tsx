import AssetSelector from 'components/form/assetselector/AssetSelector';
import React from 'react';
import { Assets, AssetType } from 'store/flowContext';
import { render } from 'test/utils';
import { createUUID } from 'utils';
import { mock } from 'testUtils';
import * as utils from 'utils';

const group_uuid = createUUID();
mock(utils, 'createUUID', utils.seededUUIDs());

const assets: Assets = {
  items: {
    [group_uuid]: {
      id: group_uuid,
      name: 'My Test Group',
      type: AssetType.Group,
    },
  },
  type: AssetType.Contact || AssetType.Group,
};

describe(AssetSelector.name, () => {
  it('renders', () => {
    const { baseElement } = render(
      <AssetSelector
        name="Recipients"
        onChange={vi.fn()}
        assets={assets}
        createAssetFromInput={vi.fn()}
        entry={{ value: null }}
      />,
    );
    expect(baseElement).toMatchSnapshot();
  });
});
