import ReactDOM from 'react-dom';
import { react as bindCallbacks } from 'auto-bind';
import { ConfigProviderContext, fakePropType } from 'config/ConfigProvider';
import { FlowDefinition, FlowMetadata } from 'flowTypes';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Plumber from 'services/Plumber';
import { DebugState } from 'store/editor';
import { RenderNode } from 'store/flowContext';
import { createEmptyNode } from 'store/helpers';
import { NodeEditorSettings } from 'store/nodeEditor';
import AppState from 'store/state';
import {
  DispatchWithState,
  mergeEditorState,
  MergeEditorState,
  NoParamsAC,
  onConnectionDrag,
  OnConnectionDrag,
  OnOpenNodeEditor,
  onOpenNodeEditor,
  onRemoveNodes,
  OnRemoveNodes,
  OnUpdateCanvasPositions,
  onUpdateCanvasPositions,
  resetNodeEditingState,
  UpdateConnection,
  updateConnection,
  updateSticky,
  UpdateSticky
} from 'store/thunks';
import { timeStart } from 'utils';
import Debug from 'utils/debug';

import i18n from 'config/i18n';
import { applyVueInReact } from 'vuereact-combined';
import styles from './Sidebar.module.scss';
// @ts-ignore
import { unnnicModalNext, unnnicIcon } from '@weni/unnnic-system';

declare global {
  interface Window {
    fe: any;
  }
}

const UnnnicIcon = applyVueInReact(unnnicIcon);

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
  ghostNode: RenderNode;
  debug: DebugState;
  translating: boolean;
  popped: string;
  dragActive: boolean;

  mergeEditorState: MergeEditorState;

  definition: FlowDefinition;
  nodes: { [uuid: string]: RenderNode };
  metadata: FlowMetadata;
  nodeEditorSettings: NodeEditorSettings;

  updateConnection: UpdateConnection;
  onOpenNodeEditor: OnOpenNodeEditor;
  onUpdateCanvasPositions: OnUpdateCanvasPositions;
  onRemoveNodes: OnRemoveNodes;
  resetNodeEditingState: NoParamsAC;
  onConnectionDrag: OnConnectionDrag;
  updateSticky: UpdateSticky;
}

export class Sidebar extends React.PureComponent<SidebarStoreProps, {}> {
  public static contextTypes = {
    config: fakePropType
  };

  constructor(props: SidebarStoreProps, context: ConfigProviderContext) {
    super(props, context);

    /* istanbul ignore next */
    if (context.config.debug) {
      window.fe = new Debug(props, this.props.debug);
    }

    bindCallbacks(this, {
      include: [/Ref$/, /^on/, /^is/, /^get/, /^handle/]
    });

    timeStart('Loaded Flow');
  }

  private getEmptyFlow(): void {
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
            const emptyNode = createEmptyNode(null, null, 1, this.context.config.flowType);
            this.props.onOpenNodeEditor({
              originalNode: emptyNode,
              originalAction: emptyNode.node.actions[0]
            });

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

  public render(): JSX.Element {
    return (
      <div className={styles.sidebar}>
        <div className={styles.option}>
          <UnnnicIcon icon="add-circle-1" onClick={() => this.getEmptyFlow()} />
        </div>
      </div>
    );
  }
}

/* istanbul ignore next */
const mapStateToProps = ({
  flowContext: { definition, metadata, nodes },
  editorState: { ghostNode, debug, translating, popped, dragActive },
  // tslint:disable-next-line: no-shadowed-variable
  nodeEditor: { settings }
}: AppState) => {
  return {
    nodeEditorSettings: settings,
    definition,
    nodes,
    metadata,
    ghostNode,
    debug,
    translating,
    popped,
    dragActive
  };
};

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
  bindActionCreators(
    {
      mergeEditorState,
      resetNodeEditingState,
      onConnectionDrag,
      onOpenNodeEditor,
      onUpdateCanvasPositions,
      onRemoveNodes,
      updateConnection,
      updateSticky
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
