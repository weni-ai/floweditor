import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import {
  initializeForm as stateToForm,
  stateToAction,
  createEmptyListItem,
  createEmptyDynamicItem,
} from 'components/flow/actions/whatsapp/sendmsg/helpers';
import { ActionFormProps } from 'components/flow/props';
import TextInputElement, {
  TextInputSizes,
} from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import {
  FormState,
  mergeForm,
  StringEntry,
  FormEntry,
  StringArrayEntry,
  UnnnicSelectOptionEntry,
} from 'store/nodeEditor';
import { ValidURL, shouldRequireIf, validate } from 'store/validators';

import styles from './SendWhatsAppMsgForm.module.scss';

import i18n from 'config/i18n';

import { applyVueInReact } from 'vuereact-combined';
import {
  unnnicIcon,
  unnnicSelectSmart,
  // @ts-ignore
} from '@weni/unnnic-system';
import {
  Attachment,
  FILE_TYPE,
  FILE_TYPE_MAP,
  FILE_TYPE_REGEX,
  renderUploadButton,
} from './attachments';
import SelectElement, {
  UnnnicSelectOption,
} from 'components/form/select/SelectElement';
import update from 'immutability-helper';
import { AxiosResponse } from 'axios';
import TextEditorElement from '../../../../form/texteditor/TextEditorElement';
import QuickRepliesList, { hasEmptyReply } from './QuickRepliesList';
import OptionsList, { hasEmptyListItem } from './OptionsList';
import { renderIf } from '../../../../../utils';
import { Trans } from 'react-i18next';
import DynamicVariables from './DynamicVariables';

const UnnnicIcon = applyVueInReact(unnnicIcon, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      'data-draggable': 'true',
      style: {
        all: '',
        height: '20px',
        padding: '4px',
      },
    },
  },
});

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

export const MAX_LIST_ITEMS_COUNT = 10;
const MAX_REPLIES_COUNT = 3;

export enum WhatsAppMessageType {
  SIMPLE = 'simple',
  INTERACTIVE = 'interactive',
}

export enum WhatsAppHeaderType {
  MEDIA = 'media',
  TEXT = 'text',
}

export enum WhatsAppInteractionType {
  LIST = 'list',
  REPLIES = 'replies',
  LOCATION = 'location',
  CTA = 'cta_url',
  WHATSAPP_FLOWS = 'whatsapp_flows',
}

export enum WhatsAppDynamicVariableType {
  RADIO = 'radio',
  IMAGE = 'image',
  DESCRIPTION = 'description',
}

export const WHATSAPP_MESSAGE_TYPE_SIMPLE: UnnnicSelectOption<
  WhatsAppMessageType
> = {
  label: i18n.t('whatsapp_messages.simple_message', 'Simple message'),
  value: WhatsAppMessageType.SIMPLE,
};

export const WHATSAPP_MESSAGE_TYPE_INTERACTIVE: UnnnicSelectOption<
  WhatsAppMessageType
> = {
  label: i18n.t('whatsapp_messages.interactive_message', 'Interactive message'),
  value: WhatsAppMessageType.INTERACTIVE,
};

export const WHATSAPP_HEADER_TYPE_TEXT: UnnnicSelectOption<
  WhatsAppHeaderType
> = {
  label: i18n.t('whatsapp_headers.text', 'Text'),
  value: WhatsAppHeaderType.TEXT,
};
export const WHATSAPP_HEADER_TYPE_MEDIA: UnnnicSelectOption<
  WhatsAppHeaderType
> = {
  label: i18n.t('whatsapp_headers.media', 'Media'),
  value: WhatsAppHeaderType.MEDIA,
};

export const WHATSAPP_DYNAMIC_VARIABLE_TYPE_RADIO: UnnnicSelectOption<
  WhatsAppDynamicVariableType
> = {
  label: i18n.t('whatsapp_flows.variables.radio.title', 'Radio Button'),
  value: WhatsAppDynamicVariableType.RADIO,
  description: i18n.t(
    'whatsapp_flows.variables.radio.description',
    'Radio Button',
  ),
};

export const WHATSAPP_DYNAMIC_VARIABLE_TYPE_IMAGE: UnnnicSelectOption<
  WhatsAppDynamicVariableType
> = {
  label: i18n.t('whatsapp_flows.variables.image.title', 'Image'),
  value: WhatsAppDynamicVariableType.IMAGE,
  description: i18n.t('whatsapp_flows.variables.image.description', 'Image'),
};

export const WHATSAPP_DYNAMIC_VARIABLE_TYPE_DESCRIPTION: UnnnicSelectOption<
  WhatsAppDynamicVariableType
> = {
  label: i18n.t('whatsapp_flows.variables.description.title', 'Description'),
  value: WhatsAppDynamicVariableType.DESCRIPTION,
  description: i18n.t(
    'whatsapp_flows.variables.description.description',
    'Description',
  ),
};

export const WHATSAPP_INTERACTION_TYPE_LIST: UnnnicSelectOption<
  WhatsAppInteractionType
> = {
  value: WhatsAppInteractionType.LIST,
  label: i18n.t('whatsapp_interactions.list', 'Option list'),
  description: i18n.t(
    'whatsapp_interactions.list_description',
    'Make choices easier with a list of up to 10 interactive options',
  ),
};

export const WHATSAPP_INTERACTION_TYPE_NONE: UnnnicSelectOption<
  WhatsAppInteractionType
> = {
  value: null,
  label: i18n.t('whatsapp_interactions.none', 'No interactions selected'),
};

export const WHATSAPP_INTERACTION_TYPE_REPLIES: UnnnicSelectOption<
  WhatsAppInteractionType
> = {
  value: WhatsAppInteractionType.REPLIES,
  label: i18n.t('whatsapp_interactions.replies', 'Quick replies'),
  description: i18n.t(
    'whatsapp_interactions.replies_description',
    'Create up to 3 quick replies with predefined messages',
  ),
};

export const WHATSAPP_INTERACTION_TYPE_CTA: UnnnicSelectOption<
  WhatsAppInteractionType
> = {
  value: WhatsAppInteractionType.CTA,
  label: i18n.t('whatsapp_interactions.add_url', 'URL Button'),
  description: i18n.t(
    'whatsapp_interactions.add_url_description',
    'Add a button with a link to an external URL.',
  ),
};

export const WHATSAPP_INTERACTION_TYPE_WHATSAPP_FLOWS: UnnnicSelectOption<
  WhatsAppInteractionType
> = {
  value: WhatsAppInteractionType.WHATSAPP_FLOWS,
  label: i18n.t('whatsapp_flows.title', 'Whatsapp Flows'),
  description: i18n.t(
    'whatsapp_flows.description',
    'Use your interactive forms created on Meta.',
  ),
};

export const WHATSAPP_INTERACTION_TYPE_LOCATION: UnnnicSelectOption<
  WhatsAppInteractionType
> = {
  value: WhatsAppInteractionType.LOCATION,
  label: i18n.t('whatsapp_interactions.request_location', 'Request Location'),
  description: i18n.t(
    'whatsapp_interactions.location_description',
    'Ask users for their location to facilitate service',
  ),
};

export const WHATSAPP_MESSAGE_TYPE_OPTIONS: UnnnicSelectOption<
  WhatsAppMessageType
>[] = [WHATSAPP_MESSAGE_TYPE_SIMPLE, WHATSAPP_MESSAGE_TYPE_INTERACTIVE];

export const WHATSAPP_HEADER_TYPE_OPTIONS: UnnnicSelectOption<
  WhatsAppHeaderType
>[] = [WHATSAPP_HEADER_TYPE_MEDIA, WHATSAPP_HEADER_TYPE_TEXT];

export const WHATSAPP_DYNAMIC_VARIABLE_TYPE_OPTIONS: UnnnicSelectOption<
  WhatsAppDynamicVariableType
>[] = [
  WHATSAPP_DYNAMIC_VARIABLE_TYPE_DESCRIPTION,
  WHATSAPP_DYNAMIC_VARIABLE_TYPE_IMAGE,
  WHATSAPP_DYNAMIC_VARIABLE_TYPE_RADIO,
];

export const WHATSAPP_INTERACTION_TYPE_OPTIONS: UnnnicSelectOption<
  WhatsAppInteractionType
>[] = [
  WHATSAPP_INTERACTION_TYPE_NONE,
  WHATSAPP_INTERACTION_TYPE_REPLIES,
  WHATSAPP_INTERACTION_TYPE_LIST,
  WHATSAPP_INTERACTION_TYPE_LOCATION,
  WHATSAPP_INTERACTION_TYPE_CTA,
  WHATSAPP_INTERACTION_TYPE_WHATSAPP_FLOWS,
];

export interface WhatsAppListItem {
  uuid: string;
  title: string;
  description: string;
}

export interface DynamicVariablesListItem {
  name: string;
  value: string;
}

export interface SendWhatsAppMsgFormState extends FormState {
  message: StringEntry;

  messageType: UnnnicSelectOptionEntry<WhatsAppMessageType>;

  headerType: UnnnicSelectOptionEntry<WhatsAppHeaderType>;
  headerText: StringEntry;
  attachment: FormEntry<Attachment>;

  footer: StringEntry;

  interactionType: UnnnicSelectOptionEntry<WhatsAppInteractionType>;

  buttonText: StringEntry;
  actionURL: StringEntry;
  listItems: FormEntry<WhatsAppListItem[]>;
  listItemTitleEntry: StringEntry;
  listItemDescriptionEntry: StringEntry;

  quickReplies: StringArrayEntry;
  quickReplyEntry: StringEntry;
  dynamicVariables: FormEntry<DynamicVariablesListItem[]>;
  firstScreen: FormEntry<string>;
  selectedForm: UnnnicSelectOptionEntry<WhatsAppHeaderType>;
}

interface UpdateKeys {
  message?: string;
  messageType?: UnnnicSelectOption<WhatsAppMessageType>;
  headerType?: UnnnicSelectOption<WhatsAppHeaderType>;
  headerText?: string;
  attachment?: Attachment;
  footer?: string;
  interactionType?: UnnnicSelectOption<WhatsAppInteractionType>;
  buttonText?: string;
  actionURL?: string;
  listItems?: WhatsAppListItem[];
  removeListItem?: WhatsAppListItem;
  quickReplies?: string[];
  dynamicVariables?: DynamicVariablesListItem;
  removeDynamicVariable?: DynamicVariablesListItem;
  addNewDynamicVariable?: DynamicVariablesListItem;
  selectedForm?: UnnnicSelectOption<any>;
}

export default class SendWhatsAppMsgForm extends React.Component<
  ActionFormProps,
  SendWhatsAppMsgFormState
> {
  constructor(props: ActionFormProps) {
    super(props);

    this.state = stateToForm(this.props.nodeSettings);

    const listItems = [...this.state.listItems.value];
    if (
      !hasEmptyListItem(listItems) &&
      listItems.length < MAX_LIST_ITEMS_COUNT
    ) {
      listItems.push(createEmptyListItem());
    }

    const dynamicVariables = [...this.state.dynamicVariables.value];
    dynamicVariables.push(createEmptyDynamicItem());

    const replies = [...this.state.quickReplies.value];
    if (!hasEmptyReply(replies) && replies.length < MAX_REPLIES_COUNT) {
      replies.push('');
    }

    this.state = {
      ...this.state,
      listItems: {
        value: listItems,
      },
      dynamicVariables: {
        value: dynamicVariables,
      },
      quickReplies: {
        value: replies,
      },
    };

    bindCallbacks(this, {
      include: [/^handle/, /^on/],
    });
  }

  public static contextTypes = {
    config: fakePropType,
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
      this.state.interactionType.value.value ===
      WHATSAPP_INTERACTION_TYPE_LIST.value
    );
  }

  private hasRequiredListItem(listItems: WhatsAppListItem[]): boolean {
    const validItems = listItems.filter(
      (item: WhatsAppListItem) => item.title.trim().length > 0,
    );

    return validItems.length > 0;
  }

  private hasRequiredReplies(): boolean {
    return (
      this.state.interactionType.value.value ===
      WHATSAPP_INTERACTION_TYPE_REPLIES.value
    );
  }

  private hasValidReply(replies: string[]): boolean {
    const validReplies = replies.filter(
      (reply: string) => reply.trim().length > 0,
    );

    return validReplies.length > 0;
  }

  private handleUpdate(keys: UpdateKeys, submitting = false): boolean {
    const updates: Partial<SendWhatsAppMsgFormState> = {};

    if (keys.hasOwnProperty('message')) {
      updates.message = validate(
        i18n.t('forms.message', 'Message'),
        keys.message,
        [
          shouldRequireIf(
            (submitting && !this.hasValidAttachment()) ||
              (this.hasValidReply(this.state.quickReplies.value) ||
                this.hasRequiredListItem(this.state.listItems.value)),
          ),
        ],
      );
    }

    if (keys.hasOwnProperty('messageType')) {
      updates.messageType = { value: keys.messageType };
    }

    if (keys.hasOwnProperty('headerType')) {
      updates.headerType = { value: keys.headerType };
    }

    if (keys.hasOwnProperty('headerText')) {
      updates.headerText = validate(
        i18n.t('forms.header_text', 'Header text'),
        keys.headerText,
        [],
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
          {
            message: i18n.t(
              'whatsapp_msg.invalid_attachment_type',
              'Invalid attachment type',
            ),
          },
        ];
      }
    }

    if (keys.hasOwnProperty('footer')) {
      updates.footer = validate(
        i18n.t('forms.footer', 'Footer'),
        keys.footer,
        [],
      );
    }

    if (keys.hasOwnProperty('interactionType')) {
      updates.interactionType = { value: keys.interactionType };
    }

    if (keys.hasOwnProperty('buttonText')) {
      updates.buttonText = validate(
        i18n.t('forms.list_button_text', 'Action button text'),
        keys.buttonText,
        [],
      );
    }

    if (keys.hasOwnProperty('actionURL')) {
      updates.actionURL = validate(
        i18n.t('forms.list_button_url', 'Action button URL'),
        keys.actionURL,
        [],
      );
    }

    let ensureEmptyListItem = false;
    if (keys.hasOwnProperty('listItems')) {
      updates.listItems = { value: keys.listItems };

      if (this.hasRequiredListItems()) {
        const hasValidItem = this.hasRequiredListItem(keys.listItems);
        if (!hasValidItem) {
          updates.listItems.validationFailures = [
            {
              message: i18n.t(
                'whatsapp_msg.list_items_required',
                'At least one list option must be filled',
              ),
            },
          ];
        }
      }

      ensureEmptyListItem = true;
    }

    if (keys.hasOwnProperty('removeListItem')) {
      const items = this.state.listItems.value.filter(
        item => item.uuid !== keys.removeListItem.uuid,
      );
      updates.listItems = validate(
        i18n.t('forms.list_items', 'List items'),
        items,
        [shouldRequireIf(submitting && this.hasRequiredListItems())],
      ) as FormEntry<WhatsAppListItem[]>;
      ensureEmptyListItem = true;
    }

    if (keys.hasOwnProperty('dynamicVariables')) {
      const updatedVariables = this.state.dynamicVariables.value.map(item =>
        item.name === keys.dynamicVariables.name
          ? {
              ...item,
              value: keys.dynamicVariables.value,
            }
          : item,
      );
      updates.dynamicVariables = { value: updatedVariables };
    }

    let ensureEmptyReply = false;
    if (keys.hasOwnProperty('quickReplies')) {
      updates.quickReplies = { value: keys.quickReplies };

      if (this.hasRequiredReplies()) {
        const hasValidReply = this.hasValidReply(keys.quickReplies);
        if (!hasValidReply) {
          updates.quickReplies.validationFailures = [
            {
              message: i18n.t(
                'whatsapp_msg.replies_required',
                'At least one quick reply must be filled',
              ),
            },
          ];
        }
      }

      // check if we have duplicates
      const uniqueReplies = Array.from(new Set(keys.quickReplies));
      if (uniqueReplies.length < keys.quickReplies.length) {
        updates.quickReplies.validationFailures = [
          {
            message: i18n.t(
              'whatsapp_msg.replies_unique',
              'Quick replies must be unique',
            ),
          },
        ];
      }

      ensureEmptyReply = true;
    }

    if (keys.hasOwnProperty('selectedForm')) {
      console.log('oieee');
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
            $push: [createEmptyListItem()],
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
            $push: [''],
          }) as string[];
          this.handleUpdate({ quickReplies: quickReplies });
        }
      }
    });
    return updated.valid;
  }

  public handleMessageTypeUpdate(
    event: UnnnicSelectOption<WhatsAppMessageType>[],
    submitting = false,
  ) {
    const messageType = event[0];

    if (messageType.value === this.state.messageType.value.value) {
      return false;
    }

    const toUpdate: Partial<UpdateKeys> = {
      messageType,
    };

    if (messageType.value === WhatsAppMessageType.SIMPLE) {
      toUpdate.interactionType = WHATSAPP_INTERACTION_TYPE_NONE;
      toUpdate.headerType = WHATSAPP_HEADER_TYPE_MEDIA;
      toUpdate.headerText = '';
      toUpdate.footer = '';
      toUpdate.listItems = [];
      toUpdate.quickReplies = [];
    } else if (messageType.value === WhatsAppMessageType.INTERACTIVE) {
      toUpdate.interactionType = WHATSAPP_INTERACTION_TYPE_REPLIES;
    }

    return this.handleUpdate(toUpdate, submitting);
  }

  public handleMessageUpdate(
    message: string,
    name: string,
    submitting = false,
  ): boolean {
    return this.handleUpdate({ message }, submitting);
  }

  public handleHeaderTypeChange(
    event: UnnnicSelectOption<WhatsAppHeaderType>[],
    submitting = false,
  ): boolean {
    const headerType = event[0];

    if (headerType.value === this.state.headerType.value.value) {
      return false;
    }

    return this.handleUpdate(
      { headerType: headerType, attachment: null, headerText: '' },
      submitting,
    );
  }

  public handleHeaderTextUpdate(
    headerText: string,
    name: string,
    submitting = false,
  ): boolean {
    // We add quick replies and list items to ensure theirs validation with the current header
    const validHeader = this.handleUpdate({ headerText }, submitting);
    const validInteractions = this.handleUpdate(
      {
        listItems: this.state.listItems.value,
        quickReplies: this.state.quickReplies.value,
      },
      submitting,
    );
    return validHeader && validInteractions;
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
            this.state.headerType.value.value === WhatsAppHeaderType.MEDIA,
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

  public handleAttachmentUploaded(response: AxiosResponse) {
    const attachment: Attachment = {
      type: response.data.type,
      url: response.data.url,
      uploaded: true,
    };
    return this.handleUpdate({ attachment }, false);
  }

  public handleAttachmentRemoved() {
    return this.handleUpdate({ attachment: null });
  }

  public handleFooterUpdate(
    footer: string,
    name: string,
    submitting = false,
  ): boolean {
    // We add quick replies and list items to ensure theirs validation with the current footer
    const validFooter = this.handleUpdate({ footer }, submitting);
    const validInteractions = this.handleUpdate(
      {
        listItems: this.state.listItems.value,
        quickReplies: this.state.quickReplies.value,
      },
      submitting,
    );
    return validFooter && validInteractions;
  }

  public handleInteractionTypeUpdate(
    event: UnnnicSelectOption<WhatsAppInteractionType>[],
    submitting = false,
  ) {
    const interactionType = event[0];

    if (interactionType.value === this.state.interactionType.value.value) {
      return false;
    }

    const toUpdate: UpdateKeys = {
      messageType: WHATSAPP_MESSAGE_TYPE_INTERACTIVE,
      interactionType,
      listItems: [],
      quickReplies: [],
      buttonText: '',
    };

    if (interactionType.value === WhatsAppInteractionType.LOCATION) {
      toUpdate.headerText = '';
      toUpdate.attachment = null;
      toUpdate.footer = '';
    } else if (
      interactionType.value === WhatsAppInteractionType.LIST ||
      interactionType.value === WhatsAppInteractionType.CTA
    ) {
      toUpdate.attachment = null;
      toUpdate.headerType = WHATSAPP_HEADER_TYPE_TEXT;
    }

    return this.handleUpdate(toUpdate);
  }

  public handleQuickRepliesUpdate(
    quickReplies: string[],
    submitting = false,
  ): boolean {
    return this.handleUpdate({ quickReplies }, submitting);
  }

  public handleListItemsUpdate(
    options: WhatsAppListItem[],
    submitting = false,
  ): boolean {
    return this.handleUpdate({ listItems: options }, submitting);
  }

  public handleListItemRemoval(item: WhatsAppListItem): boolean {
    return this.handleUpdate({ removeListItem: item });
  }

  public handleDynamicVariableUpdate(value: any, name: string): boolean {
    return this.handleUpdate({ dynamicVariables: { name, value } });
  }

  public handleButtonTextUpdate(buttonText: string): boolean {
    return this.handleUpdate({ buttonText });
  }
  public handleActionURLUpdate(actionURL: string): boolean {
    return this.handleUpdate({ actionURL });
  }

  public handleFormUpdate(
    event: UnnnicSelectOption<WhatsAppHeaderType>[],
    submitting = false,
  ) {
    const selectedForm = event[0];

    if (selectedForm.value === this.state.selectedForm.value.value) {
      return false;
    }

    return this.handleUpdate({ selectedForm: selectedForm }, submitting);
  }

  public handleSave(): void {
    let valid = true;

    let currentCheck = this.handleMessageUpdate(
      this.state.message.value,
      null,
      true,
    );
    valid = valid && currentCheck;

    currentCheck = this.handleUpdate(
      { attachment: this.state.attachment.value },
      true,
    );
    valid = valid && currentCheck;

    currentCheck = this.handleListItemsUpdate(this.state.listItems.value, true);
    valid = valid && currentCheck;

    currentCheck = this.handleQuickRepliesUpdate(
      this.state.quickReplies.value,
      true,
    );
    valid = valid && currentCheck;

    if (valid) {
      this.props.updateAction(
        stateToAction(this.props.nodeSettings, this.state),
      );
      this.props.onClose(false);
    }
  }

  public getButtons(): ButtonSet {
    return {
      primary: { name: i18n.t('buttons.confirm'), onClick: this.handleSave },
      tertiary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true),
      },
    };
  }

  private renderHeaderSection(): JSX.Element {
    const attachment = this.state.attachment.value;
    const headerType = this.state.headerType.value;
    const selectedForm = this.state.selectedForm.value;
    const interactionType =
      this.state.interactionType.value &&
      this.state.interactionType.value.value;
    const hasUploadedAttachment =
      !!attachment && (attachment && attachment.uploaded);

    return renderIf(interactionType !== WhatsAppInteractionType.LOCATION)(
      <div className={styles.header}>
        {interactionType === WhatsAppInteractionType.WHATSAPP_FLOWS ? (
          <div className={styles.disclaimer}>
            <UnnnicIcon icon="alert-circle-1-1" scheme="weni-600" />
            <span>
              <Trans
                i18nKey="forms.disclaimer.title"
                values={{
                  highlight: i18n.t('forms.disclaimer.highlight'),
                }}
              >
                Now it is possible to <b>[[highlight]]</b> using WhatsApp Flows.
              </Trans>
            </span>
            <a href="" className={styles.link}>
              {i18n.t('forms.disclaimer.link', 'Learn more.')}
            </a>
          </div>
        ) : null}

        {interactionType === WhatsAppInteractionType.WHATSAPP_FLOWS && (
          <>
            <span className={`u font secondary body-md color-neutral-cloudy`}>
              {i18n.t('forms.select_form.title', 'Select a Form')}
            </span>
            <UnnnicSelectSmart
              $model={{
                value: [selectedForm],
                setter: this.handleFormUpdate,
              }}
              options={WHATSAPP_HEADER_TYPE_OPTIONS}
              size="sm"
              orderedByIndex={true}
            />
            <span className={`u font secondary body-md color-neutral-cloudy`}>
              {i18n.t(
                'forms.select_form.warn',
                `Don't have forms yet? Learn more `,
              )}
              <a href="" className={styles.link}>
                {i18n.t('forms.select_form.here', 'here.')}
              </a>
            </span>
          </>
        )}

        <div className={styles.inputs}>
          {renderIf(interactionType === WhatsAppInteractionType.REPLIES)(
            <div className={styles.header_type}>
              <span className={`u font secondary body-md color-neutral-cloudy`}>
                {i18n.t('forms.header_optional', 'Header (optional)')}
              </span>
              <UnnnicSelectSmart
                $model={{
                  value: [headerType],
                  setter: this.handleHeaderTypeChange,
                }}
                options={WHATSAPP_HEADER_TYPE_OPTIONS}
                size="sm"
                orderedByIndex={true}
              />
            </div>,
          )}

          {renderIf(headerType.value === WhatsAppHeaderType.TEXT)(
            <div className={styles.header_text}>
              <TextInputElement
                name={
                  interactionType === WhatsAppInteractionType.REPLIES
                    ? i18n.t('forms.header_text', 'Header text')
                    : i18n.t('forms.header_optional', 'Header (optional)')
                }
                showLabel={true}
                entry={this.state.headerText}
                onChange={this.handleHeaderTextUpdate}
                placeholder={i18n.t('forms.header_text', 'Header text')}
                size={TextInputSizes.sm}
                autocomplete={true}
                maxLength={60}
              />
            </div>,
          )}

          {renderIf(headerType.value === WhatsAppHeaderType.MEDIA)(
            <>
              <div className={styles.attachment_url}>
                <TextInputElement
                  placeholder={i18n.t(
                    'forms.attachment_placeholder',
                    'Paste an URL or send a file',
                  )}
                  name={i18n.t('forms.attachment_optional', 'Media (optional)')}
                  size={TextInputSizes.sm}
                  onChange={this.handleAttachmentUrlChange}
                  entry={{
                    value:
                      attachment && !attachment.uploaded ? attachment.url : '',
                  }}
                  error={
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
            </>,
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
      </div>,
    );
  }

  private renderInteractions(): JSX.Element {
    const interactionType =
      this.state.interactionType.value &&
      this.state.interactionType.value.value;
    const messageType = this.state.messageType.value.value;

    return (
      <div className={styles.interactions_tab}>
        {renderIf(
          messageType !== WhatsAppMessageType.SIMPLE &&
            interactionType !== WhatsAppInteractionType.LOCATION,
        )(
          <TextInputElement
            placeholder={i18n.t('forms.ex_footer', 'Ex: Footer')}
            name={i18n.t('forms.footer', 'Footer (optional)')}
            size={TextInputSizes.sm}
            onChange={this.handleFooterUpdate}
            entry={this.state.footer}
            autocomplete={true}
            showLabel={true}
          />,
        )}

        {interactionType === WhatsAppInteractionType.LIST && (
          <>
            <OptionsList
              options={this.state.listItems}
              onOptionsUpdated={this.handleListItemsUpdate}
              onOptionRemoval={this.handleListItemRemoval}
            />
            <div className={styles.action_button_text}>
              <TextInputElement
                placeholder={i18n.t('forms.ex_menu', 'Ex: Menu')}
                name={i18n.t(
                  'forms.list_button_text_optional',
                  'Action Button Text (optional)',
                )}
                size={TextInputSizes.sm}
                onChange={this.handleButtonTextUpdate}
                entry={this.state.buttonText}
                autocomplete={true}
                showLabel={true}
                maxLength={20}
              />
            </div>
          </>
        )}

        {interactionType === WhatsAppInteractionType.REPLIES && (
          <QuickRepliesList
            quickReplies={this.state.quickReplies}
            onQuickRepliesUpdated={this.handleQuickRepliesUpdate}
          />
        )}
        {interactionType === WhatsAppInteractionType.CTA && (
          <div className={styles.cta_inputs}>
            <div className={styles.action_button_text}>
              <TextInputElement
                placeholder={i18n.t('forms.ex_menu', 'Ex: Menu')}
                name={i18n.t('forms.action_button_text')}
                size={TextInputSizes.sm}
                onChange={this.handleButtonTextUpdate}
                entry={this.state.buttonText}
                autocomplete={true}
                showLabel={true}
                maxLength={24}
              />
            </div>
            <div>
              <TextInputElement
                placeholder={i18n.t('forms.action_button_url_placeholder')}
                name={i18n.t('forms.action_button_url')}
                size={TextInputSizes.sm}
                onChange={this.handleActionURLUpdate}
                entry={this.state.actionURL}
                autocomplete={true}
                showLabel={true}
              />
            </div>
          </div>
        )}
        {interactionType === WhatsAppInteractionType.WHATSAPP_FLOWS && (
          <>
            <DynamicVariables
              options={this.state.dynamicVariables}
              onValueUpdated={this.handleDynamicVariableUpdate}
            />
            {/* <span className={`u font secondary body-md color-neutral-cloudy`}>
              {i18n.t('forms.select_screen', 'Select a Form')}
            </span>
            <SelectElement
              name={''}
              options={[
                {
                  value: 'first',
                  label: 'First Screen',
                },
                {
                  value: 'second',
                  label: 'Second Screen',
                },
              ]}
              entry={this.state.firstScreen}
            /> */}
          </>
        )}
      </div>
    );
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        new={typeConfig.new}
      >
        <TypeList
          nodeSettings={this.props.nodeSettings}
          __className=""
          initialType={typeConfig}
          onChange={this.props.onTypeChange}
        />
        <section className={styles.content}>
          <header className={styles.header}>
            {i18n.t(
              'whatsapp_msg.configure_your_message',
              'Configure your message',
            )}
          </header>
          <div className={styles.selectors}>
            <div>
              <span className={styles.label}>
                {i18n.t('forms.message_type', 'Message type')}
              </span>
              <UnnnicSelectSmart
                $model={{
                  value: [this.state.messageType.value],
                  setter: this.handleMessageTypeUpdate,
                }}
                options={WHATSAPP_MESSAGE_TYPE_OPTIONS}
                size="sm"
                orderedByIndex={true}
              />
            </div>

            <div>
              <span className={styles.label}>
                {i18n.t('forms.interactions', 'Interactions')}
              </span>
              <UnnnicSelectSmart
                $model={{
                  value: [this.state.interactionType.value],
                  setter: this.handleInteractionTypeUpdate,
                }}
                options={WHATSAPP_INTERACTION_TYPE_OPTIONS}
                size="sm"
                orderedByIndex={true}
                disabled={
                  this.state.messageType.value.value ===
                  WhatsAppMessageType.SIMPLE
                }
              />
            </div>
          </div>
          {this.renderHeaderSection()}
          <TextEditorElement
            name={i18n.t('forms.message', 'Message')}
            showLabel={true}
            onChange={this.handleMessageUpdate}
            entry={this.state.message}
            autocomplete={true}
            placeholder={i18n.t('forms.type_here', 'Type here...')}
            maxLength={
              this.state.messageType.value === WHATSAPP_MESSAGE_TYPE_SIMPLE
                ? 4096
                : 1024
            }
          />
          {renderIf(
            this.state.messageType.value.value ===
              WhatsAppMessageType.INTERACTIVE,
          )(this.renderInteractions())}
        </section>
      </Dialog>
    );
  }
}
