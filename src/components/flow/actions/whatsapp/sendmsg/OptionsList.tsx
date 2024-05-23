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
import { MAX_LIST_ITEMS_COUNT, WhatsAppListItem } from './SendWhatsAppMsgForm';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import update from 'immutability-helper';
import {
  FormEntry,
  StringEntry,
  ValidationFailure,
} from '../../../../../store/nodeEditor';

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

export interface OptionsListProps {
  buttonText: StringEntry;
  options: FormEntry<WhatsAppListItem[]>;
  onOptionsUpdated(options: WhatsAppListItem[]): void;
  onOptionRemoval(option: WhatsAppListItem): void;
  onButtonTextUpdated(buttonText: string): void;
}

export function hasEmptyListItem(listItems: WhatsAppListItem[]): boolean {
  return (
    listItems.find(
      (item: WhatsAppListItem) => item.title.trim().length === 0,
    ) != null
  );
}

const SortableListItem = SortableElement(({ value: row, index }: any) => {
  const listItem = row.item as WhatsAppListItem;
  return (
    <ContentCollapse
      title={`${i18n.t('forms.list_option', 'Option')} ${index +
        1}/${MAX_LIST_ITEMS_COUNT}`}
      open={index === 0 && row.length === 1}
      titleIcon="check_circle"
      titleIconScheme={
        listItem.title.trim().length > 0 ? 'weni-600' : 'neutral-soft'
      }
    >
      <div className={styles.list_item_wrapper}>
        <TextInputElement
          placeholder={i18n.t('forms.title', 'Title')}
          name={i18n.t('forms.title', 'Title')}
          size={TextInputSizes.sm}
          onChange={(value, name) =>
            row.list.handleListItemTitleUpdate(value, name, index)
          }
          entry={{ value: listItem.title }}
          autocomplete={true}
          showLabel={true}
          maxLength={24}
        />

        <TextInputElement
          placeholder={i18n.t('forms.description', 'Description')}
          name={i18n.t('forms.description_optional', 'Description (Optional)')}
          size={TextInputSizes.sm}
          onChange={(value, name) =>
            row.list.handleListItemDescriptionUpdate(value, name, index)
          }
          entry={{ value: listItem.description }}
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
        />
      </div>
    </ContentCollapse>
  );
});

export default class OptionsList extends React.Component<OptionsListProps> {
  constructor(props: OptionsListProps) {
    super(props);

    bindCallbacks(this, {
      include: [/^on/, /^handle/],
    });
  }

  private handleButtonTextUpdate(buttonText: string): void {
    this.props.onButtonTextUpdated(buttonText);
  }

  private handleListItemTitleUpdate(
    value: string,
    name: string,
    index: number,
  ): void {
    // should update name but keep the description intact
    const listItems = update(this.props.options.value, {
      [index]: {
        $merge: {
          title: value,
        },
      },
    }) as WhatsAppListItem[];

    this.props.onOptionsUpdated(listItems);
  }

  private handleListItemDescriptionUpdate(
    value: string,
    name: string,
    index: number,
  ): void {
    //should update description but keep the name intact
    const listItems = update(this.props.options.value, {
      [index]: {
        $merge: {
          description: value,
        },
      },
    }) as WhatsAppListItem[];

    return this.props.onOptionsUpdated(listItems);
  }

  private handleListItemRemoval(item: WhatsAppListItem): void {
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
    ) as WhatsAppListItem[];

    this.props.onOptionsUpdated(listItems);
  }

  private sortableListOptions = SortableContainer(
    ({ items }: { items: WhatsAppListItem[]; shouldCancelStart: any }) => {
      return (
        <TransitionGroup className={styles.list_items}>
          {items.map((value: WhatsAppListItem, index: number) => {
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

        <div className={styles.list_inputs}>
          <TextInputElement
            placeholder={i18n.t(
              'forms.list_button_text_placeholder',
              'Action Button Text',
            )}
            name={i18n.t(
              'forms.list_button_text',
              'Action Button Text (optional)',
            )}
            size={TextInputSizes.sm}
            onChange={this.handleButtonTextUpdate}
            entry={this.props.buttonText}
            autocomplete={true}
            showLabel={true}
            maxLength={20}
          />
        </div>
      </div>
    );
  }
}
