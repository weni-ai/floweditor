/* eslint-disable @typescript-eslint/no-explicit-any */
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
import TextInputElement, {
  TextInputSizes,
} from 'components/form/textinput/TextInputElement';
import {
  MaxOfTenItems,
  shouldRequireIf,
  validate,
  ValidURL,
} from 'store/validators';
import { UnnnicSelectOption } from 'components/form/select/SelectElement';
import { SendWhatsAppMsg } from 'flowTypes';
import Pill from 'components/pill/Pill';
import OptionsList from '../whatsapp/sendmsg/OptionsList';
import { createEmptyListItem } from '../whatsapp/sendmsg/helpers';
import { TembaSelect } from 'temba/TembaSelect';
import { renderIf } from 'utils';
import {
  FILE_TYPE_MAP,
  FILE_TYPE_REGEX,
  renderUploadButton,
} from '../whatsapp/sendmsg/attachments';
import QuickRepliesList from '../whatsapp/sendmsg/QuickRepliesList';

export interface WhatsappMsgLocalizationFormState extends FormState {
  text: StringEntry;
  headerType?: UnnnicSelectOption<WhatsAppHeaderType>;
  headerText: StringEntry;
  footer: StringEntry;
  attachment: FormEntry<Attachment>;
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
    const attachment: any = mutate(this.state.attachment, {
      $push: [
        { type: response.data.type, url: response.data.url, uploaded: true },
      ],
    });
    this.setState({ attachment });
  }

  public handleAttachmentUrlChange(
    value: string,
    name: string,
    submitting = false,
  ): boolean {
    const attachmentUrl = validate(
      i18n.t('whatsapp_msg.attachment_url', 'Attachment URL'),
      value,
      [
        shouldRequireIf(
          submitting &&
            this.state.headerType.value === WhatsAppHeaderType.MEDIA,
        ),
        ValidURL,
      ],
    );

    const match = attachmentUrl.value.toLowerCase().match(FILE_TYPE_REGEX);
    const fileType = match ? match[1] : null;
    const attachmentType = FILE_TYPE_MAP[fileType] || 'unknown';

    const attachment: Attachment = {
      type: attachmentType,
      url: attachmentUrl.value,
      uploaded: false,
    };

    return this.handleUpdate({ attachment }, submitting);
  }

  private handleQuickReplyChanged(quickReplies: string[]) {
    this.handleUpdate({ quickReplies });
  }

  public handleQuickRepliesUpdate(quickReplies: string[]): boolean {
    return this.handleUpdate({ quickReplies });
  }

  private handleUpdate(
    keys: {
      attachment?: Attachment;
      text?: string;
      headerType?: UnnnicSelectOption<WhatsAppHeaderType>;
      headerText?: string;
      footer?: string;
      quickReplies?: string[];
      buttonText?: string;
      actionURL?: string;
      listItems?: WhatsAppListItem[];
      removeListItem?: WhatsAppListItem;
    },
    submitting = false,
  ): boolean {
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

    if (keys.hasOwnProperty('headerType')) {
      const label = keys.headerType.value === 'text' ? 'Text' : 'Media';
      updates.headerType = { value: keys.headerType.value, label };
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

    if (keys.hasOwnProperty('buttonText')) {
      updates.buttonText = validate(
        i18n.t('forms.button_text', 'Button Text'),
        keys.buttonText!,
        [],
      );
    }

    if (keys.hasOwnProperty('actionURL')) {
      updates.actionURL = validate(
        i18n.t('forms.action_url', 'Action URL'),
        keys.actionURL!,
        [],
      );
    }

    if (keys.hasOwnProperty('listItems')) {
      const updatedList = keys.listItems;
      const hasEmptyTitle = keys.listItems.some(item => item.title === '');
      if (!hasEmptyTitle) {
        updatedList.push(createEmptyListItem());
      }
      updates.listItems = { value: keys.listItems };
    }

    if (keys.hasOwnProperty('removeListItem')) {
      if (this.state.listItems.value && this.state.listItems.value.length > 1) {
        const items = this.state.listItems.value.filter(
          item => item.uuid !== keys.removeListItem.uuid,
        );
        updates.listItems = validate(
          i18n.t('forms.list_items', 'List items'),
          items,
          [],
        ) as FormEntry<WhatsAppListItem[]>;
      }
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

  public handleButtonTextUpdate(buttonText: string): boolean {
    return this.handleUpdate({ buttonText });
  }

  public handleActionURLUpdate(actionURL: string): boolean {
    return this.handleUpdate({ actionURL });
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

  public handleHeaderTypeChange(headerType: any, submitting = false): boolean {
    if (headerType.value === this.state.headerType.value) {
      return false;
    }

    return this.handleUpdate(
      { headerType: headerType, headerText: '' },
      submitting,
    );
  }

  private handleSave(): void {
    const {
      text,
      quickReplies,
      attachment,
      headerText,
      buttonText,
      actionURL,
      footer,
      listItems,
    } = this.state;

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

      if (quickReplies.value && quickReplies.value.length > 0) {
        translations.quick_replies = quickReplies.value;
      }

      if (headerText.value) {
        translations.header_text = headerText.value;
      }
      if (footer.value) {
        translations.footer = footer.value;
      }
      if (buttonText.value) {
        translations.button_text = buttonText.value;
      }
      if (actionURL.value) {
        translations.action_url = actionURL.value;
      }
      if (listItems.value) {
        const filteredArray = listItems.value.filter(item => item.title !== '');
        translations.list_items = filteredArray;
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

  public handleListItemsUpdate(options: WhatsAppListItem[]): boolean {
    return this.handleUpdate({ listItems: options });
  }

  public handleListItemRemoval(item: WhatsAppListItem): boolean {
    return this.handleUpdate({ removeListItem: item });
  }

  public render(): JSX.Element {
    const typeConfig = determineTypeConfig(this.props.nodeSettings);
    const tabs: Tab[] = [];
    const attachment = this.state.attachment && this.state.attachment.value;
    const hasUploadedAttachment =
      !!attachment && (attachment && attachment.uploaded);

    const originalAction = this.props.nodeSettings
      .originalAction as SendWhatsAppMsg;

    if (typeConfig.localizeableKeys!.indexOf('quick_replies') > -1) {
      tabs.push({
        name: i18n.t('forms.quick_replies', 'Quick Replies'),
        body: (
          <>
            <div data-spec="translation-container">
              <div
                data-spec="text-to-translate"
                className={styles.translate_from}
              >
                {originalAction.quick_replies.map((item, index) => (
                  <div key={index} className={styles.pill}>
                    <Pill text={item} disabled={true} />
                  </div>
                ))}
              </div>
            </div>
            <QuickRepliesList
              quickReplies={this.state.quickReplies}
              onQuickRepliesUpdated={this.handleQuickRepliesUpdate}
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
            {originalAction.messageType === 'interactive' ? (
              <div className={styles.header_base}>
                <div className={styles.header_type}>
                  <span
                    className={`u font secondary body-md color-neutral-cloudy`}
                  >
                    {i18n.t('forms.header_optional', 'Header (optional)')}
                  </span>
                  <TembaSelect
                    name={''}
                    value={this.state.headerType}
                    options={WHATSAPP_HEADER_TYPE_OPTIONS}
                    onChange={this.handleHeaderTypeChange}
                    expressionsData={{
                      functions: [],
                      context: undefined,
                    }}
                  />
                </div>
                {this.state.headerType.value === 'text' ? (
                  <div className={styles.header_text}>
                    <TextInputElement
                      name={i18n.t('forms.header_text', 'Header Text')}
                      showLabel={true}
                      onChange={this.handleHeaderTextUpdate}
                      entry={this.state.headerText}
                      placeholder={`${this.props.language.name}`}
                      autocomplete={true}
                      focus={true}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {renderIf(
              originalAction.messageType === 'simple' ||
                (originalAction.messageType === 'interactive' &&
                  this.state.headerType.value === 'media'),
            )(
              <div className={styles.attachment}>
                <div className={styles.attachment_url}>
                  <TextInputElement
                    placeholder={i18n.t(
                      'forms.attachment_placeholder',
                      'Paste an URL or send a file',
                    )}
                    name={i18n.t(
                      'forms.attachment_optional',
                      'Media (optional)',
                    )}
                    size={TextInputSizes.sm}
                    onChange={this.handleAttachmentUrlChange}
                    entry={{
                      value:
                        attachment && !attachment.uploaded
                          ? attachment.url
                          : '',
                    }}
                    error={
                      this.state.attachment &&
                      this.state.attachment.validationFailures.length > 0
                        ? this.state.attachment.validationFailures[0].message
                        : null
                    }
                    autocomplete={true}
                    showLabel={true}
                    disabled={hasUploadedAttachment}
                  />
                </div>

                {renderUploadButton(
                  this.context.config.endpoints.attachments,
                  this.handleAttachmentUploaded,
                  hasUploadedAttachment,
                )}
              </div>,
            )}
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

          {originalAction.messageType === 'interactive' ? (
            <div className={styles.footer}>
              <div className={styles.footer}>
                <span
                  className={`u font secondary body-md color-neutral-cloudy`}
                >
                  {i18n.t('forms.footer', 'Footer (optional)')}
                </span>
              </div>
              {originalAction.footer ? (
                <div data-spec="translation-container">
                  <div
                    data-spec="text-to-translate"
                    className={styles.translate_from}
                  >
                    {originalAction.footer}
                  </div>
                </div>
              ) : null}
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
          ) : null}

          {originalAction.button_text ? (
            <>
              <div className={styles.header_type}>
                <span
                  className={`u font secondary body-md color-neutral-cloudy`}
                >
                  {i18n.t('forms.button_text', 'Button Text')}
                </span>
              </div>
              <div data-spec="translation-container">
                <div
                  data-spec="text-to-translate"
                  className={styles.translate_from}
                >
                  {
                    (this.props.nodeSettings.originalAction as SendWhatsAppMsg)
                      .button_text
                  }
                </div>
              </div>
              <TextInputElement
                name={i18n.t('forms.button_text', 'Button Text')}
                showLabel={false}
                onChange={this.handleButtonTextUpdate}
                entry={this.state.buttonText}
                placeholder={`${this.props.language.name}`}
                autocomplete={true}
                focus={true}
              />
            </>
          ) : null}

          {originalAction.action_url ? (
            <>
              <div className={styles.header_type}>
                <span
                  className={`u font secondary body-md color-neutral-cloudy`}
                >
                  {i18n.t('forms.action_url', 'Action URL')}
                </span>
              </div>
              <div data-spec="translation-container">
                <div
                  data-spec="text-to-translate"
                  className={styles.translate_from}
                >
                  {originalAction.action_url}
                </div>
              </div>
              <TextInputElement
                name={i18n.t('forms.action_url', 'Action URL')}
                showLabel={false}
                onChange={this.handleActionURLUpdate}
                entry={this.state.actionURL}
                placeholder={`${this.props.language.name}`}
                autocomplete={true}
                focus={true}
              />
            </>
          ) : null}

          {originalAction.list_items && originalAction.list_items.length ? (
            <>
              <div className={styles.header_type}>
                <span
                  className={`u font secondary body-md color-neutral-cloudy`}
                >
                  {i18n.t('forms.list_items', 'Listed Items')}
                </span>
              </div>
              <OptionsList
                options={this.state.listItems}
                onOptionsUpdated={this.handleListItemsUpdate}
                onOptionRemoval={this.handleListItemRemoval}
              />
            </>
          ) : null}
        </div>
      </Dialog>
    );
  }
}
