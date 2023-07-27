import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import styles from './TembaCompletion.module.scss';
import {
  updateInputElementWithCompletion,
  executeCompletionQuery,
  CompletionSchema,
  CompletionOption
} from '../utils/completion/helper';

import { AssetStore } from 'store/flowContext';

import AppState from '../store/state';

import axios from 'axios';
import { connect } from 'react-redux';

import getCaretCoordinates from './TextareaCaretPosition';
import { applyVueInReact } from 'vuereact-combined';

// @ts-ignore
import { unnnicAutocompleteSelect, unnnicTextArea } from '@weni/unnnic-system';
import { TembaStore } from '../temba-components';

const UnnnicAutocompleteSelect = applyVueInReact(unnnicAutocompleteSelect);
const UnnnicTextArea = applyVueInReact(unnnicTextArea);

interface ValuedCompletionOption extends CompletionOption {
  value: string;
}

export interface TembaCompletionProps {
  label?: string;
  placeholder?: string;
  size?: any;
  session?: boolean;
  value: string;
  onInput?: (value: string) => void;
  assetStore: AssetStore;
  type: string;
}

interface TembaCompletionState {
  query: string;
  options: ValuedCompletionOption[];
  expressionsData?: {
    functions?: CompletionOption[];
    context?: CompletionSchema;
  };
  showCompletionsMenu: boolean;
  completionTopOffset?: number;
}

export class TembaCompletion extends React.Component<TembaCompletionProps, TembaCompletionState> {
  private refInput: HTMLElement;
  private refTextArea: HTMLElement;
  completionsRef: React.RefObject<HTMLDivElement>;

  public static defaultProps = {
    type: 'input'
  };

  constructor(props: TembaCompletionProps) {
    super(props);

    this.state = {
      query: '',
      options: [],
      showCompletionsMenu: true
    };

    this.completionsRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.hideExpressionsMenu = this.hideExpressionsMenu.bind(this);

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public async componentDidMount(): Promise<void> {
    this.setState({ showCompletionsMenu: false });
    this.fetchExpressions();

    if (this.props.value && this.props.type === 'input') {
      const inputEl = (this.refInput as any).vueRef.$el.querySelector('input') as HTMLInputElement;
      inputEl.value = this.props.value;
      inputEl.dispatchEvent(new Event('input'));
      setTimeout(() => this.setState({ showCompletionsMenu: true }));
    }

    if (this.props.type === 'textarea') {
      const textAreaEl = (this.refTextArea as any).vueRef.$el.querySelector(
        'textarea'
      ) as HTMLInputElement;
      textAreaEl.addEventListener('scroll', this.hideExpressionsMenu);
      textAreaEl.addEventListener('keydown', this.handleTextAreaKeyDown);
      textAreaEl.addEventListener('keyup', this.handleTextAreaKeyUp);
      document.addEventListener('mousedown', this.handleClickOutside);
    }
  }

  private async fetchExpressions() {
    let endpoint = this.props.assetStore.completion.endpoint;

    if (endpoint) {
      const { data } = await axios.get(endpoint);

      this.setState({ expressionsData: data });
    }
  }

  public componentWillUnmount() {
    if (this.props.type === 'textarea') {
      const textAreaEl = (this.refTextArea as any).vueRef.$el.querySelector(
        'textarea'
      ) as HTMLInputElement;
      textAreaEl.removeEventListener('scroll', this.hideExpressionsMenu);
      textAreaEl.removeEventListener('keydown', this.handleTextAreaKeyDown);
      textAreaEl.removeEventListener('keyup', this.handleTextAreaKeyUp);
      document.removeEventListener('mousedown', this.handleClickOutside);
    }
  }

  private handleClickOutside(event: any) {
    if (
      this.completionsRef &&
      this.completionsRef.current &&
      !this.completionsRef.current.contains(event.target)
    ) {
      this.hideExpressionsMenu();
    }
  }

  private hideExpressionsMenu() {
    this.setState({ showCompletionsMenu: false });
  }

  private executeQuery(ele: HTMLInputElement) {
    if (this.state.expressionsData) {
      const store: TembaStore = document.querySelector('temba-store');
      const result = executeCompletionQuery(
        ele,
        store,
        this.props.session,
        this.state.expressionsData.functions,
        this.state.expressionsData.context
      );

      const expressions = result.options.map(
        (option: CompletionOption): ValuedCompletionOption => {
          if (option.signature) {
            return { ...option, name: `ƒ ${option.signature}`, value: option.signature };
          }

          return { ...option, value: option.name };
        }
      );

      if (expressions.length === 1 && result.query.startsWith(expressions[0].value)) {
        this.setState({
          query: null,
          options: []
        });
        return;
      }

      this.setState({
        query: result.query,
        options: expressions
      });
    }
  }

  private handleInput(event: ValuedCompletionOption, ref: HTMLElement, selector: string) {
    const inputEl = (ref as any).vueRef.$el.querySelector(selector) as HTMLInputElement;

    if (event.value === this.state.query) {
      this.hideExpressionsMenu();
      inputEl.focus();
    } else {
      updateInputElementWithCompletion(this.state.query, inputEl, event);
    }

    if (this.props.onInput) {
      this.props.onInput(inputEl.value);
    }
  }

  private handleSearch(event: string) {
    if (!event || !event.trim()) {
      this.setState({ showCompletionsMenu: false, options: [] });
      return;
    }

    this.setState({ showCompletionsMenu: true });
    const ele = (this.refInput as any).vueRef.$el.querySelector('input') as HTMLInputElement;
    this.executeQuery(ele);

    if (this.props.onInput) {
      this.props.onInput(event);
    }
  }

  private handleTextAreaInput(event: any) {
    this.setState({ showCompletionsMenu: true });

    const textAreaEl = (this.refTextArea as any).vueRef.$el.querySelector(
      'textarea'
    ) as HTMLInputElement;
    this.executeQuery(textAreaEl);

    const caret = getCaretCoordinates(textAreaEl, textAreaEl.selectionEnd);
    const offset = caret.top + caret.height - textAreaEl.scrollTop;
    this.setState({
      completionTopOffset: offset
    });

    if (this.props.onInput) {
      this.props.onInput(event);
    }
  }

  private handleTextAreaKeyDown(event: any) {
    const goToFirst = () => {
      const completionList = this.completionsRef.current.querySelectorAll(
        `.${styles.completion}`
      ) as NodeListOf<HTMLElement>;
      if (completionList.length > 0) {
        const nextCompletion = completionList[0];
        nextCompletion.tabIndex = 1;
        nextCompletion.focus();
      }
    };

    if (event.key === 'Tab') {
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      if (this.state.options.length > 0 && this.state.showCompletionsMenu) {
        event.preventDefault();
        goToFirst();
      }
    }
  }

  private handleTextAreaKeyUp(event: any) {
    if (event.key === 'Escape') {
      this.hideExpressionsMenu();
    }
  }

  private handleCompletionsKeyDown(event: any) {
    function goToPrevious() {
      const prevElement = event.target.previousSibling as HTMLElement;
      if (prevElement) {
        prevElement.tabIndex = 1;
        prevElement.focus();
      }
    }

    function goToNext() {
      const nextElement = event.target.nextSibling as HTMLElement;
      if (nextElement) {
        nextElement.tabIndex = 1;
        nextElement.focus();
      }
    }

    if (event.key === 'Tab') {
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      goToNext();
    } else if (event.key === 'ArrowUp') {
      goToPrevious();
    } else if (event.key !== 'Enter') {
      const textAreaEl = (this.refTextArea as any).vueRef.$el.querySelector(
        'textarea'
      ) as HTMLInputElement;
      textAreaEl.focus();
    }
  }

  private handleCompletionsKeyUp(event: any) {
    if (event.key === 'Escape') {
      this.hideExpressionsMenu();
    }
  }

  private handleSingleCompletionKeyUp(
    event: any,
    option: ValuedCompletionOption,
    ref: HTMLElement,
    selector: string
  ) {
    if (event.key === 'Enter' || event.key === 'Tab') {
      this.handleInput(option, ref, selector);
    }
  }

  public render(): JSX.Element {
    const completionList = (
      <div
        ref={this.completionsRef}
        className={styles.completions}
        style={{
          top: this.state.completionTopOffset,
          display:
            this.state.showCompletionsMenu && this.state.options.length !== 0 ? 'flex' : 'none'
        }}
        onKeyUp={this.handleCompletionsKeyUp}
        onKeyDown={this.handleCompletionsKeyDown}
      >
        {this.state.options.map((option: ValuedCompletionOption) => (
          <div
            className={styles.completion}
            key={option.value}
            onClick={() => this.handleInput(option, this.refTextArea, 'textarea')}
            onKeyUp={event =>
              this.handleSingleCompletionKeyUp(event, option, this.refTextArea, 'textarea')
            }
          >
            <span className={styles.name}>{option.name}</span>
            {option.summary && <span className={styles.summary}>{option.summary}</span>}
          </div>
        ))}
      </div>
    );
    return (
      <>
        {this.props.label && <span className={styles.label}>{this.props.label}</span>}
        {this.props.type === 'textarea' ? (
          <div className={styles.textarea_wrapper}>
            <UnnnicTextArea
              ref={(ele: any) => {
                this.refTextArea = ele;
              }}
              className={styles.textarea}
              value={this.props.value}
              on={{
                input: this.handleTextAreaInput
              }}
              placeholder={this.props.placeholder}
              size={this.props.size}
            />

            {completionList}
          </div>
        ) : (
          <UnnnicAutocompleteSelect
            className={styles.completionInput}
            ref={(ele: any) => {
              this.refInput = ele;
            }}
            value={[this.props.value]}
            on={{
              input: (event: any[]) => this.handleInput(event[0], this.refInput, 'input'),
              search: this.handleSearch
            }}
            placeholder={this.props.placeholder}
            size={this.props.size}
            items={this.state.options}
            textKey="name"
            valueKey="value"
            descriptionKey="summary"
            closeOnSelect={true}
            multi={false}
            hasIconLeft={false}
            hasIconRight={false}
            showMenu={this.state.showCompletionsMenu}
          />
        )}
      </>
    );
  }
}

/* istanbul ignore next */
const mapStateToProps = ({ flowContext: { assetStore } }: AppState) => ({
  assetStore
});

export default connect(
  mapStateToProps,
  null
)(TembaCompletion);
