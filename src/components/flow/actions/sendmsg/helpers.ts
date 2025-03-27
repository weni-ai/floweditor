/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getActionUUID } from 'components/flow/actions/helpers';
import { SendMsgFormState } from 'components/flow/actions/sendmsg/SendMsgForm';
import { Types } from 'config/interfaces';
import { MsgTemplating, SendMsg } from 'flowTypes';
import { AssetStore } from 'store/flowContext';
import { FormEntry, NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { SelectOption } from 'components/form/select/SelectElement';
import { createUUID } from 'utils';
import { Attachment } from './attachments';

export const TOPIC_OPTIONS: SelectOption[] = [
  { value: 'event', name: 'Event' },
  { value: 'account', name: 'Account' },
  { value: 'purchase', name: 'Purchase' },
  { value: 'agent', name: 'Agent' },
];

export const INSTAGRAM_RESPONSE_TYPES: SelectOption[] = [
  { name: 'None', value: 'none' },
  { name: "Tag support for DM's", value: 'tag_support' },
  { name: 'Send DM in response to a Post', value: 'post_response' },
  { name: 'Reply to a comment', value: 'comment_reply' },
];

export const TAG_OPTIONS: SelectOption[] = [
  { name: 'human_agent', value: 'human_agent' },
  { name: 'bot', value: 'bot' },
  { name: 'customer_support', value: 'customer_support' },
  { name: 'support', value: 'support' },
];

// Note: Instagram properties are already defined in the SendMsg interface in flowTypes.ts

export const initializeForm = (
  settings: NodeEditorSettings,
  assetStore: AssetStore,
): SendMsgFormState => {
  let template: FormEntry = { value: null };
  let templateVariables: StringEntry[] = [];

  if (
    settings.originalAction &&
    settings.originalAction.type === Types.send_msg
  ) {
    const action = settings.originalAction as SendMsg;
    const attachments: Attachment[] = [];
    (action.attachments || []).forEach((attachmentString: string) => {
      const splitPoint = attachmentString.indexOf(':');

      const type = attachmentString.substring(0, splitPoint);
      const attachment = {
        type,
        url: attachmentString.substring(splitPoint + 1),
        uploaded: type.indexOf('/') > -1,
      };

      attachments.push(attachment);
    });

    if (action.templating) {
      const msgTemplate = action.templating.template;
      template = {
        value: {
          uuid: msgTemplate.uuid,
          name: msgTemplate.name,
        },
      };
      templateVariables = action.templating.variables.map((value: string) => {
        return {
          value,
        };
      });
    }

    // Extract Instagram settings from action if they exist
    let instagramResponseType: { value: SelectOption | null } = { value: null };
    let postId: { value: string } = { value: '' };
    let commentId: { value: string } = { value: '' };
    let tagSelection: { value: SelectOption | null } = { value: null };

    if (action.instagram_settings) {
      const responseValue = action.instagram_settings.response_type;
      instagramResponseType = {
        value:
          INSTAGRAM_RESPONSE_TYPES.find(
            (option: SelectOption) => option.value === responseValue,
          ) || null,
      };

      // Set the appropriate field based on response type
      if (
        responseValue === 'post_response' &&
        action.instagram_settings.post_id
      ) {
        postId = { value: action.instagram_settings.post_id };
      } else if (
        responseValue === 'comment_reply' &&
        action.instagram_settings.comment_id
      ) {
        commentId = { value: action.instagram_settings.comment_id };
      } else if (
        responseValue === 'tag_support' &&
        action.instagram_settings.tag_selection
      ) {
        tagSelection = {
          value:
            TAG_OPTIONS.find(
              (option: SelectOption) =>
                option.value === action.instagram_settings.tag_selection,
            ) || null,
        };
      }
    }

    return {
      topic: {
        value: TOPIC_OPTIONS.find(option => option.value === action.topic),
      },
      template,
      templateVariables,
      attachments,
      message: { value: action.text },
      quickReplies: { value: action.quick_replies || [] },
      quickReplyEntry: { value: '' },
      sendAll: action.all_urns,
      valid: true,
      instagramResponseType,
      postId,
      commentId,
      tagSelection,
    };
  }

  return {
    topic: { value: null },
    template,
    templateVariables: [],
    attachments: [],
    message: { value: '' },
    quickReplies: { value: [] },
    quickReplyEntry: { value: '' },
    sendAll: false,
    valid: false,
    instagramResponseType: { value: null },
    postId: { value: '' },
    commentId: { value: '' },
    tagSelection: { value: null },
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  state: SendMsgFormState,
): SendMsg => {
  const attachments = state.attachments
    .filter((attachment: Attachment) => attachment.url.trim().length > 0)
    .map((attachment: Attachment) => `${attachment.type}:${attachment.url}`);

  let templating: MsgTemplating = null;

  if (state.template && state.template.value) {
    let templatingUUID = createUUID();
    if (
      settings.originalAction &&
      settings.originalAction.type === Types.send_msg
    ) {
      const action = settings.originalAction as SendMsg;
      if (
        action.templating &&
        action.templating.template &&
        action.templating.template.uuid === state.template.value.id
      ) {
        templatingUUID = action.templating.uuid;
      }
    }

    templating = {
      uuid: templatingUUID,
      template: {
        uuid: state.template.value.uuid,
        name: state.template.value.name,
      },
      variables: state.templateVariables.map(
        (variable: StringEntry) => variable.value,
      ),
    };
  }

  const result: SendMsg = {
    attachments,
    text: state.message.value,
    type: Types.send_msg,
    all_urns: state.sendAll,
    quick_replies: state.quickReplies.value,
    uuid: getActionUUID(settings, Types.send_msg),
  };

  if (templating) {
    result.templating = templating;
  }

  if (state.topic.value) {
    result.topic = state.topic.value.value;
  }

  // Add Instagram-specific properties if a response type is selected
  if (state.instagramResponseType.value) {
    const responseType = state.instagramResponseType.value.value;

    // Only add Instagram settings if response type is not 'none'
    if (responseType !== 'none') {
      result.instagram_settings = {
        response_type: responseType,
      };

      // Add specific fields based on response type
      if (responseType === 'post_response' && state.postId.value) {
        result.instagram_settings.post_id = state.postId.value;
      } else if (responseType === 'comment_reply' && state.commentId.value) {
        result.instagram_settings.comment_id = state.commentId.value;
      } else if (responseType === 'tag_support' && state.tagSelection.value) {
        result.instagram_settings.tag_selection =
          state.tagSelection.value.value;
      }
    }
  }

  return result;
};
