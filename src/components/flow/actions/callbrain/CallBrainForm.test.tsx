import { ActionFormProps } from 'components/flow/props';
import { composeComponentTestUtils, composeDuxState, mock } from 'testUtils';
import {
  createCallBrainAction,
  getActionFormProps,
} from 'testUtils/assetCreators';
import * as utils from 'utils';

import {
  BrainForm,
  CallBrainFormProps,
} from 'components/flow/actions/callbrain/CallBrainForm';
import { set } from 'utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const baseProps: CallBrainFormProps = {
  ...getActionFormProps(createCallBrainAction()),
  brainInfo: {
    name: 'Dóris',
    occupation: 'Marketing Specialist',
    enabled: true,
  },
  entry: '',
};

const { setup } = composeComponentTestUtils<ActionFormProps>(
  BrainForm,
  baseProps,
  composeDuxState({
    flowContext: {
      brainInfo: set({
        name: 'Dóris',
        occupation: 'Marketing Specialist',
        enabled: true,
      }),
    },
  }),
);

describe(BrainForm.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    const { instance } = setup(true);

    expect(instance).toMatchSnapshot();
  });

  it('should save', () => {
    const { instance, props } = setup(true);

    instance.getButtons().primary.onClick();

    expect(props.updateAction).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  it('should cancel without changes', () => {
    const { instance, props } = setup(true);

    instance.getButtons().secondary.onClick();

    expect(props.updateAction).not.toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });
});
