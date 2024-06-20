import * as React from 'react';
import { render } from 'test/utils';

import { ActionWrapper, ActionWrapperProps } from './Action';
import {
  createExit,
  createSendMsgAction,
  English,
  createRenderNode,
  Spanish,
} from 'testUtils/assetCreators';
import { AnyAction } from 'flowTypes';
import { getTypeConfig } from 'config';
import { Asset } from 'store/flowContext';
import { MouseState } from 'store/editor';

const sendMsgAction = createSendMsgAction();
const localization = {
  spa: {
    [sendMsgAction.uuid]: {
      text: ['¡Hola!'],
      quick_replies: ['Sí'],
    },
  },
};

const getActionWrapperProps = (
  action: AnyAction,
  translateTo?: Asset,
): ActionWrapperProps => {
  const node = createRenderNode({
    actions: [action],
    exits: [createExit()],
  });

  const translating = !!translateTo;
  const language = translateTo || English;

  const actionConfig = getTypeConfig(action.type);

  const { component: ActionDiv } = actionConfig;

  if (actionConfig.massageForDisplay) {
    actionConfig.massageForDisplay(action);
  }

  return {
    scrollToAction: null,
    issues: [],
    selected: false,
    localization,
    first: true,
    action: sendMsgAction,
    render: (action: AnyAction) => (
      <ActionDiv {...action} languages={[English, Spanish]} />
    ),
    renderNode: node,
    language,
    translating,
    onOpenNodeEditor: vi.fn(),
    removeAction: vi.fn(),
    moveActionUp: vi.fn(),
    mouseState: MouseState.SELECT,
  };
};

describe('ActionWrapper', () => {
  it('renders a base language', () => {
    const { baseElement } = render(
      <ActionWrapper {...getActionWrapperProps(sendMsgAction)} />,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('can have localized quick replies when empty on default language', () => {
    const { baseElement, getByText } = render(
      <ActionWrapper {...getActionWrapperProps(sendMsgAction, Spanish)} />,
    );
    expect(baseElement).toMatchSnapshot();

    // our quick reply should be there
    getByText('Sí');
  });
});
