import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import {
  nodeToState,
  stateToNode,
} from 'components/flow/routers/wenigpt/helpers';
import { createResultNameInput } from 'components/flow/routers/widgets';
import SelectElement from 'components/form/select/SelectElement';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { FormEntry, FormState, mergeForm, StringEntry } from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';

import styles from './WeniGPTRouterForm.module.scss';
import i18n from 'config/i18n';

export interface WeniGPTRouterFormState extends FormState {
  knowledgeBase: FormEntry;
  expression: StringEntry;
  resultName: StringEntry;
  knowledgeBases: any[];
}

export default class WeniGPTRouterForm extends React.Component<
  RouterFormProps,
  WeniGPTRouterFormState
> {
  constructor(props: RouterFormProps) {
    super(props);
    this.state = nodeToState(this.props.nodeSettings, this.props.assetStore);
    bindCallbacks(this, {
      include: [/^handle/],
    });
  }

  private handleUpdate(
    keys: {
      knowledgeBase?: any;
      expression?: string;
      resultName?: string;
    },
    submitting = false,
  ): boolean {
    const updates: Partial<WeniGPTRouterFormState> = {};

    if (keys.hasOwnProperty('knowledgeBase')) {
      updates.knowledgeBase = validate(
        i18n.t('forms.knowledge_base', 'Knowledge Base'),
        keys.knowledgeBase,
        [shouldRequireIf(submitting)],
      );
    }

    if (keys.hasOwnProperty('expression')) {
      updates.expression = validate(
        i18n.t('forms.expression', 'Expression'),
        keys.expression,
        [shouldRequireIf(submitting)],
      );
    }

    if (keys.hasOwnProperty('resultName')) {
      updates.resultName = validate(
        i18n.t('forms.result_name', 'Result Name'),
        keys.resultName,
        [shouldRequireIf(submitting)],
      );
    }

    const updated = mergeForm(this.state, updates);

    // update our form
    this.setState(updated);
    return updated.valid;
  }

  private handleUpdateResultName(value: string): boolean {
    return this.handleUpdate({ resultName: value });
  }

  private handleExpressionUpdate(expression: string): boolean {
    return this.handleUpdate({ expression });
  }

  private handleKnowledgeBaseUpdate(knowledgeBase: any): boolean {
    return this.handleUpdate({ knowledgeBase });
  }

  private handleRedirectClick(): void {
    window.parent.postMessage(
      { event: 'redirect', path: 'intelligences:init/force' },
      '*',
    );
  }

  private handleSave(): void {
    const valid = this.handleUpdate(
      {
        knowledgeBase: this.state.knowledgeBase.value,
        expression: this.state.expression.value,
        resultName: this.state.resultName.value,
      },
      true,
    );

    if (valid) {
      this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
      this.props.onClose(false);
    }
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: i18n.t('buttons.save'), onClick: this.handleSave },
      secondary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true),
      },
    };
  }

  private renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
      >
        <TypeList
          __className=""
          initialType={typeConfig}
          onChange={this.props.onTypeChange}
        />
        <div className={styles.content}>
          <div className={styles.knowledge_base}>
            <SelectElement
              key="knowledge_base_select"
              name={i18n.t('forms.knowledge_base', 'Knowledge Base')}
              placeholder={i18n.t(
                'forms.knowledge_base_placeholder',
                'Select a knowledge base',
              )}
              showLabel={true}
              entry={this.state.knowledgeBase}
              onChange={this.handleKnowledgeBaseUpdate}
              options={this.state.knowledgeBases}
              nameKey="label"
              valueKey="id"
            />

            <div className={styles.message}>
              <span>
                {i18n.t(
                  'forms.knowledge_base_message',
                  "Don't have any knowledge base for your AI yet?",
                )}
              </span>
              <span className={styles.link} onClick={this.handleRedirectClick}>
                {i18n.t('forms.knowledge_base_click', 'Click here')}
              </span>
            </div>
          </div>

          <TextInputElement
            name={i18n.t(
              'forms.expression_input',
              'Insert an expression to be used as input',
            )}
            showLabel={true}
            placeholder={i18n.t(
              'forms.expression_input_placeholder',
              'Ex: @input.text',
            )}
            entry={this.state.expression}
            onChange={this.handleExpressionUpdate}
            autocomplete={true}
            textarea={true}
          />
        </div>
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
