import { FormElementProps } from 'components/form/FormElement';
import * as React from 'react';
import { isRealValue, renderIf } from 'utils';
import { applyVueInReact } from 'vuereact-combined';

// @ts-ignore
import { unnnicSwitch } from '@weni/unnnic-system';

import styles from './SwitchElement.module.scss';

export enum SwitchSizes {
  medium = 'medium',
  small = 'small'
}

export interface SwitchElementProps extends FormElementProps {
  checked: boolean;
  title?: string;
  description?: string;
  labelClassName?: string;
  switchClassName?: string;
  size?: SwitchSizes;
  onChange?(checked: boolean): void;
}

interface SwitchState {
  checked: boolean;
}

export const boxIco = 'fe-square';
export const checkedBoxIco = 'fe-check-square';

export const switchSpecId = 'switch';
export const titleSpecId = 'title';
export const descSpecId = 'description';

const UnnnicSwitch = applyVueInReact(unnnicSwitch);

export default class SwitchElement extends React.Component<SwitchElementProps, SwitchState> {
  constructor(props: any) {
    super(props);

    this.state = {
      checked: this.props.checked
    };

    this.handleChange = this.handleChange.bind(this);
  }

  private handleChange(checked: boolean): void {
    console.log('checked', checked);

    this.setState({ checked }, () => {
      if (this.props.onChange) {
        this.props.onChange(this.state.checked);
      }
    });
  }

  /* istanbul ignore next */
  public validate(): boolean {
    return true;
  }

  public render(): JSX.Element {
    // const switchIcon = this.state.checked ? checkedBoxIco : boxIco;
    return (
      <>
        <UnnnicSwitch
          data-spec={switchSpecId}
          value={this.state.checked}
          textRight={this.props.title}
          on={{ input: this.handleChange }}
          size={this.props.size}
        />

        {renderIf(isRealValue(this.props.description))(
          <div
            data-spec={descSpecId}
            className={`u font secondary body-sm color-neutral-cloudy ${styles.description}`}
          >
            {this.props.description}
          </div>
        )}
      </>
    );
  }
}