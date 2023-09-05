/* eslint-disable @typescript-eslint/no-object-literal-type-assertion */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RouterFormProps } from 'components/flow/props';
import WebhookRouterForm from 'components/flow/routers/webhook/WebhookRouterForm';
import { Types } from 'config/interfaces';
import { RenderNode } from 'store/flowContext';
import { composeComponentTestUtils, mock } from 'testUtils';
import { createWebhookRouterNode, getRouterFormProps } from 'testUtils/assetCreators';
import * as utils from 'utils';
import * as React from 'react';
import {
  render,
  fireEvent,
  fireUnnnicInputChangeText,
  act,
  fireUnnnicTextAreaChangeText
} from 'test/utils';
import userEvent from '@testing-library/user-event';

mock(utils, 'createUUID', utils.seededUUIDs());

const webhookForm = getRouterFormProps({
  node: createWebhookRouterNode(),
  ui: { type: Types.call_webhook }
} as RenderNode);

const { setup } = composeComponentTestUtils<RouterFormProps>(WebhookRouterForm, webhookForm);

describe(WebhookRouterForm.name, () => {
  it('should render', () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });

  describe('updates', () => {
    it('should save changes', async () => {
      const { getByText, getByTestId, getAllByTestId } = render(
        <WebhookRouterForm {...webhookForm} />
      );

      const okButton = getByText('Confirm');

      // our url is required
      fireEvent.click(okButton);
      expect(webhookForm.updateRouter).not.toBeCalled();

      // set our url and name
      const url = getByTestId('URL');
      const resultName = getByTestId('Save as result');

      fireUnnnicInputChangeText(url, 'http://app.rapidpro.io');
      fireUnnnicInputChangeText(resultName, 'My Webhook Result');

      await act(async () => {
        userEvent.click(getByText('POST'));
      });

      // set a post body
      fireEvent.click(getByText('POST Body'));
      const postBody = getByTestId('POST Body');

      await act(async () => {
        fireUnnnicTextAreaChangeText(postBody, 'Updated post body');
      });

      // add http header
      fireEvent.click(getByText('HTTP Headers'));
      const headerName = getAllByTestId('Ex: Accept')[0];
      const headerValue = getAllByTestId('Ex: application/json')[0];

      fireEvent.change(headerName, 'Content-type');
      fireEvent.change(headerValue, 'application/json');

      fireEvent.click(okButton);
      expect(webhookForm.updateRouter).toBeCalled();
      expect(webhookForm.updateRouter).toMatchCallSnapshot();
    });

    it('should repopulate post body', () => {
      const { instance } = setup(true, {
        $merge: { onClose: jest.fn(), updateRouter: jest.fn() }
      });

      instance.handleMethodUpdate({ value: 'GET' });
      instance.handleUrlUpdate('http://domain.com/');
      expect(instance.state).toMatchSnapshot();

      instance.handleMethodUpdate('POST');
      expect(instance.state).toMatchSnapshot();
    });

    it('should cancel', () => {
      const { instance, props } = setup(true, {
        $merge: { onClose: jest.fn(), updateRouter: jest.fn() }
      });
      instance.getButtons().secondary.onClick();
      instance.handleUrlUpdate('http://domain.com/');
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateRouter).not.toHaveBeenCalled();
    });

    it('should validate urls', async () => {
      webhookForm.updateRouter = jest.fn();
      const { getByText, getByTestId } = render(<WebhookRouterForm {...webhookForm} />);

      // set our url and name
      const url = getByTestId('URL');
      const resultName = getByTestId('Save as result');

      fireUnnnicInputChangeText(url, 'bad url');
      fireUnnnicInputChangeText(resultName, 'My Webhook Result');

      // we need a valid url
      const okButton = getByText('Confirm');
      fireEvent.click(okButton);
      expect(webhookForm.updateRouter).not.toBeCalled();

      // but not if it has an expression
      await act(async () => {
        fireUnnnicInputChangeText(url, '@fields.valid_url');
      });
      fireEvent.click(okButton);
      expect(webhookForm.updateRouter).toBeCalled();
    });
  });
});
