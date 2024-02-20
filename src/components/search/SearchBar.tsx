import * as React from 'react';
import styles from './Search.module.scss';
// @ts-ignore
import { unnnicInput, unnnicButtonIcon } from '@weni/unnnic-system';
import { applyVueInReact } from 'vuereact-combined';
import AppState from 'store/state';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DispatchWithState, HandleSearchChange, handleSearchChange } from 'store/thunks';
import { RenderNode, RenderNodeMap, Search } from 'store/flowContext';

const UnnnicInput = applyVueInReact(unnnicInput, {
  vue: {
    componentWrapAttrs: {
      'unnnic-input': 'true'
    }
  }
});
const UnnnicButtonIcon = applyVueInReact(unnnicButtonIcon, {
  vue: {
    componentWrapAttrs: {
      'unnnic-button-icon': 'true'
    }
  }
});

export interface SearchStoreProps {
  search?: Search;
  nodes?: RenderNodeMap;
  handleSearchChange?: HandleSearchChange;
}

export class SearchBar extends React.PureComponent<SearchStoreProps, {}> {
  private handleInput(value: string) {
    const nodes = this.findNodes(value);
    this.props.handleSearchChange({
      active: true,
      value: value,
      nodes: nodes
    });
  }

  private getAllNodes() {
    return Object.entries(this.props.nodes).map(item => {
      return {
        uuid: item[0],
        data: item[1]
      };
    });
  }
  private findNodes(value: string) {
    const nodes = this.getAllNodes();
    return nodes.filter(item => item.data.node.actions[0].text.includes(value));
  }

  public render(): JSX.Element {
    return (
      <div className={styles.search_card}>
        <UnnnicInput
          iconLeft="search-1"
          value={this.props.search.value}
          on={{ input: (value: string) => this.handleInput(value) }}
        />
        {this.props.search.nodes ? (
          <>
            <span className={styles.number}>1 of {this.props.search.nodes.length}</span>
            <UnnnicButtonIcon icon="arrow-button-down-1" size="small" className={styles.button} />
            <UnnnicButtonIcon icon="arrow-button-up-1" size="small" className={styles.button} />
          </>
        ) : (
          <></>
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ flowContext: { search, nodes } }: AppState) => {
  return {
    search,
    nodes
  };
};

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
  bindActionCreators({ handleSearchChange }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchBar);
