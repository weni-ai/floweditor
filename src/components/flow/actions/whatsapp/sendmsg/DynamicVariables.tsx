import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import styles from './OptionsList.module.scss';
import i18n from 'config/i18n';
import TextInputElement, {
  TextInputSizes,
} from '../../../../form/textinput/TextInputElement';
import ContentCollapse from '../../../../contentcollapse/ContentCollapse';

import { applyVueInReact } from 'vuereact-combined';
// @ts-ignore
import { unnnicButton } from '@weni/unnnic-system';
import {
  SortEnd,
  SortableContainer,
  SortableElement,
  arrayMove,
} from 'react-sortable-hoc';
import {
  DynamicVariablesListItem,
  MAX_LIST_ITEMS_COUNT,
} from './SendWhatsAppMsgForm';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import update from 'immutability-helper';
import { FormEntry, ValidationFailure } from '../../../../../store/nodeEditor';

const UnnnicButton = applyVueInReact(unnnicButton, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      style: {
        all: '',
      },
    },
  },
});

export interface DynamicListProps {
  options: FormEntry<DynamicVariablesListItem[]>;
  onOptionsUpdated(options: DynamicVariablesListItem[]): boolean;
  onOptionRemoval(option: DynamicVariablesListItem): boolean;
}

export function hasEmptyListItem(
  listItems: DynamicVariablesListItem[],
): boolean {
  return (
    listItems.find(
      (item: DynamicVariablesListItem) => item.value.trim().length === 0,
    ) != null
  );
}

const SortableListItem = SortableElement(({ value: row, index }: any) => {
  const listItem = row.item as DynamicVariablesListItem;
  return (
    <ContentCollapse
      title={`${i18n.t('forms.list_option', 'Option')} ${index +
        1}/${MAX_LIST_ITEMS_COUNT}`}
      open={
        (index === 0 && row.length === 1) || listItem.value.trim().length === 0
      }
      titleIcon="check_circle"
      titleIconScheme={
        listItem.value.trim().length > 0 ? 'weni-600' : 'neutral-soft'
      }
    >
      <div className={styles.list_item_wrapper}>
        <TextInputElement
          name={i18n.t('forms.description_optional', 'Description (Optional)')}
          placeholder={i18n.t(
            'forms.ex_citrus_and_sweet',
            'Ex: Citrus and sweet',
          )}
          size={TextInputSizes.sm}
          onChange={(value, name) =>
            row.list.handleListItemDescriptionUpdate(value, name, index)
          }
          entry={{ value: listItem.value }}
          autocomplete={true}
          showLabel={true}
          maxLength={72}
        />

        <UnnnicButton
          className={styles.list_item_remove}
          data-testid="Remove"
          iconLeft="do_not_disturb_on"
          text={i18n.t('forms.remove', 'Remove')}
          size="small"
          type="tertiary"
          onClick={() => row.list.handleListItemRemoval(listItem)}
          disabled={
            index === row.length - 1 && listItem.value.trim().length === 0
          }
        />
      </div>
    </ContentCollapse>
  );
});

export default class DynamicVariables extends React.Component<
  DynamicListProps
> {
  constructor(props: DynamicListProps) {
    super(props);

    bindCallbacks(this, {
      include: [/^on/, /^handle/],
    });
  }

  private handleListItemTitleUpdate(
    value: string,
    name: string,
    index: number,
  ): void {
    const listItems = update(this.props.options.value, {
      [index]: {
        $merge: {
          value: value,
        },
      },
    }) as DynamicVariablesListItem[];

    this.props.onOptionsUpdated(listItems);
  }

  private handleListItemDescriptionUpdate(
    value: string,
    name: string,
    index: number,
  ): boolean {
    //should update description but keep the name intact
    const listItems = update(this.props.options.value, {
      [index]: {
        $merge: {
          value: value,
        },
      },
    }) as DynamicVariablesListItem[];

    return this.props.onOptionsUpdated(listItems);
  }

  private handleListItemRemoval(item: DynamicVariablesListItem): void {
    const listItems = this.props.options.value;
    if (
      listItems.indexOf(item) === listItems.length - 1 &&
      hasEmptyListItem(listItems)
    ) {
      return;
    }

    this.props.onOptionRemoval(item);
  }

  /* istanbul ignore next */
  private handleListItemsSortEnd({ oldIndex, newIndex }: SortEnd): void {
    const options = this.props.options.value;
    const listItems = arrayMove(
      options,
      oldIndex,
      newIndex === options.length - 1 ? newIndex - 1 : newIndex,
    ) as DynamicVariablesListItem[];

    this.props.onOptionsUpdated(listItems);
  }

  private sortableListOptions = SortableContainer(
    ({
      items,
    }: {
      items: DynamicVariablesListItem[];
      shouldCancelStart: any;
    }) => {
      return (
        <TransitionGroup className={styles.list_items}>
          {items.map((value: DynamicVariablesListItem, index: number) => {
            return (
              <CSSTransition
                key={value.uuid}
                timeout={300}
                classNames={{
                  enter: styles.list_item_enter,
                  enterActive: styles.list_item_enter_active,
                  exit: styles.list_item_exit,
                  exitActive: styles.list_item_exit_active,
                }}
              >
                <SortableListItem
                  key={value.uuid}
                  index={index}
                  value={{ item: value, list: this, length: items.length }}
                  disabled={index === this.props.options.value.length - 1}
                  shouldCancelStart={
                    /* istanbul ignore next */
                    (e: any) => {
                      console.log(e);
                      return true;
                    }
                  }
                />
              </CSSTransition>
            );
          })}
        </TransitionGroup>
      );
    },
  );

  public render(): JSX.Element {
    const hasError =
      this.props.options.validationFailures &&
      this.props.options.validationFailures.length > 0;

    return (
      <div className={styles.list_wrapper}>
        <div>
          <span className={styles.options_label}>
            {i18n.t('forms.options_label', 'Add up to 10 options')}
          </span>

          <this.sortableListOptions
            items={this.props.options.value}
            onSortEnd={this.handleListItemsSortEnd}
            helperClass={styles.item_z_index}
            shouldCancelStart={
              /* istanbul ignore next */
              (e: React.MouseEvent<HTMLDivElement>) => {
                if (e.target.constructor.name === 'SVGSVGElement') {
                  return !(e.target as any).dataset.draggable;
                }

                if (!(e.target instanceof HTMLElement)) {
                  return true;
                }
                return !e.target.dataset.draggable;
              }
            }
            lockAxis="y"
          />

          {hasError ? (
            <div data-testid="Error message" className={styles.error_message}>
              {this.props.options.validationFailures.map(
                (error: ValidationFailure) => error.message,
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
