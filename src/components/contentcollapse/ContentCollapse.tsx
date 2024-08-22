import * as React from 'react';
import { applyVueInReact } from 'veaury';
import styles from './ContentCollapse.module.scss';

// @ts-ignore
import Unnnic from '@weni/unnnic-system';

const UnnnicIcon = applyVueInReact(Unnnic.unnnicIcon, {
  vue: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      style: {
        all: '',
        display: 'flex',
      },
    },
  },
});

interface ContentCollapseProps {
  title: string;
  children: React.ReactNode;
  hasError?: boolean;
  wrapper_class?: string;
  open?: boolean;
  titleIcon?: string;
  titleIconScheme?: string;
}

interface ContentCollapseState {
  isOpen: boolean;
}

export default class ContentCollapse extends React.Component<
  ContentCollapseProps,
  ContentCollapseState
> {
  constructor(props: ContentCollapseProps) {
    super(props);

    this.state = {
      isOpen: this.props.open,
    };
  }

  private toggleCollapse(): void {
    this.setState({ isOpen: !this.state.isOpen });
  }

  public render(): JSX.Element {
    return (
      <div
        className={
          styles.collapse + ' ' + (this.props.hasError ? styles.error : '')
        }
      >
        <div
          data-testid={this.props.title}
          className={styles.collapse_header}
          onClick={() => this.toggleCollapse()}
        >
          {this.props.titleIcon && (
            <UnnnicIcon
              icon={this.props.titleIcon}
              scheme={this.props.titleIconScheme}
              filled={true}
            />
          )}
          <span>{this.props.title}</span>
          <div className={styles.collapse_icon}>
            <UnnnicIcon
              icon={this.state.isOpen ? 'expand_less' : 'expand_more'}
            />
          </div>
        </div>

        {this.state.isOpen && (
          <div className={this.props.wrapper_class}>{this.props.children}</div>
        )}
      </div>
    );
  }
}
