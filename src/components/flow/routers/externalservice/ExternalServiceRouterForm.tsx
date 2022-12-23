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
import styles from './ExternalServiceRouterForm.module.scss';
import * as React from 'react';
import { fakePropType } from 'config/ConfigProvider';
import i18n from 'config/i18n';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { createResultNameInput } from 'components/flow/routers/widgets';

export interface ExternalServiceRouterFormState extends FormState {
  externalService: FormEntry;
  call: FormEntry;
  body: StringEntry;
  resultName: StringEntry;
}

export default class ExternalServiceRouterForm extends React.Component<
  RouterFormProps,
  ExternalServiceRouterFormState
> {
  public static ContextTypes = {
    config: fakePropType
  };

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
      call?: Asset;
      body?: string;
      resultName?: string;
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

    if (keys.hasOwnProperty('body')) {
      updates.body = validate(i18n.t('forms.body', 'Body'), keys.body, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('resultName')) {
      updates.resultName = validate(i18n.t('forms.result_name', 'Result Name'), keys.resultName, [
        shouldRequireIf(submitting)
      ]);
    }

    const updated = mergeForm(this.state, updates);

    this.setState(updated);
    return updated.valid;
  }

  private handleExternalServiceUpdate(selected: Asset[]): void {
    this.handleUpdate({ externalService: selected[0] });
  }

  private handleBodyUpdate(body: string): boolean {
    return this.handleUpdate({ body });
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
    const valid = this.handleUpdate(
      {
        externalService: this.state.externalService.value,
        call: this.state.call.value,
        body: this.state.body.value,
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
      Object.keys(this.props.assetStore.externalServices.items).length > 1 ||
      this.props.issues.length > 0;

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        {showExternalServices ? (
          <div>
            <p>
              <span>Call External Service via... </span>
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
        <div className={styles.body}>
          <TextInputElement
            name={i18n.t('forms.body', 'Body')}
            placeholder={i18n.t('forms.enter_a_body', 'Enter a body')}
            entry={this.state.body}
            onChange={this.handleBodyUpdate}
            autocomplete={true}
            textarea={true}
          />
        </div>
        {createResultNameInput(this.state.resultName, this.handleResultNameUpdate)}
        {renderIssues(this.props)}
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
