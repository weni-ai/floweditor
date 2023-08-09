import * as React from 'react';
import ReactDOM from 'react-dom';
import { createClickHandler } from 'utils';

import shared from 'components/shared.module.scss';
import styles from './TitleBar.module.scss';
import { fakePropType } from 'config/ConfigProvider';
import i18n from 'config/i18n';
import { applyVueInReact } from 'vuereact-combined';

// @ts-ignore
import { unnnicIcon, unnnicModalNext } from '@weni/unnnic-system';

export interface TitleBarProps {
  title: string;
  onRemoval(): any;
  __className?: string;
  showRemoval?: boolean;
  showMove?: boolean;
  onMoveUp?(event: React.MouseEvent<HTMLElement>): any;
  shouldCancelClick?: () => boolean;
  selected?: boolean;
  hasIssues?: boolean;
}

export const titlebarContainerSpecId = 'titlebar-container';
export const titlebarSpecId = 'titlebar';
export const moveIconSpecId = 'move-icon';
export const moveSpecId = 'move';
export const removeIconSpecId = 'remove-icon';
export const confirmationSpecId = 'confirmation';
export const confirmRemovalSpecId = 'confirm-removal';

/**
 * Simple title bar with confirmation removal
 */

const UnnnicIcon = applyVueInReact(unnnicIcon);
const UnnnicModalNext = applyVueInReact(unnnicModalNext, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      style: {
        all: '',
        position: 'relative',
        zIndex: 10e2
      }
    }
  }
});

export default class TitleBar extends React.Component<TitleBarProps> {
  public static contextTypes = {
    config: fakePropType
  };

  constructor(props: TitleBarProps) {
    super(props);

    this.handleConfirmRemoval = this.handleConfirmRemoval.bind(this);
  }

  public handleMouseUpCapture(event: React.MouseEvent<HTMLElement>): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  public handleConfirmRemoval(event: React.MouseEvent<HTMLElement>): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const div = document.createElement('div');
    document.body.appendChild(div);

    const { onRemoval } = this.props;

    ReactDOM.render(
      <UnnnicModalNext
        data-testid={confirmRemovalSpecId}
        type="alert"
        icon="alert-circle-1"
        scheme="feedback-yellow"
        title={i18n.t('removal_confirmation', 'Do you want to delete the card?')}
        actionPrimaryLabel={i18n.t('buttons.confirm', 'Confirm')}
        actionSecondaryLabel={i18n.t('buttons.cancel', 'Cancel')}
        actionPrimaryButtonType="secondary"
        showCloseButton
        $slots={{
          description: (
            <>
              {i18n.t(
                'removal_confirmation_description',
                'Are you sure you want to delete the card?'
              )}
              <br />
              {i18n.t('action_cannot_be_reversed', 'This action cannot be reversed.')}
            </>
          )
        }}
        on={{
          close() {
            ReactDOM.unmountComponentAtNode(div);
          },
          'click-action-primary': () => {
            onRemoval();
            ReactDOM.unmountComponentAtNode(div);
          }
        }}
      />,
      div
    );
  }

  private getMoveArrow(): JSX.Element {
    let moveArrow: JSX.Element = null;

    if (this.props.showMove && this.context.config.mutable) {
      moveArrow = (
        <div
          className={styles.up_button}
          {...createClickHandler(
            this.props.onMoveUp,
            this.props.shouldCancelClick,
            this.handleMouseUpCapture
          )}
          data-testid={moveIconSpecId}
        >
          <UnnnicIcon
            className={styles.up_button}
            data-spec={moveSpecId}
            icon="arrow-button-up-1"
            size="xs"
            scheme="neutral-darkest"
          />
        </div>
      );
    } else {
      moveArrow = <div className={styles.up_button} data-spec={moveSpecId} />;
    }

    return moveArrow;
  }

  private getRemove(): JSX.Element {
    const remove: JSX.Element = (
      <div
        className={styles.remove_button}
        {...createClickHandler(
          this.handleConfirmRemoval,
          this.props.shouldCancelClick,
          this.handleMouseUpCapture
        )}
        data-testid={removeIconSpecId}
      >
        <UnnnicIcon
          icon="close-1"
          size="xs"
          scheme={this.props.selected ? 'neutral-darkest' : 'neutral-snow'}
        />
      </div>
    );

    return remove;
  }

  public render(): JSX.Element {
    const moveArrow: JSX.Element = this.getMoveArrow();
    const remove: JSX.Element = this.getRemove();
    return (
      <div
        className={`${styles.titlebar} ${this.props.hasIssues ? shared.missing : null}`}
        data-spec={titlebarContainerSpecId}
      >
        <div
          className={`${styles.normal} ${this.props.__className} ${
            this.props.selected ? styles['selected'] : null
          }`}
          data-spec={titlebarSpecId}
        >
          {moveArrow}
          <div className={`${styles.titletext} u font secondary body-md bold`}>
            {this.props.title}
          </div>
          {remove}
        </div>
      </div>
    );
  }
}
