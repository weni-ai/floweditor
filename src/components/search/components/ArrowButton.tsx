import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { applyVueInReact } from 'vuereact-combined';
import styles from './ArrowButton.module.scss';

// @ts-ignore
import { unnnicButton } from '@weni/unnnic-system';
import { DownIcon } from 'pureIcons/DownIcon';
import { UpIcon } from 'pureIcons/UpIcon';

export enum ButtonTypes {
  primary = 'primary',
  secondary = 'secondary',
  tertiary = 'terciary',
  ghost = 'ghost'
}
export interface ButtonProps {
  name: string;
  onClick: any;
  disabled?: boolean;
  type?: ButtonTypes;
  iconName?: 'up' | 'down';
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

export default class ArrowButton extends React.Component<ButtonProps> {
  constructor(props: ButtonProps) {
    super(props);

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public render(): JSX.Element {
    const { onRef, name, onClick, disabled } = this.props;

    return (
      <div className={styles.button}>
        <UnnnicButton
          ref={onRef}
          onClick={onClick}
          type={'ghost'}
          disabled={disabled}
          text={name}
          size={this.props.size || 'small'}
        >
          <div className={styles.icon}>
            {this.props.iconName === 'down' ? (
              <>
                <DownIcon disabled={disabled} />
              </>
            ) : (
              <>
                <UpIcon disabled={disabled} />
              </>
            )}
          </div>
        </UnnnicButton>
      </div>
    );
  }
}
