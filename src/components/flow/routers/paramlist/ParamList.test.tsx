import ParamList from 'components/flow/routers/paramlist/ParamList';
import React from 'react';
import { fireEvent, fireChangeText, render } from 'test/utils';
import { mock } from 'testUtils';
import * as utils from 'utils';

const serviceCalls = require('test/assets/external_services_calls.json');
const sampleParams = serviceCalls[0].params;

mock(utils, 'createUUID', utils.seededUUIDs());

const paramUUID1 = utils.createUUID();
const paramUUID2 = utils.createUUID();

const params = [
  {
    uuid: paramUUID1,
    type: serviceCalls[0].params[0].type,
    verboseName: serviceCalls[0].params[0].verboseName,
    filters: serviceCalls[0].params[0].filters,
    filter: { value: serviceCalls[0].params[0].filters[0] },
    data: { value: 'data 1' },
    valid: true
  },
  {
    uuid: paramUUID2,
    type: serviceCalls[0].params[1].type,
    verboseName: serviceCalls[0].params[1].verboseName,
    filters: serviceCalls[0].params[1].filters,
    filter: { value: serviceCalls[0].params[1].filters[0] },
    data: { value: 'data 2' },
    valid: true
  }
];

describe(ParamList.name, () => {
  describe('render', () => {
    it('should render list with an empty param', () => {
      const { baseElement } = render(
        <ParamList availableParams={sampleParams} params={[]} onParamsUpdated={jest.fn()} />
      );
      expect(baseElement).toMatchSnapshot();
    });
    it('should render list of params', () => {
      const { baseElement } = render(
        <ParamList availableParams={sampleParams} params={params} onParamsUpdated={jest.fn()} />
      );
      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should remove param and ensure empty param exists', () => {
      const { baseElement, getByTestId, queryByTestId } = render(
        <ParamList
          availableParams={sampleParams}
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

    it('should update params and call the callback', () => {
      const onParamsUpdated = jest.fn();
      const { baseElement, getByTestId } = render(
        <ParamList availableParams={sampleParams} params={[]} onParamsUpdated={onParamsUpdated} />
      );

      fireChangeText(getByTestId('Service Call Param Data'), 'data 1');

      expect(onParamsUpdated).toHaveBeenCalled();
      expect(baseElement).toMatchSnapshot();
    });
  });
});
