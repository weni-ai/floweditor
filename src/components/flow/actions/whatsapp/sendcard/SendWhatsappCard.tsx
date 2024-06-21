import Dialog from 'components/dialog/Dialog';
import { ActionFormProps } from 'components/flow/props';
import * as React from 'react';
import {
  FormState,
  StringEntry,
  UnnnicSelectOptionEntry,
  FormEntry,
  StringArrayEntry,
} from 'store/nodeEditor';

import {
  WhatsAppMessageType,
  WhatsAppHeaderType,
  WhatsAppInteractionType,
  WhatsAppListItem,
} from '../sendmsg/SendWhatsAppMsgForm';
import { Attachment } from '../sendmsg/attachments';
import i18n from 'config/i18n';
import {
  unnnicSelectSmart,
  // @ts-ignore
} from '@weni/unnnic-system';
import { applyVueInReact } from 'vuereact-combined';

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

export interface SendWhatsAppCardFormState extends FormState {
  message: StringEntry;

  messageType: UnnnicSelectOptionEntry<WhatsAppMessageType>;

  headerType: UnnnicSelectOptionEntry<WhatsAppHeaderType>;
  headerText: StringEntry;
  attachment: FormEntry<Attachment>;

  footer: StringEntry;

  interactionType: UnnnicSelectOptionEntry<WhatsAppInteractionType>;

  buttonText: StringEntry;
  listItems: FormEntry<WhatsAppListItem[]>;
  listItemTitleEntry: StringEntry;
  listItemDescriptionEntry: StringEntry;

  quickReplies: StringArrayEntry;
  quickReplyEntry: StringEntry;
}

export const WHATSAPP_MESSAGE_TYPE_OPTIONS: any[] = [
  {
    value: 'teste 2',
    label: 'teste 2',
  },
  {
    value: 'teste 2',
    label: 'teste 2',
  },
];

class SendWhatsappCard extends React.Component<
  ActionFormProps,
  SendWhatsAppCardFormState
> {
  render() {
    const typeConfig = this.props.typeConfig;
    return (
      <div>
        <Dialog title={typeConfig.name}>
          <div>
            <div>
              <span>{i18n.t('forms.message_type', 'Message type')}</span>
              <UnnnicSelectSmart
                options={WHATSAPP_MESSAGE_TYPE_OPTIONS}
                size="sm"
                orderedByIndex={true}
              />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}

export default SendWhatsappCard;
