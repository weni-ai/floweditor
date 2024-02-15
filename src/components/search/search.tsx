import * as React from 'react';
import styles from './Search.module.scss';
// @ts-ignore
import { unnnicInput } from '@weni/unnnic-system';
import { applyVueInReact } from 'vuereact-combined';

const UnnnicInput = applyVueInReact(unnnicInput, {
  vue: {
    componentWrapAttrs: {
      'unnnic-input': 'true'
    }
  }
});
export class Search extends React.Component<any> {
  public render(): JSX.Element {
    return (
      <div className={styles.search_card}>
        <UnnnicInput iconLeft="search" />
      </div>
    );
  }
}
