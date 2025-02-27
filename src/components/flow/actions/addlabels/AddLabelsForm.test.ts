import AddLabelsForm from 'components/flow/actions/addlabels/AddLabelsForm';
import { ActionFormProps } from 'components/flow/props';
import { Label } from 'flowTypes';
import { composeComponentTestUtils, mock } from 'testUtils';
import {
  createAddLabelsAction,
  FeedbackLabel,
  getActionFormProps,
} from 'testUtils/assetCreators';
import * as utils from 'utils';
import { shallowToJson } from 'enzyme-to-json';

mock(utils, 'createUUID', utils.seededUUIDs());

const { results: labels } = require('test/assets/labels.json') as {
  results: Label[];
};

const { setup } = composeComponentTestUtils(
  AddLabelsForm,
  getActionFormProps(createAddLabelsAction(labels)),
);

describe(AddLabelsForm.name, () => {
  describe('render', () => {
    it('should render a base action', () => {
      const { wrapper } = setup();
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should update and save', () => {
      const component = setup(true);
      const instance: AddLabelsForm = component.instance;
      const props: Partial<ActionFormProps> = component.props;

      instance.handleLabelsChanged([FeedbackLabel]);
      expect(instance.state).toMatchSnapshot();
      instance.handleSave();

      expect(props.updateAction).toHaveBeenCalled();
      expect(props.updateAction).toMatchSnapshot('update label');
    });

    it('should not save if labels are empty', () => {
      const component = setup(true);
      const instance: AddLabelsForm = component.instance;

      instance.handleLabelsChanged([]);
      instance.handleSave();

      expect(component.props.updateAction).not.toHaveBeenCalled();
    });

    it('should allow switching from router', () => {
      const component = setup(true, {
        $merge: { updateAction: vi.fn() },
        nodeSettings: { $merge: { originalAction: null } },
      });

      const instance: AddLabelsForm = component.instance;
      const props: Partial<ActionFormProps> = component.props;

      instance.handleLabelsChanged([FeedbackLabel]);
      instance.handleSave();
      expect(props.updateAction).toMatchSnapshot('switch from router');
    });

    it('should allow creating a new label', () => {
      const component = setup(true);
      const instance: AddLabelsForm = component.instance;

      const newAsset = instance.handleCreateAssetFromInput('New Label');
      expect(newAsset).toMatchSnapshot({ name: 'New Label' });

      instance.handleLabelCreated(FeedbackLabel);
      expect(instance.state).toMatchSnapshot('create label');

      instance.handleSave();
      expect(component.props.updateAction).toHaveBeenCalled();
      expect(component.props.updateAction).toMatchSnapshot('add new label');
    });
  });
});
