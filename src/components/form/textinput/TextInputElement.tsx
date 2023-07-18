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
import TembaCompletion from '../../../temba/TembaCompletion';

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
  error?: string;
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
  onKeyPressEnter?: () => void;
  onKeyDown?: () => void;
}

const UnnnicTextArea = applyVueInReact(unnnicTextArea);
const UnnnicInputNext = applyVueInReact(unnnicInputNext, {
  vue: {
    componentWrapAttrs: {
      'unnnic-input': 'true'
    }
  }
});
const UnnnicIcon = applyVueInReact(unnnicIcon);
const UnnnicToolTip = applyVueInReact(unnnicToolTip);

export default class TextInputElement extends React.Component<TextInputProps> {
  private inputItem: React.RefObject<any> = React.createRef();

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
    if (this.inputItem.current) {
      this.inputItem.current.vueRef.$el.querySelector('input').addEventListener('keydown', () => {
        if (this.props.onKeyDown) {
          this.props.onKeyDown();
        }
      });

      this.inputItem.current.vueRef.$el
        .querySelector('input')
        .addEventListener('keypress', (event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter' && this.props.onKeyPressEnter) {
            this.props.onKeyPressEnter();
          }
        });
    }
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
        {this.props.autocomplete ? (
          <TembaCompletion
            value={this.props.entry.value}
            onInput={(value: string) => this.handleChange({ currentTarget: { value } })}
            label={this.props.showLabel ? this.props.name : null}
            placeholder={this.props.placeholder}
            size={this.props.size || TextInputSizes.sm}
          />
        ) : (
          <UnnnicInputNext
            value={this.props.entry.value}
            on={{
              input: (value: string) => this.handleChange({ currentTarget: { value } })
            }}
            label={this.props.showLabel ? this.props.name : null}
            placeholder={this.props.placeholder}
            size={this.props.size || TextInputSizes.sm}
            ref={this.inputItem}
            error={this.props.error}
            iconRight={'keyboard-return-1'}
            maxlength={this.props.maxLength}
          />
        )}
        {this.props.helpText && typeof this.props.helpText === 'string' ? (
          <div className={`${styles.help} u font secondary body-md color-neutral-cleanest`}>
            {this.props.helpText}
          </div>
        ) : null}
        {this.props.helpText && typeof this.props.helpText !== 'string' ? (
          <div className={`${styles.help} u font secondary body-md color-neutral-cleanest`}>
            {this.props.helpText}
          </div>
        ) : null}
      </>
    );
  }
}
