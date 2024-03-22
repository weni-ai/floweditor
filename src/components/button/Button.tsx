import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { applyVueInReact } from 'vuereact-combined';

// @ts-ignore
import { unnnicButton } from '@weni/unnnic-system';

export enum ButtonTypes {
  primary = 'primary',
  secondary = 'secondary',
  tertiary = 'tertiary'
}
export interface ButtonProps {
  name: string;
  onClick: any;
  disabled?: boolean;
  type?: ButtonTypes;
  leftSpacing?: boolean;
  topSpacing?: boolean;
  iconName?: string;
  size?: string;
  onRef?: (ele: any) => void;
}

const UnnnicButton = applyVueInReact(unnnicButton, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      style: {
        all: ''
      }
    }
  }
});

export default class Button extends React.Component<ButtonProps> {
  constructor(props: ButtonProps) {
    super(props);

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public render(): JSX.Element {
    const { onRef, name, onClick, type, disabled, leftSpacing, topSpacing, iconName } = this.props;

    return (
      <UnnnicButton
        ref={onRef}
        style={{
          marginLeft: leftSpacing ? 10 : 0,
          marginTop: topSpacing ? 10 : 0
        }}
        onClick={onClick}
        type={type}
        disabled={disabled}
        iconLeft={iconName}
        text={name}
        size={this.props.size || undefined}
      />
    );
  }
}
