import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { bool, snakify, debounce } from 'utils';
import styles from './TembaSelect.module.scss';
import { Assets } from 'store/flowContext';

// @ts-ignore
import { unnnicSelect } from '@weni/unnnic-system';
// @ts-ignore
import { unnnicInput } from '@weni/unnnic-system';
// @ts-ignore
import { unnnicTag } from '@weni/unnnic-system';
// @ts-ignore
import { unnnicAutocomplete } from '@weni/unnnic-system';
import { applyVueInReact } from 'vuereact-combined';
import axios from 'axios';

const ElUnnnicSelect = applyVueInReact(unnnicSelect);
const ElUnnnicInput = applyVueInReact(unnnicInput);
const ElUnnnicTag = applyVueInReact(unnnicTag);
const ElUnnnicAutocomplete = applyVueInReact(unnnicAutocomplete);

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
}

interface TembaSelectState {
  currentTagInput?: string;
  expressionInput?: string;
  availableOptions?: any[];
  key: number;
}

const testeSearch = [
  { name: 'Teste1', id: 'fae05fb1-3021-4df2-a443-db8356b953fa', type: 'group', extra: 212 },
  { name: 'Teste2', id: '773fa0f6-dffd-4e7d-bcc1-e5709374354f', type: 'contact' }
];

export default class TembaSelect extends React.Component<TembaSelectProps, TembaSelectState> {
  constructor(props: TembaSelectProps) {
    super(props);

    this.state = {
      currentTagInput: undefined,
      key: 1
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

  private async fetchOptions() {
    let endpoint = this.props.assets ? this.props.assets.endpoint : this.props.endpoint;

    if (endpoint) {
      // TODO: handle search from endpoint
      if (this.props.queryParam) {
        if (endpoint.indexOf('?') > -1) {
          endpoint += '&';
        } else {
          endpoint += '?';
        }

        endpoint +=
          this.props.queryParam + '=' + encodeURIComponent(this.state.expressionInput || '');
      }
      const { data } = await axios.get(endpoint);

      this.setAvailableOptions(data.results);
    }
  }

  private setAvailableOptions(options: any[]) {
    const remmapedOptions = options.map((option: any) => {
      return { ...option, text: this.getName(option) };
    });

    this.setState({ availableOptions: remmapedOptions, key: this.state.key + 1 });
  }

  private handleSelectChange(event: any): void {
    // const values = event.target.values || [event.target.value];
    let values: any[] = this.props.value || [];

    if (this.state.availableOptions) {
      const newSelection = this.state.availableOptions.find(
        option => this.getValue(option) === event
      );

      if (this.props.multi && !values.includes(newSelection)) {
        values.push(newSelection);
      } else {
        values = [newSelection];
      }
    }

    let resolved = values;

    if (!this.props.assets && !this.props.tags && !this.props.endpoint) {
      resolved = values.map((op: any) => {
        const result = (this.props.options || []).find((option: any) => {
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

  private handleTagInputChange(event: any) {
    this.setState({ currentTagInput: event });
  }

  private handleTagCreation(event: any) {
    if (event.code === 'Enter') {
      if (!this.state.currentTagInput || !this.state.currentTagInput.trim()) {
        return;
      }

      const newValue = { name: this.state.currentTagInput, value: this.state.currentTagInput };
      this.addSelection(newValue);

      this.setState({ currentTagInput: undefined });
    }
  }

  private handleExpressionInput(event: any) {
    this.setState({ expressionInput: event });

    debounce(this.fetchOptions, 500, () => {
      this.fetchOptions();
    });
  }

  private handleAutoCompleteSelection(event: any) {
    this.addSelection(event);
    this.setState({ expressionInput: undefined });
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
    const values = this.props.value;

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
      await this.fetchOptions();
    }
  }

  // public isFocused(): boolean {
  //   return (this.selectbox as any).focused;
  // }

  public render(): JSX.Element {
    let selectedArray: any[] = [];
    let currentValue, valueLabel;
    if (this.props.value && !Array.isArray(this.props.value)) {
      selectedArray = [this.props.value];
      currentValue = this.getValue(this.props.value);
      valueLabel = this.props.value[this.props.nameKey || 'name'];
    } else if (Array.isArray(this.props.value)) {
      selectedArray = this.props.value;
    }

    const valuedOptions = this.state.availableOptions
      ? this.state.availableOptions.map((option: any) => {
          return { value: { ...option }, text: this.getName(option), type: 'option' };
        })
      : [];

    const isTagComponent = !!this.props.tags;
    const isMultiComponent = !!this.props.multi;
    const hasExpressionSupport = !!this.props.expressions;
    let selectInput: JSX.Element;

    if (isTagComponent) {
      selectInput = (
        <ElUnnnicInput
          value={this.state.currentTagInput}
          placeholder={this.props.placeholder}
          on={{
            input: this.handleTagInputChange,
            keyup: this.handleTagCreation
          }}
          iconRight="keyboard-return-1"
          size={this.props.style}
          disabled={this.props.disabled}
        />
      );
    } else if (hasExpressionSupport) {
      selectInput = (
        <ElUnnnicAutocomplete
          value={this.state.expressionInput}
          on={{ input: this.handleExpressionInput, choose: this.handleAutoCompleteSelection }}
          data={valuedOptions}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          iconRight="keyboard-return-1"
          openWithFocus={true}
        />
      );
    } else {
      selectInput = (
        <ElUnnnicSelect
          value={currentValue}
          valueLabel={valueLabel}
          on={{
            input: this.handleSelectChange
          }}
          placeholder={this.props.placeholder}
          search={this.props.searchable}
          size={this.props.style}
          disabled={this.props.disabled}
          key={this.state.key}
        >
          {this.state.availableOptions &&
            this.state.availableOptions.map((option, index) => {
              return (
                <option key={index} value={this.getValue(option)} label={this.getName(option)}>
                  {this.getName(option)}
                </option>
              );
            })}
        </ElUnnnicSelect>
      );
    }

    return (
      <>
        {selectInput}

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
