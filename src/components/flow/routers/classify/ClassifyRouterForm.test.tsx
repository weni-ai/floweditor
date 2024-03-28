import * as React from 'react';
import { AssetType } from 'store/flowContext';
import {
  render,
  fireUnnnicInputChangeText,
  getUnnnicInputValue,
} from 'test/utils';
import { mock } from 'testUtils';
import {
  createClassifyRouter,
  getRouterFormProps,
} from 'testUtils/assetCreators';
import * as utils from 'utils';
import ClassifyRouterForm from './ClassifyRouterForm';
import * as external from 'external';

mock(
  external,
  'fetchAsset',
  utils.fetchAsset({
    id: 'purrington',
    name: 'Purrington',
    type: AssetType.Classifier,
    content: {
      intents: ['fact', 'opinion'],
    },
  }),
);

mock(utils, 'createUUID', utils.seededUUIDs());

const routerNode = createClassifyRouter();

const getProps = () => {
  const formProps = getRouterFormProps(routerNode);
  formProps.assetStore = {
    classifiers: { items: {}, type: AssetType.Classifier },
  };
  return formProps;
};

describe(ClassifyRouterForm.name, () => {
  it('defaults to correct result name', () => {
    const props = getProps();
    props.nodeSettings.originalNode.node.router.result_name =
      'Initial Result Name';
    const { getByTestId } = render(<ClassifyRouterForm {...props} />);
    const result = getByTestId('Save as result');
    expect(getUnnnicInputValue(result)).toEqual('Initial Result Name');
  });

  it('updates the result name', () => {
    const { getByTestId } = render(<ClassifyRouterForm {...getProps()} />);

    const result = getByTestId('Save as result');
    fireUnnnicInputChangeText(result, 'Updated Result Name');
    expect(getUnnnicInputValue(result)).toEqual('Updated Result Name');
  });
});
