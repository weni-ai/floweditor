import { ActionFormProps } from 'components/flow/props';
import { composeComponentTestUtils, mock } from 'testUtils';
import { createSendWhatsAppMsgAction, getActionFormProps } from 'testUtils/assetCreators';
import * as utils from 'utils';

import SendWhatsAppMsgForm from './SendWhatsAppMsgForm';

const { setup } = composeComponentTestUtils<ActionFormProps>(
  SendWhatsAppMsgForm,
  getActionFormProps(createSendWhatsAppMsgAction())
);

mock(utils, 'createUUID', utils.seededUUIDs());

describe(SendWhatsAppMsgForm.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('render', () => {
    it('should render', () => {
      const { wrapper } = setup(true);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should not save if message is empty and there is no attachment', () => {
      const { instance, props } = setup(true);
      instance.handleSave();
      expect(instance.state).toMatchSnapshot();
      expect(props.updateAction).not.toHaveBeenCalled();
    });

    it('should save changes with updated message', () => {
      const { instance, props } = setup(true);
      instance.handleMessageUpdate('new msg');
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('should save changes with updated attachment by url', () => {
      const { instance, props } = setup(true);
      instance.handleAttachmentUrlChange('http://weni.ai/image.png');
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('should save changes with updated upload attachment', () => {
      const { instance, props } = setup(true);
      instance.handleAttachmentUploaded({
        data: { type: 'image', url: 'http://weni.ai/image.png' }
      });
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('should save changes after remove attachment', () => {
      const { instance, props } = setup(true);
      instance.handleMessageUpdate('new msg');
      instance.handleAttachmentUploaded({
        data: { type: 'image', url: 'http://weni.ai/image.png' }
      });
      expect(instance.state).toMatchSnapshot();
      instance.handleAttachmentRemoved();
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('should save changes with updated footer', () => {
      const { instance, props } = setup(true);
      // msg is required if there is no attachment
      instance.handleMessageUpdate('new msg');

      instance.handleFooterUpdate('new footer');
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('should save changes with updated header', () => {
      const { instance, props } = setup(true);
      // msg is required if there is no attachment
      instance.handleMessageUpdate('new msg');

      instance.handleHeaderTypeChange({ name: 'Text', value: 'text' });
      instance.handleHeaderTextUpdate('new header');
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('should save changes with updated list items', () => {
      const { instance, props } = setup(true);
      // msg is required if there is no attachment
      instance.handleMessageUpdate('new msg');

      instance.handleListItemsUpdate([
        { uuid: '1', title: 'title 1', description: 'description 1' },
        { uuid: '2', title: 'title 2', description: 'description 2' }
      ]);
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('should save changes with updated list items after a removal', () => {
      const { instance, props } = setup(true);
      // msg is required if there is no attachment
      instance.handleMessageUpdate('new msg');

      instance.handleListItemsUpdate([
        { uuid: '1', title: 'title 1', description: 'description 1' },
        { uuid: '2', title: 'title 2', description: 'description 2' }
      ]);
      expect(instance.state).toMatchSnapshot();
      instance.handleListItemRemoval({ uuid: '1', title: 'title 1', description: 'description 1' });
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('should not save changes with updated list title if no list items are provided', () => {
      const { instance, props } = setup(true);
      // msg is required if there is no attachment
      instance.handleMessageUpdate('new msg');

      instance.handleListTitleUpdate('new list title');
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).not.toHaveBeenCalled();
      expect(instance.state).toMatchSnapshot();
    });

    it('should not save changes with updated list footer if no list items are provided', () => {
      const { instance, props } = setup(true);
      // msg is required if there is no attachment
      instance.handleMessageUpdate('new msg');

      instance.handleListFooterUpdate('new list footer');
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).not.toHaveBeenCalled();
      expect(instance.state).toMatchSnapshot();
    });

    it('should save changes with updated list title', () => {
      const { instance, props } = setup(true);
      // msg is required if there is no attachment
      instance.handleMessageUpdate('new msg');
      instance.handleListItemsUpdate([
        { uuid: '1', title: 'title 1', description: 'description 1' },
        { uuid: '2', title: 'title 2', description: 'description 2' }
      ]);

      instance.handleListTitleUpdate('new list title');
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('should save changes with updated list footer', () => {
      const { instance, props } = setup(true);
      // msg is required if there is no attachment
      instance.handleMessageUpdate('new msg');
      instance.handleListItemsUpdate([
        { uuid: '1', title: 'title 1', description: 'description 1' },
        { uuid: '2', title: 'title 2', description: 'description 2' }
      ]);

      instance.handleListFooterUpdate('new list footer');
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('should save changes with updated quick replies', () => {
      const { instance, props } = setup(true);
      // msg is required if there is no attachment
      instance.handleMessageUpdate('new msg');
      instance.handleInteractionTypeUpdate('replies');

      instance.handleQuickRepliesUpdate(['reply 1', 'reply 2']);
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });

    it('should save changes when interaction type is location', () => {
      const { instance, props } = setup(true);
      // msg is required if there is no attachment
      instance.handleMessageUpdate('new msg');
      instance.handleInteractionTypeUpdate('location');

      expect(instance.state).toMatchSnapshot();
      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchCallSnapshot();
    });
  });

  describe('cancel', () => {
    it('should cancel without changes', () => {
      const { instance, props } = setup(true, {
        $merge: { onClose: jest.fn(), updateAction: jest.fn() }
      });
      instance.handleMessageUpdate('new msg');
      instance.getButtons().tertiary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateAction).not.toHaveBeenCalled();
    });
  });
});
