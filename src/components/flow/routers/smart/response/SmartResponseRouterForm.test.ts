import { RouterFormProps } from 'components/flow/props';
import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import SmartResponseRouterForm from 'components/flow/routers/smart/response/SmartResponseRouterForm';
import { Operators } from 'config/interfaces';
import { Types } from 'config/interfaces';
import { composeComponentTestUtils, mock } from 'testUtils';
import { getRouterFormProps, createMatchRouter } from 'testUtils/assetCreators';
import * as utils from 'utils';
import { createUUID } from 'utils';
import { getSmartOrSwitchRouter } from 'components/flow/routers/helpers';

const routerNode = createMatchRouter(['Red']);

const { setup } = composeComponentTestUtils<RouterFormProps>(
  SmartResponseRouterForm,
  getRouterFormProps(routerNode),
);

describe(SmartResponseRouterForm.name, () => {
  beforeEach(() => {
    mock(utils, 'createUUID', utils.seededUUIDs());
  });

  it('should render', () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('initializes case config', () => {
    const baseCase = createUUID();

    const baseNode = createMatchRouter(['Red']);
    const router = getSmartOrSwitchRouter(baseNode.node);
    router.cases.push({
      uuid: baseCase,
      type: Operators.has_any_word,
      arguments: ['not blue'],
      category_uuid: router.categories[0].uuid,
    });

    baseNode.ui = {
      position: { left: 0, top: 0 },
      type: Types.smart_wait_for_response,
      config: { cases: { [baseCase]: { arguments: ['not blue'] } } },
    };

    const { wrapper } = setup(true, {
      nodeSettings: {
        $set: {
          originalNode: baseNode,
        },
      },
    });

    expect(wrapper).toMatchSnapshot();
  });

  describe('updates', () => {
    it('should save changes', () => {
      const { instance, props } = setup(true, {
        $merge: { onClose: vi.fn(), updateRouter: vi.fn() },
      });

      instance.handleUpdateTimeout(180);
      instance.handleUpdateResultName('Favorite Color');
      instance.handleCasesUpdated([
        {
          uuid: createUUID(),
          kase: { type: Operators.has_any_word, arguments: ['red'] },
          categoryName: 'Red',
          valid: true,
        },
        {
          uuid: createUUID(),
          kase: { type: Operators.has_any_word, arguments: ['maroon'] },
          categoryName: 'Red',
          valid: true,
        },
        {
          uuid: createUUID(),
          kase: { type: Operators.has_any_word, arguments: ['green'] },
          categoryName: 'Green',
          valid: true,
        },
      ] as CaseProps[]);

      expect(instance.state).toMatchSnapshot();

      instance.handleSave();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateRouter).toHaveBeenCalled();
      expect(props.updateRouter).toMatchSnapshot();
    });

    it('should cancel', () => {
      const { instance, props } = setup(true, {
        $merge: { onClose: vi.fn(), updateRouter: vi.fn() },
      });
      instance.handleUpdateTimeout(180);
      instance.getButtons().secondary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateRouter).not.toHaveBeenCalled();
    });
  });
});
