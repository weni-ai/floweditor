import * as React from 'react';
import styles from './Search.module.scss';
// @ts-ignore
import { unnnicIcon } from '@weni/unnnic-system';
import { applyVueInReact } from 'vuereact-combined';
import AppState from 'store/state';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  DispatchWithState,
  HandleSearchChange,
  handleSearchChange,
  onUpdateCanvasPositions
} from 'store/thunks';
import { RenderNodeMap, Search } from 'store/flowContext';
import Button, { ButtonTypes } from 'components/button/Button';
import TextInputElement from 'components/form/textinput/TextInputElement';

const UnnnicIcon = applyVueInReact(unnnicIcon, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      style: {
        all: '',
        display: 'inline-block'
      }
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
    return nodes.filter(item => {
      const nodeItem: any = item.data.node.actions;
      if (nodeItem.length > 0) {
        const selectedNode = document.getElementById(item.uuid);
        return selectedNode ? selectedNode.innerText.includes(value) : false;
      } else {
        return false;
      }
    });
  }

  private dragBackground() {
    const canvasBg = document.getElementById('panzoom');
    if (this.props.search.nodes[this.props.search.selected] && canvasBg) {
      const uuid = this.props.search.nodes[this.props.search.selected].uuid;
      const ui = this.props.search.nodes[this.props.search.selected].data.ui.position;
      const width = window.innerWidth / 2;
      const height = window.innerHeight / 2;
      canvasBg.style.transform = `matrix(1, 0, 0, 1, ${width - ui.left}, ${height - ui.top})`;
      this.applyFilter(uuid);
    }
  }

  private applyFilter(uuid: string) {
    const allNodes = this.getAllNodes();
    allNodes.forEach(item => {
      const node = document.getElementById(item.uuid);
      if (node) node.style.filter = 'none';
      console.log(item.uuid);
      if (item.uuid !== uuid && node && uuid !== 'remove') {
        console.log('entrou');
        node.style.filter = 'opacity(.4)';
      }
    });
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
            this.props.search.selected < this.props.search.nodes.length - 1
              ? this.props.search.selected + 1
              : this.props.search.nodes.length - 1
        });
        break;
    }
    this.dragBackground();
  }

  private closeSearch() {
    this.props.handleSearchChange({
      active: false,
      value: this.props.search.value,
      nodes: this.props.search.nodes,
      selected: 0
    });
    this.applyFilter('remove');
  }

  public render(): JSX.Element {
    return (
      <div className={styles.search_card}>
        <div className={styles.icon}>
          <UnnnicIcon icon="search-1" size="avatar-nano" scheme="neutral-dark" />
        </div>

        <div className={styles.input}>
          <TextInputElement
            name={''}
            placeholder={''}
            entry={{ value: this.props.search.value }}
            onChange={value => this.handleInput(value)}
            autocomplete={true}
          />
        </div>
        <div className={styles.buttons}>
          <div className={styles.button}>
            <Button
              name={''}
              onClick={() => this.toggleMoveSelected('down')}
              type={ButtonTypes.ghost}
              iconName="arrow-button-down-1"
              size="small"
              disabled={!this.props.search.value.length}
            />
          </div>
          <div>
            <Button
              name={''}
              onClick={() => this.toggleMoveSelected('up')}
              type={ButtonTypes.ghost}
              iconName="arrow-button-up-1"
              size="small"
              disabled={!this.props.search.value.length}
            />
          </div>
        </div>
        <span className={styles.number}>
          {this.props.search.value.length && this.props.search.nodes.length ? (
            <>
              {this.props.search.selected + 1}/{this.props.search.nodes.length}
            </>
          ) : (
            <>0/0</>
          )}
        </span>
        <Button
          name={''}
          onClick={() => this.closeSearch()}
          type={ButtonTypes.ghost}
          iconName="close-1"
          size="small"
          leftSpacing={true}
        />
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
  bindActionCreators({ handleSearchChange, onUpdateCanvasPositions }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchBar);
