import { react as bindCallbacks } from 'auto-bind';
import FormElement from 'components/form/FormElement';
import TextInputElement from 'components/form/textinput/TextInputElement';
import { ServiceCallParam, ParamFilter } from 'config/interfaces';
import * as React from 'react';
import { FormState, StringEntry } from 'store/nodeEditor';

import styles from './ParamElement.module.scss';
import { initializeForm, validateParam } from './helpers';
import i18n from 'config/i18n';
import TembaSelect, { TembaSelectStyle } from 'temba/TembaSelect';
import { ParamProps } from '../paramlist/ParamList';
import { applyVueInReact } from 'vuereact-combined';

// @ts-ignore
import { unnnicIcon } from '@weni/unnnic-system';

const UnnnicIcon = applyVueInReact(unnnicIcon, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      'data-draggable': 'true',
      style: {
        all: ''
      }
    },

    slotWrapAttrs: {
      'data-draggable': 'true',
      style: {
        all: ''
      }
    }
  }
});

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

  public componentDidMount() {
    const updates = validateParam({
      currentParam: this.state.currentParam,
      currentFilter: this.state.currentFilter,
      data: this.state.data
    });
    this.setState(updates as ParamElementState, () => this.handleChange());
  }

  private handleParamChange(newParam: ServiceCallParam): void {
    const updates = validateParam({
      currentParam: newParam,
      currentFilter: newParam.filters && newParam.filters.length >= 1 ? newParam.filters[0] : null,
      data: this.state.data
    });
    this.setState(updates as ParamElementState, () => this.handleChange());
  }

  private handleFilterChange(newFilter: ParamFilter): void {
    const updates = validateParam({
      currentParam: this.state.currentParam,
      currentFilter: newFilter,
      data: this.state.data
    });
    this.setState(updates as ParamElementState, () => this.handleChange());
  }

  private handleDataChange(newData: string): void {
    const updates = validateParam({
      currentParam: this.state.currentParam,
      currentFilter: this.state.currentFilter,
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
      required: this.state.currentParam.required,
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
    const disableParam = this.state.currentParam && this.state.currentParam.required ? true : null;
    const disableFilter =
      this.state.currentFilter && this.state.currentFilter.required ? true : null;
    const canArrange = !disableParam && !disableFilter;

    const showFilter =
      this.state.currentParam &&
      this.state.currentParam.filters &&
      this.state.currentParam.filters.length;

    const rawParam = this.props.availableParams.find(
      param => param.type === this.state.currentParam.type
    );
    let paramFilters = rawParam ? rawParam.filters : [];
    paramFilters = this.state.currentFilter
      ? [this.state.currentFilter].concat(paramFilters)
      : paramFilters;
    const paramOptions =
      this.state.currentParam &&
      !this.props.availableParams.find(p => p.type === this.state.currentParam.type)
        ? [this.state.currentParam].concat(this.props.availableParams)
        : this.props.availableParams;

    return (
      <FormElement
        data-spec="param-form"
        name={this.props.name}
        __className={styles.group}
        kaseError={this.state.errors.length > 0}
      >
        <div className={`${styles.param}`} data-draggable={canArrange}>
          <UnnnicIcon
            className={styles.move_icon}
            icon="move-expand-vertical-1"
            size="sm"
            scheme={canArrange ? 'neutral-cloudy' : 'neutral-clean'}
            data-draggable={canArrange}
          />

          <div
            className={`${styles.choice} ${disableFilter ? styles.disabled : ''}`}
            style={{ flex: showFilter ? 1 : 2 }}
          >
            <TembaSelect
              name={i18n.t('forms.service_call_param', 'Service Call Param')}
              placeholder={i18n.t('forms.param', 'Param')}
              style={TembaSelectStyle.small}
              options={paramOptions}
              nameKey="verboseName"
              valueKey="name"
              disabled={disableParam || disableFilter}
              onChange={this.handleParamChange}
              value={this.state.currentParam}
            />
          </div>
          {showFilter ? (
            <div className={`${styles.choice} ${disableFilter ? styles.disabled : ''}`}>
              <TembaSelect
                name={i18n.t('forms.service_call_param_filter', 'Service Call Param Filter')}
                placeholder={i18n.t('forms.filter', 'Filter')}
                style={TembaSelectStyle.small}
                options={paramFilters}
                nameKey="verboseName"
                valueKey="name"
                onChange={this.handleFilterChange}
                value={this.state.currentFilter}
                disabled={disableFilter}
              />
            </div>
          ) : (
            <></>
          )}
          <div className={styles.data}>
            <TextInputElement
              name={i18n.t('forms.service_call_param_data', 'Service Call Param Data')}
              onChange={this.handleDataChange}
              entry={this.state.data}
              autocomplete={true}
            />
          </div>
          <UnnnicIcon
            className={styles.remove_icon}
            data-testid={'remove-param-' + this.props.initialParam.uuid}
            icon="delete-1-1"
            size="sm"
            scheme={!disableParam && !disableFilter ? 'neutral-cloudy' : 'neutral-clean'}
            onClick={!disableParam && !disableFilter ? this.handleRemoveClicked : () => {}}
            clickable
          />
        </div>
      </FormElement>
    );
  }
}
