import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import styles from 'components/flow/actions/whatsapp/sendmsg/WhatsAppFlowData.module.scss';
import i18n from 'config/i18n';
import TextInputElement from 'components/form/textinput/TextInputElement';

import { FlowData } from 'components/flow/actions/whatsapp/sendmsg/SendWhatsAppMsgForm';
import { FormEntry, ValidationFailure } from 'store/nodeEditor';
import Button, { ButtonTypes } from 'components/button/Button';

export interface WhatsAppFlowDataProps {
  data: FormEntry<FlowData>;
  onValueUpdated(key: string, value: string): boolean;
}

const BASE_64_REGEX = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

export default class WhatsAppFlowData extends React.Component<
  WhatsAppFlowDataProps
> {
  constructor(props: WhatsAppFlowDataProps) {
    super(props);

    bindCallbacks(this, {
      include: [/^on/, /^handle/],
    });
  }

  private async handleFileUpload(key: string, files: FileList): Promise<void> {
    if (files.length === 0) {
      return;
    }

    const file = files[0];
    const base64 = await this.convertFileToBase64(file);
    this.props.onValueUpdated(key, base64);
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result as string);
      };

      reader.onerror = error => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  private checkBase64(value: string): boolean {
    const trimmedValue = value.trim();

    const parts = trimmedValue.split(',');
    if (parts.length === 0 || parts.length !== 2) {
      return false;
    }

    const fileInfo = parts[0];
    if (fileInfo.indexOf('base64') === -1 || !fileInfo.startsWith('data:')) {
      return false;
    }

    return BASE_64_REGEX.test(parts[1]);
  }

  public render(): JSX.Element {
    const filePickers: { [key: string]: any } = {};

    const triggerAttachmentUpload = (key: string): void => {
      const filePicker = filePickers[key];
      filePicker.value = null;
      filePicker.click();
    };
    const hasError =
      this.props.data.validationFailures &&
      this.props.data.validationFailures.length > 0;

    const data = this.props.data.value;

    return (
      <div className={styles.list_wrapper}>
        <div>
          <div className={styles.title}>
            <header className={styles.options_label}>
              <b>
                {i18n.t(
                  'forms.dynamic_variables.config.highlight',
                  'Configure imported dynamic variables',
                )}
              </b>
              {i18n.t('forms.dynamic_variables.config.base', '(Optional)')}
            </header>
          </div>
          <div className={styles.list_items}>
            <div className={styles.item}>
              <span className={styles.options_name}>
                {i18n.t('forms.dynamic_variables.label', 'Imported field')}
              </span>
              <span className={styles.options_value}>
                {i18n.t('forms.dynamic_variables.value', 'Field value')}
              </span>
            </div>
            {Object.entries(data).map(([key, value]) => {
              const isBase64 = this.checkBase64(value);

              return (
                <div key={key} className={styles.item}>
                  <div className={styles.name}>
                    <TextInputElement
                      name={key}
                      entry={{ value: key }}
                      disabled={true}
                    />
                  </div>
                  <div className={styles.value}>
                    <TextInputElement
                      __className={styles.variable}
                      name={`${key}-value`}
                      entry={{ value }}
                      onChange={e => this.props.onValueUpdated(key, e)}
                      focus={true}
                      disabled={!!isBase64}
                    />
                  </div>
                  {isBase64 ? (
                    <Button
                      type={ButtonTypes.secondary}
                      name={''}
                      onClick={() => this.props.onValueUpdated(key, '')}
                      iconName={'close'}
                      size={'small'}
                    />
                  ) : (
                    <Button
                      type={ButtonTypes.secondary}
                      name={''}
                      onClick={() => triggerAttachmentUpload(key)}
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
                      filePickers[key] = ele;
                    }}
                    accept="image/png, image/jpeg, image/jpg, video/mp4 ,application/pdf, application/msword"
                    type="file"
                    onChange={e => this.handleFileUpload(key, e.target.files)}
                  />
                </div>
              );
            })}
          </div>

          {hasError ? (
            <div data-testid="Error message" className={styles.error_message}>
              {this.props.data.validationFailures.map(
                (error: ValidationFailure) => error.message,
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
