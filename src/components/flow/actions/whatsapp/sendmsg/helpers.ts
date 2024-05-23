import { getActionUUID } from 'components/flow/actions/helpers';
import {
  SendWhatsAppMsgFormState,
  WHATSAPP_HEADER_TYPE_MEDIA,
  WHATSAPP_HEADER_TYPE_OPTIONS,
  WHATSAPP_INTERACTION_TYPE_NONE,
  WHATSAPP_INTERACTION_TYPE_OPTIONS,
  WHATSAPP_MESSAGE_TYPE_OPTIONS,
  WHATSAPP_MESSAGE_TYPE_SIMPLE,
  WhatsAppListItem,
} from 'components/flow/actions/whatsapp/sendmsg/SendWhatsAppMsgForm';
import { Types } from 'config/interfaces';
import { NodeEditorSettings } from 'store/nodeEditor';
import { createUUID } from 'utils';
import { Attachment } from './attachments';
import { SendWhatsAppMsg } from '../../../../../flowTypes';

export const initializeForm = (
  settings: NodeEditorSettings,
): SendWhatsAppMsgFormState => {
  if (
    settings.originalAction &&
    settings.originalAction.type === Types.send_whatsapp_msg
  ) {
    const action = settings.originalAction as SendWhatsAppMsg;
    let attachment: Attachment = null;

    if (action.attachment) {
      const splitPoint = action.attachment.indexOf(':');

      const type = action.attachment.substring(0, splitPoint);

      attachment = {
        type: type,
        url: action.attachment.substring(splitPoint + 1),
        uploaded: type.indexOf('/') > -1,
      };
    }

    return {
      message: { value: action.text || '' },
      messageType: {
        value: WHATSAPP_MESSAGE_TYPE_OPTIONS.find(
          o => o.value === action.messageType,
        ),
      },
      headerType: {
        value: WHATSAPP_HEADER_TYPE_OPTIONS.find(
          o => o.value === action.header_type,
        ),
      },
      headerText: { value: action.header_text || '' },
      attachment: { value: attachment, validationFailures: [] },
      footer: { value: action.footer || '' },
      interactionType: {
        value:
          WHATSAPP_INTERACTION_TYPE_OPTIONS.find(
            o => o.value === action.interaction_type,
          ) || WHATSAPP_INTERACTION_TYPE_NONE,
      },
      buttonText: { value: action.button_text || '' },
      listItems: { value: action.list_items || [] },
      quickReplies: { value: action.quick_replies || [] },

      listItemTitleEntry: { value: '' },
      listItemDescriptionEntry: { value: '' },
      quickReplyEntry: { value: '' },
      valid: true,
    };
  }

  return {
    headerType: { value: WHATSAPP_HEADER_TYPE_MEDIA },
    message: { value: '' },
    messageType: { value: WHATSAPP_MESSAGE_TYPE_SIMPLE },
    headerText: { value: '' },
    attachment: { value: null, validationFailures: [] },
    footer: { value: '' },
    interactionType: { value: WHATSAPP_INTERACTION_TYPE_NONE },
    buttonText: { value: '' },
    listItems: { value: [] },
    quickReplies: { value: [] },

    listItemTitleEntry: { value: '' },
    listItemDescriptionEntry: { value: '' },
    quickReplyEntry: { value: '' },
    valid: false,
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  state: SendWhatsAppMsgFormState,
): SendWhatsAppMsg => {
  let attachment: string = null;
  if (
    state.attachment &&
    state.attachment.value &&
    state.attachment.value.url.trim().length > 0
  ) {
    attachment = `${
      state.attachment.value.type
    }:${state.attachment.value.url.trim()}`;
  }

  let replies: string[] = [];
  if (state.quickReplies.value) {
    replies = state.quickReplies.value.filter(
      (reply: string) => reply.trim().length > 0,
    );
  }

  let listItems: WhatsAppListItem[] = [];
  if (state.listItems.value) {
    listItems = state.listItems.value.filter(
      (item: WhatsAppListItem) => item.title.trim().length > 0,
    );
  }

  let result: SendWhatsAppMsg = {
    attachment,
    type: Types.send_whatsapp_msg,
    text: state.message.value,
    messageType: state.messageType.value.value,
    header_type: state.headerType.value.value,
    header_text: state.headerText.value,
    footer: state.footer.value,
    interaction_type: state.interactionType.value.value,
    button_text: state.buttonText.value,
    list_items: listItems,
    quick_replies: replies,
    uuid: getActionUUID(settings, Types.send_whatsapp_msg),
  };

  result = Object.fromEntries(
    Object.entries(result).filter(
      ([, v]) =>
        !(
          ((typeof v === 'string' || Array.isArray(v)) && !v.length) ||
          v === null ||
          typeof v === 'undefined'
        ),
    ),
  ) as SendWhatsAppMsg;

  return result;
};

export const createEmptyListItem = () => {
  return {
    uuid: createUUID(),
    title: '',
    description: '',
  };
};
