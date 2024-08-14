import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import styles from './DynamicVariables.module.scss';
import i18n from 'config/i18n';
import TextInputElement, {
  TextInputSizes,
  TextInputStyle,
} from '../../../../form/textinput/TextInputElement';

import { applyVueInReact } from 'vuereact-combined';
// @ts-ignore
import { unnnicButton } from '@weni/unnnic-system';
import { DynamicVariablesListItem } from './SendWhatsAppMsgForm';
import { FormEntry, ValidationFailure } from '../../../../../store/nodeEditor';

const UnnnicButton = applyVueInReact(unnnicButton, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      style: {
        all: '',
      },
    },
  },
});

export interface DynamicListProps {
  options: FormEntry<DynamicVariablesListItem[]>;
  onValueUpdated(value: string, name: string): boolean;
}

export interface DynamicListState {
  selectedOption: DynamicVariablesListItem[];
}

export default class DynamicVariables extends React.Component<
  DynamicListProps,
  DynamicListState
> {
  constructor(props: DynamicListProps) {
    super(props);

    bindCallbacks(this, {
      include: [/^on/, /^handle/],
    });
  }

  public render(): JSX.Element {
    const hasError =
      this.props.options.validationFailures &&
      this.props.options.validationFailures.length > 0;

    const list = this.props.options.value;

    return (
      <div className={styles.list_wrapper}>
        <div>
          <div className={styles.title}>
            <span className={styles.options_label}>
              {i18n.t('forms.options_label', 'Config dynamic variables')}
            </span>
          </div>
          <div className={styles.list_items}>
            <div className={styles.item}>
              <span className={styles.options_name}>
                {i18n.t('forms.options_label', 'Campo Importado')}
              </span>
              <span className={styles.options_value}>
                {i18n.t('forms.options_label', 'Valor do campo')}
              </span>
            </div>
            {list.map(item => (
              <div key={item.name} className={styles.item}>
                <div className={styles.name}>
                  <TextInputElement
                    name={item.name}
                    entry={{ value: item.name }}
                    disabled={true}
                  />
                </div>
                <div className={styles.value}>
                  <TextInputElement
                    name={`${item.name}-value`}
                    entry={{ value: item.value }}
                    onChange={e => this.props.onValueUpdated(e, item.name)}
                    __className={styles.variable}
                  />
                </div>
              </div>
            ))}
          </div>

          {hasError ? (
            <div data-testid="Error message" className={styles.error_message}>
              {this.props.options.validationFailures.map(
                (error: ValidationFailure) => error.message,
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
