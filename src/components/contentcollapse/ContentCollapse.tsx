import * as React from 'react';
import { applyVueInReact } from 'vuereact-combined';
import styles from './ContentCollapse.module.scss';

// @ts-ignore
import { unnnicIcon } from '@weni/unnnic-system';

const UnnnicIcon = applyVueInReact(unnnicIcon);

interface ContentCollapseProps {
  title: string;
  children: React.ReactNode;
  hasError?: boolean;
  wrapper_class?: string;
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
      isOpen: false,
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
          <span>{this.props.title}</span>
          <UnnnicIcon
            icon={this.state.isOpen ? 'expand_less' : 'expand_more'}
          />
        </div>

        {this.state.isOpen && (
          <div className={this.props.wrapper_class}>{this.props.children}</div>
        )}
      </div>
    );
  }
}
