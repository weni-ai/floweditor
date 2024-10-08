import { SendEmail } from 'flowTypes';
import { composeComponentTestUtils } from 'testUtils';
import { createSendEmailAction } from 'testUtils/assetCreators';
import SendEmailComp from 'components/flow/actions/sendemail/SendEmail';
import { shallowToJson } from 'enzyme-to-json';

const sendEmailAction = createSendEmailAction();

const { setup } = composeComponentTestUtils<SendEmail>(
  SendEmailComp,
  sendEmailAction,
);

describe(SendEmailComp.name, () => {
  describe('render', () => {
    it('should render self, children', () => {
      const { wrapper, props } = setup();

      expect(wrapper.text()).toBe(props.subject);
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
  });
});
