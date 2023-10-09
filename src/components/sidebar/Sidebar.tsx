import ReactDOM from 'react-dom';
import { fakePropType } from 'config/ConfigProvider';
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
import { unnnicModalNext, unnnicToolTip } from '@weni/unnnic-system';
import GuidingSteps from 'components/guidingsteps/GuidingSteps';
import { MouseState } from 'store/editor';

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
  onCreateNode: (node: RenderNode) => void;
  onMouseStateChange: (mouseState: MouseState) => void;
  selectionActive: boolean;
  nodes: { [uuid: string]: RenderNode };
  onOpenNodeEditor: OnOpenNodeEditor;
  guidingStep: number;
  currentGuide: string;
  mergeEditorState: MergeEditorState;
  mouseState: MouseState;
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

    this.props.onCreateNode(emptyNode);
  }

  public componentDidMount(): void {
    if (Object.keys(this.props.nodes).length === 0) {
      // this.showGetStartedModal();
    }
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
      return styles.disabled;
    }

    return styles.enabled;
  }

  private handleCopyClick(): void {
    if (!this.props.selectionActive) {
      return;
    }

    this.props.onCopyClick();
  }

  private toggleMouseState(): void {
    const mouseState =
      this.props.mouseState === MouseState.SELECT ? MouseState.DRAG : MouseState.SELECT;

    this.props.onMouseStateChange(mouseState);
  }

  public render(): JSX.Element {
    return (
      <div className={styles.sidebar}>
        <UnnnicTooltip
          enabled={this.props.guidingStep !== 0}
          side="right"
          text={
            this.props.mouseState === MouseState.SELECT
              ? i18n.t('select', 'Select')
              : i18n.t('drag', 'Drag')
          }
          shortcutText={'V'}
        >
          <div className={styles.option} onClick={() => this.toggleMouseState()}>
            {this.props.mouseState === MouseState.SELECT ? (
              <span className="material-symbols-rounded">near_me</span>
            ) : (
              <span className="material-symbols-rounded">back_hand</span>
            )}
          </div>
        </UnnnicTooltip>

        <GuidingSteps
          guide="v2"
          step={0}
          title={i18n.t('guiding.v2.0.title', 'New block')}
          description={i18n.t(
            'guiding.v2.0.description',
            `Now just click on this button to create a new block.`
          )}
          buttonText={i18n.t('guiding.v2.0.button', 'Got it 1/3')}
        >
          <UnnnicTooltip
            text={i18n.t('create_block')}
            enabled={this.props.guidingStep !== 0}
            side="right"
          >
            <div className={styles.option} onClick={() => this.createSendMessageNode()}>
              <span className="material-symbols-rounded">add_circle</span>
            </div>
          </UnnnicTooltip>
        </GuidingSteps>

        <GuidingSteps
          guide="v2"
          step={1}
          title={i18n.t('guiding.v2.1.title', 'Copy and paste')}
          description={i18n.t(
            'guiding.v2.1.description',
            `Finally, you can copy and paste the blocks wherever you want, including in\nanother flow. Click the button or use the shortcut Ctrl C + Ctrl V.`
          )}
          buttonText={i18n.t('guiding.v2.1.button', 'Got it 2/3')}
        >
          <UnnnicTooltip
            className={styles.left_aligned}
            text={this.getCopyTooltip()}
            enabled={this.props.guidingStep !== 1}
            side="right"
            shortcutText={this.props.selectionActive ? 'Ctrl C' : null}
          >
            <div
              className={`${styles.option} ${!this.props.selectionActive ? styles.disabled : ''}`}
              onClick={() => this.handleCopyClick()}
            >
              <span className={'material-symbols-rounded ' + this.getCopyIconScheme()}>
                content_copy
              </span>
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
