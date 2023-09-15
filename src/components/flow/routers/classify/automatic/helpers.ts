import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import {
  createCaseProps,
  createRenderNode,
  hasCases,
  resolveRoutes
} from 'components/flow/routers/helpers';
import { AutomaticClassifyRouterFormState } from 'components/flow/routers/classify/automatic/AutomaticClassifyRouterForm';
import { DEFAULT_OPERAND } from 'components/nodeeditor/constants';
import { Type, Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { Router, RouterTypes, SwitchRouter } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';

export const nodeToState = (settings: NodeEditorSettings): AutomaticClassifyRouterFormState => {
  let initialCases: CaseProps[] = [];

  // TODO: work out an incremental result name
  let resultName: StringEntry = { value: 'Result' };
  let operand = DEFAULT_OPERAND;

  if (settings.originalNode && getType(settings.originalNode) === Types.automatic_classify) {
    const router = settings.originalNode.node.router as SwitchRouter;
    if (router) {
      if (hasCases(settings.originalNode.node)) {
        initialCases = createCaseProps(router.cases, settings.originalNode);
      }

      resultName = { value: router.result_name || '' };
      operand = router.operand;
    }
  }

  return {
    cases: initialCases,
    resultName,
    valid: true,
    operand: { value: operand }
  };
};

export const stateToNode = (
  settings: NodeEditorSettings,
  typeConfig: Type,
  state: AutomaticClassifyRouterFormState
): RenderNode => {
  const { cases, exits, defaultCategory, caseConfig, categories } = resolveRoutes(
    state.cases,
    false,
    settings.originalNode.node
  );

  const optionalRouter: Pick<Router, 'result_name'> = {};
  if (state.resultName.value) {
    optionalRouter.result_name = state.resultName.value;
  }

  const routerResultName = state.resultName.value;
  const actionResultName = '_' + routerResultName + ' Classification';

  const router: SwitchRouter = {
    type: RouterTypes.smart,
    default_category_uuid: defaultCategory,
    cases,
    categories,
    operand: state.operand.value,
    result_name: routerResultName,
    ...optionalRouter
  };

  const newRenderNode = createRenderNode(
    settings.originalNode.node.uuid,
    router,
    exits,
    typeConfig.type,
    [],
    { cases: caseConfig }
  );

  return newRenderNode;
};
