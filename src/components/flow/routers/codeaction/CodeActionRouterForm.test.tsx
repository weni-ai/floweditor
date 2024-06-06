import * as React from 'react';
import { RouterFormProps } from 'components/flow/props';
import CodeActionRouterForm from './CodeActionRouterForm';
import {
  getRouterFormProps,
  createCodeActionRouterNode,
} from 'testUtils/assetCreators';
import { Types } from 'config/interfaces';
import { act } from '@testing-library/react';
import { RenderNode } from 'store/flowContext';
import { render } from 'test/utils';

const codeActionAsset = require('test/assets/code_actions.json');

describe(CodeActionRouterForm.name, () => {
  describe('Code Action', () => {
    let codeActionForm: RouterFormProps;
    beforeEach(() => {
      codeActionForm = getRouterFormProps({
        node: createCodeActionRouterNode(
          'codeActionID',
          'CodeActionDummyLogic',
        ),
        ui: { type: Types.run_code_action },
      } as RenderNode);
    });

    describe('render', () => {
      it('should render', async () => {
        codeActionForm.assetStore.codeActions.items = {
          [codeActionAsset[0].id]: {
            ...codeActionAsset[0],
          },
          [codeActionAsset[1].id]: {
            ...codeActionAsset[1],
          },
        };
        let rendered: any;
        await act(async () => {
          rendered = render(<CodeActionRouterForm {...codeActionForm} />);
          return undefined;
        });
        expect(rendered.baseElement).toMatchSnapshot();
      });
    });
  });
});
