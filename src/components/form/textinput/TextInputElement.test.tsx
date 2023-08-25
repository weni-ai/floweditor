import TextInputElement, { TextInputProps } from 'components/form/textinput/TextInputElement';
import * as React from 'react';
import { render } from 'test/utils';

const baseProps: TextInputProps = {
  name: 'Message',
  entry: { value: '' }
};

describe(TextInputElement.name, () => {
  it('renders', () => {
    const { baseElement } = render(<TextInputElement {...baseProps} />);
    expect(baseElement).toMatchSnapshot();
  });
});
