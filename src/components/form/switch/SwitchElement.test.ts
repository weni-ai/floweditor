import { composeComponentTestUtils, getSpecWrapper } from 'testUtils';

import SwitchElement, {
  boxIco,
  SwitchElementProps,
  switchSpecId,
  checkedBoxIco,
  descSpecId,
  titleSpecId
} from './SwitchElement';

const baseProps: SwitchElementProps = {
  name: 'Switch',
  checked: false
};

const { setup, spyOn } = composeComponentTestUtils(SwitchElement, baseProps);

describe(SwitchElement.name, () => {
  it('should render a switch element with title, description', () => {
    const setStateSpy = spyOn('setState');
    const { wrapper, props } = setup(true, {
      $merge: {
        title: 'Switch',
        description: 'All Destinations',
        labelClassName: 'label',
        switchClassName: 'switch',
        onChange: jest.fn()
      }
    });

    expect(getSpecWrapper(wrapper, switchSpecId).hasClass(boxIco)).toBeTruthy();
    expect(getSpecWrapper(wrapper, titleSpecId).exists()).toBeTruthy();
    expect(getSpecWrapper(wrapper, descSpecId).hasClass('description')).toBeTruthy();
    expect(wrapper).toMatchSnapshot('unchecked');

    // Check box
    wrapper.find('label').prop('onClick')();
    wrapper.update();

    expect(setStateSpy).toHaveBeenCalledTimes(1);
    expect(setStateSpy).toMatchCallSnapshot();
    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(getSpecWrapper(wrapper, switchSpecId).hasClass(checkedBoxIco)).toBeTruthy();
    expect(wrapper).toMatchSnapshot();

    // Remove title
    wrapper.setProps({
      title: '',
      description: 'Continue when there is no response'
    });

    expect(getSpecWrapper(wrapper, descSpecId).hasClass('description_solo')).toBeTruthy();
    expect(wrapper).toMatchSnapshot();

    setStateSpy.mockRestore();
  });
});
