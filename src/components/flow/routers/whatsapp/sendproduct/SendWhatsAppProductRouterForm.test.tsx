import { mock } from 'testUtils';
import { createSendWhatsAppProductNode, getRouterFormProps } from 'testUtils/assetCreators';
import { Types } from 'config/interfaces';
import { AssetMap, AssetType, RenderNode } from 'store/flowContext';
import SendWhatsAppProductRouterForm from './SendWhatsAppProductRouterForm';
import * as utils from 'utils';
import * as React from 'react';
import {
  render,
  fireEvent,
  fireUnnnicInputChangeText,
  wait,
  fireUnnnicTextAreaChangeText,
  fireUnnnicSwitch,
  act
} from 'test/utils';
import userEvent from '@testing-library/user-event';
import { WhatsAppProduct } from 'flowTypes';

mock(utils, 'createUUID', utils.seededUUIDs());

import whatsappProducts from 'test/assets/whatsapp_products.json';
import { resultToAsset } from '../../../../../external';

function getProps(automatic = false) {
  const productNode = createSendWhatsAppProductNode(
    {
      header: '',
      body: '',
      footer: '',
      action: ''
    },
    [],
    automatic,
    false,
    ''
  );

  // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
  const sendWhatsAppProductForm = getRouterFormProps({
    node: productNode,
    ui: { type: Types.split_by_whatsapp_product }
  } as RenderNode);

  const productsAssets: AssetMap = {};
  whatsappProducts.results.forEach((product: WhatsAppProduct) => {
    productsAssets[product.uuid] = resultToAsset(product, AssetType.WhatsAppProduct, 'uuid');
  });
  sendWhatsAppProductForm.assetStore.whatsapp_products = {
    type: AssetType.WhatsAppProduct,
    items: productsAssets,
    endpoint: '/assets/whatsapp_products.json'
  };

  return sendWhatsAppProductForm;
}

describe(SendWhatsAppProductRouterForm.name, () => {
  describe('manual product search', () => {
    it('should render', async () => {
      const props = getProps();
      const { baseElement } = render(<SendWhatsAppProductRouterForm {...props} />);

      await wait();

      expect(baseElement).toMatchSnapshot();
    });

    it('should change from manual to automatic', async () => {
      const props = getProps();
      const { baseElement, getByTestId } = render(<SendWhatsAppProductRouterForm {...props} />);

      await wait();

      expect(baseElement).toMatchSnapshot();

      const automaticSwitch = getByTestId('switch');
      fireUnnnicSwitch(automaticSwitch);

      await wait();

      expect(baseElement).toMatchSnapshot();
    });

    it('should save a manual product sending with header', async () => {
      const props = getProps();
      const { baseElement, getByText, getByTestId } = render(
        <SendWhatsAppProductRouterForm {...props} />
      );

      await wait();

      expect(baseElement).toMatchSnapshot();

      // open the view settings inputs
      userEvent.click(getByTestId('ViewSettings'));
      expect(baseElement).toMatchSnapshot();

      const okButton = getByText('Confirm');
      const resultName = getByTestId('Save as result');

      // our products, productViewSettings and result name are required
      await act(async () => {
        fireUnnnicInputChangeText(resultName, '');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      userEvent.click(getByText('Product 1'));
      userEvent.click(getByText('Product 3'));

      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      const header = getByTestId('Header');
      const body = getByTestId('Body');
      const footer = getByTestId('Footer (optional)');
      const action = getByTestId('Action button title');

      // still requires body and action
      await act(async () => {
        fireUnnnicInputChangeText(header, 'header text');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      // still requires action and result
      await act(async () => {
        fireUnnnicTextAreaChangeText(body, 'body text');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      // still requires action and result
      await act(async () => {
        fireUnnnicInputChangeText(footer, 'footer text');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      // still requires result
      await act(async () => {
        fireUnnnicInputChangeText(action, 'action text');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      await act(async () => {
        fireUnnnicInputChangeText(resultName, 'ResultName');
      });

      // now it should save
      fireEvent.click(okButton);

      await wait();

      expect(props.updateRouter).toBeCalled();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('should save a catalog sending', async () => {
      const props = getProps();
      const { baseElement, getByText, getByTestId } = render(
        <SendWhatsAppProductRouterForm {...props} />
      );

      await wait();

      expect(baseElement).toMatchSnapshot();

      // open the view settings inputs
      userEvent.click(getByTestId('ViewSettings'));
      expect(baseElement).toMatchSnapshot();

      const okButton = getByText('Confirm');
      const resultName = getByTestId('Save as result');

      userEvent.click(getByText('Send complete catalog'));

      // productViewSettings and result name are required
      await act(async () => {
        fireUnnnicInputChangeText(resultName, '');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      expect(baseElement).toMatchSnapshot();

      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      const body = getByTestId('Body');
      const footer = getByTestId('Footer (optional)');
      const action = getByTestId('Action button title');

      // still requires action and result
      await act(async () => {
        fireUnnnicTextAreaChangeText(body, 'body text');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      // still requires action and result
      await act(async () => {
        fireUnnnicInputChangeText(footer, 'footer text');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      // still requires result
      await act(async () => {
        fireUnnnicInputChangeText(action, 'action text');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      await act(async () => {
        fireUnnnicInputChangeText(resultName, 'ResultName');
      });

      // now it should save
      fireEvent.click(okButton);

      await wait();

      expect(props.updateRouter).toBeCalled();
      expect(props.updateRouter).toMatchCallSnapshot();
    });
  });

  describe('automatic product search', () => {
    it('should render', async () => {
      const props = getProps(true);
      const { baseElement } = render(<SendWhatsAppProductRouterForm {...props} />);

      await wait();

      expect(baseElement).toMatchSnapshot();
    });

    it('should save an automatic product sending', async () => {
      const props = getProps(true);
      const { baseElement, getByText, getByTestId } = render(
        <SendWhatsAppProductRouterForm {...props} />
      );

      await wait();

      expect(baseElement).toMatchSnapshot();

      // open the view settings inputs
      userEvent.click(getByTestId('ViewSettings'));
      expect(baseElement).toMatchSnapshot();

      const okButton = getByText('Confirm');
      const resultName = getByTestId('Save as result');

      // productSearch, productViewSettings and result name are required
      await act(async () => {
        fireUnnnicInputChangeText(resultName, '');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      const productSearch = getByTestId('Product Search');
      const header = getByTestId('Header');
      const body = getByTestId('Body');
      const footer = getByTestId('Footer (optional)');
      const action = getByTestId('Action button title');

      // still requires header, body and action
      await act(async () => {
        fireUnnnicInputChangeText(productSearch, '@results.result');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      // still requires body and action
      await act(async () => {
        fireUnnnicInputChangeText(header, 'header text');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      // still requires action and result
      await act(async () => {
        fireUnnnicTextAreaChangeText(body, 'body text');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      // still requires action and result
      await act(async () => {
        fireUnnnicInputChangeText(footer, 'footer text');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      // still requires result
      await act(async () => {
        fireUnnnicInputChangeText(action, 'action text');
      });
      fireEvent.click(okButton);
      expect(props.updateRouter).not.toBeCalled();

      await act(async () => {
        fireUnnnicInputChangeText(resultName, 'ResultName');
      });

      // now it should save
      fireEvent.click(okButton);

      await wait();

      expect(props.updateRouter).toBeCalled();
      expect(props.updateRouter).toMatchCallSnapshot();
    });
  });
});
