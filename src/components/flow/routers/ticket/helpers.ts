import { createWebhookBasedNode } from 'components/flow/routers/helpers';
import { Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { OpenTicket } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, FormEntry } from 'store/nodeEditor';
import { createUUID } from 'utils';
import { TicketRouterFormState } from 'components/flow/routers/ticket/TicketRouterForm';

export const getOriginalAction = (settings: NodeEditorSettings): OpenTicket => {
  const action =
    settings.originalAction ||
    (settings.originalNode.node.actions.length > 0 &&
      settings.originalNode.node.actions[0]);

  if (action.type === Types.open_ticket) {
    return action as OpenTicket;
  }
};

export const nodeToState = (
  settings: NodeEditorSettings,
  initialTicketer: any,
): TicketRouterFormState => {
  let ticketer: FormEntry = initialTicketer
    ? { value: { uuid: initialTicketer.id, name: initialTicketer.name } }
    : { value: null };
  let subject = { value: '@run.flow.name' };
  let body = { value: '@results' };
  let resultName = { value: 'Result' };
  let assignee: FormEntry = { value: null };
  let topic: FormEntry = { value: null };
  let queues: any[] = [];
  let topics: any[] = [];

  if (getType(settings.originalNode) === Types.split_by_ticket) {
    const action = getOriginalAction(settings) as OpenTicket;
    ticketer = { value: action.ticketer };
    subject = { value: action.subject };
    body = { value: action.body };
    topic = { value: action.topic };
    assignee = { value: action.assignee };
    resultName = { value: action.result_name };
    queues = [];
    topics = [];
  }

  const state: TicketRouterFormState = {
    assignee,
    topic,
    ticketer,
    subject,
    body,
    resultName,
    queues,
    topics,
    valid: true,
  };

  return state;
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: TicketRouterFormState,
): RenderNode => {
  let uuid = createUUID();
  const originalAction = getOriginalAction(settings);
  if (originalAction) {
    uuid = originalAction.uuid;
  }

  const newAction: OpenTicket = {
    uuid,
    type: Types.open_ticket,
    ticketer: {
      uuid: state.ticketer.value.uuid,
      name: state.ticketer.value.name,
    },
    body: state.body.value,
    topic: state.topic.value,
    assignee: state.assignee.value,
    result_name: state.resultName.value,
  };

  return createWebhookBasedNode(newAction, settings.originalNode, true);
};
