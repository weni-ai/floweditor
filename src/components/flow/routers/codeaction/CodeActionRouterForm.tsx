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
  validate,
} from 'store/validators';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import { Asset } from 'store/flowContext';
import * as React from 'react';
import i18n from 'config/i18n';
import TypeList from 'components/nodeeditor/TypeList';
import { createResultNameInput } from 'components/flow/routers/widgets';
import { fakePropType } from '../../../../config/ConfigProvider';

export interface CodeActionRouterFormState extends FormState {
  codeAction: FormEntry;
  resultName: StringEntry;
}

export default class CodeActionRouterForm extends React.Component<
  RouterFormProps,
  CodeActionRouterFormState
> {
  public static contextTypes = {
    config: fakePropType,
  };

  constructor(props: RouterFormProps) {
    super(props);

    const codeActions = Object.values(this.props.assetStore.codeActions.items);
    const codeAction = codeActions.length === 1 ? codeActions[0] : null;

    this.state = nodeToState(this.props.nodeSettings, codeAction);

    bindCallbacks(this, {
      include: [/^handle/],
    });
  }

  private handleUpdateResultName(result: string): void {
    const resultName = validate(
      i18n.t('forms.result_name', 'Result Name'),
      result,
      [Required, Alphanumeric, StartIsNonNumeric],
    );
    this.setState({
      resultName,
      valid: this.state.valid && !hasErrors(resultName),
    });
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: i18n.t('buttons.ok', 'ok'), onClick: this.handleSave },
      secondary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true),
      },
    };
  }

  private handleSave(): void {
    const valid = this.handleUpdate(
      {
        codeAction: this.state.codeAction.value,
        resultName: this.state.resultName.value,
      },
      true,
    );

    if (valid) {
      this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
      this.props.onClose(false);
    }
  }

  private async handleCodeActionUpdate(selected: any[]) {
    this.handleUpdate({ codeAction: selected[0] });
  }

  private handleUpdate(
    keys: {
      codeAction?: Asset;
      resultName?: string;
    },
    submitting = false,
    callback?: () => void,
  ): boolean {
    const updates: Partial<CodeActionRouterFormState> = {};

    if (keys.hasOwnProperty('codeAction')) {
      updates.codeAction = validate(
        i18n.t('forms.codeAction', 'Code Action'),
        keys.codeAction,
        [shouldRequireIf(submitting)],
      );
    }
    const updated = mergeForm(this.state, updates);

    this.setState(updated, callback);
    return updated.valid;
  }

  public renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;
    return (
      <Dialog title={typeConfig.name} buttons={this.getButtons()}>
        <TypeList
          __className=""
          initialType={typeConfig}
          onChange={this.props.onTypeChange}
        />
        <AssetSelector
          key="select_code_action"
          name={i18n.t('forms.codeAction', 'Code Action')}
          placeholder="Select Code Action to run in this step"
          showLabel={true}
          assets={this.props.assetStore.codeActions}
          onChange={this.handleCodeActionUpdate}
          entry={this.state.codeAction}
        />
        {createResultNameInput(
          this.state.resultName,
          this.handleUpdateResultName,
        )}
        {renderIssues(this.props)}
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
