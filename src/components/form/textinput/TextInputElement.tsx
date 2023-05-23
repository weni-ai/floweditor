import { react as bindCallbacks } from 'auto-bind';
import { FormElementProps } from 'components/form/FormElement';
import * as React from 'react';
import { StringEntry } from 'store/nodeEditor';
import { applyVueInReact } from 'vuereact-combined';
import { count as SmsCount } from 'sms-length';
import i18n from 'config/i18n';

// @ts-ignore
import { unnnicTextArea, unnnicInputNext, unnnicIcon, unnnicToolTip } from '@weni/unnnic-system';

import styles from './TextInputElement.module.scss';

export enum Count {
  SMS = 'SMS'
}

export enum TextInputStyle {
  small = 'small',
  medium = 'medium',
  normal = 'normal'
}

export enum TextInputSizes {
  sm = 'sm',
  md = 'md'
}

export interface TextInputProps extends FormElementProps {
  entry?: StringEntry;
  __className?: string;
  count?: Count;
  textarea?: boolean;
  placeholder?: string;
  autocomplete?: boolean;
  focus?: boolean;
  showInvalid?: boolean;
  maxLength?: number;
  counter?: string;
  style?: TextInputStyle;
  size?: TextInputSizes;
  onChange?: (value: string, name?: string) => void;
  onBlur?: (event: React.ChangeEvent) => void;
}

const UnnnicTextArea = applyVueInReact(unnnicTextArea);
const UnnnicInputNext = applyVueInReact(unnnicInputNext);
const UnnnicIcon = applyVueInReact(unnnicIcon);
const UnnnicToolTip = applyVueInReact(unnnicToolTip);

export default class TextInputElement extends React.Component<TextInputProps> {
  constructor(props: TextInputProps) {
    super(props);

    let initial = '';
    if (this.props.entry && this.props.entry.value) {
      initial = this.props.entry.value;
    }

    this.state = {
      value: initial
    };

    bindCallbacks(this, {
      include: [/^on/, /Ref$/, 'setSelection', 'validate', /^has/, /^handle/]
    });
  }

  public componentDidMount(): void {
    // return this.props.focus && this.focusInput();
  }

  public handleChange({ currentTarget: { value } }: any): void {
    if (this.props.onChange) {
      this.props.onChange(value, this.props.name);
    }
  }

  public render(): JSX.Element {
    const optional: any = {};
    if (this.props.textarea) {
      optional['textarea'] = true;
    }

    if (this.props.counter) {
      optional['counter'] = this.props.counter;
    }

    return this.props.textarea ? (
      <>
        <UnnnicTextArea
          value={this.props.entry.value}
          on={{
            input: (value: string) => this.handleChange({ currentTarget: { value } })
          }}
          label={this.props.showLabel ? this.props.name : null}
          placeholder={this.props.placeholder}
          size={this.props.size || TextInputSizes.sm}
        />

        {this.props.helpText}

        {this.props.counter ? (
          <div className={`${styles.sms_counter} u font secondary body-md color-neutral-cloudy`}>
            {SmsCount(this.props.entry.value).length} / {SmsCount(this.props.entry.value).messages}
            <UnnnicToolTip
              enabled
              text={i18n.t('forms.sms_counter_info', {
                characters: SmsCount(this.props.entry.value).length,
                messages: SmsCount(this.props.entry.value).messages
              })}
              side="top"
              maxWidth="180px"
            >
              <UnnnicIcon icon="information-circle-4" size="sm" scheme="neutral-soft" />
            </UnnnicToolTip>
          </div>
        ) : null}
      </>
    ) : (
      <>
        <UnnnicInputNext
          value={this.props.entry.value}
          on={{
            input: (value: string) => this.handleChange({ currentTarget: { value } })
          }}
          label={this.props.showLabel ? this.props.name : null}
          placeholder={this.props.placeholder}
          size={this.props.size || TextInputSizes.sm}
          message={typeof this.props.helpText === 'string' ? this.props.helpText : undefined}
        />

        {typeof this.props.helpText !== 'string' ? this.props.helpText : null}
      </>
    );
  }
}
