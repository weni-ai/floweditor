import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bool, snakify, debounce } from 'utils';
import styles from './TembaSelect.module.scss';
import { Assets, AssetStore } from 'store/flowContext';

import {
  unnnicSelect,
  unnnicInput,
  unnnicTag,
  unnnicAutocompleteSelect
  // @ts-ignore
} from '@weni/unnnic-system';
import { applyVueInReact } from 'vuereact-combined';
import axios from 'axios';
import AppState from '../store/state';
import {
  CompletionOption,
  CompletionSchema,
  executeCompletionQuery,
  updateInputElementWithCompletion
} from '../utils/completion/helper';

const ElUnnnicSelect = applyVueInReact(unnnicSelect);
const ElUnnnicInput = applyVueInReact(unnnicInput);
const ElUnnnicTag = applyVueInReact(unnnicTag);
const ElUnnnicAutocompleteSelect = applyVueInReact(unnnicAutocompleteSelect);

export enum TembaSelectStyle {
  small = 'sm',
  normal = 'md'
}

export interface TembaSelectProps {
  name: string;
  options?: any[];
  value: any;
  onChange: (option: any) => void;
  onFocus?: () => void;
  shouldExclude?: (option: any) => boolean;
  disabled?: boolean;

  createPrefix?: string;
  expressions?: boolean;
  assets?: Assets;
  errors?: string[];
  style?: TembaSelectStyle;
  endpoint?: string;

  placeholder?: string;
  searchable?: boolean;
  multi?: boolean;
  tags?: boolean;

  cacheKey?: string;

  getName?: (option: any) => string;

  createArbitraryOption?: (input: string) => any;

  nameKey?: string;
  valueKey?: string;

  sortFunction?(a: any, b: any): number;

  hideError?: boolean;

  clearable?: boolean;

  queryParam?: string;

  assetStore: AssetStore;
}

interface TembaSelectState {
  expressionInput?: string;
  availableOptions?: any[];
  expressionsData?: {
    functions?: CompletionOption[];
    context?: CompletionSchema;
  };
  showingExpressionsSelection: boolean;
  availableExpressions?: CompletionOption[];
  currentQuery?: string;
}

export class TembaSelect extends React.Component<TembaSelectProps, TembaSelectState> {
  private selectInputRef: HTMLElement;

  constructor(props: TembaSelectProps) {
    super(props);

    this.state = {
      showingExpressionsSelection: false
    };

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public getName(option: any): string {
    let name = '';
    if (this.props.getName) {
      name = this.props.getName(option);
    }

    if (!name && this.props.nameKey in option) {
      name = option[this.props.nameKey];
    }

    if (!name && 'label' in option) {
      name = option['label'];
    }

    if (!name) {
      name = option['name'];
    }
    return name;
  }

  public getValue(option: any): string {
    return option[this.props.valueKey || 'value'] || this.getName(option);
  }

  public isMatch(a: any, b: any): boolean {
    if (a && b) {
      if (Array.isArray(a)) {
        return a.find((option: any) => this.getValue(option) === this.getValue(b));
      } else {
        return this.getValue(a) === this.getValue(b);
      }
    }
    return false;
  }

  public componentDidUpdate(prevProps: TembaSelectProps): void {
    if (this.props.options !== prevProps.options) {
      this.setAvailableOptions(this.props.options || []);
    }
  }

  private async fetchOptions(query?: string) {
    let endpoint = this.props.assets ? this.props.assets.endpoint : this.props.endpoint;

    if (endpoint) {
      // TODO: handle search from endpoint
      if (this.props.queryParam) {
        if (endpoint.indexOf('?') > -1) {
          endpoint += '&';
        } else {
          endpoint += '?';
        }

        endpoint += this.props.queryParam + '=' + encodeURIComponent(query || '');
      }
      const { data } = await axios.get(endpoint);

      this.setAvailableOptions(data.results);
    }
  }

  private async fetchExpressions() {
    let endpoint = this.props.assetStore.completion.endpoint;

    if (endpoint) {
      const { data } = await axios.get(endpoint);
      this.setState({ expressionsData: data });
    }
  }

  private setAvailableOptions(options: any[]) {
    this.setState({ availableOptions: options });
  }

  private handleSelectChange(event: any): void {
    let resolved = event;

    if (!this.props.assets && !this.props.tags && !this.props.endpoint) {
      resolved = event.map((op: any) => {
        const result = (this.state.availableOptions || []).find((option: any) => {
          let value1 = this.getValue(option);
          let value2 = this.getValue(op);
          if (value1 && value2) {
            return value1 === value2;
          } else {
            return option === op;
          }
        });
        if (!result && this.props.createPrefix) {
          return op;
        }
        return result;
      });

      resolved.forEach((option: any) => {
        if (!option) {
          throw new Error('No option found for selection');
        }
      });
    }

    if (this.props.onChange) {
      if (this.props.multi) {
        this.props.onChange(resolved);
      } else {
        this.props.onChange(resolved[0]);
      }
    }
  }

  private handleTagCreation(event: any) {
    if (!event || !event.trim()) {
      return;
    }

    const select = this;
    // add the option to create groups abitrarily
    if (this.props.createPrefix && event.indexOf('@') === -1) {
      var existing = this.props.options.find(function(option: any) {
        const name = select.getName(option);
        return !!(name.toLowerCase().trim() === event.toLowerCase().trim());
      });

      if (!existing) {
        let newOption: any;

        if (this.props.createArbitraryOption) {
          newOption = this.props.createArbitraryOption(event);
          newOption.arbitrary = true;
          this.addSelection(newOption);
          return;
        }

        this.addSelection({
          prefix: this.props.createPrefix,
          name: event,
          id: 'created',
          post: true
        });
        return;
      }
    }

    this.addSelection({ name: event, value: event });
  }

  handleSearch(event: string) {
    if (this.props.expressions && event.indexOf('@') > -1) {
      this.setState({ showingExpressionsSelection: true });

      const inputEl = (this.selectInputRef as any).vueRef.$children[0].$children[0].$children[0]
        .$el;
      const result = executeCompletionQuery(
        inputEl,
        this.props.expressions,
        this.state.expressionsData.functions,
        this.state.expressionsData.context
      );

      const availableExpressions = result.options.map((option: CompletionOption) => {
        if (option.signature) {
          return { ...option, name: `ƒ ${option.signature}`, value: option.signature };
        }

        return { ...option, value: option.name };
      });

      const hasExpressions = availableExpressions.length > 0;

      this.setState({
        availableExpressions,
        currentQuery: result.query,
        showingExpressionsSelection: hasExpressions
      });
    } else {
      this.setState({ showingExpressionsSelection: false });
      this.fetchOptions(event);
    }
  }

  private handleExpressionInput(event: any) {
    // Always get the last value, in the case of a multiple select event
    const option = event[event.length - 1];
    const inputEl = (this.selectInputRef as any).vueRef.$children[0].$children[0].$children[0].$el;
    updateInputElementWithCompletion(this.state.currentQuery, inputEl, option);

    if (!this.props.tags && !this.props.createPrefix) {
      const expression = {
        name: inputEl.value,
        value: inputEl.value,
        expression: true
      };

      this.addSelection(expression);
    }

    this.setState({
      currentQuery: null,
      showingExpressionsSelection: false,
      availableExpressions: []
    });
  }

  private addSelection(newValue: any) {
    // TODO: careful with mutating this.props.value here
    let values = this.props.value || [];

    if (values && values.length) {
      const hasSelection = values.find((v: any) => this.getValue(v) === this.getValue(newValue));
      if (hasSelection) return;

      values.push(newValue);
    } else {
      values = [newValue];
    }

    if (this.props.onChange) {
      if (this.props.multi) {
        this.props.onChange(values);
      } else {
        this.props.onChange(values[0]);
      }
    }
  }

  private handleSelectedDelete(event: any) {
    const values = Array.isArray(this.props.value) ? this.props.value : [this.props.value];

    const index = values.findIndex((element: any) => this.getValue(element) === event);

    values.splice(index, 1);

    if (this.props.onChange) {
      this.props.onChange(values);
    }
  }

  public async componentDidMount(): Promise<void> {
    if (this.props.options && this.props.options.length) {
      this.setAvailableOptions(this.props.options);
    } else {
      this.fetchOptions();
    }

    if (this.props.expressions) {
      this.fetchExpressions();
    }
  }

  public render(): JSX.Element {
    let selectedArray: any[] = [];
    if (this.props.value && !Array.isArray(this.props.value)) {
      selectedArray = [this.props.value];
    } else if (Array.isArray(this.props.value)) {
      selectedArray = this.props.value;
    }

    const isTagComponent = !!this.props.tags || !!this.props.createPrefix;
    const isMultiComponent = !!this.props.multi;

    return (
      <>
        <ElUnnnicAutocompleteSelect
          ref={(ele: any) => {
            this.selectInputRef = ele;
          }}
          value={selectedArray}
          on={{
            input: this.state.showingExpressionsSelection
              ? this.handleExpressionInput
              : this.handleSelectChange,
            'tag-create': this.handleTagCreation,
            search: this.handleSearch
          }}
          placeholder={this.props.placeholder}
          size={this.props.style || TembaSelectStyle.small}
          disabled={this.props.disabled}
          items={
            (this.state.showingExpressionsSelection
              ? this.state.availableExpressions
              : this.state.availableOptions) || []
          }
          textKey={this.props.nameKey || 'name'}
          valueKey={
            (this.state.showingExpressionsSelection ? 'value' : this.props.valueKey) || 'value'
          }
          descriptionKey={this.state.showingExpressionsSelection ? 'summary' : ''}
          closeOnSelect={true}
          multi={isMultiComponent}
          tag={isTagComponent && !this.state.showingExpressionsSelection}
          tagCreateLabel={this.props.createPrefix || ''}
          showValue={!isTagComponent && !isMultiComponent}
          hasIconRight={isTagComponent}
          hasIconLeft={!isTagComponent}
        />

        {isTagComponent || isMultiComponent ? (
          <div className={styles['selected-list-container']}>
            {selectedArray.map((selected, index) => {
              return (
                <ElUnnnicTag
                  key={index}
                  text={this.getName(selected)}
                  scheme="neutral-dark"
                  hasCloseIcon={true}
                  on={{
                    close: () => this.handleSelectedDelete(this.getValue(selected))
                  }}
                />
              );
            })}
          </div>
        ) : null}
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
)(TembaSelect);
