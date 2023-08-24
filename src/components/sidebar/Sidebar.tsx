import ReactDOM from 'react-dom';
import { fakePropType } from 'config/ConfigProvider';
import { FlowPosition } from 'flowTypes';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderNode } from 'store/flowContext';
import { createEmptyNode } from 'store/helpers';
import AppState from 'store/state';
import {
  DispatchWithState,
  OnOpenNodeEditor,
  onOpenNodeEditor,
  mergeEditorState,
  MergeEditorState
} from 'store/thunks';

import i18n from 'config/i18n';
import { applyVueInReact } from 'vuereact-combined';
import styles from './Sidebar.module.scss';
// @ts-ignore
import { unnnicModalNext, unnnicIcon, unnnicToolTip } from '@weni/unnnic-system';
import GuidingSteps from 'components/guidingsteps/GuidingSteps';

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
  guidingStep: number;
  currentGuide: string;
  mergeEditorState: MergeEditorState;
}

export class Sidebar extends React.PureComponent<SidebarStoreProps, {}> {
  public static contextTypes = {
    config: fakePropType
  };

  private createSendMessageNode(): void {
    if (this.props.guidingStep === 0 && this.props.currentGuide === 'v2') {
      this.props.mergeEditorState({ guidingStep: 1 });
    }

    const emptyNode = createEmptyNode(null, null, 1, this.context.config.flowType);

    emptyNode.ui.position = this.getNewNodePosition();

    this.props.onOpenNodeEditor({
      originalNode: emptyNode,
      originalAction: emptyNode.node.actions[0]
    });
  }

  public componentDidMount(): void {
    if (Object.keys(this.props.nodes).length === 0) {
      // this.showGetStartedModal();
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
        <GuidingSteps
          guide="v2"
          step={0}
          title={i18n.t('guiding.v2.0.title', 'New block')}
          description={i18n.t(
            'guiding.v2.0.description',
            `Now just click on this button to create a new block\nsoon you will also be able to select the type of block you want to create`
          )}
          buttonText={i18n.t('guiding.v2.0.button', 'Got it 1/3')}
        >
          <UnnnicTooltip
            text={i18n.t('create_block')}
            enabled={this.props.guidingStep !== 0}
            side="right"
          >
            <div className={styles.option} onClick={() => this.createSendMessageNode()}>
              <UnnnicIcon icon="add-circle-1" />
            </div>
          </UnnnicTooltip>
        </GuidingSteps>

        <GuidingSteps
          guide="v2"
          step={1}
          title={i18n.t('guiding.v2.1.title', 'Copy and paste')}
          description={i18n.t(
            'guiding.v2.1.description',
            `Finally, you can copy and paste the blocks wherever you want, including in\nanother flow. Click the button or use the shortcut Ctrl C + Ctrl V`
          )}
          buttonText={i18n.t('guiding.v2.1.button', 'Got it 2/3')}
        >
          <UnnnicTooltip
            className={styles.left_aligned}
            text={this.getCopyTooltip()}
            enabled={this.props.guidingStep !== 1}
            side="right"
          >
            <div
              className={`${styles.option} ${!this.props.selectionActive ? styles.disabled : ''}`}
              onClick={() => this.handleCopyClick()}
            >
              <UnnnicIcon icon="paginate-filter-text-1" scheme={this.getCopyIconScheme()} />
            </div>
          </UnnnicTooltip>
        </GuidingSteps>
      </div>
    );
  }
}

/* istanbul ignore next */
const mapStateToProps = ({
  flowContext: { nodes },
  editorState: { selectionActive, guidingStep, currentGuide }
}: AppState) => {
  return {
    nodes,
    selectionActive,
    guidingStep,
    currentGuide
  };
};

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
  bindActionCreators({ onOpenNodeEditor, mergeEditorState }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
