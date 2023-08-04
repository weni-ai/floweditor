import { createCallExternalServiceNode, getRouterFormProps } from 'testUtils/assetCreators';
import { Types } from 'config/interfaces';
import { RenderNode } from 'store/flowContext';
import ExternalServiceRouterForm from './ExternalServiceRouterForm';
import * as React from 'react';
import {
  render,
  fireEvent,
  fireChangeText,
  fireTembaSelect,
  fireUnnnicInputChangeText,
  fireUnnnicSelect
} from 'test/utils';
import { act } from '@testing-library/react';

const externalServiceAsset = require('test/assets/external_services.json');

// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
const externalServiceForm = getRouterFormProps({
  node: createCallExternalServiceNode('omie'),
  ui: { type: Types.split_by_external_service }
} as RenderNode);

describe(ExternalServiceRouterForm.name, () => {
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
        [externalServiceAsset.results[0].uuid]: externalServiceAsset.results[0],
        [externalServiceAsset.results[1].uuid]: externalServiceAsset.results[1]
      };
      let rendered: any;

      await act(async () => {
        rendered = render(<ExternalServiceRouterForm {...externalServiceForm} />);
        return undefined;
      });

      expect(rendered.baseElement).toMatchSnapshot();

      const okButton = rendered.getByText('Ok');
      const resultName = rendered.getByTestId('Save as result');

      fireUnnnicInputChangeText(resultName, '');
      fireEvent.click(okButton);
      expect(externalServiceForm.updateRouter).not.toBeCalled();

      await act(async () => {
        fireUnnnicSelect(
          rendered.getByTestId('temba_select_external_service'),
          { value: [externalServiceAsset.results[1]] },
          'value'
        );
      });

      await act(async () => {
        fireUnnnicSelect(
          rendered.getByTestId('temba_select_external_service_call'),
          {
            value: [
              {
                name: 'IncluirContato',
                value: 'IncluirContato',
                verboseName: 'Inserir Contato'
              }
            ]
          },
          'value'
        );
      });

      await act(async () => {
        fireUnnnicInputChangeText(resultName, 'My External Service Result');
      });

      await act(async () => {
        fireUnnnicInputChangeText(rendered.getAllByTestId('Service Call Param Data')[0], 'data 1');
      });

      // cannot be called due to missing second required field
      expect(externalServiceForm.updateRouter).not.toBeCalled();

      await act(async () => {
        fireUnnnicInputChangeText(rendered.getAllByTestId('Service Call Param Data')[1], 'data 2');
      });

      fireEvent.click(okButton);
      expect(externalServiceForm.updateRouter).toHaveBeenCalled();
      expect(externalServiceForm.updateRouter).toMatchCallSnapshot();
    });
  });
});
