import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { debounce, snakify } from 'utils';
import styles from './TembaSelect.module.scss';
import { Assets } from 'store/flowContext';

import {
  unnnicTag,
  unnnicInput
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
import { TembaStore } from '../temba-components';
import i18n from 'config/i18n';
import SelectOptions from './SelectOptions';

const ElUnnnicTag = applyVueInReact(unnnicTag);
const UnnnicInput = applyVueInReact(unnnicInput);

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

  expressionsData: {
    functions: CompletionOption[];
    context: CompletionSchema;
  };
}

interface TembaSelectState {
  expressionInput?: string;
  availableOptions?: any[];
  showingExpressionsSelection: boolean;
  availableExpressions?: CompletionOption[];
  currentQuery?: string;
  selectKey: number;
  showOptions: boolean;
  input: string;
  fetchOnOpen?: boolean;
}

export class TembaSelect extends React.Component<TembaSelectProps, TembaSelectState> {
  private selectRef: HTMLElement;
  private selectInputRef: HTMLInputElement;

  constructor(props: TembaSelectProps) {
    super(props);

    this.state = {
      input: null,
      showingExpressionsSelection: false,
      availableOptions: [],
      availableExpressions: [],
      selectKey: 0,
      showOptions: false,
      currentQuery: ''
    };

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public async componentDidMount(): Promise<void> {
    if (this.props.options && this.props.options.length) {
      this.setAvailableOptions(this.props.options);
    }

    this.fetchOptions();

    const selectInputEl = this.getRefFromVueInputRef(this.selectInputRef);
    selectInputEl.addEventListener('keyup', this.handleInputKeyUp);
  }

  public componentDidUpdate(prevProps: TembaSelectProps, prevState: TembaSelectState): void {
    if (this.props.options !== prevProps.options) {
      this.setAvailableOptions(this.props.options || []);
    }

    if (this.state.showOptions && !prevState.showOptions && this.state.fetchOnOpen) {
      this.fetchOptions();
      this.setState({ fetchOnOpen: false });
    }
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
    if (!option) {
      if (this.props.clearable) {
        return 'None';
      }
      return null;
    }

    return option[this.props.valueKey || 'value'] || this.getName(option);
  }

  public valuedOption(option: any): any {
    if (!option) {
      return null;
    }

    if (option.value && option.label) {
      return option;
    }

    const newOption: any = { ...option };

    if (!option.label) {
      newOption.label = this.getName(option);
    }
    if (!option.value) {
      newOption.value = this.getValue(option);
    }

    return newOption;
  }

  public getValueAsArray(option: any): any[] {
    if (!option) {
      return [];
    }

    if (Array.isArray(option)) {
      return option.map((op: any) => this.valuedOption(op));
    }

    return [this.valuedOption(option)];
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

  private async fetchOptions(query?: string) {
    let url = this.props.assets ? this.props.assets.endpoint : this.props.endpoint;

    try {
      if (url) {
        if (this.props.queryParam) {
          if (url.indexOf('?') > -1) {
            url += '&';
          } else {
            url += '?';
          }

          url += this.props.queryParam + '=' + encodeURIComponent(query || '');
        }

        let options: any[] = [];
        let pageUrl = url;
        while (pageUrl) {
          const { data } = await axios.get(pageUrl);
          options = options.concat(data.results || []);
          pageUrl = data.next;
        }

        options = (this.props.options || []).concat(options || []);
        this.setAvailableOptions(options, query);
      } else {
        this.setAvailableOptions(this.props.options || [], query);
      }
    } catch (err) {
      this.setAvailableOptions(this.props.options || [], query);
    }
  }

  private setAvailableOptions(options: any[], filter?: string) {
    const nameKey = this.props.nameKey || 'name';
    const valueKey = this.props.valueKey || 'value';
    const remappedOptions = options.map((option: any) => {
      const newOption = { ...option, value: this.getValue(option) };
      if (!newOption[nameKey]) {
        newOption[nameKey] = this.getName(option);
      }
      if (!newOption[valueKey]) {
        newOption[valueKey] = this.getValue(option);
      }
      return newOption;
    });

    if (this.props.clearable) {
      const clearOption: any = {
        [nameKey]: i18n.t('forms.none', 'None'),
        [valueKey]: null,
        clear: true
      };
      remappedOptions.unshift(clearOption);
    }

    let filteredOptions = remappedOptions;

    if (filter && filter.trim()) {
      const loweredQuery = filter.toLowerCase();

      filteredOptions = options.filter((option: any) => {
        const name = this.getName(option).toLowerCase();
        return name.includes(loweredQuery);
      });
    }

    this.setState({
      availableOptions: filteredOptions,
      selectKey: this.state.selectKey + 1
    });
  }

  private handleTagCreation(event: any) {
    if (!event || !event.trim()) {
      return;
    }

    const select = this;
    // add the option to create groups arbitrarily
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
          this.setState({ fetchOnOpen: true }, () => {
            this.addSelection(newOption);
          });
          return;
        }

        this.setState({ fetchOnOpen: true }, () => {
          this.addSelection({
            prefix: this.props.createPrefix,
            name: event,
            id: 'created',
            post: true
          });
        });
        return;
      }
    }

    const selection: any = { name: event, value: event };
    if (event.indexOf('@') > -1) {
      selection.expression = true;
    }
    this.addSelection(selection);
  }

  private matchOption(options: any[], search: string) {
    const loweredSearch = search.toLowerCase();

    return options.some((option: any) => {
      const name = this.getName(option).toLowerCase();
      return name === loweredSearch;
    });
  }

  private getExpressionResult(inputElement: HTMLInputElement) {
    const store: TembaStore = document.querySelector('temba-store');
    return executeCompletionQuery(
      inputElement,
      store,
      this.props.expressions,
      this.props.expressionsData.functions,
      this.props.expressionsData.context
    );
  }

  handleSearch(event: string) {
    this.setState({ input: event });
    if (event === undefined || event === null) {
      this.setState({ availableExpressions: [], showOptions: false });
      return;
    }

    if (!event.trim()) {
      this.fetchOptions();
      this.setState({ availableExpressions: [], showOptions: true });
      return;
    }

    if (this.props.expressions && event.indexOf('@') > -1) {
      this.setState({ showOptions: false });

      const inputEl = this.getRefFromVueInputRef(this.selectInputRef);

      const result = this.getExpressionResult(inputEl);

      const availableExpressions = result.options.map((option: CompletionOption) => {
        if (option.signature) {
          return { ...option, name: `ƒ ${option.signature}`, value: option.signature };
        }

        return { ...option, value: option.name };
      });

      this.setState({
        availableExpressions,
        currentQuery: result.query
      });
    } else {
      this.setState({ availableExpressions: [], currentQuery: null, showOptions: true });
      debounce(this.fetchOptions, 300, async () => {
        await this.fetchOptions(event);

        if (this.props.createPrefix) {
          let match = this.matchOption(this.state.availableOptions, event);

          if (!match) {
            this.setState({
              availableExpressions: [],
              availableOptions: this.state.availableOptions.concat([
                {
                  [this.props.nameKey || 'name']: event,
                  [this.props.valueKey || 'value']: event,
                  arbitrary: true
                }
              ])
            });
          }
        }
      });
    }
  }

  private selectExpression(option: any) {
    const inputEl = this.getRefFromVueInputRef(this.selectInputRef);
    updateInputElementWithCompletion(this.state.currentQuery, inputEl, option);

    const selectedTheOnlyOne =
      this.state.availableExpressions.length === 1 &&
      this.state.currentQuery === this.state.availableExpressions[0].name;

    if ((!this.props.tags && !this.props.createPrefix) || selectedTheOnlyOne) {
      const expression = {
        name: inputEl.value,
        value: inputEl.value,
        expression: true
      };

      this.addSelection(expression);
    }

    this.setState({
      currentQuery: null,
      availableExpressions: []
    });
  }

  private addOrRemoveSelection(newValue: any) {
    if (newValue.arbitrary) {
      this.setState({ fetchOnOpen: true }, () => {
        this.addSelection(newValue);
        this.clearInputValue();
      });
      return;
    }

    const values = Array.isArray(this.props.value) ? [...this.props.value] : [this.props.value];

    if (values && values.length) {
      const hasSelection = values.find((v: any) => this.getValue(v) === this.getValue(newValue));
      if (hasSelection) {
        this.handleSelectedDelete(newValue);
      } else {
        this.addSelection(newValue);
      }
    } else {
      this.addSelection(newValue);
    }
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
    const values = Array.isArray(this.props.value) ? [...this.props.value] : [this.props.value];

    const index = values.findIndex(
      (element: any) => this.getValue(element) === this.getValue(event)
    );

    values.splice(index, 1);

    if (this.props.onChange) {
      this.props.onChange(values);
    }
  }

  private selectOption(selectedOption: any) {
    if (this.props.clearable && selectedOption.clear) {
      if (this.props.onChange) {
        this.props.onChange(undefined);
      }
      return;
    }

    let resolved = selectedOption;

    if (!this.props.assets && !this.props.tags && !this.props.endpoint) {
      const result = (this.state.availableOptions || []).find((option: any) => {
        let value1 = this.getValue(option);
        let value2 = this.getValue(selectedOption);
        if (value1 && value2) {
          return value1 === value2;
        } else {
          return option === selectedOption;
        }
      });
      if (!result && this.props.createPrefix) {
        resolved = selectedOption;
      }
      resolved = result;

      if (!resolved) {
        throw new Error('No option found for selection');
      }
    }

    if (this.props.multi) {
      this.addOrRemoveSelection(resolved);
      return;
    }

    if (this.props.onChange) {
      this.props.onChange(resolved);
    }

    if (this.props.createArbitraryOption && this.props.createPrefix) {
      this.setState({ fetchOnOpen: true });
    }

    this.setState({ showOptions: false });
    this.clearInputValue();
  }

  private handleInputFocus() {
    if (!this.state.showOptions) {
      if (this.props.onFocus) {
        this.props.onFocus();
      }
    }

    this.setState({ showOptions: !this.state.showOptions });
  }

  private handleInputKeyUp(event: any) {
    if (this.props.tags && !this.state.availableExpressions.length) {
      if (event.key === 'Enter') {
        this.handleTagCreation(event.target.value);
        this.clearInputValue();
      }
    } else if (this.props.multi && event.target.value.indexOf('@') > -1) {
      if (event.key === 'Enter') {
        const expressionResult = this.getExpressionResult(event.target);
        if (expressionResult.options.length <= 1) {
          this.handleTagCreation(event.target.value);
        }
      }
    }
  }

  private clearInputValue() {
    this.setState({ input: null });
    this.getRefFromVueInputRef(this.selectInputRef).blur();
  }

  private getRefFromVueInputRef(inputRef: HTMLInputElement) {
    return (inputRef as any).vueRef.$el.querySelector('input') as HTMLInputElement;
  }

  public render(): JSX.Element {
    let selectedArray: any[] = [];
    if (this.props.value && !Array.isArray(this.props.value)) {
      selectedArray = [this.props.value];
    } else if (Array.isArray(this.props.value)) {
      selectedArray = this.props.value;
    }
    const isMultiComponent = !!this.props.multi;
    const hasErrors = this.props.errors && this.props.errors.length > 0;

    let autocompletePlaceholder = this.props.placeholder;
    if (!this.props.tags && !isMultiComponent) {
      autocompletePlaceholder =
        selectedArray.length > 0 ? this.getName(selectedArray[0]) : this.props.placeholder;
    }

    let inputIcon = this.props.disabled
      ? 'arrow-button-down-1'
      : this.state.showOptions
      ? 'arrow-button-up-1'
      : 'arrow-button-down-1';
    if (this.props.tags) {
      inputIcon = 'keyboard-return-1';
    }

    return (
      <>
        <div
          ref={(ele: any) => {
            this.selectRef = ele;
          }}
          className={styles.select_wrapper}
          data-testid={`temba_select_${snakify(this.props.name)}`}
        >
          <UnnnicInput
            ref={(ele: any) => {
              this.selectInputRef = ele;
            }}
            data-testid={`temba_select_input_${snakify(this.props.name)}`}
            className={styles.bold_placeholder}
            value={this.state.input}
            on={{ input: this.handleSearch }}
            placeholder={autocompletePlaceholder}
            size={this.props.style || TembaSelectStyle.small}
            disabled={this.props.disabled}
            type={hasErrors ? 'error' : 'normal'}
            error={this.props.errors && this.props.errors[0]}
            onClick={this.handleInputFocus}
            iconRight={inputIcon}
            readonly={!this.props.searchable}
          />

          {this.selectRef && this.selectInputRef ? (
            <>
              <SelectOptions
                testId={`temba_select_options_${snakify(this.props.name)}`}
                options={this.state.availableOptions}
                selected={selectedArray}
                onBlur={() => this.setState({ showOptions: false })}
                onSelect={option => this.selectOption(option)}
                active={!this.props.disabled && this.state.showOptions}
                anchorRef={this.selectRef}
                inputRef={this.getRefFromVueInputRef(this.selectInputRef)}
                getName={option => this.getName(option)}
                getValue={option => this.getValue(option)}
                multi={isMultiComponent}
                createPrefix={this.props.createPrefix}
              />

              <SelectOptions
                testId={`temba_select_expressions_${snakify(this.props.name)}`}
                options={this.state.availableExpressions}
                onBlur={() => this.setState({ availableExpressions: [] })}
                onSelect={option => this.selectExpression(option)}
                active={!this.props.disabled && this.state.availableExpressions.length > 0}
                anchorRef={this.selectRef}
                inputRef={this.getRefFromVueInputRef(this.selectInputRef)}
                expressions={true}
              />
            </>
          ) : null}
        </div>

        {(this.props.tags || isMultiComponent) && selectedArray.length ? (
          <div className={styles['selected-list-container']}>
            {selectedArray.map((selected, index) => {
              return (
                <ElUnnnicTag
                  key={index}
                  text={this.getName(selected)}
                  scheme="neutral-dark"
                  hasCloseIcon={true}
                  on={{
                    close: () => this.handleSelectedDelete(selected)
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
  expressionsData: assetStore.completion.items as any
});

export default connect(
  mapStateToProps,
  null
)(TembaSelect);
