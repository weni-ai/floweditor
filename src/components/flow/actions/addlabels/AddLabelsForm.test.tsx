import React from 'react';
import {
  fireEvent,
  render,
  getCallParams,
  getDomElement,
  act,
  waitFor,
} from 'test/utils';
import { mock } from 'testUtils';
import {
  createAddLabelsAction,
  createStartSessionAction,
  getActionFormProps,
} from 'testUtils/assetCreators';
import * as utils from 'utils';
import AddLabelsForm from './AddLabelsForm';
import userEvent from '@testing-library/user-event';
import { describe, vi, it, expect } from 'vitest';

mock(utils, 'createUUID', utils.seededUUIDs());
const props = getActionFormProps(
  createAddLabelsAction([{ name: 'My Label', uuid: utils.createUUID() }]),
);

describe(AddLabelsForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { baseElement } = render(<AddLabelsForm {...props} />);
      expect(baseElement).toMatchSnapshot();
    });

    it('allows expressions', async () => {
      const props = getActionFormProps(createStartSessionAction());
      const ref: React.RefObject<any> = React.createRef();
      const { baseElement, getByText, getByTestId } = render(
        <AddLabelsForm ref={ref} {...props} />,
      );

      const input = getDomElement(getByTestId('temba_select_labels'), 'input');

      await act(async () => {
        userEvent.type(input, '@contact.uuid');
      });

      const contactUuid = await waitFor(() => getByText('contact.uuid'));
      userEvent.click(contactUuid);

      expect(baseElement).toMatchSnapshot();

      // save our action
      fireEvent.click(getByText('Confirm'));
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchSnapshot();

      const [addLabelAction] = getCallParams(props.updateAction);
      expect(JSON.stringify(addLabelAction)).toMatch('name_match');
    });
  });
});
