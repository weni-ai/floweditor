import { Sticky, StickyProps } from 'components/sticky/Sticky';
import { FlowDefinition, StickyNote } from 'flowTypes';
import { composeComponentTestUtils, composeDuxState, setMock } from 'testUtils';
import { set } from 'utils';

jest.useFakeTimers();

const definition = require('test/flows/empty.json') as FlowDefinition;

const clearTimeoutMock = clearTimeout as jest.Mock;

const sticky: StickyNote = {
  title: 'Sticky Title',
  body: 'Sticky Body',
  position: { left: 100, top: 200 },
};

const baseProps: StickyProps = {
  uuid: 'stickyA',
  sticky,
  definition,
  selected: false,
  updateSticky: jest.fn(),
};

const { setup } = composeComponentTestUtils(
  Sticky,
  baseProps,
  composeDuxState({ flowContext: { definition: set(definition) } }),
);

describe(Sticky.name, () => {
  describe('colors', () => {
    it('should render yellow as a default', () => {
      const { wrapper } = setup();
      expect(wrapper.find('.sticky_container').hasClass('yellow')).toBeTruthy();
    });

    it('should render green notes', () => {
      sticky.color = 'green';
      const { wrapper } = setup(true, { sticky: set(sticky) });
      expect(wrapper.find('.sticky_container').hasClass('green')).toBeTruthy();
    });

    it('should let you change the color', () => {
      const { wrapper } = setup();
      wrapper.find('.color_chooser .blue').simulate('click');
      expect(wrapper.find('.sticky_container').hasClass('blue')).toBeTruthy();
    });
  });

  describe('update content', () => {
    let wrapper: any;

    const updateText = (name: string, value: string) => {
      const selector = `textarea.${name}`;
      wrapper.find(selector).prop('onChange')({
        currentTarget: { value },
      });
      expect(wrapper.find(selector).text()).toBe(value);
    };

    it('should update the title', () => {
      wrapper = setup(false).wrapper;
      updateText('title', 'My new title');
    });

    it('should update the body', () => {
      wrapper = setup(false).wrapper;
      updateText('body', 'My new body');
    });

    it('should debounce multiple updates', () => {
      wrapper = setup(false).wrapper;
      updateText('title', 'Update one');
      updateText('title', 'Update two');

      // we should have cleared our debounce
      expect(clearTimeout).toHaveBeenCalledTimes(1);
    });

    it('should deregister debounce on unmount', () => {
      wrapper = setup(false).wrapper;
      updateText('title', 'Update one');
      updateText('title', 'Update two');
      clearTimeoutMock.mockClear();

      wrapper.unmount();

      expect(clearTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should show confirmation when clicking remove', () => {
      const { wrapper } = setup(false);

      // starts off without the removal class
      expect(wrapper.find('.title_wrapper').hasClass('removal')).toBeFalsy();

      // click on the removal, and removal should be there
      wrapper.find('.remove_button').simulate('click');

      expect(wrapper.find('.title_wrapper').hasClass('removal')).toBeTruthy();

      // run through the end of the timer period and removal should go away
      jest.runAllTimers();

      expect(
        wrapper
          .render()
          .find('.title_wrapper')
          .hasClass('removal'),
      ).toBeFalsy();
    });

    it('should delete on double click', () => {
      const { wrapper, props } = setup(true, { updateSticky: setMock() });

      // click on the removal, and removal should be there
      wrapper.find('.remove_button').simulate('click');
      wrapper.find('.remove_button').simulate('click');

      // TODO: make mocks work
      expect(props.updateSticky).toHaveBeenCalledTimes(1);
      expect(props.updateSticky).toHaveBeenCalledWith('stickyA', null);

      // run through the end of the timer period and removal should go away
      jest.runAllTimers();
    });

    it('should deregister timeout when unmounting', () => {
      const { wrapper } = setup();
      clearTimeoutMock.mockClear();

      // click to remove will register a timer to switch removal off
      wrapper.find('.remove_button').simulate('click');

      // unmounting should deregister our timer
      wrapper.unmount();

      expect(clearTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('dragging', () => {
    it('should get coverage for a noop', () => {
      const { instance } = setup();

      instance.handleDrag({});
    });
  });
});
