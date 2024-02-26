import { SearchBar, SearchStoreProps } from './SearchBar';
import { composeComponentTestUtils } from 'testUtils';

const baseProps: SearchStoreProps = {
  search: {
    active: false,
    value: '',
    selected: 0,
    nodes: []
  },
  nodes: {},
  handleSearchChange: jest.fn()
};

const { setup } = composeComponentTestUtils(SearchBar, baseProps);

describe(SearchBar.name, () => {
  describe('render', () => {
    it('should render timeout control', () => {
      const { wrapper } = setup(false);
      expect(wrapper).toMatchSnapshot();
    });
  });
});
