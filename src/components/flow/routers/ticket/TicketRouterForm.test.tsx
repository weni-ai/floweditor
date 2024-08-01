import { mock } from 'testUtils';
import {
  createOpenTicketNode,
  getRouterFormProps,
} from 'testUtils/assetCreators';
import { Types } from 'config/interfaces';
import { AssetType, RenderNode } from 'store/flowContext';
import TicketRouterForm from './TicketRouterForm';
import * as utils from 'utils';
import * as React from 'react';
import {
  render,
  fireEvent,
  fireUnnnicInputChangeText,
  waitFor,
  act,
} from 'test/utils';
import userEvent from '@testing-library/user-event';
import { Ticketer } from '../../../../flowTypes';

mock(utils, 'createUUID', utils.seededUUIDs());

const ticketNode = createOpenTicketNode('Need help', 'Where are my cookies');
const ticketForm = getRouterFormProps({
  node: ticketNode,
  ui: { type: Types.split_by_ticket },
} as RenderNode);

const ticketer: Ticketer = (ticketNode.actions[0] as any).ticketer;
ticketForm.assetStore.ticketers = {
  type: AssetType.Ticketer,
  items: { [ticketer.uuid]: ticketer } as any,
  endpoint: '/assets/ticketers.json',
};

describe(TicketRouterForm.name, () => {
  describe('render', () => {
    it('should render', async () => {
      const { baseElement } = render(<TicketRouterForm {...ticketForm} />);

      await waitFor(() => expect(baseElement).toMatchSnapshot());
    });
  });

  describe('updates', () => {
    it('should save changes', async () => {
      const { baseElement, getByText, getByTestId } = render(
        <TicketRouterForm {...ticketForm} />,
      );

      await waitFor(() => expect(baseElement).toMatchSnapshot());

      const okButton = getByText('Ok');
      const resultName = getByTestId('Save as result');

      // our ticketer, body and result name are required
      await act(async () => {
        fireUnnnicInputChangeText(resultName, '');
      });
      fireEvent.click(okButton);
      expect(ticketForm.updateRouter).not.toBeCalled();

      userEvent.click(getByText('Agent User'));

      // we need a topic
      userEvent.click(getByText('General'));

      await act(async () => {
        fireUnnnicInputChangeText(resultName, 'My Ticket Result');
      });

      fireEvent.click(okButton);

      await waitFor(() => expect(ticketForm.updateRouter).toBeCalled());

      expect(ticketForm.updateRouter).toMatchSnapshot();
    });
  });
});
