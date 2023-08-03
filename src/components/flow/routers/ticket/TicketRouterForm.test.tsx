import { mock } from 'testUtils';
import { createOpenTicketNode, getRouterFormProps } from 'testUtils/assetCreators';
import { Types } from 'config/interfaces';
import { RenderNode } from 'store/flowContext';
import TicketRouterForm from './TicketRouterForm';
import * as utils from 'utils';
import * as React from 'react';
import {
  render,
  fireEvent,
  fireUnnnicInputChangeText,
  fireUnnnicSelect,
  fireUnnnicAutocompleteSelect,
  act
} from 'test/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
const ticketForm = getRouterFormProps({
  node: createOpenTicketNode('Need help', 'Where are my cookies'),
  ui: { type: Types.split_by_ticket }
} as RenderNode);

describe(TicketRouterForm.name, () => {
  describe('render', () => {
    it('should render', async () => {
      let rendered: any;
      await act(async () => {
        rendered = render(<TicketRouterForm {...ticketForm} />);
      });
      expect(rendered.baseElement).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should save changes', async () => {
      let rendered: any;
      await act(async () => {
        rendered = render(<TicketRouterForm {...ticketForm} />);
      });

      expect(rendered.baseElement).toMatchSnapshot();

      const okButton = rendered.getByText('Ok');
      const resultName = rendered.getByTestId('Save as result');

      // our ticketer, body and result name are required
      fireUnnnicInputChangeText(resultName, '');
      fireEvent.click(okButton);
      expect(ticketForm.updateRouter).not.toBeCalled();

      fireUnnnicSelect(
        rendered.getByTestId('temba_select_assignee'),
        {
          email: 'agent.user@gmail.com',
          first_name: 'Agent',
          last_name: 'User',
          role: 'agent',
          created_on: '2021-06-10T21:44:30.971221Z'
        },
        'email'
      );

      // we need a topic
      fireUnnnicAutocompleteSelect(
        rendered.getByTestId('temba_select_topic'),
        {
          name: 'General',
          uuid: '6f38eba0-d673-4a35-82df-21bae2b6d466'
        },
        'name'
      );

      fireUnnnicInputChangeText(resultName, 'My Ticket Result');

      fireEvent.click(okButton);
      expect(ticketForm.updateRouter).toBeCalled();
      expect(ticketForm.updateRouter).toMatchCallSnapshot();
    });
  });
});
