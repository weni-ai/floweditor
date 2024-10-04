import * as React from 'react';
import { StringEntry } from 'store/nodeEditor';
import { applyVueInReact } from 'veaury';

// @ts-ignore
import Unnnic from '@weni/unnnic-system';

import styles from './TextEditorActions.module.scss';

const UnnnicButton = applyVueInReact(Unnnic.unnnicButton);
const UnnnicEmojiPicker = applyVueInReact(Unnnic.unnnicEmojiPicker);

export interface TextEditorProps {
  entry: StringEntry;
  maxLength: number;
  onAddEmoji: (emoji: any) => void;
  onFormat: (c: string) => void;
}

export interface TextEditorState {
  showEmojiPicker: boolean;
}

export default class TextEditorActions extends React.Component<
  TextEditorProps,
  TextEditorState
> {
  constructor(props: TextEditorProps) {
    super(props);

    this.state = {
      showEmojiPicker: false,
    };
  }

  private toggleEmojiPicker(): void {
    this.setState(prevState => ({
      showEmojiPicker: !prevState.showEmojiPicker,
    }));
  }

  private addEmoji(emoji: any) {
    this.props.onAddEmoji(emoji);
    this.toggleEmojiPicker();
  }

  render() {
    return (
      <div className={styles.actions}>
        <div className={styles.emoji_picker_wrapper}>
          <UnnnicButton
            iconCenter="sentiment_satisfied"
            size="small"
            type="tertiary"
            onClick={() => this.toggleEmojiPicker()}
          />
          {this.state.showEmojiPicker && (
            <div className={styles.emoji_picker}>
              <UnnnicEmojiPicker
                onEmojiSelected={(e: any) => this.addEmoji(e)}
                onClickOutside={() => this.toggleEmojiPicker()}
              />
            </div>
          )}
        </div>

        <UnnnicButton
          iconCenter="format_bold"
          size="small"
          type="tertiary"
          onClick={() => this.props.onFormat('*')}
        />

        <UnnnicButton
          iconCenter="format_italic"
          size="small"
          type="tertiary"
          onClick={() => this.props.onFormat('_')}
        />

        <UnnnicButton
          iconCenter="code"
          size="small"
          type="tertiary"
          onClick={() => this.props.onFormat('```')}
        />

        <UnnnicButton
          iconCenter="format_strikethrough"
          size="small"
          type="tertiary"
          onClick={() => this.props.onFormat('~')}
        />

        <span className={styles.counter}>
          {this.props.entry.value.length} / {this.props.maxLength}
        </span>
      </div>
    );
  }
}
