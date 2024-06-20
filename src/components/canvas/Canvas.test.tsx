import { Canvas, CANVAS_PADDING, CanvasProps } from 'components/canvas/Canvas';
import { CanvasDraggableProps } from 'components/canvas/CanvasDraggable';
import React from 'react';
import { fireEvent, render } from 'test/utils';
import { createUUID } from 'utils';
import { MouseState } from 'store/editor';

// vi.mock('components/sidebar/Sidebar', () => () => 'Mocked Sidebar');

const baseProps: CanvasProps = {
  uuid: createUUID(),
  draggingNew: false,
  dragActive: false,
  onDragging: vi.fn(),
  onUpdatePositions: vi.fn(),
  mergeEditorState: vi.fn(),
  onRemoveNodes: vi.fn(),
  onDoubleClick: vi.fn(),
  onLoaded: vi.fn(),
  draggables: [],
  newDragElement: <div></div>,
  mutable: true,
  mouseState: MouseState.SELECT,
  onZoom: vi.fn(),
  onMouseStateChange: vi.fn(),
  nodes: undefined,
  updateNodesEditor: vi.fn(),
};

describe(Canvas.name, () => {
  it('render default', () => {
    const { baseElement } = render(<Canvas {...baseProps} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('initializes the height to the lowest draggable', () => {
    const lowest: CanvasDraggableProps = {
      elementCreator: vi.fn(),
      uuid: createUUID(),
      position: { top: 1200, left: 100, bottom: 1290, right: 300 },
      idx: 0,
    };
    const { baseElement } = render(
      <Canvas {...baseProps} draggables={[lowest]} />,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('adjusts the height when updating dimensions', () => {
    const uuid = createUUID();
    const lowest: CanvasDraggableProps = {
      elementCreator: vi.fn(),
      uuid,
      position: { top: 1200, left: 100, right: 200, bottom: 1400 },
      idx: 0,
    };

    const { baseElement, getByTestId } = render(
      <Canvas {...baseProps} draggables={[lowest]} />,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('reflows collisions', () => {
    vi.useFakeTimers();

    const first: CanvasDraggableProps = {
      elementCreator: vi.fn(),
      uuid: createUUID(),
      position: { top: 100, bottom: 200, left: 100, right: 200 },
      idx: 0,
    };

    const second: CanvasDraggableProps = {
      elementCreator: vi.fn(),
      uuid: createUUID(),
      position: { top: 150, left: 100, bottom: 250, right: 200 },
      idx: 0,
    };

    const onDragging = vi.fn();

    const { getByTestId } = render(
      <Canvas
        {...baseProps}
        draggables={[first, second]}
        onDragging={onDragging}
      />,
    );

    // trigger reflow by simulating a drag event
    fireEvent.mouseDown(getByTestId('draggable_' + first.uuid));
    fireEvent.mouseUp(getByTestId('draggable_' + first.uuid));
    vi.runAllTimers();

    expect(onDragging).toMatchSnapshot();
  });
});
