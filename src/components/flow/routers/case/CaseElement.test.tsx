import CaseElement, { CaseElementProps } from 'components/flow/routers/case/CaseElement';
import { Operators } from 'config/interfaces';
import * as React from 'react';
import {
  fireEvent,
  render,
  fireTembaSelect,
  fireUnnnicSelect,
  fireUnnnicInputChangeText,
  getUnnnicInputValue
} from 'test/utils';
import { createUUID } from 'utils';

const caseUUID = createUUID();

const caseProps: CaseElementProps = {
  name: `case_${caseUUID}`,
  kase: {
    uuid: caseUUID,
    type: Operators.has_any_word,
    arguments: [''],
    category_uuid: createUUID()
  },
  categoryName: null,
  onRemove: jest.fn(),
  onChange: jest.fn()
};

const selectOperator = (getByTestId: any, operator: Operators) => {
  fireUnnnicSelect(getByTestId('temba_select_operator'), { value: [{ type: operator }] }, 'value');
};

describe(CaseElement.name, () => {
  describe('render', () => {
    it('should render empty case', () => {
      const { baseElement } = render(<CaseElement {...caseProps} />);
      expect(baseElement).toMatchSnapshot();
    });

    it('renders no argument rules', () => {
      const kase = {
        uuid: caseUUID,
        type: Operators.has_number,
        category_uuid: createUUID()
      };

      const { baseElement } = render(<CaseElement {...caseProps} kase={kase} />);
      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('operator changes', () => {
    // we need a full renders because we update our category reference
    it('should handle updates', () => {
      const { baseElement, getByTestId } = render(<CaseElement {...caseProps} />);

      selectOperator(getByTestId, Operators.has_phone);
      expect(baseElement).toMatchSnapshot();
    });

    it('should should set arguments for numeric range', () => {
      const { baseElement, getByTestId } = render(<CaseElement {...caseProps} />);
      selectOperator(getByTestId, Operators.has_number_between);
      expect(baseElement).toMatchSnapshot();
    });

    it('shouldnt update exit if it has been edited', () => {
      const { baseElement, queryByDisplayValue, getByTestId } = render(
        <CaseElement {...caseProps} />
      );

      // make us a has phone so we can look up our category by value
      selectOperator(getByTestId, Operators.has_phone);

      // update our category to a user supplied value
      const category = getByTestId('Exit Name');
      fireUnnnicInputChangeText(category, 'My Exit Name');

      // now swithc our type to force a category change
      selectOperator(getByTestId, Operators.has_number);

      // we shouldn't have updated our category
      expect(queryByDisplayValue('My Exit Name')).not.toBeNull();
      expect(queryByDisplayValue('Has Number')).toBeNull();
      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('update', () => {
    it('handles removes', () => {
      const onRemove = jest.fn();
      const { getByTestId } = render(<CaseElement {...caseProps} onRemove={onRemove} />);

      fireEvent.click(getByTestId(`remove-case-${caseProps.kase.uuid}`));
      expect(onRemove).toHaveBeenCalled();
    });

    it('handles argument change', () => {
      const onRemove = jest.fn();
      const { baseElement, getAllByTestId } = render(
        <CaseElement {...caseProps} onRemove={onRemove} />
      );
      const args = getAllByTestId('arguments');
      fireUnnnicInputChangeText(args[0], 'Purple, p');
      expect(getUnnnicInputValue(args[0])).toEqual('Purple, p');
      expect(baseElement).toMatchSnapshot();
    });

    it('handles multiple argument change', () => {
      const onRemove = jest.fn();
      const { baseElement, getByTestId, getAllByTestId } = render(
        <CaseElement {...caseProps} onRemove={onRemove} />
      );

      selectOperator(getByTestId, Operators.has_number_between);

      const args = getAllByTestId('arguments');

      fireUnnnicInputChangeText(args[0], '1');
      fireUnnnicInputChangeText(args[1], '100');
      expect(getUnnnicInputValue(args[0])).toEqual('1');
      expect(getUnnnicInputValue(args[1])).toEqual('100');
      expect(baseElement).toMatchSnapshot();
    });
  });
});
