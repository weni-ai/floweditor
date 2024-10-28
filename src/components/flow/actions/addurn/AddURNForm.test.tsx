/* eslint-disable react/react-in-jsx-scope */
import AddURNForm from 'components/flow/actions/addurn/AddURNForm';
import { Types } from 'config/interfaces';
import { AddURN } from 'flowTypes';
import { render, fireEvent, screen } from 'test/utils';
import { getActionFormProps } from 'testUtils/assetCreators';
import i18n from 'config/i18n';

const props = getActionFormProps({
  scheme: 'tel',
  path: '+12065551212',
  type: Types.add_contact_urn,
} as AddURN);

describe(AddURNForm.name, () => {
  it('renders', () => {
    const { baseElement } = render(<AddURNForm {...props} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('should call handleSave when the confirm button is clicked', () => {
    render(<AddURNForm {...props} />);
    fireEvent.click(screen.getByText(i18n.t('buttons.confirm')));
    expect(props.updateAction).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalledWith(false);
  });

  it('should call onClose when the cancel button is clicked', () => {
    render(<AddURNForm {...props} />);
    fireEvent.click(screen.getByText(i18n.t('buttons.cancel', 'Cancel')));
    expect(props.onClose).toHaveBeenCalledWith(true);
  });

  it('should validate the path field when handlePathChanged is called', () => {
    const { container } = render(<AddURNForm {...props} />);
    const input = container.querySelector(
      `input[placeholder="${i18n.t(
        'forms.enter_urn_value',
        'Enter the URN value',
      )}"]`,
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'newPathValue' } });
    fireEvent.blur(input);

    expect(input.value).toBe('newPathValue');
  });
});
