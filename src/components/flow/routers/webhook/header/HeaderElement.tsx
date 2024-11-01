import { react as bindCallbacks } from 'auto-bind';
import { getAllErrors } from 'components/flow/actions/helpers';
import { HeaderEntry } from 'components/flow/routers/webhook/WebhookRouterForm';
import styles from 'components/flow/routers/webhook/WebhookRouterForm.module.scss';
import FormElement from 'components/form/FormElement';
import TextInputElement from 'components/form/textinput/TextInputElement';
import * as React from 'react';
import { StringEntry, ValidationFailure } from 'store/nodeEditor';
import { HeaderName, validate } from 'store/validators';
import i18n from 'config/i18n';
import { applyVueInReact } from 'veaury';

// @ts-ignore
import Unnnic from '@weni/unnnic-system';

// TODO: move this into webhook router component
export interface Header {
  uuid: string;
  name: string;
  value: string;
}

export interface HeaderElementProps {
  entry: HeaderEntry;
  index: number;
  onRemove: (header: Header) => void;
  onChange: (header: Header, validationFailures: ValidationFailure[]) => void;
  empty?: boolean;
  canRemove?: boolean;
}

interface HeaderElementState {
  name: StringEntry;
  value: StringEntry;
  errors: string[];
}

export const headerContainerSpecId = 'header-container';
export const nameContainerSpecId = 'name-container';
export const valueConatainerSpecId = 'value-container';
export const removeIcoSpecId = 'remove-icon';

export const HEADER_NAME_ERROR = i18n.t(
  'errors.http_header_missing_name',
  'HTTP headers must have a name',
);
export const NAME_PLACEHOLDER = i18n.t('forms.ex_accept', 'Ex: Accept');
export const VALUE_PLACEHOLDER = i18n.t(
  'forms.ex_application_json',
  'Ex: application/json',
);

const UnnnicIcon = applyVueInReact(Unnnic.unnnicIcon);

export default class HeaderElement extends React.Component<
  HeaderElementProps,
  HeaderElementState
> {
  constructor(props: HeaderElementProps) {
    super(props);

    const header = this.props.entry.value;
    const name = header.name || '';
    const value = header.value || '';

    this.state = {
      name: { value: name },
      value: { value },
      errors: [],
    };

    bindCallbacks(this, {
      include: [/^on/, /^handle/],
    });
  }

  private getHeader(): Header {
    return {
      name: this.state.name.value,
      value: this.state.value.value,
      uuid: this.props.entry.value.uuid,
    };
  }

  private handleChangeName(value: string): void {
    const name = validate(i18n.t('forms.header_name', 'Header name'), value, [
      HeaderName,
    ]);

    const errors = getAllErrors(this.state.value)
      .concat(getAllErrors(name))
      .map(({ message }) => message);

    this.setState({ name: { value: name.value }, errors }, () =>
      this.props.onChange(
        this.getHeader(),
        getAllErrors(this.state.value).concat(getAllErrors(name)),
      ),
    );
  }

  private handleChangeValue(value: string): void {
    this.setState({ value: { value } }, () => {
      const name = validate(
        i18n.t('forms.header_name', 'Header name'),
        this.state.name.value,
        [HeaderName],
      );
      this.props.onChange(
        this.getHeader(),
        getAllErrors(this.state.value).concat(getAllErrors(name)),
      );
    });
  }

  private handleRemove(): void {
    this.props.onRemove(this.getHeader());
  }

  private getRemoveIco(): JSX.Element {
    return (
      <div className={styles.remove_icon}>
        {this.props.canRemove ? (
          <UnnnicIcon
            icon="delete-1-1"
            size="sm"
            scheme="neutral-cloudy"
            clickable
            onClick={this.handleRemove}
            data-spec={removeIcoSpecId}
            data-testid={removeIcoSpecId}
          />
        ) : null}
      </div>
    );
  }

  public render(): JSX.Element {
    const removeIco: JSX.Element = this.getRemoveIco();
    return (
      <FormElement
        name={i18n.t('forms.webhook_header', 'Header')}
        entry={this.props.entry}
      >
        <div className={styles.header} data-spec={headerContainerSpecId}>
          <div className={styles.header_name} data-spec={nameContainerSpecId}>
            <TextInputElement
              placeholder={NAME_PLACEHOLDER}
              name={NAME_PLACEHOLDER}
              onChange={this.handleChangeName}
              entry={this.state.name}
              error={
                this.state.errors.length
                  ? this.state.errors.join(', ')
                  : undefined
              }
            />
          </div>
          <div
            className={styles.header_value}
            data-spec={valueConatainerSpecId}
          >
            <TextInputElement
              placeholder={VALUE_PLACEHOLDER}
              name={VALUE_PLACEHOLDER}
              onChange={this.handleChangeValue}
              entry={this.state.value}
              autocomplete={true}
              error={this.state.errors.length ? '' : undefined}
            />
          </div>
          {removeIco}
        </div>
      </FormElement>
    );
  }
}
