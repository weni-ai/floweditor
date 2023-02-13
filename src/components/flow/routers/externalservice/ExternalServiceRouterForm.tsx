import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors, renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import { nodeToState, stateToNode } from './helpers';
import { FormState, mergeForm, StringEntry, FormEntry } from 'store/nodeEditor';
import {
  Alphanumeric,
  Required,
  shouldRequireIf,
  StartIsNonNumeric,
  validate
} from 'store/validators';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import { Asset } from 'store/flowContext';
import * as React from 'react';
import i18n from 'config/i18n';
import TembaSelect from 'temba/TembaSelect';
import TypeList from 'components/nodeeditor/TypeList';
import { createResultNameInput } from 'components/flow/routers/widgets';
import ParamList from 'components/flow/routers/paramlist/ParamList';
import { ServiceCall } from 'config/interfaces';
import { ServicesCalls } from './constants';

export interface ExternalServiceRouterFormState extends FormState {
  externalService: FormEntry;
  call: FormEntry;
  resultName: StringEntry;
  calls: FormEntry;
  params: FormEntry;
}

export default class ExternalServiceRouterForm extends React.Component<
  RouterFormProps,
  ExternalServiceRouterFormState
> {
  constructor(props: RouterFormProps) {
    super(props);
    const externalServices = Object.values(this.props.assetStore.externalServices.items);
    const externalService = externalServices.length === 1 ? externalServices[0] : null;
    this.state = nodeToState(this.props.nodeSettings, externalService);

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }
  private handleUpdate(
    keys: {
      externalService?: Asset;
      call?: ServiceCall;
      resultName?: string;
      calls?: any[];
      params?: any[];
    },
    submitting = false
  ): boolean {
    const updates: Partial<ExternalServiceRouterFormState> = {};

    if (keys.hasOwnProperty('externalService')) {
      updates.externalService = validate(
        i18n.t('forms.externalService', 'External Service'),
        keys.externalService,
        [shouldRequireIf(submitting)]
      );
    }

    if (keys.hasOwnProperty('call')) {
      updates.call = validate(i18n.t('forms.call', 'Call'), keys.call, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('resultName')) {
      updates.resultName = validate(i18n.t('forms.result_name', 'Result Name'), keys.resultName, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('calls')) {
      updates.calls = validate(i18n.t('forms.calls', 'Calls'), keys.calls, [
        shouldRequireIf(submitting)
      ]);
    }

    // TODO: Improve paramter validation to check each field
    if (keys.hasOwnProperty('params')) {
      updates.params = validate(i18n.t('forms.params', 'Params'), keys.params, [
        shouldRequireIf(submitting)
      ]);
    }

    const updated = mergeForm(this.state, updates);

    this.setState(updated);
    return updated.valid;
  }

  private handleExternalServiceUpdate(selected: Asset[]): void {
    const newService = selected[0];
    this.handleUpdate({ externalService: newService, calls: ServicesCalls[newService.type] || [] });
  }

  private handleCallUpdate(call: ServiceCall): void {
    this.handleUpdate({ call });
  }

  private handleParamsUpdated(params: any[]): void {
    this.handleUpdate({ params });
  }

  private handleResultNameUpdate(value: string): void {
    const resultName = validate(i18n.t('forms.result_name', 'Result Name'), value, [
      Required,
      Alphanumeric,
      StartIsNonNumeric
    ]);
    this.setState({
      resultName,
      valid: this.state.valid && !hasErrors(resultName)
    });
  }

  private handleSave(): void {
    // remove the last param as it is an empty one
    this.state.params.value.pop();

    const valid = this.handleUpdate(
      {
        externalService: this.state.externalService.value,
        call: this.state.call.value,
        params: this.state.params.value,
        resultName: this.state.resultName.value
      },
      true
    );

    if (valid) {
      this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
      this.props.onClose(false);
    }
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: i18n.t('buttons.ok', 'ok'), onClick: this.handleSave },
      secondary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true)
      }
    };
  }

  private renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const showExternalServices =
      Object.keys(this.props.assetStore.externalServices.items).length > 0 ||
      this.props.issues.length > 0;

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        {showExternalServices ? (
          <div>
            <p>
              <span>Integration with... </span>
            </p>
            <AssetSelector
              key="select_external_service"
              name={i18n.t('forms.external_service', 'External Service')}
              placeholder="Select the external service to use"
              assets={this.props.assetStore.externalServices}
              onChange={this.handleExternalServiceUpdate}
              entry={this.state.externalService}
            />
          </div>
        ) : (
          ''
        )}
        <div>
          <p>
            <span>Action</span>
          </p>
          <TembaSelect
            key="select_external_service_call"
            name={i18n.t('forms.external_service_call', 'External Service Call')}
            placeholder="Select the call from external service to do"
            options={this.state.calls.value}
            nameKey="verboseName"
            onChange={this.handleCallUpdate}
            value={this.state.call.value}
            searchable={false}
          />
        </div>
        {this.state.call.value ? (
          <ParamList
            availableParams={this.state.call.value.params}
            params={this.state.params.value}
            onParamsUpdated={this.handleParamsUpdated}
          />
        ) : (
          <></>
        )}
        {createResultNameInput(this.state.resultName, this.handleResultNameUpdate)}
        {renderIssues(this.props)}
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
