import { RouterFormProps } from 'components/flow/props';
import { getTypeConfig } from 'config';
import { Types } from 'config/interfaces';
import * as React from 'react';
import { fireEvent, render } from 'test/utils';
import { composeComponentTestUtils, mock } from 'testUtils';
import {
  createRandomNode,
  createRenderNode,
  createSendMsgAction,
  getRouterFormProps,
} from 'testUtils/assetCreators';
import * as utils from 'utils';
import userEvent from '@testing-library/user-event';

import RandomRouterForm from './RandomRouterForm';

mock(utils, 'createUUID', utils.seededUUIDs());

const { setup } = composeComponentTestUtils<RouterFormProps>(
  RandomRouterForm,
  getRouterFormProps(createRandomNode(2)),
);

describe(RandomRouterForm.name, () => {
  it('should render', () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('should initialize existing random', () => {
    const props: RouterFormProps = {
      nodeSettings: {
        originalNode: createRandomNode(5),
      },
      typeConfig: getTypeConfig(Types.split_by_random),
      assetStore: null,
      updateRouter: vi.fn(),
      onTypeChange: vi.fn(),
      onClose: vi.fn(),
      issues: [],
      helpArticles: {},
    };

    const { baseElement } = render(<RandomRouterForm {...props} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('should remove exits when shrinking', async () => {
    const props: RouterFormProps = {
      nodeSettings: {
        originalNode: createRandomNode(5),
      },
      typeConfig: getTypeConfig(Types.split_by_random),
      assetStore: null,
      updateRouter: vi.fn(),
      onTypeChange: vi.fn(),
      onClose: vi.fn(),
      helpArticles: {},
      issues: [],
    };

    const { baseElement, getByText, getByTestId, debug } = render(
      <RandomRouterForm {...props} />,
    );

    // we start off with five input boxes for our buckets plus 2 considering the select elements inputs
    expect(baseElement.querySelectorAll('input').length).toEqual(7);

    // choose 3 buckets
    userEvent.click(getByText('3 buckets'));

    // now we should only have three input buckets plus 2 from the select elements inputs
    expect(baseElement.querySelectorAll('input').length).toEqual(5);
    expect(baseElement).toMatchSnapshot();

    // now lets save our form
    fireEvent.click(getByText('Confirm'));

    expect(props.updateRouter).toMatchSnapshot();
  });

  it('should convert from a non-random node', () => {
    const { wrapper, instance, props } = setup(true, {
      nodeSettings: {
        $set: {
          originalAction: createSendMsgAction({ text: '' }),
          originalNode: createRenderNode({
            actions: [createSendMsgAction({ text: 'A message' })],
            exits: [{ uuid: utils.createUUID() }],
            ui: {
              type: Types.execute_actions,
              position: { left: 100, top: 100 },
            },
          }),
        },
      },
    });

    instance.handleSave();

    // our orginal node should still only have one exit
    expect(props.nodeSettings.originalNode.node.exits.length).toBe(1);

    expect(wrapper).toMatchSnapshot();
    expect(props.updateRouter).toMatchSnapshot();
    expect(props.nodeSettings.originalNode).toMatchSnapshot();
  });
});
