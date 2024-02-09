import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import styles from './QuickRepliesList.module.scss';
import i18n from 'config/i18n';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { SortEnd, SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';

import TextInputElement, { TextInputSizes } from '../../../../form/textinput/TextInputElement';
import update from 'immutability-helper';
import { applyVueInReact } from 'vuereact-combined';
// @ts-ignore
import { unnnicIcon, unnnicButton } from '@weni/unnnic-system';

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

export interface QuickRepliesListProps {
  quickReplies: string[];
  onQuickRepliesUpdated(quickReplies: string[]): void;
}

export function hasEmptyReply(replies: string[]): boolean {
  return replies.find((reply: string) => reply.trim().length === 0) != null;
}

export default class QuickRepliesList extends React.Component<QuickRepliesListProps> {
  constructor(props: QuickRepliesListProps) {
    super(props);

    this.state = {};

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private handleReplyUpdate(value: string, name: string, index: number): void {
    const quickReplies = update(this.props.quickReplies, {
      [index]: {
        $set: value
      }
    }) as string[];

    this.props.onQuickRepliesUpdated(quickReplies);
  }

  private handleReplyRemoval(index: number): void {
    const quickReplies = this.props.quickReplies.filter((item, i) => i !== index);
    this.props.onQuickRepliesUpdated(quickReplies);
  }

  /* istanbul ignore next */
  private handleRepliesSortEnd({ oldIndex, newIndex }: SortEnd): void {
    const quickReplies = arrayMove(this.props.quickReplies, oldIndex, newIndex);

    this.props.onQuickRepliesUpdated(quickReplies);
  }

  private sortableReply = SortableElement(({ value: row, index }: any) => {
    return (
      <div className={styles.reply_item_wrapper}>
        <div className={styles.drag_wrapper} data-draggable={true}>
          <UnnnicIcon
            className={styles.drag_handle}
            icon="drag_indicator"
            size="sm"
            scheme="neutral-cloudy"
            clickable
            data-draggable={true}
          />
        </div>

        <div className={styles.reply_item_input}>
          <TextInputElement
            placeholder={i18n.t('forms.reply', 'Reply')}
            name={i18n.t('forms.reply', 'Reply')}
            size={TextInputSizes.md}
            onChange={(value, name) => this.handleReplyUpdate(value, name, index)}
            entry={{ value: row.item }}
            autocomplete={true}
            showLabel={false}
            maxLength={20}
          />
        </div>

        <UnnnicButton
          data-testid="Remove"
          iconCenter="delete"
          size="small"
          type="tertiary"
          onClick={() => this.handleReplyRemoval(index)}
        />
      </div>
    );
  });

  private sortableReplies = SortableContainer(
    ({ items }: { items: string[]; shouldCancelStart: any }) => {
      return (
        <TransitionGroup className={styles.replies_items}>
          {items.map((value: string, index: number) => {
            return (
              <CSSTransition
                key={`reply-${index}}`}
                timeout={300}
                classNames={{
                  enter: styles.reply_item_enter,
                  enterActive: styles.reply_item_enter_active,
                  exit: styles.reply_item_exit,
                  exitActive: styles.reply_item_exit_active
                }}
              >
                <this.sortableReply
                  key={`reply-${index}}`}
                  index={index}
                  value={{ item: value }}
                  disabled={
                    index === this.props.quickReplies.length - 1 &&
                    hasEmptyReply(this.props.quickReplies)
                  }
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
    return (
      <>
        <span className={styles.replies_label}>
          {i18n.t('forms.replies_label', 'Add up to 3 replies')}
        </span>

        <this.sortableReplies
          items={this.props.quickReplies}
          onSortEnd={this.handleRepliesSortEnd}
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
      </>
    );
  }
}
