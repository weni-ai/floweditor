import ReactDOM from 'react-dom';
import { ConfigProviderContext, fakePropType } from 'config/ConfigProvider';
import { FlowPosition } from 'flowTypes';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderNode } from 'store/flowContext';
import { createEmptyNode } from 'store/helpers';
import AppState from 'store/state';
import { DispatchWithState, OnOpenNodeEditor, onOpenNodeEditor } from 'store/thunks';

import i18n from 'config/i18n';
import { applyVueInReact } from 'vuereact-combined';
import styles from './Sidebar.module.scss';
// @ts-ignore
import { unnnicModalNext, unnnicIcon, unnnicToolTip } from '@weni/unnnic-system';

const UnnnicIcon = applyVueInReact(unnnicIcon);
const UnnnicTooltip = applyVueInReact(unnnicToolTip);

const UnnnicModalNext = applyVueInReact(unnnicModalNext, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      style: {
        all: '',
        position: 'relative',
        zIndex: 10e2
      }
    }
  }
});

export interface SidebarStoreProps {
  onCopyClick: () => void;
  selectionActive: boolean;
  nodes: { [uuid: string]: RenderNode };
  onOpenNodeEditor: OnOpenNodeEditor;
}

export class Sidebar extends React.PureComponent<SidebarStoreProps, {}> {
  public static contextTypes = {
    config: fakePropType
  };

  private createSendMessageNode(): void {
    const emptyNode = createEmptyNode(null, null, 1, this.context.config.flowType);

    emptyNode.ui.position = this.getNewNodePosition();

    this.props.onOpenNodeEditor({
      originalNode: emptyNode,
      originalAction: emptyNode.node.actions[0]
    });
  }

  public componentDidMount(): void {
    if (Object.keys(this.props.nodes).length === 0) {
      this.showGetStartedModal();
    }
  }

  private getNewNodePosition(): FlowPosition {
    return {
      top: window.scrollY,
      left: window.scrollX
    };
  }

  private showGetStartedModal(): void {
    let getStartedModalEl: HTMLDivElement = document.querySelector('#get-started-modal');

    if (!getStartedModalEl) {
      getStartedModalEl = document.createElement('div');
      getStartedModalEl.setAttribute('id', 'get-started-modal');
      document.body.appendChild(getStartedModalEl);
    }

    if (getStartedModalEl.hasChildNodes()) {
      return;
    }

    ReactDOM.render(
      <UnnnicModalNext
        type="alert"
        scheme="feedback-yellow"
        title={i18n.t('empty_flow_message_title')}
        description={i18n.t('empty_flow_message_description')}
        actionPrimaryLabel={i18n.t('buttons.create_message')}
        actionPrimaryButtonType="secondary"
        on={{
          'click-action-primary': () => {
            this.createSendMessageNode();

            ReactDOM.unmountComponentAtNode(getStartedModalEl);
          },
          'click-action-secondary': () => {
            ReactDOM.unmountComponentAtNode(getStartedModalEl);
          }
        }}
        actionSecondaryLabel={i18n.t('buttons.later')}
      />,
      getStartedModalEl
    );
  }

  private getCopyTooltip(): string {
    if (!this.props.selectionActive) {
      return i18n.t('disabled_copy_tooltip');
    }

    return i18n.t('copy_tooltip');
  }

  private getCopyIconScheme(): string {
    if (!this.props.selectionActive) {
      return 'neutral-cleanest';
    }

    return 'neutral-cloudy';
  }

  private handleCopyClick(): void {
    if (!this.props.selectionActive) {
      return;
    }

    this.props.onCopyClick();
  }

  public render(): JSX.Element {
    return (
      <div className={styles.sidebar}>
        <UnnnicTooltip text={i18n.t('create_block')} enabled side="right">
          <div className={styles.option} onClick={() => this.createSendMessageNode()}>
            <UnnnicIcon icon="add-circle-1" />
          </div>
        </UnnnicTooltip>

        <UnnnicTooltip
          className={styles.left_aligned}
          text={this.getCopyTooltip()}
          enabled
          side="right"
        >
          <div
            className={`${styles.option} ${!this.props.selectionActive ? styles.disabled : ''}`}
            onClick={() => this.handleCopyClick()}
          >
            <UnnnicIcon icon="paginate-filter-text-1" scheme={this.getCopyIconScheme()} />
          </div>
        </UnnnicTooltip>
      </div>
    );
  }
}

/* istanbul ignore next */
const mapStateToProps = ({
  flowContext: { nodes },
  editorState: { selectionActive }
}: AppState) => {
  return {
    nodes,
    selectionActive
  };
};

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
  bindActionCreators({ onOpenNodeEditor }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
