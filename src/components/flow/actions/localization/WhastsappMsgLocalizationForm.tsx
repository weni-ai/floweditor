import { react as bindCallbacks } from 'auto-bind';
import { LocalizationFormProps } from 'components/flow/props';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import styles from './WhatsappMsgLocalizationForm.module.scss';
import {
  FormEntry,
  FormState,
  mergeForm,
  StringArrayEntry,
  StringEntry,
  UnnnicSelectOptionEntry,
} from 'store/nodeEditor';

import { initializeWhatsappMsgLocalizedForm } from './helpers';
import { Attachment, renderAttachments } from '../sendmsg/attachments';
import {
  WHATSAPP_HEADER_TYPE_OPTIONS,
  WhatsAppHeaderType,
  WhatsAppInteractionType,
  WhatsAppListItem,
} from '../whatsapp/sendmsg/SendWhatsAppMsgForm';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import i18n from 'config/i18n';
import { AxiosResponse } from 'axios';
import { determineTypeConfig } from 'components/flow/helpers';
import mutate from 'immutability-helper';
import TextInputElement from 'components/form/textinput/TextInputElement';
import { validate } from 'store/validators';
import { applyVueInReact } from 'vuereact-combined';
import {
  unnnicSelectSmart,
  // @ts-ignore
} from '@weni/unnnic-system';
import { UnnnicSelectOption } from 'components/form/select/SelectElement';
import { SendMsg, SendWhatsAppMsg } from 'flowTypes';

const UnnnicSelectSmart = applyVueInReact(unnnicSelectSmart, {
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

export interface WhatsappMsgLocalizationFormState extends FormState {
  message: StringEntry;
  headerType: UnnnicSelectOptionEntry<WhatsAppHeaderType>;
  headerText: StringEntry;
  footer: StringEntry;
  attachments: Attachment[];
  interactionType: UnnnicSelectOptionEntry<WhatsAppInteractionType>;

  buttonText: StringEntry;
  actionURL: StringEntry;
  listItems: FormEntry<WhatsAppListItem[]>;
  listItemTitleEntry: StringEntry;
  listItemDescriptionEntry: StringEntry;

  quickReplies: StringArrayEntry;
  quickReplyEntry: StringEntry;
}

export default class WhatsappMsgLocalizationForm extends React.Component<
  LocalizationFormProps,
  WhatsappMsgLocalizationFormState
> {
  constructor(props: LocalizationFormProps) {
    super(props);
    this.state = initializeWhatsappMsgLocalizedForm(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^handle/, /^on/],
    });
  }

  public static contextTypes = {
    config: fakePropType,
  };

  private handleAttachmentUploaded(response: AxiosResponse) {
    const attachments: any = mutate(this.state.attachments, {
      $push: [
        { type: response.data.type, url: response.data.url, uploaded: true },
      ],
    });
    this.setState({ attachments });
  }

  private handleAttachmentChanged(index: number, type: string, url: string) {
    let attachments: any = this.state.attachments;
    if (index === -1) {
      attachments = mutate(attachments, {
        $push: [{ type, url }],
      });
    } else {
      attachments = mutate(attachments, {
        [index]: {
          $set: { type, url },
        },
      });
    }

    this.setState({ attachments });
  }

  private handleAttachmentRemoved(index: number) {
    const attachments: any = mutate(this.state.attachments, {
      $splice: [[index, 1]],
    });
    this.setState({ attachments });
  }

  private handleUpdate(type: string, value: any): boolean {
    const updates: Partial<WhatsappMsgLocalizationFormState> = {};

    if (type === 'headerText' || type === 'message' || type === 'footer') {
      updates[type] = validate(i18n.t('forms.message', 'Message'), value!, []);
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);

    return updated.valid;
  }

  public handleMessageUpdate({ type, text }: any): boolean {
    return this.handleUpdate(type, text);
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: i18n.t('buttons.ok', 'Ok'), onClick: null },
      secondary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true),
      },
    };
  }

  public handleHeaderTypeChange(
    event: UnnnicSelectOption<WhatsAppHeaderType>[],
    submitting = false,
  ): boolean {
    const headerType = event[0];

    if (headerType.value === this.state.headerType.value.value) {
      return false;
    }

    this.handleUpdate('headerType', headerType);
    this.handleUpdate('headerText', '');
    this.handleUpdate('attachment', null);
  }

  public render(): JSX.Element {
    const typeConfig = determineTypeConfig(this.props.nodeSettings);
    const tabs: Tab[] = [];
    if (typeConfig.localizeableKeys!.indexOf('quick_replies') > -1) {
      tabs.push({
        name: i18n.t('forms.attachments', 'Attachments'),
        body: renderAttachments(
          this.context.config.endpoints.attachments,
          this.state.attachments,
          this.handleAttachmentUploaded,
          this.handleAttachmentChanged,
          this.handleAttachmentRemoved,
        ),
        checked: this.state.attachments.length > 0,
      });
    }
    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={tabs}
      >
        <div>
          <div className={styles.header}>
            <div className={styles.header_type}>
              <span className={`u font secondary body-md color-neutral-cloudy`}>
                {i18n.t('forms.header_optional', 'Header (optional)')}
              </span>
            </div>
            <div data-spec="translation-container">
              <div
                data-spec="text-to-translate"
                className={styles.translate_from}
              >
                {
                  (this.props.nodeSettings.originalAction as SendWhatsAppMsg)
                    .header_text
                }
              </div>
            </div>
            <TextInputElement
              name={i18n.t('forms.message', 'Message')}
              showLabel={false}
              onChange={e =>
                this.handleMessageUpdate({ type: 'headerText', text: e })
              }
              entry={this.state.headerText}
              placeholder={`${this.props.language.name}`}
              autocomplete={true}
              focus={true}
            />
          </div>
          <div className={styles.content}>
            <div>
              <span className={`u font secondary body-md color-neutral-cloudy`}>
                {i18n.t('forms.message', 'Message')}
              </span>
            </div>
            <div data-spec="translation-container">
              <div
                data-spec="text-to-translate"
                className={styles.translate_from}
              >
                {
                  (this.props.nodeSettings.originalAction as SendWhatsAppMsg)
                    .text
                }
              </div>
            </div>
            <TextInputElement
              name={i18n.t('forms.message', 'Message')}
              showLabel={false}
              onChange={e =>
                this.handleMessageUpdate({ type: 'message', text: e })
              }
              entry={this.state.message}
              placeholder={`${this.props.language.name}`}
              autocomplete={true}
              focus={true}
              textarea={true}
            />
          </div>
          <div className={styles.content}>
            <div className={styles.header_type}>
              <span className={`u font secondary body-md color-neutral-cloudy`}>
                {i18n.t('forms.footer', 'Footer (optional)')}
              </span>
            </div>
            <div data-spec="translation-container">
              <div
                data-spec="text-to-translate"
                className={styles.translate_from}
              >
                {
                  (this.props.nodeSettings.originalAction as SendWhatsAppMsg)
                    .footer
                }
              </div>
            </div>
            <TextInputElement
              name={i18n.t('forms.footer', 'Footer')}
              showLabel={false}
              onChange={e =>
                this.handleMessageUpdate({ type: 'footer', text: e })
              }
              entry={this.state.footer}
              placeholder={`${this.props.language.name}`}
              autocomplete={true}
              focus={true}
            />
          </div>
        </div>
      </Dialog>
    );
  }
}
