import { Types } from 'config/interfaces';
import { CallBrain } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';
import { getActionUUID } from 'components/flow/actions/helpers';
import { CallBrainFormProps } from './CallBrainForm';

export const propsToAction = (
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
