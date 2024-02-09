import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import {
  initializeForm as stateToForm,
  stateToAction,
  createEmptyListItem
} from 'components/flow/actions/whatsapp/sendmsg/helpers';
import { ActionFormProps } from 'components/flow/props';
import TextInputElement, { TextInputSizes } from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import {
  FormState,
  mergeForm,
  StringEntry,
  FormEntry,
  SelectOptionEntry,
  StringArrayEntry
} from 'store/nodeEditor';
import { ValidURL, shouldRequireIf, validate } from 'store/validators';

import styles from './SendWhatsAppMsgForm.module.scss';

import i18n from 'config/i18n';

import { applyVueInReact } from 'vuereact-combined';
// @ts-ignore
import { unnnicIcon, unnnicRadio } from '@weni/unnnic-system';
import TembaSelect, { TembaSelectStyle } from '../../../../../temba/TembaSelect';
import {
  Attachment,
  FILE_TYPE,
  FILE_TYPE_MAP,
  FILE_TYPE_REGEX,
  renderUploadButton
} from './attachments';
import { SelectOption } from '../../../../form/select/SelectElement';
import update from 'immutability-helper';
import { AxiosResponse } from 'axios';
import TextEditorElement from '../../../../form/texteditor/TextEditorElement';
import QuickRepliesList, { hasEmptyReply } from './QuickRepliesList';
import OptionsList, { hasEmptyListItem } from './OptionsList';

const UnnnicIcon = applyVueInReact(unnnicIcon, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      'data-draggable': 'true',
      style: {
        all: '',
        height: '20px',
        padding: '4px'
      }
    }
  }
});

const UnnnicRadio = applyVueInReact(unnnicRadio, {
  react: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      style: {
        all: ''
      }
    }
  }
});

const MAX_LIST_ITEMS_COUNT = 10;
const MAX_REPLIES_COUNT = 3;

export enum WhatsAppHeaderType {
  MEDIA = 'media',
  TEXT = 'text'
}

export enum WhatsAppInteractionType {
  LIST = 'list',
  REPLIES = 'replies',
  LOCATION = 'location'
}

export const WHATSAPP_HEADER_TYPE_TEXT: SelectOption<WhatsAppHeaderType> = {
  name: i18n.t('whatsapp_headers.text', 'Text'),
  value: WhatsAppHeaderType.TEXT
};
export const WHATSAPP_HEADER_TYPE_MEDIA: SelectOption<WhatsAppHeaderType> = {
  name: i18n.t('whatsapp_headers.media', 'Media'),
  value: WhatsAppHeaderType.MEDIA
};

export const WHATSAPP_INTERACTION_TYPE_LIST: SelectOption<WhatsAppInteractionType> = {
  name: i18n.t('whatsapp_interactions.list', 'Option list'),
  value: WhatsAppInteractionType.LIST
};

export const WHATSAPP_INTERACTION_TYPE_REPLIES: SelectOption<WhatsAppInteractionType> = {
  name: i18n.t('whatsapp_interactions.replies', 'Quick replies'),
  value: WhatsAppInteractionType.REPLIES
};

export const WHATSAPP_INTERACTION_TYPE_LOCATION: SelectOption<WhatsAppInteractionType> = {
  name: i18n.t('whatsapp_interactions.location', 'Request location'),
  value: WhatsAppInteractionType.LOCATION
};

export const WHATSAPP_HEADER_TYPE_OPTIONS: SelectOption<WhatsAppHeaderType>[] = [
  WHATSAPP_HEADER_TYPE_MEDIA,
  WHATSAPP_HEADER_TYPE_TEXT
];

export const WHATSAPP_INTERACTION_TYPE_OPTIONS: SelectOption<WhatsAppInteractionType>[] = [
  WHATSAPP_INTERACTION_TYPE_LIST,
  WHATSAPP_INTERACTION_TYPE_REPLIES,
  WHATSAPP_INTERACTION_TYPE_LOCATION
];

export interface WhatsAppListItem {
  uuid: string;
  title: string;
  description: string;
}

export interface SendWhatsAppMsgFormState extends FormState {
  message: StringEntry;

  headerType: SelectOptionEntry<WhatsAppHeaderType>;
  header_text: StringEntry;
  attachment: FormEntry<Attachment>;

  footer: StringEntry;

  interactionType: SelectOptionEntry<WhatsAppInteractionType>;

  listTitle: StringEntry;
  listFooter: StringEntry;
  listItems: FormEntry<WhatsAppListItem[]>;
  listItemTitleEntry: StringEntry;
  listItemDescriptionEntry: StringEntry;

  quickReplies: StringArrayEntry;
  quickReplyEntry: StringEntry;
}

export default class SendWhatsAppMsgForm extends React.Component<
  ActionFormProps,
  SendWhatsAppMsgFormState
> {
  constructor(props: ActionFormProps) {
    super(props);

    this.state = stateToForm(this.props.nodeSettings);

    const listItems = [...this.state.listItems.value];
    if (!hasEmptyListItem(listItems) && listItems.length < MAX_LIST_ITEMS_COUNT) {
      listItems.push(createEmptyListItem());
    }

    const replies = [...this.state.quickReplies.value];
    if (!hasEmptyReply(replies) && replies.length < MAX_REPLIES_COUNT) {
      replies.push('');
    }

    this.state = {
      ...this.state,
      listItems: {
        value: listItems
      },
      quickReplies: {
        value: replies
      }
    };

    bindCallbacks(this, {
      include: [/^handle/, /^on/]
    });
  }

  public static contextTypes = {
    config: fakePropType
  };

  private hasValidAttachment(): boolean {
    const attachment = this.state.attachment.value;
    return (
      attachment &&
      attachment.type !== FILE_TYPE.UNKNOWN &&
      this.state.attachment.validationFailures.length === 0
    );
  }

  private hasRequiredListItems(): boolean {
    return (
      this.state.interactionType.value.value === WHATSAPP_INTERACTION_TYPE_LIST.value &&
      (this.state.listTitle.value.trim().length > 0 ||
        this.state.listFooter.value.trim().length > 0)
    );
  }

  private hasRequiredListItem(listItems: WhatsAppListItem[]): boolean {
    const validItems = listItems.filter((item: WhatsAppListItem) => item.title.trim().length > 0);

    return validItems.length > 0;
  }

  private hasValidReply(replies: string[]): boolean {
    const validReplies = replies.filter((reply: string) => reply.trim().length > 0);

    return validReplies.length > 0;
  }

  private handleUpdate(
    keys: {
      message?: string;
      headerType?: SelectOption<WhatsAppHeaderType>;
      header_text?: string;
      attachment?: Attachment;
      footer?: string;
      interactionType?: SelectOption<WhatsAppInteractionType>;
      listTitle?: string;
      listFooter?: string;
      listItems?: WhatsAppListItem[];
      removeListItem?: WhatsAppListItem;
      quickReplies?: string[];
    },
    submitting = false
  ): boolean {
    const updates: Partial<SendWhatsAppMsgFormState> = {};

    if (keys.hasOwnProperty('message')) {
      updates.message = validate(i18n.t('forms.message', 'Message'), keys.message, [
        shouldRequireIf(submitting && !this.hasValidAttachment())
      ]);
    }

    if (keys.hasOwnProperty('headerType')) {
      updates.headerType = { value: keys.headerType };
    }

    if (keys.hasOwnProperty('header_text')) {
      updates.header_text = validate(
        i18n.t('forms.header_text', 'Header text'),
        keys.header_text,
        []
      );
    }

    if (keys.hasOwnProperty('attachment')) {
      updates.attachment = { value: keys.attachment, validationFailures: [] };
      if (
        keys.attachment &&
        !keys.attachment.uploaded &&
        keys.attachment.type === FILE_TYPE.UNKNOWN &&
        keys.attachment.url.length > 0
      ) {
        updates.attachment.validationFailures = [
          { message: i18n.t('whatsapp_msg.invalid_attachment_type', 'Invalid attachment type') }
        ];
      }
    }

    if (keys.hasOwnProperty('footer')) {
      updates.footer = validate(i18n.t('forms.footer', 'Footer'), keys.footer, []);
    }

    if (keys.hasOwnProperty('interactionType')) {
      updates.interactionType = { value: keys.interactionType };
    }

    if (keys.hasOwnProperty('listTitle')) {
      updates.listTitle = validate(i18n.t('forms.list_title', 'List title'), keys.listTitle, []);
    }

    if (keys.hasOwnProperty('listFooter')) {
      updates.listFooter = validate(
        i18n.t('forms.list_footer', 'List footer'),
        keys.listFooter,
        []
      );
    }

    let ensureEmptyListItem = false;
    if (keys.hasOwnProperty('listItems')) {
      updates.listItems = { value: keys.listItems };

      if (submitting && this.hasRequiredListItems()) {
        const hasValidItem = this.hasRequiredListItem(keys.listItems);
        if (!hasValidItem) {
          updates.listItems.validationFailures = [
            {
              message: i18n.t(
                'whatsapp_msg.list_items_required',
                'At least one list option is required if list title or footer is set'
              )
            }
          ];
        }
      }

      ensureEmptyListItem = true;
    }

    if (keys.hasOwnProperty('removeListItem')) {
      const items = this.state.listItems.value.filter(
        item => item.uuid !== keys.removeListItem.uuid
      );
      updates.listItems = validate(i18n.t('forms.list_items', 'List items'), items, [
        shouldRequireIf(submitting && this.hasRequiredListItems())
      ]) as FormEntry<WhatsAppListItem[]>;
      ensureEmptyListItem = true;
    }

    let ensureEmptyReply = false;
    if (keys.hasOwnProperty('quickReplies')) {
      updates.quickReplies = validate(
        i18n.t('forms.quick_replies', 'Quick Replies'),
        keys.quickReplies,
        []
      );
      ensureEmptyReply = true;
    }

    const updated = mergeForm(this.state, updates) as SendWhatsAppMsgFormState;

    this.setState(updated, () => {
      // if we no longer have an empty list item, add one
      if (ensureEmptyListItem) {
        if (
          !hasEmptyListItem(this.state.listItems.value) &&
          this.state.listItems.value.length < MAX_LIST_ITEMS_COUNT
        ) {
          const listItems = update(this.state.listItems.value, {
            $push: [createEmptyListItem()]
          }) as WhatsAppListItem[];
          this.handleUpdate({ listItems: listItems });
        }
      }

      // if we no longer have an empty reply, add one
      if (ensureEmptyReply) {
        if (
          !hasEmptyReply(this.state.quickReplies.value) &&
          this.state.quickReplies.value.length < MAX_REPLIES_COUNT
        ) {
          const quickReplies = update(this.state.quickReplies.value, {
            $push: ['']
          }) as string[];
          this.handleUpdate({ quickReplies: quickReplies });
        }
      }
    });
    return updated.valid;
  }

  private handleMessageUpdate(message: string, name: string, submitting = false): boolean {
    return this.handleUpdate({ message }, submitting);
  }

  private handleHeaderTypeChange(
    headerType: SelectOption<WhatsAppHeaderType>,
    submitting = false
  ): boolean {
    return this.handleUpdate(
      { headerType: headerType, attachment: null, header_text: '' },
      submitting
    );
  }

  private handleHeaderTextUpdate(header_text: string, name: string, submitting = false): boolean {
    return this.handleUpdate({ header_text }, submitting);
  }

  private handleAttachmentUrlChange(value: string, name: string, submitting = false): boolean {
    const attachmentUrl = validate(i18n.t('whatsapp_msg.attachment_url', 'Attachment URL'), value, [
      shouldRequireIf(submitting && this.state.headerType.value.value === WhatsAppHeaderType.MEDIA),
      ValidURL
    ]);

    const match = attachmentUrl.value.match(FILE_TYPE_REGEX);
    const fileType = match ? match[1] : null;
    const attachmentType = FILE_TYPE_MAP[fileType] || 'unknown';

    const attachment: Attachment = {
      type: attachmentType,
      url: attachmentUrl.value,
      uploaded: false
    };

    return this.handleUpdate({ attachment }, submitting);
  }

  private handleAttachmentUploaded(response: AxiosResponse) {
    const attachment: Attachment = {
      type: response.data.type,
      url: response.data.url,
      uploaded: true
    };
    return this.handleUpdate({ attachment }, false);
  }

  private handleAttachmentRemoved() {
    return this.handleUpdate({ attachment: null });
  }

  private handleFooterUpdate(footer: string, name: string, submitting = false): boolean {
    return this.handleUpdate({ footer }, submitting);
  }

  private handleInteractionTypeUpdate(newValue: string) {
    const interactionType = WHATSAPP_INTERACTION_TYPE_OPTIONS.find(
      option => option.value === newValue
    );

    return this.handleUpdate({ interactionType, listItems: [], quickReplies: [] });
  }

  private handleQuickRepliesUpdate(quickReplies: string[]): boolean {
    return this.handleUpdate({ quickReplies });
  }

  private handleListItemsUpdate(options: WhatsAppListItem[], submitting = false): boolean {
    return this.handleUpdate({ listItems: options }, submitting);
  }

  private handleListItemRemoval(item: WhatsAppListItem): boolean {
    return this.handleUpdate({ removeListItem: item });
  }

  private handleListTitleUpdate(listTitle: string): boolean {
    return this.handleUpdate({ listTitle });
  }

  private handleListFooterUpdate(listFooter: string): boolean {
    return this.handleUpdate({ listFooter });
  }

  private handleSave(): void {
    let valid = true;

    let currentCheck = this.handleMessageUpdate(this.state.message.value, null, true);
    valid = valid && currentCheck;

    currentCheck = this.handleUpdate({ attachment: this.state.attachment.value }, true);
    valid = valid && currentCheck;

    currentCheck = this.handleListItemsUpdate(this.state.listItems.value, true);
    valid = valid && currentCheck;

    if (valid) {
      this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));
      this.props.onClose(false);
    }
  }

  public getButtons(): ButtonSet {
    return {
      primary: { name: i18n.t('buttons.confirm'), onClick: this.handleSave },
      tertiary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true)
      }
    };
  }

  private renderInteractionsTab(): Tab {
    const interactionType = this.state.interactionType.value.value;
    const isChecked =
      this.hasRequiredListItem(this.state.listItems.value) ||
      this.hasValidReply(this.state.quickReplies.value) ||
      interactionType === WHATSAPP_INTERACTION_TYPE_LOCATION.value;

    return {
      name: isChecked
        ? i18n.t('forms.interactions', 'Interactions')
        : i18n.t('forms.add_interactions', 'Add Interactions'),
      body: (
        <div>
          <div className={`${styles.interaction_type}`}>
            <UnnnicRadio
              $model={{
                value: interactionType,
                setter: this.handleInteractionTypeUpdate
              }}
              value={WHATSAPP_INTERACTION_TYPE_LIST.value}
              size="sm"
            >
              <span className="color-neutral-cloudy">{WHATSAPP_INTERACTION_TYPE_LIST.name}</span>
            </UnnnicRadio>
            <UnnnicRadio
              $model={{
                value: interactionType,
                setter: this.handleInteractionTypeUpdate
              }}
              value={WHATSAPP_INTERACTION_TYPE_REPLIES.value}
              size="sm"
            >
              <span className="color-neutral-cloudy">{WHATSAPP_INTERACTION_TYPE_REPLIES.name}</span>
            </UnnnicRadio>
            <UnnnicRadio
              $model={{
                value: interactionType,
                setter: this.handleInteractionTypeUpdate
              }}
              value={WHATSAPP_INTERACTION_TYPE_LOCATION.value}
              size="sm"
            >
              <span className="color-neutral-cloudy">
                {WHATSAPP_INTERACTION_TYPE_LOCATION.name}
              </span>
            </UnnnicRadio>
          </div>

          {interactionType === WhatsAppInteractionType.LIST && (
            <OptionsList
              listTitle={this.state.listTitle}
              listFooter={this.state.listFooter}
              options={this.state.listItems}
              onOptionsUpdated={this.handleListItemsUpdate}
              onOptionRemoval={this.handleListItemRemoval}
              onListTitleUpdated={this.handleListTitleUpdate}
              onListFooterUpdated={this.handleListFooterUpdate}
            />
          )}

          {interactionType === WhatsAppInteractionType.REPLIES && (
            <QuickRepliesList
              quickReplies={this.state.quickReplies.value}
              onQuickRepliesUpdated={this.handleQuickRepliesUpdate}
            />
          )}

          {interactionType === WhatsAppInteractionType.LOCATION && (
            // TODO: Add tooltip to indicate that the message will be sent when requesting the user location
            <div className={styles.location_message}>
              <TextInputElement
                name={i18n.t('forms.message', 'Message')}
                showLabel={true}
                entry={this.state.message}
                placeholder={i18n.t('forms.type_here', 'Type here...')}
                disabled={true}
                textarea={true}
              />
            </div>
          )}
        </div>
      ),
      checked: isChecked,
      hasErrors: hasErrors(this.state.listItems)
    };
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;
    const tabs = [this.renderInteractionsTab()];
    const attachment = this.state.attachment.value;
    const headerType = this.state.headerType.value;

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={tabs}
      >
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />

        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.header_type}>
              <span className={`u font secondary body-md color-neutral-cloudy`}>
                {i18n.t('forms.header_optional', 'Header (optional)')}
              </span>

              <TembaSelect
                name={i18n.t('forms.header_optional', 'Header (optional)')}
                style={TembaSelectStyle.normal}
                options={WHATSAPP_HEADER_TYPE_OPTIONS}
                nameKey="name"
                valueKey="value"
                onChange={this.handleHeaderTypeChange}
                value={headerType}
              />
            </div>

            {headerType.value === WhatsAppHeaderType.TEXT && (
              <div className={styles.header_text}>
                <TextInputElement
                  name={i18n.t('forms.header', 'Header')}
                  entry={this.state.header_text}
                  onChange={this.handleHeaderTextUpdate}
                  placeholder={i18n.t('forms.header_text', 'Header text')}
                  size={TextInputSizes.md}
                  autocomplete={true}
                />
              </div>
            )}

            {headerType.value === WhatsAppHeaderType.MEDIA && (
              <>
                <div className={styles.attachment_url}>
                  <TextInputElement
                    placeholder={i18n.t('forms.ex_weni', 'Ex: weni.ai')}
                    name={i18n.t('forms.url', 'URL')}
                    size={TextInputSizes.md}
                    onChange={this.handleAttachmentUrlChange}
                    entry={{
                      value: attachment && !attachment.uploaded ? attachment.url : ''
                    }}
                    error={
                      this.state.attachment.validationFailures.length > 0
                        ? this.state.attachment.validationFailures[0].message
                        : null
                    }
                    autocomplete={true}
                    showLabel={true}
                  />
                </div>

                {renderUploadButton(
                  this.context.config.endpoints.attachments,
                  this.handleAttachmentUploaded
                )}
              </>
            )}
          </div>

          {attachment && attachment.uploaded && (
            <div className={styles.attachment}>
              {attachment.url.substring(attachment.url.lastIndexOf('/') + 1)}

              <div className={styles.remove}>
                <UnnnicIcon
                  icon="close"
                  size="sm"
                  scheme="neutral-cloudy"
                  clickable
                  onClick={() => this.handleAttachmentRemoved()}
                />
              </div>
            </div>
          )}

          <TextEditorElement
            name={i18n.t('forms.message', 'Message')}
            showLabel={true}
            onChange={this.handleMessageUpdate}
            entry={this.state.message}
            autocomplete={true}
            placeholder={i18n.t('forms.type_here', 'Type here...')}
            maxLength={4096}
          />

          <TextInputElement
            placeholder={i18n.t('forms.ex_footer', 'Ex: Footer')}
            name={i18n.t('forms.footer', 'Footer (optional)')}
            size={TextInputSizes.md}
            onChange={this.handleFooterUpdate}
            entry={this.state.footer}
            autocomplete={true}
            showLabel={true}
          />
        </div>
      </Dialog>
    );
  }
}
