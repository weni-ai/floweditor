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
import { MaxOfTenItems, validate } from 'store/validators';
import { applyVueInReact } from 'vuereact-combined';
import {
  unnnicSelectSmart,
  // @ts-ignore
} from '@weni/unnnic-system';
import { UnnnicSelectOption } from 'components/form/select/SelectElement';
import { SendWhatsAppMsg } from 'flowTypes';
import MultiChoiceInput from 'components/form/multichoice/MultiChoice';
import { Trans } from 'react-i18next';

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
  text: StringEntry;
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

  private handleQuickReplyChanged(quickReplies: string[]) {
    this.handleUpdate({ quickReplies });
  }

  public handleQuickRepliesUpdate(quickReplies: string[]): boolean {
    return this.handleUpdate({ quickReplies });
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

  private handleUpdate(keys: {
    text?: string;
    headerType?: any;
    headerText?: string;
    footer?: string;
    quickReplies?: string[];
  }): boolean {
    const updates: Partial<WhatsappMsgLocalizationFormState> = {};

    if (keys.hasOwnProperty('text')) {
      updates.text = validate(
        i18n.t('forms.message', 'Message'),
        keys.text!,
        [],
      );
    }

    if (keys.hasOwnProperty('headerText')) {
      updates.headerText = validate(
        i18n.t('forms.message', 'Message'),
        keys.headerText!,
        [],
      );
    }

    if (keys.hasOwnProperty('footer')) {
      updates.footer = validate(
        i18n.t('forms.message', 'Message'),
        keys.footer!,
        [],
      );
    }

    if (keys.hasOwnProperty('quickReplies')) {
      updates.quickReplies = validate(
        i18n.t('forms.quick_replies', 'Quick Replies'),
        keys.quickReplies!,
        [MaxOfTenItems],
      );
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);

    return updated.valid;
  }

  public handleMessageUpdate(text: string): boolean {
    return this.handleUpdate({ text });
  }

  public handleHeaderTextUpdate(headerText: string): boolean {
    return this.handleUpdate({ headerText });
  }

  public handleFooterUpdate(footer: string): boolean {
    return this.handleUpdate({ footer });
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: i18n.t('buttons.ok', 'Ok'), onClick: this.handleSave },
      secondary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true),
      },
    };
  }

  public handleHeaderTypeChange(
    event: UnnnicSelectOption<WhatsAppHeaderType>[],
  ): boolean {
    const headerType = event[0];

    if (headerType.value === this.state.headerType.value.value) {
      return false;
    }
    this.handleUpdate({ headerText: '' });
    this.handleUpdate({ headerType });
  }

  private handleSave(): void {
    const { text, quickReplies, attachments, headerText, footer } = this.state;

    const typeConfig = determineTypeConfig(this.props.nodeSettings);
    const valid =
      typeConfig.localizeableKeys!.indexOf('quick_replies') > -1
        ? this.handleQuickRepliesUpdate(this.state.quickReplies.value)
        : true;

    if (valid) {
      const translations: any = {};
      if (text.value) {
        translations.text = text.value;
      }

      translations.attachments = attachments
        .filter((attachment: Attachment) => attachment.url.trim().length > 0)
        .map(
          (attachment: Attachment) => `${attachment.type}:${attachment.url}`,
        );

      if (quickReplies.value && quickReplies.value.length > 0) {
        translations.quick_replies = quickReplies.value;
      }

      if (headerText.value) {
        translations.header_text = headerText.value;
      }
      if (footer.value) {
        translations.footer = footer.value;
      }

      const localizations = [
        {
          uuid: this.props.nodeSettings.originalAction!.uuid,
          translations,
        },
      ];

      this.props.updateLocalizations(this.props.language.id, localizations);
      this.props.onClose(false);
    }
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

    if (typeConfig.localizeableKeys!.indexOf('quick_replies') > -1) {
      tabs.push({
        name: i18n.t('forms.quick_replies', 'Quick Replies'),
        body: (
          <>
            <MultiChoiceInput
              name={i18n.t('forms.quick_reply', 'Quick Reply')}
              helpText={
                <Trans
                  i18nKey="forms.localized_quick_replies"
                  values={{ language: this.props.language.name }}
                >
                  Add a new [[language]] Quick Reply and press enter.
                </Trans>
              }
              items={this.state.quickReplies}
              onChange={this.handleQuickReplyChanged}
            />
          </>
        ),
        checked: this.state.quickReplies.value.length > 0,
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
            {(this.props.nodeSettings.originalAction as SendWhatsAppMsg)
              .header_type === 'text' ? (
              <>
                <div data-spec="translation-container">
                  <div
                    data-spec="text-to-translate"
                    className={styles.translate_from}
                  >
                    {
                      (this.props.nodeSettings
                        .originalAction as SendWhatsAppMsg).header_type
                    }
                  </div>
                </div>
                <TextInputElement
                  name={i18n.t('forms.message', 'Message')}
                  showLabel={false}
                  onChange={this.handleHeaderTextUpdate}
                  entry={this.state.headerText}
                  placeholder={`${this.props.language.name}`}
                  autocomplete={true}
                  focus={true}
                />
              </>
            ) : null}
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
              onChange={this.handleMessageUpdate}
              entry={this.state.text}
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
              onChange={this.handleFooterUpdate}
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
