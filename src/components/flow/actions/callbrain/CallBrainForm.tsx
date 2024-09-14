import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { react as bindCallbacks } from 'auto-bind';
import { ActionFormProps } from 'components/flow/props';
import { connect } from 'react-redux';

import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';

import styles from './CallBrainForm.module.scss';
import i18n from 'config/i18n';
import AppState from 'store/state';
import { updateBrainAction, initializeForm } from './helpers';
import { BrainInfo } from '../../../../store/flowContext';

import { applyVueInReact } from 'veaury';
// @ts-ignore
import Unnnic from '@weni/unnnic-system';
import TextInputElement, {
  TextInputSizes,
} from 'components/form/textinput/TextInputElement';
import { StringEntry } from 'store/nodeEditor';
const UnnnicIcon = applyVueInReact(Unnnic.unnnicIcon);

export interface CallBrainFormProps extends ActionFormProps {
  brainInfo: BrainInfo;
}

export interface CallBrainFormState {
  entry: StringEntry;
}

export interface CallBrainFormData
  extends CallBrainFormProps,
    CallBrainFormState {}

export class BrainForm extends React.Component<
  CallBrainFormProps,
  CallBrainFormState
> {
  constructor(props: CallBrainFormProps) {
    super(props);
    this.state = initializeForm(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^handle/, /^on/],
    });
  }
  private handleSave(): void {
    const brainData: CallBrainFormData = {
      ...this.props,
      entry: this.state.entry,
    };
    this.props.updateAction(
      updateBrainAction(this.props.nodeSettings, brainData),
    );
    this.props.onClose(false);
  }

  private getButtons(): ButtonSet {
    return {
      primary: {
        name: i18n.t('buttons.save'),
        onClick: () => this.handleSave(),
      },
      secondary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true),
      },
    };
  }

  private handleEntryChange(value: string) {
    this.setState({ entry: { value } });
  }

  private renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        className={styles.dialog}
      >
        <TypeList
          __className=""
          initialType={typeConfig}
          onChange={this.props.onTypeChange}
          nodeSettings={this.props.nodeSettings}
        />
        <div className={styles.content}>
          <UnnnicIcon
            icon="hub"
            size="sm"
            scheme={'neutral-cloudy'}
            className={styles.icon}
          />
          <span className={styles.text}>
            {this.props.brainInfo.name} - {this.props.brainInfo.occupation}
          </span>
        </div>
        <div className={styles.entry}>
          <span>
            {i18n.t(
              'forms.brain.entry',
              `Enter an expression to use as input in the Brain. To use the contact's last response, use @input.text.`,
            )}
          </span>
          <TextInputElement
            name={'entry'}
            onChange={this.handleEntryChange}
            entry={this.state.entry}
            size={TextInputSizes.sm}
            autocomplete
          />
        </div>
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}

/* istanbul ignore next -- @preserve */
const mapStateToProps = ({ flowContext: { brainInfo } }: AppState) => {
  return {
    brainInfo,
  };
};

export default connect(mapStateToProps)(BrainForm);
