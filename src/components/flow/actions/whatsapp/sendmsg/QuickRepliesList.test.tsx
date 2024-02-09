import { mock } from 'testUtils';
import QuickRepliesList, { hasEmptyReply } from './QuickRepliesList';
import * as utils from 'utils';
import * as React from 'react';
import { act, fireUnnnicInputChangeText, render, wait } from 'test/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

function getProps() {
  return {
    quickReplies: ['reply 1', 'reply 2'],
    onQuickRepliesUpdated: jest.fn()
  };
}

describe(QuickRepliesList.name, () => {
  it('should render', async () => {
    const props = getProps();
    const { baseElement } = render(<QuickRepliesList {...props} />);

    await wait();

    expect(baseElement).toMatchSnapshot();
  });

  it('should update quick replies', async () => {
    const props = getProps();
    const { getAllByTestId } = render(<QuickRepliesList {...props} />);

    await wait();

    const quickRepliesInput = getAllByTestId('Reply')[1];
    await act(async () => {
      fireUnnnicInputChangeText(quickRepliesInput, 'new reply 2');
    });

    expect(props.onQuickRepliesUpdated).toHaveBeenCalledWith(['reply 1', 'new reply 2']);
  });

  it('should remove quick reply', async () => {
    const props = getProps();
    const { getAllByTestId } = render(<QuickRepliesList {...props} />);

    await wait();

    const removeButton = getAllByTestId('Remove')[1];
    await act(async () => {
      removeButton.click();
    });

    expect(props.onQuickRepliesUpdated).toHaveBeenCalledWith(['reply 1']);
  });

  it('should return if array has an empty reply', async () => {
    const replies = ['reply 1', ''];
    expect(hasEmptyReply(replies)).toBe(true);

    const replies2 = ['reply 1', 'reply 2'];
    expect(hasEmptyReply(replies2)).toBe(false);
  });
});
