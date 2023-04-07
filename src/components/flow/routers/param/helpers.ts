import { ServiceCallParam, ParamFilter } from 'config/interfaces';

import { ParamElementProps, ParamElementState } from './ParamElement';
import { StringEntry } from 'store/nodeEditor';
import { Required, validate } from 'store/validators';
import i18n from 'config/i18n';

export const initializeForm = (props: ParamElementProps): ParamElementState => {
  const currentParam = props.initialParam.type ? props.initialParam : props.availableParams[0];

  const initialData = props.initialParam.data.value || '';
  const initialFilter = props.initialParam.filter ? props.initialParam.filter.value : null;

  return {
    errors: [],
    currentParam,
    currentFilter: initialFilter,
    data: { value: initialData },
    valid: true
  };
};

export const validateParam = (keys: {
  currentParam: ServiceCallParam;
  currentFilter: ParamFilter;
  data: StringEntry;
}) => {
  const updates: Partial<ParamElementState> = {};
  const validators =
    (keys.currentParam && keys.currentParam.required) ||
    (keys.currentFilter && keys.currentFilter.required)
      ? [Required]
      : [];

  updates.currentParam = keys.currentParam;
  updates.currentFilter = keys.currentFilter;

  updates.data = validate(i18n.t('forms.parameter', 'Parameter'), keys.data.value, validators);

  updates.valid = updates.data.validationFailures.length === 0;

  return updates;
};
