import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import styles from './DynamicVariables.module.scss';
import i18n from 'config/i18n';
import TextInputElement from '../../../../form/textinput/TextInputElement';

import { DynamicVariablesListItem } from './SendWhatsAppMsgForm';
import { FormEntry, ValidationFailure } from '../../../../../store/nodeEditor';
import Button, { ButtonTypes } from 'components/button/Button';

export interface DynamicListProps {
  options: FormEntry<DynamicVariablesListItem[]>;
  onValueUpdated(value: any, name: string): Promise<boolean>;
  onRemoveAttachment(name: string): void;
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
    let filePicker: any = null;

    const triggerAttachmentUpload = (): void => {
      filePicker.value = null;
      filePicker.click();
    };
    const hasError =
      this.props.options.validationFailures &&
      this.props.options.validationFailures.length > 0;

    const list = this.props.options.value;

    return (
      <div className={styles.list_wrapper}>
        <div>
          <div className={styles.title}>
            <header className={styles.options_label}>
              <b>
                {i18n.t(
                  'forms.dynamic_variables.config.highlight',
                  'Configure dynamic variables',
                )}
              </b>
              {i18n.t('forms.dynamic_variables.config.base', '(Optional)')}
            </header>
          </div>
          <div className={styles.list_items}>
            <div className={styles.item}>
              <span className={styles.options_name}>
                {i18n.t('forms.dynamic_variables.label', 'Campo Importado')}
              </span>
              <span className={styles.options_value}>
                {i18n.t('forms.dynamic_variables.value', 'Valor do campo')}
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
                    focus={true}
                    disabled={item.disabled}
                  />
                </div>
                {item.disabled ? (
                  <Button
                    type={ButtonTypes.secondary}
                    name={''}
                    onClick={() => this.props.onRemoveAttachment(item.name)}
                    iconName={'close'}
                    size={'small'}
                  />
                ) : (
                  <Button
                    type={ButtonTypes.secondary}
                    name={''}
                    onClick={triggerAttachmentUpload}
                    iconName={'upload-bottom-1'}
                    size={'small'}
                  />
                )}

                <input
                  data-testid="upload-input"
                  style={{
                    display: 'none',
                  }}
                  ref={(ele: any) => {
                    filePicker = ele;
                  }}
                  type="file"
                  onChange={e => this.props.onValueUpdated(e, item.name)}
                />
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
