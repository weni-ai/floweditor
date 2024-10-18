import {
  actionContainerSpecId,
  actionInteractiveDivSpecId,
  ActionWrapper,
  ActionWrapperProps,
} from 'components/flow/actions/action/Action';
import { composeComponentTestUtils, getSpecWrapper, setMock } from 'testUtils';
import {
  createExit,
  createRenderNode,
  createSendMsgAction,
  createStartFlowAction,
  createSubflowNode,
  English,
  createSendWhatsAppMsgAction,
  createSendEmailAction,
  createCallWeniGPTAction,
  Spanish,
} from 'testUtils/assetCreators';
import { getLocalization, set, setFalse, setTrue } from 'utils';
import { MouseState } from 'store/editor';
import { shallowToJson } from 'enzyme-to-json';

const sendMsgAction = createSendMsgAction();
const sendMsgAction1 = createSendMsgAction({
  uuid: '0ed4b887-2924-45ea-babe-4d580cdfb000',
  text: 'Yo!',
});
const sendWppMsgAction = createSendWhatsAppMsgAction();
const sendEmailAction = createSendEmailAction();
const callWeniGptAction = createCallWeniGPTAction();
const sendMsgNode = createRenderNode({
  actions: [sendMsgAction],
  exits: [createExit()],
});
const startFlowAction = createStartFlowAction();
const subflowNode = createSubflowNode(startFlowAction);
const localization = {
  spa: {
    [sendMsgAction.uuid]: {
      text: ['¡Hola!'],
    },
  },
};

const wppLocalization = {
  spa: {
    [sendWppMsgAction.uuid]: {
      text: ['¡Hola!'],
    },
  },
};

const baseProps: ActionWrapperProps = {
  selected: false,
  localization,
  first: true,
  action: sendMsgAction,
  render: vi.fn(),
  renderNode: sendMsgNode,
  language: English,
  translating: false,
  onOpenNodeEditor: vi.fn(),
  removeAction: vi.fn(),
  moveActionUp: vi.fn(),
  issues: [],
  scrollToAction: '',
  mouseState: MouseState.SELECT,
};

const { setup, spyOn } = composeComponentTestUtils(ActionWrapper, baseProps);

describe(ActionWrapper.name, () => {
  describe('render', () => {
    it('should render self, children with base props', () => {
      const { wrapper, props, instance } = setup(true, {
        render: setMock(),
      });
      const actionContainer = getSpecWrapper(wrapper, actionContainerSpecId);

      expect(actionContainer.prop('id')).toBe(`action-${props.action.uuid}`);
      expect(
        getSpecWrapper(wrapper, actionInteractiveDivSpecId).exists(),
      ).toBeTruthy();
      expect(wrapper.find('TitleBar').props()).toMatchSnapshot();
      expect(props.render).toHaveBeenCalledTimes(1);
      expect(props.render).toHaveBeenCalledWith(
        props.action,
        instance.context.config.endpoints,
      );
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it('should show move icon', () => {
      const { wrapper } = setup(true, { first: setFalse() });

      expect(wrapper.find('TitleBar').prop('showMove')).toBeTruthy();
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it('should display translating style', () => {
      const { wrapper } = setup(true, { translating: setTrue() });

      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it('should render selected', () => {
      const { wrapper } = setup(true, { selected: setTrue() });

      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it('should display translating style to send whatsapp message action', () => {
      const { wrapper } = setup(true, {
        action: set(sendWppMsgAction),
        translating: setTrue(),
      });

      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it('should display translating style to send email action', () => {
      const { wrapper } = setup(true, {
        action: set(sendEmailAction),
        translating: setTrue(),
      });

      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it('should display translating style to call weni gpt action', () => {
      const { wrapper } = setup(true, {
        action: set(callWeniGptAction),
        translating: setTrue(),
      });

      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it('should display not_localizable style', () => {
      const { wrapper } = setup(true, {
        action: set(startFlowAction),
        translating: setTrue(),
      });

      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it('should display hybrid style', () => {
      const { wrapper } = setup(true, {
        renderNode: set(subflowNode),
      });

      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it('should display missing_localization style', () => {
      const { wrapper } = setup(true, {
        action: set(sendMsgAction1),
        translating: setTrue(),
      });

      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('instance methods', () => {
    describe('handleActionClicked', () => {
      it('should be called when interactive div is clicked', () => {
        const onClickSpy = spyOn('handleActionClicked');
        const { wrapper } = setup();
        const interactiveDiv = getSpecWrapper(
          wrapper,
          actionInteractiveDivSpecId,
        );
        const mockEvent = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        };

        interactiveDiv.simulate('mouseDown', mockEvent);
        interactiveDiv.simulate('mouseUp', mockEvent);

        expect(onClickSpy).toHaveBeenCalledTimes(1);

        onClickSpy.mockRestore();
      });

      it("should call 'onOpenEditor' action creator if node is not dragging", () => {
        const { props, instance } = setup(true, {
          onOpenNodeEditor: setMock(),
        }) as { instance: ActionWrapper; props: ActionWrapperProps };

        const mockEvent: any = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        };

        instance.handleActionClicked(mockEvent);

        expect(props.onOpenNodeEditor).toHaveBeenCalledTimes(1);
        /* 
                expect(props.onOpenNodeEditor).toHaveBeenCalledWith({
                    originalNode: props.node,
                    originalAction: props.action,
                    showAdvanced: false
                });
                */
      });

      it("should call onOpenNodeEditor with showAdvanced true if clicked on a target with 'data-advanced' attribute", () => {
        const { props, instance } = setup(true, {
          onOpenNodeEditor: setMock(),
        }) as { instance: ActionWrapper; props: ActionWrapperProps };

        const mockEvent: any = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          target: {
            attributes: {},
            getAttribute: vi.fn(() => 'true'),
          },
        };

        instance.handleActionClicked(mockEvent);

        expect(props.onOpenNodeEditor).toHaveBeenCalledTimes(1);
        expect(props.onOpenNodeEditor).toHaveBeenCalledWith({
          originalNode: props.renderNode,
          originalAction: props.action,
          showAdvanced: true,
        });
      });

      it('should not call onOpenNodeEditor if node is dragging', () => {
        const { props, instance } = setup(true, {
          onOpenNodeEditor: setMock(),
          mouseState: set(MouseState.DRAGGING),
        }) as { instance: ActionWrapper; props: ActionWrapperProps };

        const mockEvent: any = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        };

        instance.handleActionClicked(mockEvent);

        expect(props.onOpenNodeEditor).not.toHaveBeenCalled();
      });
    });

    describe('handleRemoval', () => {
      it('should call removeAction action creator', () => {
        const { props, instance } = setup(true, {
          removeAction: setMock(),
        }) as { instance: ActionWrapper; props: ActionWrapperProps };
        // const mockEvent: any = {
        //   stopPropagation: vi.fn(),
        //   preventDefault: vi.fn(),
        // };

        instance.handleRemoval();

        expect(props.removeAction).toHaveBeenCalledTimes(1);
        expect(props.removeAction).toHaveBeenCalledWith(
          props.renderNode.node.uuid,
          props.action,
        );
      });
    });

    describe('onMoveUp', () => {
      it('should call moveActionUp action creator', () => {
        const { props, instance } = setup(true, {
          moveActionUp: setMock(),
        }) as { instance: ActionWrapper; props: ActionWrapperProps };

        const mockEvent: any = {
          stopPropagation: vi.fn(),
          preventDefault: vi.fn(),
        };

        instance.handleMoveUp(mockEvent);

        expect(props.moveActionUp).toHaveBeenCalledTimes(1);
        expect(props.moveActionUp).toHaveBeenCalledWith(
          props.renderNode.node.uuid,
          props.action,
        );
      });

      it('should call moveActionUp eve without event', () => {
        const { props, instance } = setup(true, {
          moveActionUp: setMock(),
        }) as { instance: ActionWrapper; props: ActionWrapperProps };

        instance.handleMoveUp(null);

        expect(props.moveActionUp).toHaveBeenCalledTimes(1);
        expect(props.moveActionUp).toHaveBeenCalledWith(
          props.renderNode.node.uuid,
          props.action,
        );
      });
    });

    describe('getAction', () => {
      it('should return the action passed via props if not localized', () => {
        const { props, instance } = setup(true, {
          node: set(sendMsgAction1),
        });

        expect(instance.getAction()).toEqual(props.action);
      });

      it('should return localized action if localized', () => {
        const { props, instance } = setup();
        const localizedObject = getLocalization(
          props.action,
          props.localization,
          props.language,
        ).getObject();

        expect(instance.getAction()).toEqual(localizedObject);
      });

      it('should return localized action if localized when translating', () => {
        const { props, instance } = setup(true, {
          action: set(sendWppMsgAction),
          translating: setTrue(),
          language: set(Spanish),
          localization: set(wppLocalization),
        });
        const localizedObject = getLocalization(
          props.action,
          props.localization,
          props.language,
        ).getObject();

        expect(instance.getAction()).toEqual(localizedObject);
      });
    });

    describe('scrollToAction', () => {
      it("should render MountScroll with action's uuid", () => {
        const { wrapper } = setup(true, {
          scrollToAction: set(sendMsgAction.uuid),
          action: set({ uuid: sendMsgAction.uuid }),
        });

        expect(shallowToJson(wrapper)).toMatchSnapshot();
      });
    });

    describe('should render action titlebar with missing style if have any issues', () => {
      it('should render if have issues', () => {
        const { wrapper } = setup(true, {
          issues: set([
            {
              type: 'missing_dependency',
              node_uuid: sendMsgNode.node.uuid,
              action_uuid: sendMsgAction.uuid,
              description: 'Missing dependency',
            },
          ]),
        });

        expect(shallowToJson(wrapper)).toMatchSnapshot();
      });
    });
  });
});
