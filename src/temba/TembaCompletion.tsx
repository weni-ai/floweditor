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

import { applyVueInReact } from 'vuereact-combined';

// @ts-ignore
import { unnnicAutocompleteSelect } from '@weni/unnnic-system';

const UnnnicAutocompleteSelect = applyVueInReact(unnnicAutocompleteSelect);

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
}

interface TembaCompletionState {
  query: string;
  options: ValuedCompletionOption[];
  expressionsData?: {
    functions?: CompletionOption[];
    context?: CompletionSchema;
  };
  showExpressionsMenu: boolean;
}

export class TembaCompletion extends React.Component<TembaCompletionProps, TembaCompletionState> {
  private refInput: HTMLElement;

  constructor(props: TembaCompletionProps) {
    super(props);

    this.state = {
      query: '',
      options: [],
      showExpressionsMenu: true
    };

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public async componentDidMount(): Promise<void> {
    this.setState({ showExpressionsMenu: false });
    this.fetchExpressions();

    if (this.props.value) {
      const inputEl = (this.refInput as any).vueRef.$el.querySelector('input') as HTMLInputElement;
      inputEl.value = this.props.value;
      inputEl.dispatchEvent(new Event('input'));
    }
    setTimeout(() => this.setState({ showExpressionsMenu: true }));
  }

  private async fetchExpressions() {
    let endpoint = this.props.assetStore.completion.endpoint;

    if (endpoint) {
      const { data } = await axios.get(endpoint);

      this.setState({ expressionsData: data });
    }
  }

  private executeQuery(ele: HTMLInputElement) {
    if (this.state.expressionsData) {
      const result = executeCompletionQuery(
        ele,
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

      this.setState({
        query: result.query,
        options: expressions
      });
    }
  }

  private handleInput(event: any[]) {
    const expression = event[0];
    const inputEl = (this.refInput as any).vueRef.$el.querySelector('input') as HTMLInputElement;
    updateInputElementWithCompletion(this.state.query, inputEl, expression);

    this.setState({
      query: null,
      options: []
    });

    if (this.props.onInput) {
      this.props.onInput(inputEl.value);
    }
  }

  private handleSearch(event: string) {
    if (!event || !event.trim()) {
      this.setState({ showExpressionsMenu: false, options: [] });
      return;
    }

    this.setState({ showExpressionsMenu: true });
    const ele = (this.refInput as any).vueRef.$el.querySelector('input') as HTMLInputElement;
    this.executeQuery(ele);

    if (this.props.onInput) {
      this.props.onInput(event);
    }
  }

  public render(): JSX.Element {
    return (
      <>
        {this.props.label && <span className={styles.label}>{this.props.label}</span>}
        <UnnnicAutocompleteSelect
          className={styles.completion}
          ref={(ele: any) => {
            this.refInput = ele;
          }}
          value={[this.props.value]}
          on={{
            input: this.handleInput,
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
          showMenu={this.state.showExpressionsMenu}
        />
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
