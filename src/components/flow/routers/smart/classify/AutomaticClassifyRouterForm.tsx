import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors, renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import CaseList, { CaseListType, CaseProps } from 'components/flow/routers/caselist/CaseList';
import { nodeToState, stateToNode } from 'components/flow/routers/smart/classify/helpers';
import { createResultNameInput } from 'components/flow/routers/widgets';
import TypeList from 'components/nodeeditor/TypeList';
import { FormState, StringEntry } from 'store/nodeEditor';
import { Alphanumeric, StartIsNonNumeric, validate, Required } from 'store/validators';
import styles from './AutomaticClassifyRouterForm.module.scss';
import i18n from 'config/i18n';
import TextInputElement from 'components/form/textinput/TextInputElement';

export const leadInSpecId = 'lead-in';

export interface AutomaticClassifyRouterFormState extends FormState {
  operand: StringEntry;
  cases: CaseProps[];
  hiddenCases: CaseProps[];
  resultName: StringEntry;
}

export default class AutomaticClassifyRouterForm extends React.Component<
  RouterFormProps,
  AutomaticClassifyRouterFormState
> {
  constructor(props: RouterFormProps) {
    super(props);

    this.state = nodeToState(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private handleUpdateResultName(value: string): void {
    const resultName = validate(i18n.t('forms.result_name', 'Result Name'), value, [
      Alphanumeric,
      StartIsNonNumeric
    ]);

    const invalidCase = !!this.state.cases.find((caseProps: CaseProps) => !caseProps.valid);
    this.setState({
      resultName,
      valid: !invalidCase && !hasErrors(resultName)
    });
  }

  private handleCasesUpdated(cases: CaseProps[]): void {
    const invalidCase = cases.find((caseProps: CaseProps) => !caseProps.valid);
    const nameErrors = hasErrors(this.state.resultName);
    this.setState({ cases, valid: !invalidCase && !nameErrors });
  }

  private handleSave(): void {
    if (this.state.valid) {
      this.props.updateRouter(
        stateToNode(this.props.nodeSettings, this.props.typeConfig, this.state)
      );
      this.props.onClose(false);
    }
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: i18n.t('buttons.confirm'), onClick: this.handleSave },
      secondary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true)
      }
    };
  }

  private handleOperandUpdated(value: string): void {
    this.setState({
      operand: validate(i18n.t('forms.operand', 'Operand'), value, [Required])
    });
  }

  public renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        new={typeConfig.new}
      >
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <div className={styles.input}>
          <div className={`${styles.label} u font secondary body-md color-neutral-cloudy`}>
            {i18n.t('forms.classifier_input_description')}
            <span className={`${styles.link} color-weni-600`}>{i18n.t(' @input.text')}</span>
          </div>
          <TextInputElement
            name={i18n.t('forms.operand', 'Operand')}
            placeholder={i18n.t('@input.text')}
            showLabel={false}
            autocomplete={true}
            onChange={this.handleOperandUpdated}
            entry={this.state.operand}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.phrases}>
            <div className={styles.header}>
              <span className={styles.title}>
                {i18n.t('forms.automatic_classify.words_title', 'Words')}
              </span>
              <span className={styles.description}>
                {i18n.t(
                  'forms.automatic_classify.words_description',
                  'Examples of words related to the category'
                )}
              </span>
            </div>
          </div>
          <div className={styles.categories}>
            <div className={styles.header}>
              <span className={styles.title}>
                {i18n.t('forms.automatic_classify.category_title', 'Categorize as')}
              </span>
              <span className={styles.description}>
                {i18n.t(
                  'forms.automatic_classify.category_description',
                  "Define the category you want to classify the contact's response"
                )}
              </span>
            </div>
          </div>
        </div>
        <CaseList
          data-spec="cases"
          cases={this.state.cases}
          onCasesUpdated={this.handleCasesUpdated}
          type={CaseListType.smart}
          required
        />
        {createResultNameInput(this.state.resultName, this.handleUpdateResultName)}
        {renderIssues(this.props)}
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
