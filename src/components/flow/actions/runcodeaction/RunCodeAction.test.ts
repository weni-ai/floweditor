import { RunCodeAction } from 'flowTypes';
import RunCodeActionComp from 'components/flow/actions/runcodeaction/RunCodeAction';
import { Types } from 'config/interfaces';
import { composeComponentTestUtils } from 'testUtils';

const baseProps: RunCodeAction = {
  type: Types.run_code_action,
  uuid: `${Types.run_code_action}-0`,
  codeaction: { id: 'abcdefghijklmn', name: 'code action logic' },
  result_name: 'result',
};

const { setup } = composeComponentTestUtils<RunCodeAction>(
  RunCodeActionComp,
  baseProps,
);

describe(RunCodeActionComp, () => {
  it('should render self', () => {
    const { wrapper, props } = setup();
    expect(wrapper.text()).toBe(props.codeaction.name);
    expect(wrapper).toMatchSnapshot();
  });
});
