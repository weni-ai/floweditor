import * as React from 'react';
import SendMsgForm from 'components/flow/actions/sendmsg/SendMsgForm';
import { ActionFormProps } from 'components/flow/props';
import { composeComponentTestUtils, mock } from 'testUtils';
import {
  createSendMsgAction,
  getActionFormProps,
} from 'testUtils/assetCreators';
import * as utils from 'utils';
import { shallowToJson } from 'enzyme-to-json';
import { config } from 'test/config';
import { act, fireEvent, render, waitFor } from 'test/utils';
import { MediaUrlSigner } from 'services/MediaUrlSigner';

const { setup } = composeComponentTestUtils<ActionFormProps>(
  SendMsgForm,
  getActionFormProps(createSendMsgAction()),
);

mock(utils, 'createUUID', utils.seededUUIDs());

describe(SendMsgForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { wrapper } = setup(true);
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should save changes', () => {
      const { instance, props } = setup(true);

      instance.handleMessageUpdate('What is your favorite color?', []);
      instance.handleQuickRepliesUpdate(['red', 'green', 'blue']);
      instance.handleSendAllUpdate(true);

      expect(instance.state).toMatchSnapshot();

      instance.handleSave();
      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchSnapshot();
    });

    it('should allow switching from router', () => {
      const { instance, props } = setup(true, {
        $merge: { updateAction: vi.fn() },
        nodeSettings: { $merge: { originalAction: null } },
      });

      instance.handleMessageUpdate('What is your favorite color?', []);
      instance.handleSave();

      expect(props.updateAction).toMatchSnapshot();
    });
  });

  describe('cancel', () => {
    it('should cancel without changes', () => {
      const { instance, props } = setup(true, {
        $merge: { onClose: vi.fn(), updateAction: vi.fn() },
      });
      instance.handleMessageUpdate("Don't save me bro", []);
      instance.getButtons().tertiary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateAction).not.toHaveBeenCalled();
    });
  });

  describe('download with signing', () => {
    const canonicalUrl =
      'https://weni-flows.s3.us-east-1.amazonaws.com/attachments/42/1337/steps/9c1d/report.pdf';
    const attachment = 'application/pdf:' + canonicalUrl;

    beforeEach(() => {
      MediaUrlSigner.get().configure(config.endpoints.media_urls);
    });

    afterEach(() => {
      MediaUrlSigner.get().configure(undefined);
      vi.restoreAllMocks();
    });

    it('saves the canonical url after downloading', async () => {
      const tab = { opener: {}, closed: false, location: { href: '' } };
      vi.spyOn(window, 'open').mockReturnValue((tab as unknown) as Window);
      const props = getActionFormProps(
        createSendMsgAction({ attachments: [attachment] }),
      );

      // The dialog buttons belong to the modal wrapper, so save through the form
      const form = React.createRef<SendMsgForm>();
      const { getByText, getByTestId } = render(
        React.createElement(SendMsgForm, { ...props, ref: form }),
      );

      fireEvent.click(getByText('Attachments'));
      fireEvent.click(getByTestId('download-attachment-0'));
      await waitFor(() =>
        expect(tab.location.href).toBe(canonicalUrl + '?X-Amz-Signature=test'),
      );
      act(() => form.current.getButtons().primary.onClick());

      expect(props.updateAction).toHaveBeenCalledWith(
        expect.objectContaining({ attachments: [attachment] }),
      );
      expect(
        JSON.stringify(vi.mocked(props.updateAction).mock.calls),
      ).not.toContain('X-Amz-Signature');
    });
  });
});
