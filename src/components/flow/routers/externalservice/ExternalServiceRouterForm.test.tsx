import { mock } from 'testUtils';
import { createCallExternalServiceNode, getRouterFormProps } from 'testUtils/assetCreators';
import { Types } from 'config/interfaces';
import { RenderNode } from 'store/flowContext';
import ExternalServiceRouterForm from './ExternalServiceRouterForm';
import * as utils from 'utils';
import * as React from 'react';
import { render, fireEvent, fireChangeText } from 'test/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
const externalServiceForm = getRouterFormProps({
  node: createCallExternalServiceNode('omie'),
  ui: { type: Types.split_by_external_service }
} as RenderNode);

describe(ExternalServiceRouterForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { baseElement } = render(<ExternalServiceRouterForm {...externalServiceForm} />);
      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should save changes', () => {
      const { baseElement, getByText, getByTestId } = render(
        <ExternalServiceRouterForm {...externalServiceForm} />
      );
      expect(baseElement).toMatchSnapshot();

      const okButton = getByText('Ok');
      const resultName = getByTestId('Result Name');

      fireChangeText(resultName, '');
      fireEvent.click(okButton);
      expect(externalServiceForm.updateRouter).not.toBeCalled();

      fireChangeText(getByTestId('Service Call Param Data'), 'data 1');

      fireChangeText(resultName, 'My External Service Result');

      fireEvent.click(okButton);
      expect(externalServiceForm.updateRouter).toBeCalled();
      expect(externalServiceForm.updateRouter).toMatchCallSnapshot();
    });
  });
});
