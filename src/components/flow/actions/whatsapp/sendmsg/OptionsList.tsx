import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import styles from './OptionsList.module.scss';
import i18n from 'config/i18n';
import TextInputElement, { TextInputSizes } from '../../../../form/textinput/TextInputElement';
import ContentCollapse from '../../../../contentcollapse/ContentCollapse';

import { applyVueInReact } from 'vuereact-combined';
// @ts-ignore
import { unnnicIcon, unnnicButton } from '@weni/unnnic-system';
import { SortEnd, SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { WhatsAppListItem } from './SendWhatsAppMsgForm';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import update from 'immutability-helper';
import { FormEntry, StringEntry, ValidationFailure } from '../../../../../store/nodeEditor';

const UnnnicButton = applyVueInReact(unnnicButton);

const UnnnicIcon = applyVueInReact(unnnicIcon, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      'data-draggable': 'true',
      style: {
        all: '',
        height: '20px',
        padding: '4px'
      }
    }
  }
});

export interface OptionsListProps {
  listTitle: StringEntry;
  listFooter: StringEntry;
  options: FormEntry<WhatsAppListItem[]>;
  onOptionsUpdated(options: WhatsAppListItem[]): void;
  onOptionRemoval(option: WhatsAppListItem): void;
  onListTitleUpdated(title: string): void;
  onListFooterUpdated(footer: string): void;
}

export function hasEmptyListItem(listItems: WhatsAppListItem[]): boolean {
  return listItems.find((item: WhatsAppListItem) => item.title.trim().length === 0) != null;
}

export default class OptionsList extends React.Component<OptionsListProps> {
  constructor(props: OptionsListProps) {
    super(props);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private handleListTitleUpdate(listTitle: string): void {
    this.props.onListTitleUpdated(listTitle);
  }

  private handleListFooterUpdate(listFooter: string): void {
    this.props.onListFooterUpdated(listFooter);
  }

  private handleListItemTitleUpdate(value: string, name: string, index: number): void {
    // should update name but keep the description intact
    const listItems = update(this.props.options.value, {
      [index]: {
        $merge: {
          title: value
        }
      }
    }) as WhatsAppListItem[];

    this.props.onOptionsUpdated(listItems);
  }

  private handleListItemDescriptionUpdate(value: string, name: string, index: number): void {
    //should update description but keep the name intact
    const listItems = update(this.props.options.value, {
      [index]: {
        $merge: {
          description: value
        }
      }
    }) as WhatsAppListItem[];

    return this.props.onOptionsUpdated(listItems);
  }

  private handleListItemRemoval(item: WhatsAppListItem): void {
    const listItems = this.props.options.value;
    if (listItems.indexOf(item) === listItems.length - 1 && hasEmptyListItem(listItems)) {
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
      newIndex === options.length - 1 ? newIndex - 1 : newIndex
    ) as WhatsAppListItem[];

    this.props.onOptionsUpdated(listItems);
  }

  private sortableListItem = SortableElement(({ value: row, index }: any) => {
    const listItem = row.item as WhatsAppListItem;
    return (
      <div className={styles.list_item_wrapper} key={listItem.uuid}>
        <UnnnicIcon
          className={styles.drag_handle}
          icon="drag_indicator"
          size="sm"
          scheme="neutral-cloudy"
          clickable
          data-draggable={true}
        />

        <div className={styles.list_item_inputs}>
          <TextInputElement
            placeholder={i18n.t('forms.title', 'Title')}
            name={i18n.t('forms.title', 'Title')}
            size={TextInputSizes.md}
            onChange={(value, name) => this.handleListItemTitleUpdate(value, name, index)}
            entry={{ value: listItem.title }}
            autocomplete={true}
            showLabel={true}
            maxLength={72}
          />

          <TextInputElement
            placeholder={i18n.t('forms.description', 'Description')}
            name={i18n.t('forms.description_optional', 'Description (Optional)')}
            size={TextInputSizes.md}
            onChange={(value, name) => this.handleListItemDescriptionUpdate(value, name, index)}
            entry={{ value: listItem.description }}
            autocomplete={true}
            showLabel={true}
            maxLength={72}
          />
        </div>

        <UnnnicButton
          data-testid="Remove"
          iconCenter="delete"
          size="small"
          type="tertiary"
          onClick={() => this.handleListItemRemoval(listItem)}
        />
      </div>
    );
  });

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
                  exitActive: styles.list_item_exit_active
                }}
              >
                <this.sortableListItem
                  key={value.uuid}
                  index={index}
                  value={{ item: value }}
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
    }
  );

  public render(): JSX.Element {
    const hasError =
      this.props.options.validationFailures && this.props.options.validationFailures.length > 0;

    return (
      <div className={styles.list_wrapper}>
        <div className={styles.list_inputs}>
          <TextInputElement
            placeholder={i18n.t('forms.title', 'Title')}
            name={i18n.t('forms.list_title', 'List title (optional)')}
            size={TextInputSizes.md}
            onChange={this.handleListTitleUpdate}
            entry={this.props.listTitle}
            autocomplete={true}
            showLabel={true}
            maxLength={60}
          />

          <TextInputElement
            placeholder={i18n.t('forms.list_footer_text', 'List Footer text')}
            name={i18n.t('forms.list_footer', 'List Footer (optional)')}
            size={TextInputSizes.md}
            onChange={this.handleListFooterUpdate}
            entry={this.props.listFooter}
            autocomplete={true}
            showLabel={true}
            maxLength={72}
          />
        </div>

        <div>
          <ContentCollapse title={i18n.t('forms.list_options', 'List options')} hasError={hasError}>
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
          </ContentCollapse>

          {hasError ? (
            <div data-testid="Error message" className={styles.error_message}>
              {this.props.options.validationFailures.map(
                (error: ValidationFailure) => error.message
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
