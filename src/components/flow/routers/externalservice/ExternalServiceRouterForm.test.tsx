import { createCallExternalServiceNode, getRouterFormProps } from 'testUtils/assetCreators';
import { Types } from 'config/interfaces';
import { RenderNode } from 'store/flowContext';
import ExternalServiceRouterForm from './ExternalServiceRouterForm';
import * as React from 'react';
import { render, fireEvent, fireChangeText, fireTembaSelect } from 'test/utils';
import { act } from '@testing-library/react';
import { RouterFormProps } from '../../props';

const externalServiceAsset = require('test/assets/external_services.json');

describe(ExternalServiceRouterForm.name, () => {
  describe('ChatGPT', () => {
    let externalServiceForm: RouterFormProps;
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      externalServiceForm = getRouterFormProps({
        node: createCallExternalServiceNode(
          'chatgpt',
          externalServiceAsset.results[0].actions,
          externalServiceAsset.results[0].uuid,
          externalServiceAsset.results[0].actions[0]
        ),
        ui: { type: Types.split_by_external_service }
      } as RenderNode);
    });

    describe('render', () => {
      it('should render', async () => {
        externalServiceForm.assetStore.externalServices.items = {
          [externalServiceAsset.results[0].uuid]: {
            content: externalServiceAsset.results[0],
            name: externalServiceAsset.results[0].name,
            type: externalServiceAsset.results[0].external_service_type,
            id: externalServiceAsset.results[0].uuid
          },
          [externalServiceAsset.results[1].uuid]: {
            content: externalServiceAsset.results[1],
            name: externalServiceAsset.results[1].name,
            type: externalServiceAsset.results[1].external_service_type,
            id: externalServiceAsset.results[1].uuid
          }
        };
        let rendered: any;
        await act(async () => {
          rendered = render(<ExternalServiceRouterForm {...externalServiceForm} />);
          return undefined;
        });
        expect(rendered.baseElement).toMatchSnapshot();
      });
    });

    describe('updates', () => {
      it('should save changes', async () => {
        externalServiceForm.assetStore.externalServices.items = {
          [externalServiceAsset.results[0].uuid]: {
            content: externalServiceAsset.results[0],
            name: externalServiceAsset.results[0].name,
            type: externalServiceAsset.results[0].external_service_type,
            id: externalServiceAsset.results[0].uuid
          },
          [externalServiceAsset.results[1].uuid]: {
            content: externalServiceAsset.results[1],
            name: externalServiceAsset.results[1].name,
            type: externalServiceAsset.results[1].external_service_type,
            id: externalServiceAsset.results[1].uuid
          }
        };
        let rendered: any;

        await act(async () => {
          rendered = render(<ExternalServiceRouterForm {...externalServiceForm} />);
          return undefined;
        });

        await act(async () => {
          fireTembaSelect(rendered.getByTestId('temba_select_external_service'), [
            externalServiceAsset.results[0]
          ]);
        });

        expect(rendered.baseElement).toMatchSnapshot();

        const okButton = rendered.getByText('Ok');
        const resultName = rendered.getByTestId('Result Name');

        // since there are no mandatory fields, we can save the router right away
        fireEvent.click(okButton);
        expect(externalServiceForm.updateRouter).toBeCalledTimes(1);

        // cannot save without the result field filled
        fireChangeText(resultName, '');
        fireEvent.click(okButton);
        expect(externalServiceForm.updateRouter).toBeCalledTimes(1);

        fireChangeText(resultName, 'My External Service Result');

        await act(async () => {
          fireTembaSelect(rendered.getByTestId('temba_select_aditional_prompts'), [
            {
              text: 'Aditional Prompt 1 content',
              uuid: 'ab154b06-5ecd-43d9-afca-39738e6859d7'
            },
            {
              text: 'Aditional Prompt 2 content',
              uuid: 'ac154b06-5ecd-43d9-afca-39738e6859d7'
            }
          ]);
        });

        expect(rendered.baseElement).toMatchSnapshot();

        fireEvent.click(okButton);
        expect(externalServiceForm.updateRouter).toHaveBeenCalled();
        expect(externalServiceForm.updateRouter).toMatchCallSnapshot();
      });
    });
  });

  describe('Omie', () => {
    let externalServiceForm: RouterFormProps;
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      externalServiceForm = getRouterFormProps({
        node: createCallExternalServiceNode(
          'omie',
          externalServiceAsset.results[1].actions,
          externalServiceAsset.results[1].uuid,
          externalServiceAsset.results[1].actions[0]
        ),
        ui: { type: Types.split_by_external_service }
      } as RenderNode);
    });

    describe('render', () => {
      it('should render', async () => {
        let rendered: any;
        await act(async () => {
          rendered = render(<ExternalServiceRouterForm {...externalServiceForm} />);
          return undefined;
        });
        expect(rendered.baseElement).toMatchSnapshot();
      });
    });

    describe('updates', () => {
      it('should save changes', async () => {
        externalServiceForm.assetStore.externalServices.items = {
          [externalServiceAsset.results[0].uuid]: {
            content: externalServiceAsset.results[0],
            name: externalServiceAsset.results[0].name,
            type: externalServiceAsset.results[0].external_service_type,
            id: externalServiceAsset.results[0].uuid
          },
          [externalServiceAsset.results[1].uuid]: {
            content: externalServiceAsset.results[1],
            name: externalServiceAsset.results[1].name,
            type: externalServiceAsset.results[1].external_service_type,
            id: externalServiceAsset.results[1].uuid
          }
        };
        let rendered: any;

        await act(async () => {
          rendered = render(<ExternalServiceRouterForm {...externalServiceForm} />);
          return undefined;
        });

        await act(async () => {
          fireTembaSelect(rendered.getByTestId('temba_select_external_service'), [
            externalServiceAsset.results[1]
          ]);
        });

        expect(rendered.baseElement).toMatchSnapshot();

        const okButton = rendered.getByText('Ok');
        const resultName = rendered.getByTestId('Result Name');

        // since there mandatory fields, we cannot save the router right away
        fireChangeText(resultName, '');
        fireEvent.click(okButton);
        expect(externalServiceForm.updateRouter).not.toBeCalled();

        await act(async () => {
          fireTembaSelect(rendered.getByTestId('temba_select_external_service_call'), [
            {
              name: 'IncluirContato',
              value: 'IncluirContato',
              verboseName: 'Inserir Contato'
            }
          ]);
        });

        fireChangeText(resultName, 'My External Service Result');

        fireChangeText(rendered.getAllByTestId('Service Call Param Data')[0], 'data 1');

        fireEvent.click(okButton);
        // cannot be called due to missing second required field
        expect(externalServiceForm.updateRouter).not.toBeCalled();

        fireChangeText(rendered.getAllByTestId('Service Call Param Data')[1], 'data 2');

        fireEvent.click(okButton);
        expect(externalServiceForm.updateRouter).toHaveBeenCalled();
        expect(externalServiceForm.updateRouter).toMatchCallSnapshot();
      });
    });
  });
});
