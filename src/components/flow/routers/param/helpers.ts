import { ServiceCallParam, ParamFilter } from 'config/interfaces';

import { ParamElementProps, ParamElementState } from './ParamElement';
import { StringEntry } from 'store/nodeEditor';

export const initializeForm = (props: ParamElementProps): ParamElementState => {
  const currentParam = props.initialParam.type ? props.initialParam : props.availableParams[0];

  const initialData = props.initialParam.data.value || '';
  const initialFilter = props.initialParam.filter.value || null;
  const paramFilters = currentParam ? currentParam.filters : [];

  return {
    errors: [],
    currentParam,
    paramFilters,
    currentFilter: initialFilter,
    data: { value: initialData },
    valid: true
  };
};

export const validateParam = (keys: {
  currentParam: ServiceCallParam;
  currentFilter: ParamFilter;
  paramFilters: ParamFilter[];
  data: StringEntry;
}) => {
  const updates: Partial<ParamElementState> = {};

  updates.currentParam = keys.currentParam;
  updates.currentFilter = keys.currentFilter;
  updates.paramFilters = keys.paramFilters;
  updates.data = keys.data;

  return updates;
};
