import { createRenderNode } from 'components/flow/routers/helpers';
import {
  Category,
  Exit,
  RouterTypes,
  SwitchRouter,
  WebhookExitNames,
} from 'flowTypes';
import { Types } from 'config/interfaces';
import { RunCodeAction } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, FormEntry } from 'store/nodeEditor';
import { createUUID, snakify } from 'utils';
import { CodeActionRouterFormState } from 'components/flow/routers/codeaction/CodeActionRouterForm';
import { StringEntry } from '../../../../store/nodeEditor';

export const getOriginalAction = (
  settings: NodeEditorSettings,
): RunCodeAction => {
  const action =
    settings.originalAction ||
    (settings.originalNode.node.actions.length > 0 &&
      settings.originalNode.node.actions[0]);

  if (action.type === Types.run_code_action) {
    return action as RunCodeAction;
  }
};

export const nodeToState = (
  settings: NodeEditorSettings,
  initialCodeAction: any,
): CodeActionRouterFormState => {
  const originalAction = getOriginalAction(settings);
  let resultName: StringEntry = { value: 'Result' };
  let codeAction: FormEntry = {
    value: { id: 0, name: 'Select a Code Action' },
  };

  if (originalAction && originalAction.type === Types.run_code_action) {
    codeAction = { value: originalAction.codeaction };
    resultName = { value: originalAction.result_name };
  } else {
    if (initialCodeAction) {
      codeAction = initialCodeAction;
    }
  }

  const state: CodeActionRouterFormState = {
    resultName,
    codeAction,
    valid: true,
  };
  return state;
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: CodeActionRouterFormState,
): RenderNode => {
  let uuid = createUUID();
  const originalAction = getOriginalAction(settings);
  if (originalAction) {
    uuid = originalAction.uuid;
  }
  let categories: Category[] = [];
  let exits: Exit[] = [];

  const newAction: RunCodeAction = {
    uuid,
    type: Types.run_code_action,
    codeaction: {
      id: state.codeAction.value.id,
      name: state.codeAction.value.name,
    },
    result_name: state.resultName.value,
  };

  const originalNode = settings.originalNode;
  if (
    originalNode &&
    originalNode.node.actions.length === 1 &&
    originalNode.node.actions[0].type === newAction.type
  ) {
    exits = originalNode.node.exits;
    categories = originalNode.node.router.categories;
  } else {
    exits = [
      {
        uuid: createUUID(),
        destination_uuid: null,
      },
      {
        uuid: createUUID(),
        destination_uuid: null,
      },
    ];

    categories = [
      {
        uuid: createUUID(),
        name: WebhookExitNames.Success,
        exit_uuid: exits[0].uuid,
      },
      {
        uuid: createUUID(),
        name: WebhookExitNames.Failure,
        exit_uuid: exits[1].uuid,
      },
    ];
  }

  let operand = '@results.' + snakify(newAction.result_name);

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    default_category_uuid: categories[0].uuid,
    cases: [],
    categories,
    operand,
  };

  const newRenderNode = createRenderNode(
    settings.originalNode.node.uuid,
    router,
    exits,
    Types.run_code_action,
    [newAction],
  );

  return newRenderNode;
};
