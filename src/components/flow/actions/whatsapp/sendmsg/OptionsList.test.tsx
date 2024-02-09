import { mock } from 'testUtils';
import OptionsList from './OptionsList';
import * as utils from 'utils';
import * as React from 'react';
import { act, fireUnnnicInputChangeText, render, wait } from 'test/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

function getProps() {
  return {
    listTitle: {
      value: 'list title'
    },
    listFooter: {
      value: 'list footer'
    },
    options: {
      value: [
        { uuid: '1', title: 'title 1', description: 'description 1' },
        { uuid: '2', title: 'title 2', description: 'description 2' }
      ],
      validationFailures: [] as any[]
    },
    onOptionsUpdated: jest.fn(),
    onListTitleUpdated: jest.fn(),
    onListFooterUpdated: jest.fn(),
    onOptionRemoval: jest.fn()
  };
}

describe(OptionsList.name, () => {
  it('should render', async () => {
    const props = getProps();
    const { baseElement } = render(<OptionsList {...props} />);

    await wait();

    expect(baseElement).toMatchSnapshot();
  });

  it('should update list title', async () => {
    const props = getProps();
    const { getByTestId } = render(<OptionsList {...props} />);

    await wait();

    const listTitleInput = getByTestId('List title (optional)');
    await act(async () => {
      fireUnnnicInputChangeText(listTitleInput, 'new list title');
    });

    expect(props.onListTitleUpdated).toHaveBeenCalledWith('new list title');
  });

  it('should update list footer', async () => {
    const props = getProps();
    const { getByTestId } = render(<OptionsList {...props} />);

    await wait();

    const listFooterInput = getByTestId('Footer (optional)');
    await act(async () => {
      fireUnnnicInputChangeText(listFooterInput, 'new list footer');
    });

    expect(props.onListFooterUpdated).toHaveBeenCalledWith('new list footer');
  });

  it('should update list item title', async () => {
    const props = getProps();
    const { getByTestId, getAllByTestId } = render(<OptionsList {...props} />);

    await wait();

    // expand collapse
    const expandCollapseButton = getByTestId('List options');
    await act(async () => {
      expandCollapseButton.click();
    });

    const listItemTitleInput = getAllByTestId('Title')[1];
    await act(async () => {
      fireUnnnicInputChangeText(listItemTitleInput, 'new title 2');
    });

    expect(props.onOptionsUpdated).toHaveBeenCalledWith([
      { uuid: '1', title: 'title 1', description: 'description 1' },
      { uuid: '2', title: 'new title 2', description: 'description 2' }
    ]);
  });

  it('should update list item description', async () => {
    const props = getProps();
    const { getByTestId, getAllByTestId } = render(<OptionsList {...props} />);

    await wait();

    // expand collapse
    const expandCollapseButton = getByTestId('List options');
    await act(async () => {
      expandCollapseButton.click();
    });

    const listItemDescriptionInput = getAllByTestId('Description (Optional)')[1];
    await act(async () => {
      fireUnnnicInputChangeText(listItemDescriptionInput, 'new description 2');
    });

    expect(props.onOptionsUpdated).toHaveBeenCalledWith([
      { uuid: '1', title: 'title 1', description: 'description 1' },
      { uuid: '2', title: 'title 2', description: 'new description 2' }
    ]);
  });

  it('should remove list item', async () => {
    const props = getProps();
    const { getByTestId, getAllByTestId } = render(<OptionsList {...props} />);

    await wait();

    // expand collapse
    const expandCollapseButton = getByTestId('List options');
    await act(async () => {
      expandCollapseButton.click();
    });

    const listItemRemoveButton = getAllByTestId('Remove')[1];
    await act(async () => {
      listItemRemoveButton.click();
    });

    expect(props.onOptionRemoval).toHaveBeenCalledWith({
      uuid: '2',
      title: 'title 2',
      description: 'description 2'
    });
  });

  it('should not remove last list item if it is an empty one', async () => {
    const props = getProps();
    props.options.value = [{ uuid: '1', title: '', description: '' }];
    const { getByTestId, getAllByTestId } = render(<OptionsList {...props} />);

    await wait();

    // expand collapse
    const expandCollapseButton = getByTestId('List options');
    await act(async () => {
      expandCollapseButton.click();
    });

    const listItemRemoveButton = getAllByTestId('Remove')[0];
    await act(async () => {
      listItemRemoveButton.click();
    });

    expect(props.onOptionRemoval).not.toHaveBeenCalled();
  });

  it('should show error message', () => {
    const props = getProps();
    props.options.validationFailures = [{ message: 'error message text' }];
    const { getByTestId } = render(<OptionsList {...props} />);

    const errorMessage = getByTestId('Error message');

    expect(errorMessage).toBeInTheDocument();
  });
});
