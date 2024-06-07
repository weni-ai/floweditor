import * as React from 'react';
import { RouterFormProps } from 'components/flow/props';
import CodeActionRouterForm from './CodeActionRouterForm';
import {
  getRouterFormProps,
  createCodeActionRouterNode,
} from 'testUtils/assetCreators';
import { Types } from 'config/interfaces';
import { act, fireEvent } from '@testing-library/react';
import { RenderNode } from 'store/flowContext';
import { fireUnnnicInputChangeText, render } from 'test/utils';
import userEvent from '@testing-library/user-event';

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
        codeActionForm.assetStore.codeActions.items = codeActionAsset.reduce(
          (asset: any, item: any) => {
            asset[item.id] = item;
            return asset;
          },
          {},
        );
        let rendered: any;
        await act(async () => {
          rendered = render(<CodeActionRouterForm {...codeActionForm} />);
          return undefined;
        });
        expect(rendered.baseElement).toMatchSnapshot();
      });
    });

    describe('updates', () => {
      it('should save changes', async () => {
        codeActionForm.assetStore.codeActions.items = codeActionAsset.reduce(
          (asset: any, item: any) => {
            asset[item.id] = item;
            return asset;
          },
          {},
        );
        let rendered: any;

        await act(async () => {
          rendered = render(<CodeActionRouterForm {...codeActionForm} />);
          return undefined;
        });

        userEvent.click(rendered.getByText('save data to external db'));

        expect(rendered.baseElement).toMatchSnapshot();

        const okButton = rendered.getByText('Ok');
        const resultName = rendered.getByTestId('Save as result');

        fireEvent.click(okButton);
        expect(codeActionForm.updateRouter).toBeCalledTimes(1);

        fireUnnnicInputChangeText(resultName, '');
        fireEvent.click(okButton);
        expect(codeActionForm.updateRouter).toBeCalledTimes(2);

        fireUnnnicInputChangeText(resultName, 'My Code Action Result');

        expect(codeActionForm.updateRouter).toHaveBeenCalled();
        expect(codeActionForm.updateRouter).toMatchCallSnapshot();
      });
    });
  });
});
