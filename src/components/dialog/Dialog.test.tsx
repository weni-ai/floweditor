import Dialog, { DialogProps, HeaderStyle } from 'components/dialog/Dialog';
import * as React from 'react';
import { render } from 'test/utils';

const baseProps: DialogProps = {
  title: 'My Dialog',
  subtitle: 'Subtitlf',
  headerIcon: 'fe-icon',
  headerClass: 'header-class',
  headerStyle: HeaderStyle.BARBER,
  buttons: {
    primary: { name: 'Ok', onClick: vi.fn() },
    secondary: { name: 'Cancel', onClick: vi.fn() },
    tertiary: { name: 'Other', onClick: vi.fn() },
  },
  gutter: <div>The Gutter</div>,
};

describe(Dialog.name, () => {
  it('should render', () => {
    const { baseElement } = render(<Dialog {...baseProps} />);
    expect(baseElement).toMatchSnapshot();
  });
});
