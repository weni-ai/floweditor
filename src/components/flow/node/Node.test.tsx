import { NodeComp, NodeProps } from 'components/flow/node/Node';
import { Types } from 'config/interfaces';
import React from 'react';
import { render, TEST_NODE } from 'test/utils';
import { createRandomNode } from 'testUtils/assetCreators';
import { createUUID } from 'utils';
import { MouseState } from '../../../store/editor';

const baseProps: NodeProps = {
  languages: {},
  nodeUUID: createUUID(),
  startingNode: true,
  onlyNode: true,
  selected: false,
  plumberMakeTarget: vi.fn(),
  plumberRecalculate: vi.fn(),
  plumberMakeSource: vi.fn(),
  plumberRemove: vi.fn(),
  plumberConnectExit: vi.fn(),
  plumberUpdateClass: vi.fn(),

  results: {},
  activeCount: 0,
  translating: false,
  simulating: false,
  debug: null,
  renderNode: {
    node: TEST_NODE,
    ui: {
      position: { left: 0, top: 0 },
      type: Types.execute_actions,
    },
    inboundConnections: {},
  },
  onAddToNode: vi.fn(),
  onOpenNodeEditor: vi.fn(),
  removeNode: vi.fn(),
  mergeEditorState: vi.fn(),
  issues: [],
  language: null,
  mouseState: MouseState.SELECT,
  scrollToAction: '',
  scrollToNode: '',
  brainInfo: null,
};

describe(NodeComp.name, () => {
  it('renders', () => {
    const { baseElement } = render(<NodeComp {...baseProps} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('renders a named random split', () => {
    const randomSplit = createRandomNode(3);
    randomSplit.node.router.result_name = 'My Random Split';
    const { baseElement } = render(
      <NodeComp {...baseProps} renderNode={randomSplit} />,
    );
    expect(baseElement).toMatchSnapshot();
  });
});
