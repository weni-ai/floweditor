import ParamList from 'components/flow/routers/paramlist/ParamList';
import { Operators } from 'config/interfaces';
import React from 'react';
import { fireEvent, fireTembaSelect, fireChangeText, render, waitForDomChange } from 'test/utils';
import { mock } from 'testUtils';
import * as utils from 'utils';
import { ServicesCalls } from '../externalservice/constants';

mock(utils, 'createUUID', utils.seededUUIDs());

const paramUUID1 = utils.createUUID();
const paramUUID2 = utils.createUUID();

const availableParams = ServicesCalls['omie'][0].params;

const params = [
  {
    uuid: paramUUID1,
    type: availableParams[0].type,
    verboseName: availableParams[0].verboseName,
    filters: availableParams[0].filters,
    filter: { value: availableParams[0].filters[0] },
    data: { value: 'data 1' },
    valid: true
  },
  {
    uuid: paramUUID2,
    type: availableParams[1].type,
    verboseName: availableParams[1].verboseName,
    filters: availableParams[1].filters,
    filter: { value: availableParams[1].filters[0] },
    data: { value: 'data 2' },
    valid: true
  }
];

describe(ParamList.name, () => {
  describe('render', () => {
    it('should render list with an empty param', () => {
      const { baseElement } = render(
        <ParamList availableParams={availableParams} params={[]} onParamsUpdated={jest.fn()} />
      );
      expect(baseElement).toMatchSnapshot();
    });
    it('should render list of params', () => {
      const { baseElement } = render(
        <ParamList availableParams={availableParams} params={params} onParamsUpdated={jest.fn()} />
      );
      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should remove param and ensure empty param exists', () => {
      const { baseElement, getByTestId, queryByTestId } = render(
        <ParamList
          availableParams={availableParams}
          params={[params[0]]}
          onParamsUpdated={jest.fn()}
        />
      );

      const removeParam = `remove-param-${params[0].uuid}`;
      fireEvent.click(getByTestId(removeParam));
      expect(baseElement).toMatchSnapshot();

      // our case should be gone
      expect(queryByTestId(removeParam)).toBeNull();
    });

    // TODO: test param select update, filter select update and data update
    it('should update params and call the callback', () => {
      const onParamsUpdated = jest.fn();
      const { baseElement, getByTestId } = render(
        <ParamList
          availableParams={availableParams}
          params={[]}
          onParamsUpdated={onParamsUpdated}
        />
      );

      fireChangeText(getByTestId('Service Call Param Data'), 'data 1');

      // twice because a new empty param has been created
      expect(onParamsUpdated).toHaveBeenCalledTimes(2);
      expect(baseElement).toMatchSnapshot();
    });

    // it('changes default operator on add', () => {
    //   const onCasesUpdated = jest.fn();

    //   // start with an empty list
    //   const { baseElement, getAllByTestId } = render(
    //     <CaseList cases={[]} onCasesUpdated={onCasesUpdated} />
    //   );

    //   // we should have one operator for the default
    //   expect(getAllByTestId('temba_select_operator').length).toBe(1);

    //   // switch default to greater than operator and populate it
    //   fireTembaSelect(getAllByTestId('temba_select_operator')[0], [
    //     { type: Operators.has_number_gt }
    //   ]);
    //   const argsInput = getAllByTestId('arguments')[0];
    //   fireEvent.change(argsInput, { target: { value: '42' } });

    //   // now we should have two rules
    //   expect(getAllByTestId('temba_select_operator').length).toBe(2);

    //   // our new default operator should match the last one we entered
    //   const newOperator = getAllByTestId('temba_select_operator')[1];
    //   expect(newOperator.getAttribute('values')).toBe(
    //     JSON.stringify([{ type: 'has_number_gt', verboseName: 'has a number above', operands: 1 }])
    //   );

    //   expect(baseElement).toMatchSnapshot();
    // });
  });
});
