import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { ActionFormProps } from 'components/flow/props';
import { connect } from 'react-redux';

import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';

import styles from './CallBrainForm.module.scss';
import i18n from 'config/i18n';
import AppState from 'store/state';
import { propsToAction } from './helpers';
import { BrainInfo } from '../../../../store/flowContext';

import { applyVueInReact } from 'vuereact-combined';
// @ts-ignore
import { unnnicIcon } from '@weni/unnnic-system';
const UnnnicIcon = applyVueInReact(unnnicIcon);

export interface CallBrainFormProps extends ActionFormProps {
  brainInfo: BrainInfo;
}

export class BrainForm extends React.Component<CallBrainFormProps> {
  private handleSave(): void {
    this.props.updateAction(propsToAction(this.props.nodeSettings, this.props));
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
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}

/* istanbul ignore next */
const mapStateToProps = ({ flowContext: { brainInfo } }: AppState) => {
  return {
    brainInfo,
  };
};

export default connect(mapStateToProps)(BrainForm);
