import ParamElement, { ParamElementProps } from 'components/flow/routers/param/ParamElement';
import * as React from 'react';
import { fireEvent, render, fireTembaSelect, fireChangeText } from 'test/utils';
import { createUUID } from 'utils';
import { ServicesCalls } from '../externalservice/constants';

const availableParams = ServicesCalls['omie'][0].params;

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

    it('handles data change', () => {
      const { baseElement, getByTestId } = render(
        <ParamElement {...paramProps} onRemove={jest.fn()} />
      );

      fireChangeText(getByTestId('Service Call Param Data'), 'new data');
      expect(baseElement).toMatchSnapshot();
    });

    it('handles filter change', () => {
      const { baseElement, getByTestId } = render(
        <ParamElement {...paramProps} onRemove={jest.fn()} />
      );

      fireTembaSelect(getByTestId('temba_select_service_call_param_filter'), [
        {
          name: 'cCodInt',
          type: 'text',
          verboseName: 'Código de Integração'
        }
      ]);
      expect(baseElement).toMatchSnapshot();
    });

    it('handles param change', () => {
      const { baseElement, getByTestId } = render(
        <ParamElement {...paramProps} onRemove={jest.fn()} />
      );

      fireTembaSelect(getByTestId('temba_select_service_call_param'), [availableParams[2]]);
      expect(baseElement).toMatchSnapshot();
    });

    it('handles filter change from correct param after param change', () => {
      const { baseElement, getByTestId } = render(
        <ParamElement {...paramProps} onRemove={jest.fn()} />
      );

      fireTembaSelect(getByTestId('temba_select_service_call_param'), [availableParams[2]]);
      fireTembaSelect(getByTestId('temba_select_service_call_param_filter'), [
        availableParams[2].filters[2]
      ]);
      fireChangeText(getByTestId('Service Call Param Data'), 'new data');
      expect(baseElement).toMatchSnapshot();
    });
  });
});
