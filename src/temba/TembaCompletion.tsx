import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
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
import { unnnicAutocomplete } from '@weni/unnnic-system';

const UnnnicAutocomplete = applyVueInReact(unnnicAutocomplete);

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
  options: CompletionOption[];
  expressionsData?: {
    functions?: CompletionOption[];
    context?: CompletionSchema;
  };
}

export class TembaCompletion extends React.Component<TembaCompletionProps, TembaCompletionState> {
  private refInput: HTMLElement;

  constructor(props: TembaCompletionProps) {
    super(props);

    this.state = {
      query: '',
      options: []
    };

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public async componentDidMount(): Promise<void> {
    this.fetchExpressions();
  }

  private async fetchExpressions() {
    let endpoint = this.props.assetStore.completion.endpoint;

    if (endpoint) {
      const { data } = await axios.get(endpoint);

      this.setState({ expressionsData: data });
    }
  }

  private executeQuery(ele: HTMLInputElement) {
    const result = executeCompletionQuery(
      ele,
      this.props.session,
      this.state.expressionsData.functions,
      this.state.expressionsData.context
    );

    this.setState({
      query: result.query,
      options: result.options
    });
  }

  private handleInput() {
    const ele = (this.refInput as any).vueRef.$el.querySelector('input') as HTMLInputElement;

    setTimeout(() => {
      this.props.onInput(ele.value);
    });

    this.executeQuery(ele);
  }

  private handleChoose(option: CompletionOption) {
    const ele = (this.refInput as any).vueRef.$el.querySelector('input') as HTMLInputElement;

    setTimeout(() => {
      ele.value = this.props.value;

      updateInputElementWithCompletion(this.state.query, ele, option);
    });
  }

  public render(): JSX.Element {
    return (
      <UnnnicAutocomplete
        ref={(ele: any) => {
          this.refInput = ele;
        }}
        value={this.props.value}
        on={{
          input: this.handleInput,
          choose: this.handleChoose
        }}
        data={this.state.options.map(option => {
          let text;

          if (option.signature) {
            const argStart = option.signature.indexOf('(');
            const name = option.signature.substr(0, argStart);
            const args = option.signature.substr(argStart);

            text = `ƒ ${name} (${args} ${option.summary})`;
          } else {
            text = `${option.name} (${option.summary})`;
          }

          return { type: 'option', text, value: option };
        })}
        label={this.props.label}
        placeholder={this.props.placeholder}
        size={this.props.size}
      />
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
