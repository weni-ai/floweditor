import CaseList from 'components/flow/routers/caselist/CaseList';
import { Operators } from 'config/interfaces';
import React from 'react';
import {
  act,
  fireEvent,
  fireTembaSelect,
  fireUnnnicInputChangeText,
  fireUnnnicSelect,
  getUnnnicSelectValue,
  render,
  waitForDomChange
} from 'test/utils';
import { mock } from 'testUtils';
import * as utils from 'utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const caseUUID1 = utils.createUUID();
const caseUUID2 = utils.createUUID();

const cases = [
  {
    uuid: caseUUID1,
    kase: {
      uuid: caseUUID1,
      type: Operators.has_any_word,
      arguments: ['Red, r'],
      category_uuid: utils.createUUID()
    },
    categoryName: 'Red',
    valid: true
  },
  {
    uuid: caseUUID2,
    kase: {
      uuid: caseUUID2,
      type: Operators.has_any_word,
      arguments: ['Green, g'],
      category_uuid: utils.createUUID()
    },
    categoryName: 'Green',
    valid: true
  }
];

describe(CaseList.name, () => {
  describe('render', () => {
    it('should render empty list', () => {
      const { baseElement } = render(<CaseList cases={[]} onCasesUpdated={jest.fn()} />);
      expect(baseElement).toMatchSnapshot();
    });

    it('should render list of cases', () => {
      const { baseElement } = render(<CaseList cases={cases} onCasesUpdated={jest.fn()} />);
      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should remove cases', () => {
      const { baseElement, getByTestId, queryByTestId } = render(
        <CaseList cases={cases} onCasesUpdated={jest.fn()} />
      );

      const removeCase = `remove-case-${cases[0].uuid}`;
      fireEvent.click(getByTestId(removeCase));
      expect(baseElement).toMatchSnapshot();

      // our case should be gone
      expect(queryByTestId(removeCase)).toBeNull();
    });

    it('should update cases', async () => {
      const onCasesUpdated = jest.fn();
      const { baseElement, getAllByTestId } = render(
        <CaseList cases={cases} onCasesUpdated={onCasesUpdated} />
      );

      const argsInput = getAllByTestId('arguments')[0] as any;
      await act(async () => {
        fireUnnnicInputChangeText(argsInput, 'Purple, p');
      });

      expect(onCasesUpdated).toHaveBeenCalledTimes(5);
      expect(baseElement).toMatchSnapshot();
    });

    it('changes default operator on add', async () => {
      const onCasesUpdated = jest.fn();

      // start with an empty list
      const { baseElement, getAllByTestId } = render(
        <CaseList cases={[]} onCasesUpdated={onCasesUpdated} />
      );

      // we should have one operator for the default
      expect(getAllByTestId('temba_select_operator').length).toBe(1);

      // switch default to greater than operator and populate it
      fireUnnnicSelect(
        getAllByTestId('temba_select_operator')[0],
        { value: [{ type: Operators.has_number_gt }] },
        'value'
      );
      const argsInput = getAllByTestId('arguments')[0];
      await act(async () => {
        fireUnnnicInputChangeText(argsInput, '42');
      });

      // now we should have two rules
      expect(getAllByTestId('temba_select_operator').length).toBe(2);

      // our new default operator should match the last one we entered
      const newOperator = getAllByTestId('temba_select_operator')[1];
      expect(getUnnnicSelectValue(newOperator)).toBe('has_number_gt');

      expect(baseElement).toMatchSnapshot();
    });
  });
});
