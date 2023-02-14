import { react as bindCallbacks } from 'auto-bind';
import FormElement from 'components/form/FormElement';
import TextInputElement, { TextInputStyle } from 'components/form/textinput/TextInputElement';
import { ServiceCallParam, ParamFilter } from 'config/interfaces';
import * as React from 'react';
import { FormState, StringEntry } from 'store/nodeEditor';

import styles from './ParamElement.module.scss';
import { initializeForm, validateParam } from './helpers';
import i18n from 'config/i18n';
import TembaSelect, { TembaSelectStyle } from 'temba/TembaSelect';
import { ParamProps } from '../paramlist/ParamList';

export interface ParamElementProps {
  initialParam: ParamProps;
  availableParams: ServiceCallParam[];
  name?: string; // satisfy form widget props
  onRemove?(uuid: string): void;
  onChange?(p: ParamProps): void;
}

export interface ParamElementState extends FormState {
  errors: string[];
  currentParam: ServiceCallParam;
  currentFilter: ParamFilter;
  paramFilters: ParamFilter[];
  data: StringEntry;
}

export default class ParamElement extends React.Component<ParamElementProps, ParamElementState> {
  constructor(props: ParamElementProps) {
    super(props);

    bindCallbacks(this, {
      include: [/^handle/]
    });

    this.state = initializeForm(props);
  }

  private handleParamChange(newParam: ServiceCallParam): void {
    const updates = validateParam({
      currentParam: newParam,
      currentFilter: newParam.filters && newParam.filters.length >= 1 ? newParam.filters[0] : null,
      paramFilters: newParam.filters,
      data: this.state.data
    });
    this.setState(updates as ParamElementState, () => this.handleChange());
  }

  private handleFilterChange(newFilter: ParamFilter): void {
    const updates = validateParam({
      currentParam: this.state.currentParam,
      currentFilter: newFilter,
      paramFilters: this.state.paramFilters,
      data: this.state.data
    });
    this.setState(updates as ParamElementState, () => this.handleChange());
  }

  private handleDataChange(newData: string): void {
    const updates = validateParam({
      currentParam: this.state.currentParam,
      currentFilter: this.state.currentFilter,
      paramFilters: this.state.paramFilters,
      data: { value: newData }
    });
    this.setState(updates as ParamElementState, () => this.handleChange());
  }

  private handleRemoveClicked(): void {
    this.props.onRemove(this.props.initialParam.uuid);
  }

  private getParamProps(): ParamProps {
    const props: ParamProps = {
      uuid: this.props.initialParam.uuid,
      type: this.state.currentParam.type,
      verboseName: this.state.currentParam.verboseName,
      filters: this.state.currentParam.filters,
      filter: { value: this.state.currentFilter },
      data: this.state.data,
      valid: this.state.valid
    };
    return props;
  }

  private handleChange(): void {
    this.props.onChange(this.getParamProps());
  }

  public render(): JSX.Element {
    return (
      <FormElement
        data-spec="param-form"
        name={this.props.name}
        __className={styles.group}
        kaseError={this.state.errors.length > 0}
      >
        <div className={`${styles.param}`} data-draggable={true}>
          <span className={`fe-chevrons-expand ${styles.dnd_icon}`} data-draggable={true} />
          <div className={styles.choice}>
            <TembaSelect
              name={i18n.t('forms.service_call_param', 'Service Call Param')}
              placeholder={i18n.t('forms.param', 'param')}
              style={TembaSelectStyle.small}
              options={this.props.availableParams}
              nameKey="verboseName"
              valueKey="name"
              onChange={this.handleParamChange}
              value={this.state.currentParam}
            />
          </div>
          <div className={styles.choice}>
            <TembaSelect
              name={i18n.t('forms.service_call_param_filter', 'Service Call Param Filter')}
              placeholder={i18n.t('forms.filter', 'filter')}
              style={TembaSelectStyle.small}
              options={this.state.paramFilters}
              nameKey="verboseName"
              valueKey="name"
              onChange={this.handleFilterChange}
              value={this.state.currentFilter}
              disabled={
                this.state.currentParam && this.state.currentParam.filters.length === 0
                  ? true
                  : null
              }
            />
          </div>
          <div className={styles.data}>
            <TextInputElement
              name={i18n.t('forms.service_call_param_data', 'Service Call Param Data')}
              style={TextInputStyle.small}
              onChange={this.handleDataChange}
              entry={this.state.data}
              maxLength={36}
            />
          </div>
          <span
            data-testid={'remove-param-' + this.props.initialParam.uuid}
            className={`fe-x ${styles.remove_icon}`}
            onClick={this.handleRemoveClicked}
          />
        </div>
      </FormElement>
    );
  }
}
