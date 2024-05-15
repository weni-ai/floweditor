import { getActionUUID } from 'components/flow/actions/helpers';
import { SendEmailFormState } from 'components/flow/actions/sendemail/SendEmailForm';
import { Types } from 'config/interfaces';
import { SendEmail } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';

export const initializeForm = (
  settings: NodeEditorSettings,
): SendEmailFormState => {
  if (
    settings.originalAction &&
    settings.originalAction.type === Types.send_email
  ) {
    const action = settings.originalAction as SendEmail;
    return {
      body: { value: action.body },
      subject: { value: action.subject },
      recipients: { value: action.addresses },
      recipient: { value: '' },
      recipientError: undefined,
      valid: true,
    };
  }

  return {
    body: { value: '' },
    subject: { value: '' },
    recipients: { value: [] },
    recipient: { value: '' },
    recipientError: undefined,
    valid: true,
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  formState: SendEmailFormState,
): SendEmail => {
  return {
    addresses: formState.recipients.value,
    subject: formState.subject.value,
    body: formState.body.value,
    type: Types.send_email,
    uuid: getActionUUID(settings, Types.send_email),
  };
};
