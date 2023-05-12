import { composeComponentTestUtils, getSpecWrapper } from 'testUtils';

import SwitchElement, { SwitchElementProps, descSpecId } from './SwitchElement';

const baseProps: SwitchElementProps = {
  name: 'Switch',
  checked: false
};

const { setup } = composeComponentTestUtils(SwitchElement, baseProps);

describe(SwitchElement.name, () => {
  it('should render a switch element with description', () => {
    const { wrapper } = setup(true, {
      $merge: {
        title: 'Switch',
        description: 'All Destinations',
        labelClassName: 'label',
        switchClassName: 'switch',
        onChange: jest.fn()
      }
    });

    expect(getSpecWrapper(wrapper, descSpecId).hasClass('description')).toBeTruthy();
    expect(wrapper).toMatchSnapshot('unchecked');
  });
});
