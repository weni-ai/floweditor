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
  onUpdateCanvasPositions,
} from 'store/thunks';
import { RenderNodeMap, Search } from 'store/flowContext';
import TextInputElement from 'components/form/textinput/TextInputElement';
import i18n from 'config/i18n';
import ArrowButton from './components/ArrowButton';
import CloseButton from './components/CloseButton';

const UnnnicIcon = applyVueInReact(unnnicIcon, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      style: {
        all: '',
        display: 'inline-block',
      },
    },
  },
});
export interface SearchStoreProps {
  search?: Search;
  nodes?: RenderNodeMap;
  handleSearchChange?: HandleSearchChange;
}

export class SearchBar extends React.PureComponent<SearchStoreProps, {}> {
  public componentDidMount(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) =>
      this.handleWindowKeyDown(e),
    );
  }

  private handleWindowKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.toggleMoveSelected('down');
    }
  }

  private handleInput(value: string) {
    const nodes = this.findNodes(value);
    this.props.handleSearchChange({
      isSearchOpen: true,
      value: value,
      nodes: nodes,
      selected: 0,
    });
    this.dragBackground();
  }

  private getAllNodes() {
    return Object.entries(this.props.nodes).map(item => {
      return {
        uuid: item[0],
        data: item[1],
      };
    });
  }
  private findNodes(value: string) {
    const nodes = this.getAllNodes();
    return nodes.filter(item => {
      const nodeItem: any = item.data.node.actions;
      if (nodeItem.length > 0) {
        const selectedNode = document.getElementById(item.uuid);
        if (selectedNode) {
          this.highlightText(selectedNode, value);
        }
        return selectedNode
          ? selectedNode.innerText
              .toLocaleLowerCase()
              .includes(value.toLocaleLowerCase())
          : false;
      } else {
        return false;
      }
    });
  }

  private findParentsAndHighlightWord(
    rootElement: HTMLElement,
    searchWord: string,
  ) {
    const walker = document.createTreeWalker(
      rootElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (new RegExp(`\\b${searchWord}\\b`, 'gi').test(node.nodeValue)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        },
      },
    );

    let node;
    const parentElements: HTMLElement[] = [];

    while ((node = walker.nextNode())) {
      const parent = node.parentNode as HTMLElement;
      if (!parentElements.includes(parent)) {
        parentElements.push(parent);
      }

      const regex = new RegExp(`(\\b${searchWord}\\b)`, 'gi');
      const highlightedText = node.nodeValue.replace(
        regex,
        '<span class="highlight">$1</span>',
      );

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = highlightedText;

      while (tempDiv.firstChild) {
        parent.insertBefore(tempDiv.firstChild, node);
      }
      parent.removeChild(node);
    }

    return parentElements;
  }

  private highlightText(rootElement: HTMLElement, searchWord: string) {
    // Remove existing highlights
    this.removeHighlights(rootElement);

    // Add new highlights
    this.findParentsAndHighlightWord(rootElement, searchWord);

    const style = document.createElement('style');
    style.innerHTML = `
    .highlight {
        background-color: yellow; /* Change this to your desired highlight color */
    }
    `;
    document.head.appendChild(style);
  }

  private removeHighlights(rootElement: HTMLElement) {
    const highlightedElements = rootElement.querySelectorAll('.highlight');
    highlightedElements.forEach(element => {
      const parent = element.parentNode;
      parent.replaceChild(
        document.createTextNode(element.textContent),
        element,
      );
      parent.normalize();
    });
  }

  private dragBackground() {
    const { nodes, selected } = this.props.search;
    const canvasBg = document.getElementById('panzoom');
    if (nodes[selected] && canvasBg) {
      const uuid = nodes[selected].uuid;
      const ui = nodes[selected].data.ui.position;
      const width = window.innerWidth / 2;
      const height = window.innerHeight / 2;
      canvasBg.style.transform = `matrix(1, 0, 0, 1, ${width -
        ui.left}, ${height - ui.top})`;
      this.applyFilter(uuid);
    }
  }

  private applyFilter(uuid: string) {
    const allNodes = this.getAllNodes();
    allNodes.forEach(item => {
      const node = document.getElementById(item.uuid);
      if (node) {
        const titlebar = node.querySelector("[data-spec='titlebar'");
        node.style.filter = 'none';
        titlebar.classList.remove('Titlebar__filter');
        if (item.uuid !== uuid && uuid !== 'remove') {
          node.style.filter = 'opacity(.4)';
          titlebar.classList.remove(null);
          titlebar.classList.add('Titlebar__filter');
        }
      }
    });
  }

  private toggleMoveSelected(type: 'up' | 'down') {
    const { value, nodes, selected } = this.props.search;
    switch (type) {
      case 'up':
        if (selected === 0) {
          this.props.handleSearchChange({
            isSearchOpen: true,
            value: value,
            nodes: nodes,
            selected: nodes.length - 1,
          });
        } else {
          this.props.handleSearchChange({
            isSearchOpen: true,
            value: value,
            nodes: nodes,
            selected: selected - 1 < 0 ? 0 : selected - 1,
          });
        }
        break;
      case 'down':
        var down = selected - 1;
        if (down < 0) {
          down = 0;
        }
        if (selected + 1 === nodes.length) {
          this.props.handleSearchChange({
            isSearchOpen: true,
            value: value,
            nodes: nodes,
            selected: 0,
          });
        } else {
          this.props.handleSearchChange({
            isSearchOpen: true,
            value: value,
            nodes: nodes,
            selected:
              selected < nodes.length - 1 ? selected + 1 : nodes.length - 1,
          });
        }
        break;
    }
    this.dragBackground();
  }

  private closeSearch() {
    const { value, nodes } = this.props.search;
    this.props.handleSearchChange({
      isSearchOpen: false,
      value: value,
      nodes: nodes,
      selected: 0,
    });
    this.applyFilter('remove');
  }

  public render(): JSX.Element {
    const { value, nodes, selected } = this.props.search;
    return (
      <div className={styles.search_card}>
        <div className={styles.icon}>
          <UnnnicIcon
            icon="search-1"
            size="avatar-nano"
            scheme="neutral-dark"
          />
        </div>

        <div className={styles.input} id="searchBarInputElementDiv">
          <TextInputElement
            name={''}
            placeholder={i18n.t('actions.search')}
            entry={{ value: value }}
            onChange={value => this.handleInput(value)}
            autocomplete={true}
          />
        </div>
        <div className={styles.buttons}>
          <ArrowButton
            disabled={!nodes.length || !value.length}
            name={''}
            onClick={() => this.toggleMoveSelected('down')}
            iconName="down"
            size="sm"
          />

          <ArrowButton
            name={''}
            disabled={!nodes.length || !value.length}
            onClick={() => this.toggleMoveSelected('up')}
            iconName="up"
            size="sm"
          />
        </div>
        <span className={styles.number}>
          {value.length && nodes.length ? (
            <>
              {selected + 1}/{nodes.length}
            </>
          ) : (
            <>0/0</>
          )}
        </span>
        <div className={styles.close}>
          <CloseButton name={''} onClick={() => this.closeSearch()} size="sm" />
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ flowContext: { search, nodes } }: AppState) => {
  return {
    search,
    nodes,
  };
};

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
  bindActionCreators({ handleSearchChange, onUpdateCanvasPositions }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchBar);
