import { react as bindCallbacks } from 'auto-bind';
import { CanvasDraggable, CanvasDraggableProps } from 'components/canvas/CanvasDraggable';
import { getDraggablesInBox, reflow } from 'components/canvas/helpers';
import { DRAG_THRESHOLD } from 'components/flow/Flow';
import { Dimensions, Exit, FlowNode, FlowPosition } from 'flowTypes';
import Sidebar from 'components/sidebar/Sidebar';
import mutate from 'immutability-helper';
import React from 'react';
import { CanvasPositions, DragSelection } from 'store/editor';
import { addPosition } from 'store/helpers';
import { MergeEditorState } from 'store/thunks';
import { COLLISION_FUDGE, snapPositionToGrid, throttle, snapToGrid } from 'utils';

import styles from './Canvas.module.scss';
import nodesCopy from '../../components/copyAndPasteNodes';
import { RenderNode } from '../../store/flowContext';

export const CANVAS_PADDING = 300;
export const REFLOW_QUIET = 200;

export interface CanvasProps {
  uuid: string;
  dragActive: boolean;
  draggingNew: boolean;
  newDragElement: JSX.Element;
  draggables: CanvasDraggableProps[];
  mutable: boolean;
  onLoaded: () => void;
  onDragging: (draggedUUIDs: string[]) => void;
  onUpdatePositions: (positions: CanvasPositions) => void;
  onRemoveNodes: (nodeUUIDs: string[]) => void;
  onDoubleClick: (position: FlowPosition) => void;
  mergeEditorState: MergeEditorState;
  nodes: any;
  updateNodesEditor: any;
}

interface CanvasState {
  dragDownPosition: FlowPosition | null;
  dragUUID: string | null;
  dragGroup: boolean;
  dragSelection: DragSelection | null;
  uuid: string;
  positions: CanvasPositions;
  selected: CanvasPositions;
  height: number;
  mouseX: number;
  mouseY: number;
}

export class Canvas extends React.PureComponent<CanvasProps, CanvasState> {
  private ele!: HTMLDivElement;
  private isScrolling: any;

  private reflowTimeout: any;

  // when auto scrolling we need to move dragged elements
  private lastX!: number | null;
  private lastY!: number | null;

  // did we just select something
  private justSelected = false;

  private onDragThrottled: (uuids: string[]) => void = throttle(this.props.onDragging, 300);
  private onMouseThrottled: (event: any) => void = throttle(this.handleMouseMove.bind(this), 10);

  constructor(props: CanvasProps) {
    super(props);

    let height = document.documentElement.clientHeight;

    const positions: { [uuid: string]: FlowPosition } = {};
    this.props.draggables.forEach((draggable: CanvasDraggableProps) => {
      positions[draggable.uuid] = draggable.position;
      if (draggable.position.bottom) {
        height = Math.max(height, draggable.position.bottom + CANVAS_PADDING);
      }
    });

    this.state = {
      height,
      dragDownPosition: null,
      dragUUID: null,
      dragGroup: false,
      dragSelection: null,
      uuid: this.props.uuid,
      selected: {},
      positions,
      mouseX: 0,
      mouseY: 0
    };

    bindCallbacks(this, {
      include: [/^handle/, /^render/, /^mark/, /^do/, /^ensure/]
    });
  }

  private handleWindowResize(): void {
    const windowHeight = document.documentElement.clientHeight;
    this.setState({ height: Math.max(windowHeight, this.state.height) });
  }

  public componentDidMount(): void {
    /* istanbul ignore next */
    window.addEventListener('resize', this.handleWindowResize);
    document.addEventListener('keydown', this.handleKeyDown);

    window.document.addEventListener('copy', event => {
      if (Object.keys(this.state.selected).length === 0) {
        return;
      }

      const instance = new nodesCopy();

      const edgeCorner: any = {
        left: null,
        top: null
      };

      let nodes = instance.replaceUuidsToUpdate(
        this.props.draggables
          .filter(({ uuid }) => Object.keys(this.state.selected).includes(uuid))
          .map(({ config }) => ({
            node: config.node,
            ui: config.ui,
            inboundConnections: config.inboundConnections
          }))
          .map(node => JSON.parse(JSON.stringify(node)))
      );

      nodes.forEach((node: any) => {
        if (!node.ui) {
          return;
        }

        if (edgeCorner.left === null || node.ui.position.left < edgeCorner.left) {
          edgeCorner.left = node.ui.position.left;
        }

        if (edgeCorner.top === null || node.ui.position.top < edgeCorner.top) {
          edgeCorner.top = node.ui.position.top;
        }
      });

      nodes = nodes.map((node: any) => ({
        ...node,
        ui: {
          ...node.ui,
          position: {
            left: node.ui.position.left - edgeCorner.left,
            top: node.ui.position.top - edgeCorner.top
          }
        }
      }));

      event.clipboardData.setData('application/json', JSON.stringify(nodes));
      event.preventDefault();
    });

    window.document.addEventListener('paste', event => {
      if (event.clipboardData.getData('application/json')) {
        const nodes = JSON.parse(event.clipboardData.getData('application/json'));

        const instance = new nodesCopy();

        const nodesPasted = instance.createNewUuids(nodes);

        nodesPasted.forEach((item: RenderNode) => {
          const filteredInboundConnections = this.filterExistingInbounds(nodesPasted, item);
          const filteredExits = this.filterExistingExits(nodesPasted, item.node);
          this.props.nodes[item.node.uuid] = {
            ...item,
            node: {
              ...item.node,
              exits: filteredExits
            },
            inboundConnections: filteredInboundConnections,
            ui: {
              ...item.ui,
              position: {
                left: item.ui.position.left + this.state.mouseX,
                top: item.ui.position.top + this.state.mouseY
              }
            }
          };
        });

        this.props.updateNodesEditor(this.props.nodes);
      }
    });

    this.props.onLoaded();
  }

  private filterExistingExits(nodeList: RenderNode[], node: FlowNode): Exit[] {
    const exits: Exit[] = node.exits || [];
    const filteredExits: Exit[] = [];

    for (const exit of exits) {
      if (exit.destination_uuid) {
        let hasDestination = false;
        for (const n of nodeList) {
          if (n.node.uuid === exit.destination_uuid) {
            hasDestination = true;
            break;
          }
        }

        if (hasDestination) {
          filteredExits.push(exit);
        } else {
          filteredExits.push({ ...exit, destination_uuid: undefined });
        }
      } else {
        filteredExits.push(exit);
      }
    }

    return filteredExits;
  }

  private filterExistingInbounds(
    nodeList: RenderNode[],
    node: RenderNode
  ): { [nodeUUID: string]: string } {
    const inboundConnections: { [nodeUUID: string]: string } = node.inboundConnections || {};
    const filteredInboundConnections: { [nodeUUID: string]: string } = {};

    for (const key of Object.keys(inboundConnections)) {
      const inboundConnection = inboundConnections[key];
      for (const n of nodeList) {
        if (n.node.exits.find(exit => exit.uuid === key)) {
          filteredInboundConnections[key] = inboundConnection;
          break;
        }
      }
    }

    return filteredInboundConnections;
  }

  private handleKeyDown(event: any): void {
    if (this.state.selected && (event.key === 'Backspace' || event.key === 'Delete')) {
      const nodeUUIDs = Object.keys(this.state.selected);
      if (nodeUUIDs.length > 0) {
        this.props.onRemoveNodes(Object.keys(this.state.selected));
      }
    }
  }

  public componentWillUnmount(): void {
    window.removeEventListener('resize', this.handleWindowResize);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  public componentDidUpdate(prevProps: CanvasProps, prevState: CanvasState): void {
    // traceUpdate(this, prevProps, prevState);

    let updated = false;
    let updatedPositions = { ...this.state.positions };

    // are we being given something new
    this.props.draggables.forEach((draggable: CanvasDraggableProps) => {
      if (!this.state.positions[draggable.uuid]) {
        updatedPositions = mutate(updatedPositions, {
          $merge: { [draggable.uuid]: draggable.position }
        });
        updated = true;
      }
    });

    // have we removed something
    Object.keys(updatedPositions).forEach((uuid: string) => {
      if (
        !this.props.draggables.find((draggable: CanvasDraggableProps) => draggable.uuid === uuid)
      ) {
        updatedPositions = mutate(updatedPositions, { $unset: [[uuid]] } as any);
        updated = true;
      }
    });

    if (updated) {
      this.setState({ positions: updatedPositions });
    }

    this.ensureCanvasHeight();
  }

  public renderSelectionBox(): JSX.Element | null {
    const drag = this.state.dragSelection;

    if (drag && drag.startX && drag.startY && drag.currentX && drag.currentY) {
      const left = Math.min(drag.startX, drag.currentX);
      const top = Math.min(drag.startY, drag.currentY);
      const width = Math.max(drag.startX, drag.currentX) - left;
      const height = Math.max(drag.startY, drag.currentY) - top;

      if (this.state.dragSelection && this.state.dragSelection.startX) {
        return <div className={styles.drag_selection} style={{ left, top, width, height }} />;
      }
    }

    return null;
  }

  private isClickOnCanvas(event: React.MouseEvent<HTMLDivElement>): boolean {
    // ignore right clicks
    if (event.nativeEvent.which === 3) {
      return false;
    }
    return (event.target as any).id === 'canvas';
  }

  private handleMouseDown(event: React.MouseEvent<HTMLDivElement>): void {
    // ignore right clicks
    if (event.nativeEvent.which === 3) {
      return;
    }

    if (!this.props.mutable) {
      return;
    }

    const offset = this.ele.getBoundingClientRect();

    this.justSelected = false;
    if (this.isClickOnCanvas(event)) {
      const startX = event.pageX - offset.left;
      const startY = event.pageY - offset.top - window.scrollY;

      this.setState({
        dragSelection: { startX, startY, currentX: startX, currentY: startY }
      });
    }
  }

  private handleMouseMoveCanvas(event: React.MouseEvent<HTMLDivElement>): void {
    let pageX = 0,
      pageY = 0;

    let currentTarget: HTMLElement = event.currentTarget;

    do {
      pageX += currentTarget.offsetLeft;
      pageY += currentTarget.offsetTop;

      currentTarget = currentTarget.offsetParent as HTMLElement;
    } while (currentTarget !== document.body);

    this.setState({
      mouseX: event.pageX - pageX,
      mouseY: event.pageY - pageY
    });
  }

  private handleMouseMove(event: React.MouseEvent<HTMLDivElement>): void {
    if (!this.props.mutable) {
      return;
    }

    if (this.props.draggingNew) {
      this.lastX = event.pageX;
      this.lastY = event.pageY;
      this.updateStateWithScroll(event.clientY, event.pageY);
      if (this.state.dragUUID) {
        this.updatePositions(event.pageX, event.pageY, event.clientY, false);
      }
      return;
    }

    if (this.state.dragSelection && this.state.dragSelection.startX) {
      const drag = this.state.dragSelection;

      if (drag && drag.startX && drag.startY && drag.currentX && drag.currentY) {
        const left = Math.min(drag.startX, drag.currentX);
        const top = Math.min(drag.startY, drag.currentY);
        const right = Math.max(drag.startX, drag.currentX);
        const bottom = Math.max(drag.startY, drag.currentY);

        const selected = getDraggablesInBox(this.state.positions, {
          left,
          top,
          right,
          bottom
        });

        const offset = this.ele.getBoundingClientRect();

        this.setState({
          dragSelection: {
            startX: drag.startX,
            startY: drag.startY,
            currentX: event.pageX - offset.left,
            currentY: event.pageY - offset.top - window.scrollY
          }
        });

        this.setState({ selected });

        if (Object.keys(selected).length > 0) {
          this.justSelected = true;
        }
      }
    }

    if (this.state.dragUUID) {
      this.updatePositions(event.pageX, event.pageY, event.clientY, false);
    }
  }

  private scrollCanvas(amount: number): void {
    if (!this.isScrolling) {
      this.isScrolling = true;

      let speed = amount;
      if (window.scrollY + amount < 0) {
        speed = 0;
      }

      this.isScrolling = window.setInterval(() => {
        if (this.lastX && this.lastY) {
          // as we scroll we need to move our dragged items along with us
          this.updatePositions(this.lastX, this.lastY + speed, 0, false);
          window.scrollBy(0, speed);
        }
      }, 30);
    }
  }

  private handleMouseUpCapture(event: React.MouseEvent<HTMLDivElement>): void {
    if (!this.props.mutable) {
      return;
    }

    // ignore right clicks
    if (event.nativeEvent.which === 3) {
      return;
    }

    this.lastX = null;
    this.lastY = null;
    if (this.state.dragUUID) {
      this.setState({
        dragDownPosition: null,
        dragSelection: null,
        dragUUID: null
      });
    }

    if (!this.justSelected) {
      this.props.mergeEditorState({
        dragActive: false
      });

      this.setState({ selected: {} });
    }

    if (this.state.dragSelection && this.state.dragSelection.startX) {
      this.setState({
        dragSelection: {
          startX: undefined,
          startY: undefined,
          currentX: undefined,
          currentY: undefined
        }
      });
    }

    this.justSelected = false;
  }

  public handleUpdateDimensions(uuid: string, dimensions: Dimensions): void {
    if (dimensions.width && dimensions.height) {
      let pos = this.state.positions[uuid];
      if (!pos) {
        pos = this.props.draggables.find((item: CanvasDraggableProps) => item.uuid === uuid)!
          .position;
      }

      const newPosition = {
        left: pos.left,
        top: pos.top,
        right: pos.left + dimensions.width,
        bottom: pos.top + dimensions.height
      };

      if (newPosition.bottom !== pos.bottom || newPosition.right !== pos.right) {
        this.setState((prevState: CanvasState) => {
          const newPositions = mutate(prevState.positions, {
            $merge: {
              [uuid]: newPosition
            }
          });

          return {
            positions: newPositions,
            height: Math.max(newPosition.bottom + CANVAS_PADDING, prevState.height)
          };
        }, this.markReflow);
      }
    }
  }

  public ensureCanvasHeight() {
    let height = this.state.height;
    Object.keys(this.state.positions).forEach(uuid => {
      const bottom = this.state.positions[uuid].bottom + CANVAS_PADDING;
      if (bottom > height) {
        height = bottom;
      }
    });

    if (height > this.state.height) {
      this.setState({ height });
    }
  }

  public doReflow(): void {
    const reflowPositions = { ...this.state.positions };
    delete reflowPositions[this.state.dragUUID];
    const { positions, changed } = reflow(reflowPositions, COLLISION_FUDGE);

    if (changed) {
      this.setState({ positions });

      if (changed) {
        this.props.onUpdatePositions(
          changed.reduce((results: CanvasPositions, uuid: string) => {
            results[uuid] = positions[uuid];
            return results;
          }, {})
        );
      }
    }

    this.props.onDragging(changed);
  }

  private markReflow(): void {
    if (this.reflowTimeout) {
      clearTimeout(this.reflowTimeout);
    }

    this.reflowTimeout = setTimeout(() => {
      // only reflow if we aren't dragging
      if (!this.state.dragUUID) {
        this.doReflow();
      }
    }, REFLOW_QUIET);
  }

  /**
   * Updates the state of the canvas, expanding and scrolling as needed
   * @param windowY the mouse position in the viewport
   * @param pageY the mouse position in the full canvas
   * @param otherState optional state to set
   */
  private updateStateWithScroll(
    windowY: number,
    pageY: number,
    otherState: Partial<CanvasState> = {}
  ): void {
    const viewportHeight = document.documentElement.clientHeight;
    this.setState(
      (prevState: CanvasState) => {
        return {
          ...(otherState as CanvasState),
          height: Math.max(pageY + CANVAS_PADDING, prevState.height)
        };
      },
      () => {
        // check if we need to scroll our canvas

        if (!this.isScrolling && windowY !== 0) {
          if (windowY + 100 > viewportHeight) {
            this.scrollCanvas(15);
          } else if (windowY < 100) {
            this.scrollCanvas(-15);
          }
        }
        // if we are scrolling but given a clientY then user is mousing
        else if (windowY !== 0 && (windowY > 100 && windowY + 100 < viewportHeight)) {
          window.clearInterval(this.isScrolling);
          this.isScrolling = null;
        }
      }
    );
  }

  private updatePositions(pageX: number, pageY: number, clientY: number, snap: boolean): void {
    if (this.state.dragUUID) {
      const { dragUUID } = this.state;

      // save off the last update, if we scroll on the user's behalf we'll need this
      this.lastX = pageX;
      this.lastY = pageY;

      const startPosition = this.props.dragActive
        ? this.state.selected[dragUUID]
        : this.state.positions[dragUUID];

      const offset = this.ele.getBoundingClientRect();

      if (this.state.dragDownPosition) {
        const xd = pageX - offset.left - this.state.dragDownPosition.left - startPosition.left;

        const yd =
          pageY - offset.top - this.state.dragDownPosition.top - startPosition.top - window.scrollY;

        let lowestNode: number | undefined = 0;
        if (this.props.dragActive) {
          const delta = { left: xd, top: yd };
          const prevState = this.state;
          const uuids = Object.keys(prevState.selected);
          let newPositions: { [uuid: string]: FlowPosition } = {};

          uuids.forEach((uuid: string) => {
            let newPosition = addPosition(prevState.selected[uuid], delta);
            if (snap) {
              newPosition = snapPositionToGrid(newPosition);
            }

            if (newPosition && newPosition.bottom! > lowestNode!) {
              lowestNode = newPosition.bottom;
            }
            newPositions[uuid] = newPosition;
          });

          newPositions = mutate(prevState.positions, {
            $merge: newPositions
          });

          this.updateStateWithScroll(clientY, lowestNode, {
            positions: newPositions
          });

          if (uuids.length <= 5) {
            this.props.onDragging(uuids);
          } else {
            this.onDragThrottled(uuids);
          }
        } else {
          if (Math.abs(xd) + Math.abs(yd) > DRAG_THRESHOLD) {
            let selected = this.state.selected;
            if (!(this.state.dragUUID in selected)) {
              selected = { [dragUUID]: this.state.positions[dragUUID] };
            }

            this.props.mergeEditorState({
              dragActive: true
            });

            this.setState({ selected });
          }
        }
      }
    }
  }

  private handleDragStart(uuid: string, position: FlowPosition): void {
    const offset = this.ele.getBoundingClientRect();

    this.setState({
      dragUUID: uuid,
      dragDownPosition: {
        left: position.left - offset.left,
        top: position.top - offset.top - window.scrollY
      }
    });
  }

  /** Gets all the positions for nodes that were dragged */
  private getSelectedPositions(): CanvasPositions {
    return Object.keys(this.state.selected).reduce((result: CanvasPositions, uuid: string) => {
      result[uuid] = this.state.positions[uuid];
      return result;
    }, {});
  }

  private handleDragStop(): void {
    if (this.state.dragUUID) {
      this.updatePositions(this.lastX!, this.lastY!, 0, true);
    }

    this.props.onUpdatePositions(this.getSelectedPositions());
    this.setState({
      dragUUID: null,
      dragDownPosition: null,
      dragSelection: null
    });

    this.markReflow();

    this.props.mergeEditorState({
      dragActive: false
    });
  }

  private handleAnimated(uuid: string): void {
    this.props.onDragging([uuid]);
  }

  private handleDoubleClick(event: React.MouseEvent<HTMLDivElement>): void {
    if (this.isClickOnCanvas(event)) {
      const offset = this.ele.getBoundingClientRect();
      this.props.onDoubleClick(
        snapToGrid(event.pageX - offset.left, event.pageY - offset.top - window.scrollY)
      );
    }
  }

  public render(): JSX.Element {
    return (
      <div
        id="canvas-container"
        className={styles.canvas_container}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.onMouseThrottled}
        onMouseUp={this.handleMouseUpCapture}
        onDoubleClick={this.handleDoubleClick}
      >
        <div className={styles.canvas_background}>
          <Sidebar />

          <div
            data-testid="canvas"
            style={{ height: this.state.height }}
            id="canvas"
            ref={(ele: HTMLDivElement) => {
              this.ele = ele;
            }}
            className={styles.canvas}
            onMouseMove={this.handleMouseMoveCanvas}
          >
            {this.props.newDragElement}
            {this.props.draggables.map((draggable: CanvasDraggableProps, idx: number) => {
              const pos = this.state.positions[draggable.uuid] || draggable.position;
              return (
                <CanvasDraggable
                  onAnimated={this.handleAnimated}
                  key={'draggable_' + draggable.uuid}
                  uuid={draggable.uuid}
                  updateDimensions={this.handleUpdateDimensions}
                  position={pos}
                  idx={draggable.idx}
                  selected={!!this.state.selected[draggable.uuid]}
                  elementCreator={draggable.elementCreator}
                  onDragStart={this.handleDragStart}
                  onDragStop={this.handleDragStop}
                  dragOnAdd={draggable.dragOnAdd}
                  config={draggable.config}
                />
              );
            })}
            {this.renderSelectionBox()}
          </div>
        </div>
      </div>
    );
  }
}
