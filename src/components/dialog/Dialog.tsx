import { react as bindCallbacks } from 'auto-bind';
import Button, { ButtonProps, ButtonTypes } from 'components/button/Button';
import * as React from 'react';
import { renderIf } from 'utils';
import { applyVueInReact } from 'vuereact-combined';

// @ts-ignore
import { unnnicTab } from '@weni/unnnic-system';

// @ts-ignore
import { unnnicIcon } from '@weni/unnnic-system';

import styles from './Dialog.module.scss';

import i18n from 'config/i18n';

export enum HeaderStyle {
  NORMAL = 'normal',
  BARBER = 'barber'
}

export interface ButtonSet {
  primary: ButtonProps;
  secondary?: ButtonProps;
  tertiary?: ButtonProps;
}

export interface Tab {
  name: string;
  body: JSX.Element;
  hasErrors?: boolean;
  icon?: string;
  checked?: boolean;
}

interface Buttons {
  leftButtons: JSX.Element[];
  rightButtons: JSX.Element[];
}

export interface DialogProps {
  title: string;
  subtitle?: string;
  headerIcon?: string;
  headerClass?: string;
  headerStyle?: HeaderStyle;
  buttons?: ButtonSet;
  gutter?: JSX.Element;
  noPadding?: boolean;
  tabs?: Tab[];
  className?: string;
  new?: boolean;
}

export interface DialogState {
  activeTab: number;
}

const UnnnicTab = applyVueInReact(unnnicTab);
const UnnnicIcon = applyVueInReact(unnnicIcon);

/**
 * A component that has a front and back and can flip back and forth between them
 */
export default class Dialog extends React.Component<DialogProps, DialogState> {
  private tabFocus: any = null;
  private primaryButton: any = null;

  constructor(props: DialogProps) {
    super(props);
    this.state = {
      activeTab: -1
    };

    bindCallbacks(this, {
      include: [/^handle/, /^get/]
    });
  }

  public showTab(index: number): void {
    this.setState({ activeTab: index });
  }

  private handlePrimaryButton(onClick: any): void {
    onClick();

    this.tabFocus = window.setTimeout(() => {
      let foundTab = false;
      // focus on a tab with errors
      (this.props.tabs || []).forEach((tab: Tab, index: number) => {
        if (tab.hasErrors) {
          this.setState({ activeTab: index });
          foundTab = true;
          return;
        }
      });

      if (!foundTab) {
        // or focus on the main content
        this.setState({ activeTab: -1 });
      }
    }, 0);
  }

  private handleKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && event.shiftKey) {
      if (this.primaryButton) {
        event.preventDefault();
        event.stopPropagation();
        (event.target as any).blur();
        this.primaryButton.click();
        (event.target as any).focus();
      } else {
        console.log('No primary button!');
      }
    }
  }

  public componentDidMount(): void {
    window.document.addEventListener('keydown', this.handleKey, {
      capture: true
    });
  }

  public componentWillUnmount(): void {
    window.clearTimeout(this.tabFocus);
    window.document.removeEventListener('keydown', this.handleKey, {
      capture: true
    });
  }

  private getButtons(): Buttons {
    const rightButtons: JSX.Element[] = [];
    const buttons = this.props.buttons || {
      primary: null,
      secondary: null,
      tertiary: null
    };

    if (buttons.secondary) {
      rightButtons.push(<Button key={0} type={ButtonTypes.ghost} {...buttons.secondary} />);
    }

    if (buttons.primary) {
      rightButtons.push(
        <Button
          key={'button_' + buttons.primary.name}
          onRef={(ref: any) => {
            if (ref) {
              this.primaryButton = ref.vueInstance.$el;
            }
          }}
          onClick={() => {
            this.handlePrimaryButton(buttons.primary.onClick);
          }}
          leftSpacing={true}
          name={buttons.primary.name}
          disabled={buttons.primary.disabled}
          type={ButtonTypes.primary}
        />
      );
    }

    const leftButtons: JSX.Element[] = [];

    // Our left most button if we have one
    if (buttons.tertiary) {
      leftButtons.push(<Button key={0} type={ButtonTypes.ghost} {...buttons.tertiary} />);
    }

    return {
      leftButtons,
      rightButtons
    };
  }

  public render(): JSX.Element {
    const headerClasses = [styles.header];

    if (this.state.activeTab > -1) {
      headerClasses.push(styles.clickable);
    }

    if (this.props.headerIcon) {
      headerClasses.push(styles.iconed);
    }

    if (this.props.headerStyle === HeaderStyle.BARBER) {
      headerClasses.push(styles.barber);
    }

    const activeClasses = [styles.dialog];
    const { leftButtons, rightButtons } = this.getButtons();

    if (this.props.className) {
      activeClasses.push(this.props.className);
    }

    return (
      <div className={activeClasses.join(' ')}>
        <div
          onClick={() => {
            this.setState({ activeTab: -1 });
          }}
          className={headerClasses.join(' ')}
        >
          {this.state.activeTab > -1 ? <div className={styles.header_overlay} /> : null}
          {renderIf(this.props.headerIcon !== undefined)(
            <span className={`${styles.header_icon} ${this.props.headerIcon}`} />
          )}
          <div className={styles.title_container}>
            <div className={`${styles.title} u font secondary title-sm black`}>
              {this.props.title}

              {this.props.new && <span className={styles.new}>{i18n.t('new', 'New')}!</span>}
            </div>
            <div className={styles.subtitle}>{this.props.subtitle}</div>
          </div>
        </div>
        <div className={this.props.noPadding ? '' : styles.content}>
          {(this.props.tabs || []).length > 0 ? (
            <UnnnicTab
              className={styles.tabs}
              size="sm"
              initialTab={String(this.state.activeTab + 1)}
              tabs={[
                '0',
                ...(this.props.tabs || []).map((tab: Tab, index: number) => String(index + 1))
              ]}
              $slots={(this.props.tabs || []).reduce(
                (tabs, currentTab: Tab, index: number) => ({
                  ...tabs,
                  [`tab-head-${index + 1}`]: (
                    <>
                      {currentTab.name}
                      {currentTab.checked ? (
                        <UnnnicIcon
                          icon="check-square-1"
                          size="sm"
                          scheme={
                            this.state.activeTab + 1 === index ? 'neutral-clean' : 'neutral-darkest'
                          }
                          className={styles.icon}
                        />
                      ) : null}
                    </>
                  )
                }),
                {
                  'tab-head-0': i18n.t('forms.general', 'General')
                }
              )}
              $model={{
                value: String(this.state.activeTab + 1),
                setter: (index: string) => {
                  this.setState({ activeTab: Number(index) - 1 });
                }
              }}
            />
          ) : null}

          {this.state.activeTab > -1
            ? this.props.tabs![this.state.activeTab].body
            : this.props.children}
        </div>

        <div className={styles.footer}>
          <div className={styles.buttons}>
            {renderIf(this.props.gutter != null)(
              <div className={styles.gutter}>{this.props.gutter}</div>
            )}
            <div className={styles.buttons_wrapper}>
              {renderIf(leftButtons.length > 0)(
                <div className={styles.left_buttons}>{leftButtons}</div>
              )}
              <div className={styles.right_buttons}>{rightButtons}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
