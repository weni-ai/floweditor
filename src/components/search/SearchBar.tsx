import * as React from 'react';
import styles from './Search.module.scss';
// @ts-ignore
import { unnnicInput } from '@weni/unnnic-system';
import { applyVueInReact } from 'vuereact-combined';
import AppState from 'store/state';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DispatchWithState, HandleSearchChange, handleSearchChange } from 'store/thunks';
import { Search } from 'store/flowContext';

const UnnnicInput = applyVueInReact(unnnicInput, {
  vue: {
    componentWrapAttrs: {
      'unnnic-input': 'true'
    }
  }
});
export interface SearchStoreProps {
  search?: Search;
  handleSearchChange?: HandleSearchChange;
}

export class SearchBar extends React.PureComponent<SearchStoreProps, {}> {
  private handleInput(value: string) {
    this.props.handleSearchChange({
      active: true,
      value: value
    });
  }

  public render(): JSX.Element {
    return (
      <div className={styles.search_card}>
        <UnnnicInput
          iconLeft="search-1"
          value={this.props.search.value}
          on={{ input: (value: string) => this.handleInput(value) }}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ flowContext: { search } }: AppState) => {
  return {
    search
  };
};

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
  bindActionCreators({ handleSearchChange }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchBar);
