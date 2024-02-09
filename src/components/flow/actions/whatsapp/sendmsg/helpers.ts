import { getActionUUID } from 'components/flow/actions/helpers';
import {
  SendWhatsAppMsgFormState,
  WHATSAPP_HEADER_TYPE_MEDIA,
  WHATSAPP_HEADER_TYPE_OPTIONS,
  WHATSAPP_INTERACTION_TYPE_LIST,
  WHATSAPP_INTERACTION_TYPE_OPTIONS,
  WhatsAppListItem
} from 'components/flow/actions/whatsapp/sendmsg/SendWhatsAppMsgForm';
import { Types } from 'config/interfaces';
import { NodeEditorSettings } from 'store/nodeEditor';
import { createUUID } from 'utils';
import { Attachment } from './attachments';
import { SendWhatsAppMsg } from '../../../../../flowTypes';

export const initializeForm = (settings: NodeEditorSettings): SendWhatsAppMsgFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.send_whatsapp_msg) {
    const action = settings.originalAction as SendWhatsAppMsg;
    let attachment: Attachment = null;

    if (action.attachment) {
      const splitPoint = action.attachment.indexOf(':');

      const type = action.attachment.substring(0, splitPoint);

      attachment = {
        type: type,
        url: action.attachment.substring(splitPoint + 1),
        uploaded: type.indexOf('/') > -1
      };
    }

    return {
      message: { value: action.text },
      headerType: {
        value: WHATSAPP_HEADER_TYPE_OPTIONS.find(o => o.value === action.header_type)
      },
      header_text: { value: action.header_text },
      attachment: { value: attachment, validationFailures: [] },
      footer: { value: action.footer },
      interactionType: {
        value: WHATSAPP_INTERACTION_TYPE_OPTIONS.find(o => o.value === action.interaction_type)
      },
      listTitle: { value: action.list_title },
      listFooter: { value: action.list_footer },
      listItems: { value: action.list_items || [] },
      quickReplies: { value: action.quick_replies || [] },

      listItemTitleEntry: { value: '' },
      listItemDescriptionEntry: { value: '' },
      quickReplyEntry: { value: '' },
      valid: true
    };
  }

  return {
    headerType: { value: WHATSAPP_HEADER_TYPE_MEDIA },
    message: { value: '' },
    header_text: { value: '' },
    attachment: { value: null, validationFailures: [] },
    footer: { value: '' },
    interactionType: { value: WHATSAPP_INTERACTION_TYPE_LIST },
    listTitle: { value: '' },
    listFooter: { value: '' },
    listItems: { value: [] },
    quickReplies: { value: [] },

    listItemTitleEntry: { value: '' },
    listItemDescriptionEntry: { value: '' },
    quickReplyEntry: { value: '' },
    valid: false
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  state: SendWhatsAppMsgFormState
): SendWhatsAppMsg => {
  let attachment: string = null;
  if (state.attachment && state.attachment.value && state.attachment.value.url.trim().length > 0) {
    attachment = `${state.attachment.value.type}:${state.attachment.value.url.trim()}`;
  }

  let replies: string[] = [];
  if (state.quickReplies.value) {
    replies = state.quickReplies.value.filter((reply: string) => reply.trim().length > 0);
  }

  let listItems: WhatsAppListItem[] = [];
  if (state.listItems.value) {
    listItems = state.listItems.value.filter(
      (item: WhatsAppListItem) => item.title.trim().length > 0
    );
  }

  const result: SendWhatsAppMsg = {
    attachment,
    type: Types.send_whatsapp_msg,
    text: state.message.value,
    header_type: state.headerType.value.value,
    header_text: state.header_text.value,
    footer: state.footer.value,
    interaction_type: state.interactionType.value.value,
    list_title: state.listTitle.value,
    list_footer: state.listFooter.value,
    list_items: listItems,
    quick_replies: replies,
    uuid: getActionUUID(settings, Types.send_whatsapp_msg)
  };

  return result;
};

export const createEmptyListItem = () => {
  return {
    uuid: createUUID(),
    title: '',
    description: ''
  };
};
