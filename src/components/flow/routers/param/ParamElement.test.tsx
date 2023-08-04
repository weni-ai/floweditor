import ParamElement, { ParamElementProps } from 'components/flow/routers/param/ParamElement';
import * as React from 'react';
import {
  fireEvent,
  render,
  fireTembaSelect,
  fireChangeText,
  fireUnnnicInputChangeText,
  fireUnnnicSelect,
  getUnnnicSelectValue,
  act
} from 'test/utils';
import { createUUID } from 'utils';

const serviceCalls = require('test/assets/external_services_calls.json');
const availableParams = serviceCalls[0].params;

const paramUUID = createUUID();

const paramProps: ParamElementProps = {
  name: `param_${paramUUID}`,
  initialParam: {
    type: availableParams[0].type,
    verboseName: availableParams[0].verboseName,
    filters: availableParams[0].filters,
    uuid: paramUUID,
    filter: { value: availableParams[0].filters[0] },
    data: { value: '' },
    valid: true
  },
  availableParams,
  onRemove: jest.fn(),
  onChange: jest.fn()
};

describe(ParamElement.name, () => {
  describe('render', () => {
    it('should render param', () => {
      const { baseElement } = render(<ParamElement {...paramProps} />);
      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('update', () => {
    it('handles removes', () => {
      const onRemove = jest.fn();
      const { getByTestId } = render(<ParamElement {...paramProps} onRemove={onRemove} />);

      fireEvent.click(getByTestId(`remove-param-${paramProps.initialParam.uuid}`));
      expect(onRemove).toHaveBeenCalled();
    });

    it('handles data change', async () => {
      const { baseElement, getByTestId } = render(
        <ParamElement {...paramProps} onRemove={jest.fn()} />
      );
      await act(async () => {
        fireUnnnicInputChangeText(getByTestId('Service Call Param Data'), 'new data');
      });
      expect(baseElement).toMatchSnapshot();
    });

    it('handles filter change', async () => {
      const { baseElement, getByTestId } = render(
        <ParamElement {...paramProps} onRemove={jest.fn()} />
      );

      await act(async () => {
        fireUnnnicSelect(
          getByTestId('temba_select_service_call_param_filter'),
          {
            value: [
              {
                name: 'nCodConta',
                type: 'integer',
                verboseName: 'Código da Conta'
              }
            ]
          },
          'value'
        );
      });
      expect(baseElement).toMatchSnapshot();
    });

    it('handles param change', async () => {
      const { baseElement, getByTestId } = render(
        <ParamElement {...paramProps} onRemove={jest.fn()} />
      );

      await act(async () => {
        fireUnnnicSelect(
          getByTestId('temba_select_service_call_param'),
          { value: [availableParams[2]] },
          'value'
        );
      });
      expect(getUnnnicSelectValue(getByTestId('temba_select_service_call_param'))).toBe(
        availableParams[2].verboseName
      );
      expect(baseElement).toMatchSnapshot();
    });

    it('handles filter change from correct param after param change', async () => {
      const { baseElement, getByTestId } = render(
        <ParamElement {...paramProps} onRemove={jest.fn()} />
      );

      await act(async () => {
        fireUnnnicSelect(
          getByTestId('temba_select_service_call_param'),
          { value: [availableParams[2]] },
          'value'
        );
      });
      await act(async () => {
        fireUnnnicSelect(
          getByTestId('temba_select_service_call_param_filter'),
          { value: [availableParams[2].filters[2]] },
          'value'
        );
      });
      await act(async () => {
        fireUnnnicInputChangeText(getByTestId('Service Call Param Data'), 'new data');
      });
      expect(getUnnnicSelectValue(getByTestId('temba_select_service_call_param'))).toBe(
        availableParams[2].verboseName
      );
      expect(getUnnnicSelectValue(getByTestId('temba_select_service_call_param_filter'))).toBe(
        availableParams[2].filters[2].name
      );
      expect(baseElement).toMatchSnapshot();
    });
  });
});
