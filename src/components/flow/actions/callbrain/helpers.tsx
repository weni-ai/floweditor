import { Types } from 'config/interfaces';
import { CallBrain } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';
import { getActionUUID } from 'components/flow/actions/helpers';
import { CallBrainFormProps, CallBrainFormState } from './CallBrainForm';

export const initializeForm = (
  settings: NodeEditorSettings,
): CallBrainFormState => {
  if (
    settings.originalAction &&
    settings.originalAction.type === Types.call_brain
  ) {
    const action = settings.originalAction;
    return {
      entry: { value: action.entry || '@input.text' },
    };
  }
};
export const updateAction = (
  settings: NodeEditorSettings,
  state: CallBrainFormProps,
): CallBrain => {
  return {
    type: Types.call_brain,
    uuid: getActionUUID(settings, Types.call_brain),
    brainInfo: state.brainInfo,
    entry: state.entry,
  };
};
