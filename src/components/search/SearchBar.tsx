import * as React from 'react';
import styles from './Search.module.scss';
// @ts-ignore
import { unnnicInput, unnnicButtonIcon, unnnicButton } from '@weni/unnnic-system';
import { applyVueInReact } from 'vuereact-combined';
import AppState from 'store/state';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DispatchWithState, HandleSearchChange, handleSearchChange } from 'store/thunks';
import { RenderNodeMap, Search } from 'store/flowContext';

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
const UnnnicButton = applyVueInReact(unnnicButton, {
  vue: {
    componentWrapAttrs: {
      'unnnic-button': 'true'
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
      nodes: nodes,
      selected: 0
    });
    this.dragBackground();
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

  private dragBackground() {
    const element: HTMLElement | null = document.getElementById('canvas_background');
    element.style.backgroundPosition = '5000px 60px';
  }

  private toggleMoveSelected(type: 'up' | 'down') {
    switch (type) {
      case 'up':
        this.props.handleSearchChange({
          active: true,
          value: this.props.search.value,
          nodes: this.props.search.nodes,
          selected: this.props.search.selected - 1 < 0 ? 0 : this.props.search.selected - 1
        });
        break;
      case 'down':
        var down = this.props.search.selected - 1;
        if (down < 0) {
          down = 0;
        }
        this.props.handleSearchChange({
          active: true,
          value: this.props.search.value,
          nodes: this.props.search.nodes,
          selected:
            this.props.search.selected + 1 < this.props.search.nodes.length
              ? this.props.search.selected + 1
              : this.props.search.nodes.length
        });
        break;
    }
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
            <span className={styles.number}>
              {this.props.search.selected + 1} of {this.props.search.nodes.length}
            </span>
            <UnnnicButton
              iconLeft="arrow-button-down-1"
              size="small"
              className={styles.button}
              text=""
              type="primary"
              on={{ click: () => this.toggleMoveSelected('down') }}
            />
            <UnnnicButton
              iconLeft="arrow-button-up-1"
              size="small"
              className={styles.button}
              text=""
              type="primary"
              on={{ click: () => this.toggleMoveSelected('up') }}
            />
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
