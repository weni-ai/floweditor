import TransferAirtimeComp from 'components/flow/actions/transferairtime/TransferAirtime';
import { TransferAirtime } from 'flowTypes';
import { composeComponentTestUtils } from 'testUtils';
import { createTransferAirtimeAction } from 'testUtils/assetCreators';
import { shallowToJson } from 'enzyme-to-json';

const action = createTransferAirtimeAction();

const { setup } = composeComponentTestUtils<TransferAirtime>(
  TransferAirtimeComp,
  action as TransferAirtime,
);

describe(TransferAirtimeComp.name, () => {
  describe('render', () => {
    it('should render self', () => {
      const { wrapper, props } = setup();
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
  });
});
