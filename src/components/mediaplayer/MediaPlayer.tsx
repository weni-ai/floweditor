import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import styles from './MediaPlayer.module.scss';

import { applyVueInReact } from 'veaury';
import { MediaSurface, MediaUrlSigner } from 'services/MediaUrlSigner';

// @ts-ignore
import Unnnic from '@weni/unnnic-system';

const UnnnicIcon = applyVueInReact(Unnnic.unnnicIcon, {
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

export interface MediaPlayerProps {
  url: string;
  surface: MediaSurface;
  triggered?: boolean;
}

interface MediaPlayerState {
  durationSeconds: number;
  currentSeconds: number;
  progress: number;
  playing: boolean;
  isLoading: boolean;
}

export class MediaPlayer extends React.Component<
  MediaPlayerProps,
  MediaPlayerState
> {
  private ele: HTMLAudioElement;
  private isUnmounted = false;

  private stroke = 1;
  private radius = 9;

  private radiusNormalized = this.radius - this.stroke * 2;
  private circumference = this.radiusNormalized * 2 * Math.PI;

  constructor(props: MediaPlayerProps) {
    super(props);

    this.state = {
      durationSeconds: 0,
      currentSeconds: 0,
      playing: false,
      progress: 0,
      isLoading: false,
    };

    bindCallbacks(this, {
      include: [/^handle/],
    });
  }

  private handleTimeUpdate(e: React.SyntheticEvent<HTMLAudioElement>): void {
    const currentTime = this.ele.currentTime || 0;
    const duration = this.ele.duration || 0;

    this.setState((prevState: MediaPlayerState) => {
      if ((this.ele.ended || currentTime === 0) && prevState.playing) {
        setTimeout(() => {
          this.setState({ progress: 0, playing: false });
        }, 500);
      }

      /* istanbul ignore next -- @preserve */
      const progress =
        duration > 0 ? Math.floor((currentTime / duration) * 100) : 0;

      /* istanbul ignore next -- @preserve */
      return {
        currentSeconds: this.ele.ended || progress === 100 ? 0 : currentTime,
        durationSeconds: duration,
        playing: currentTime > 0 && !this.ele.ended,
        progress: progress,
      };
    });
  }

  public componentDidMount(): void {
    if (this.props.triggered) {
      this.handleTogglePlay(null);
    }
  }

  public componentWillUnmount(): void {
    this.isUnmounted = true;
  }

  private handleTogglePlay(e: React.MouseEvent<HTMLDivElement>): void {
    if (e !== null) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (this.state.isLoading) {
      return;
    }

    if (this.state.playing) {
      this.ele.pause();
      this.ele.currentTime = 0;
      return;
    }

    // A cached or unsigned URL must start playback inside the click, or
    // browsers such as Safari reject play() for lack of user activation.
    const resolvedUrl = MediaUrlSigner.get().getResolvedUrl(this.props.url);
    if (resolvedUrl !== null) {
      this.startPlayback(resolvedUrl);
    } else {
      this.resolveAndPlay();
    }
  }

  private async resolveAndPlay(): Promise<void> {
    const requestedUrl = this.props.url;
    this.setState({ isLoading: true });

    const playbackUrl = await MediaUrlSigner.get().resolve(requestedUrl, {
      surface: this.props.surface,
    });

    if (this.isUnmounted) {
      return;
    }

    // A new url already reset isLoading in componentDidUpdate, and the late
    // result belongs to a recording that is no longer shown.
    if (this.props.url !== requestedUrl) {
      return;
    }

    this.setState({ isLoading: false });
    this.startPlayback(playbackUrl);
  }

  private startPlayback(playbackUrl: string): void {
    if (this.ele.getAttribute('src') !== playbackUrl) {
      this.ele.src = playbackUrl;
    }

    this.ele.load();

    // play() returns no promise in older browsers and in jsdom.
    const playResult = this.ele.play();
    if (playResult) {
      playResult.catch(this.handlePlayRejected);
    }
  }

  private handlePlayRejected(): void {
    if (this.isUnmounted) {
      return;
    }

    this.setState({ playing: false, progress: 0 });
  }

  private getIcon(): string {
    if (this.state.isLoading) {
      return 'hourglass_empty';
    }
    return this.state.playing ? 'stop' : 'play_arrow';
  }

  private handleRef(ref: HTMLAudioElement): any {
    return (this.ele = ref);
  }

  public componentDidUpdate(prevProps: MediaPlayerProps): void {
    if (this.props.url !== prevProps.url) {
      this.setState({
        durationSeconds: 0,
        currentSeconds: 0,
        playing: false,
        progress: 0,
        isLoading: false,
      });
    }
  }

  public render(): JSX.Element {
    const progress = this.state.progress || 0;
    const strokeDashoffset =
      this.circumference - (progress / 100) * this.circumference;

    return (
      <div
        data-testid="mediaplayer"
        aria-busy={this.state.isLoading ? true : undefined}
        className={
          styles.player + ' ' + (this.state.playing ? styles.playing : '')
        }
        style={{ height: this.radius * 2, width: this.radius * 2 }}
        onMouseUp={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={this.handleTogglePlay}
      >
        <audio
          data-testid="audio"
          ref={this.handleRef}
          onTimeUpdate={this.handleTimeUpdate}
          // The player assigns the signed src itself on play: React only
          // rewrites the attribute when the prop changes, so a re-render never
          // restarts playback, and preload="none" keeps the canonical URL from
          // being fetched before then.
          src={this.props.url}
          preload="none"
        />

        <div className={styles.circles}>
          <svg height={this.radius * 2} width={this.radius * 2}>
            <circle
              className={styles.circle_background}
              stroke="#fff"
              fill="#fff"
              strokeWidth={this.stroke}
              r={this.radiusNormalized}
              cx={this.radius}
              cy={this.radius}
            />
            <circle
              className={styles.circle_background}
              stroke="#ddd"
              fill="transparent"
              strokeWidth={this.stroke}
              r={this.radiusNormalized}
              cx={this.radius}
              cy={this.radius}
            />
            <circle
              className={styles.circle_foreground}
              stroke="cornflowerblue"
              fill="transparent"
              strokeWidth={this.stroke}
              strokeDasharray={this.circumference + ' ' + this.circumference}
              style={{ strokeDashoffset }}
              r={this.radiusNormalized}
              cx={this.radius}
              cy={this.radius}
            />
          </svg>
        </div>
        <div className={styles.button}>
          <UnnnicIcon icon={this.getIcon()} size="sm" scheme="alert-red" />
        </div>
      </div>
    );
  }
}
