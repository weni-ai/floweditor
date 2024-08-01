import { CallBrain } from 'flowTypes';
import { composeComponentTestUtils } from 'testUtils';
import { createCallBrainAction } from 'testUtils/assetCreators';

import CallBrainComp, {
  getBrainInfoPlaceholder,
} from 'components/flow/actions/callbrain/CallBrain';

const CallBrainAction = createCallBrainAction();

const { setup } = composeComponentTestUtils<CallBrain>(
  CallBrainComp,
  CallBrainAction as CallBrain,
);

describe(CallBrainComp.name, () => {
  it('should render save placeholder when result prop passed', () => {
    const { wrapper, props } = setup();

    expect(
      wrapper.containsMatchingElement(getBrainInfoPlaceholder(props.brainInfo)),
    ).toBeTruthy();
    expect(wrapper).toMatchSnapshot();
  });
});
