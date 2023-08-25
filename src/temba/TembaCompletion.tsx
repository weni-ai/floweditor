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
  name: string;
  label?: string;
  placeholder?: string;
  size?: any;
  session?: boolean;
  value: string;
  onInput?: (value: string) => void;
  assetStore: AssetStore;
  type: string;
  errors?: string[];
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
  optionIndex: number;
}

export class TembaCompletion extends React.Component<TembaCompletionProps, TembaCompletionState> {
  private tembaCompletionRef: HTMLElement;
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
      showCompletionsMenu: true,
      optionIndex: 0
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
      document.addEventListener('mousedown', this.handleClickOutside);
      this.tembaCompletionRef.addEventListener('keydown', this.handleCompletionsKeyDown);
    }
  }

  public componentWillUnmount() {
    if (this.props.type === 'textarea') {
      const textAreaEl = (this.refTextArea as any).vueRef.$el.querySelector(
        'textarea'
      ) as HTMLInputElement;
      textAreaEl.removeEventListener('scroll', this.hideExpressionsMenu);
      document.removeEventListener('mousedown', this.handleClickOutside);
      this.tembaCompletionRef.removeEventListener('keydown', this.handleCompletionsKeyDown);
    }
  }

  public componentDidUpdate(
    prevProps: Readonly<TembaCompletionProps>,
    prevState: Readonly<TembaCompletionState>
  ): void {
    if (prevState.optionIndex !== this.state.optionIndex) {
      const completionList = this.completionsRef.current;
      const activeCompletion = completionList.querySelector(`.${styles.active}`);
      if (activeCompletion) {
        activeCompletion.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      }
    }
  }

  private async fetchExpressions() {
    let endpoint = this.props.assetStore.completion.endpoint;

    if (endpoint) {
      const { data } = await axios.get(endpoint);

      this.setState({ expressionsData: data });
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
    this.setState({ showCompletionsMenu: false, optionIndex: 0 });
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
    if (!event) {
      return;
    }

    const inputEl = (ref as any).vueRef.$el.querySelector(selector) as HTMLInputElement;

    if (event.value === this.state.query) {
      this.hideExpressionsMenu();
      inputEl.focus();
    } else {
      updateInputElementWithCompletion(this.state.query, inputEl, event);
      this.setState({ optionIndex: 0 });
    }

    if (this.props.onInput) {
      this.props.onInput(inputEl.value);
    }
  }

  private handleSearch(event: string) {
    if (!event || !event.trim()) {
      this.setState({ showCompletionsMenu: false, options: [] });

      if (this.props.onInput) {
        this.props.onInput(event);
      }
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
    const offset = caret.top + (caret.height || 0) - textAreaEl.scrollTop;
    this.setState({
      completionTopOffset: offset
    });

    if (this.props.onInput) {
      this.props.onInput(event);
    }
  }

  private moveFocusedOption(direction: number) {
    const newIndex = Math.max(
      Math.min(this.state.optionIndex + direction, this.state.options.length - 1),
      0
    );
    this.setState({
      optionIndex: newIndex
    });
  }

  private handleMouseMove(event: any) {
    if (Math.abs(event.movementX) + Math.abs(event.movementY) > 0) {
      const index = (event.currentTarget as HTMLElement).getAttribute('data-completion-index');
      this.setState({ optionIndex: parseInt(index) });
    }
  }

  private handleCompletionsKeyDown(event: any) {
    if (this.state.options.length !== 0) {
      if (event.key === 'Escape') {
        this.hideExpressionsMenu();
      } else if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        event.stopPropagation();
        this.handleInput(this.getCurrentOption(), this.refTextArea, 'textarea');
      } else if (event.key === 'ArrowDown') {
        this.moveFocusedOption(1);
        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === 'ArrowUp') {
        this.moveFocusedOption(-1);
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  private getCurrentOption(): ValuedCompletionOption {
    return this.state.options[this.state.optionIndex];
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
      >
        {this.state.options.map((option: ValuedCompletionOption, index: number) => (
          <div
            data-completion-index={index}
            className={
              styles.completion + ' ' + (index === this.state.optionIndex ? styles.active : '')
            }
            key={option.value}
            onClick={() => this.handleInput(option, this.refTextArea, 'textarea')}
            onMouseMove={this.handleMouseMove}
          >
            <span className={styles.name}>{option.name}</span>
            {option.summary && <span className={styles.summary}>{option.summary}</span>}
          </div>
        ))}
      </div>
    );

    const hasErrors = this.props.errors && this.props.errors.length > 0;
    return (
      <>
        <div
          ref={(ele: any) => {
            this.tembaCompletionRef = ele;
          }}
        >
          {this.props.label && <span className={styles.label}>{this.props.label}</span>}
          {this.props.type === 'textarea' ? (
            <div className={styles.textarea_wrapper}>
              <UnnnicTextArea
                data-testid={this.props.name}
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
                type={hasErrors ? 'error' : 'normal'}
                errors={this.props.errors}
              />

              {completionList}
            </div>
          ) : (
            <UnnnicAutocompleteSelect
              data-testid={this.props.name}
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
              type={hasErrors ? 'error' : 'normal'}
              message={this.props.errors && this.props.errors[0]}
            />
          )}
        </div>
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
