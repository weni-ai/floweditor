import SayMsgComp, { PLACEHOLDER } from 'components/flow/actions/saymsg/SayMsg';
import { MediaPlayer } from 'components/mediaplayer/MediaPlayer';
import { SayMsg } from 'flowTypes';
import { composeComponentTestUtils } from 'testUtils';
import {
  createSayMsgAction,
  createSendMsgAction,
} from 'testUtils/assetCreators';
import { setEmpty } from 'utils';
import { shallowToJson } from 'enzyme-to-json';
import * as React from 'react';
import { config } from 'test/config';
import { fireEvent, render, store, waitFor } from 'test/utils';
import { MediaUrlSigner } from 'services/MediaUrlSigner';

const sendMsgAction = createSendMsgAction();
const canonicalUrl =
  'https://weni-flows.s3.us-east-1.amazonaws.com/audio/42/1337/greeting.mp3';

const { setup } = composeComponentTestUtils<SayMsg>(SayMsgComp, sendMsgAction);

describe(SayMsgComp.name, () => {
  describe('render', () => {
    it('should render text prop when passed', () => {
      const { wrapper, props } = setup();

      expect(wrapper.text()).toBe(props.text);
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });

    it("should render placeholder when text prop isn't passed", () => {
      const { wrapper } = setup(true, { text: setEmpty() });

      expect(wrapper.text()).toBe(PLACEHOLDER);
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('recording', () => {
    it('should pass the original audio_url to the player', () => {
      const { wrapper } = setup(true, { audio_url: { $set: canonicalUrl } });

      expect(wrapper.find(MediaPlayer).props()).toMatchObject({
        url: canonicalUrl,
        surface: 'say_msg_audio',
      });
    });

    describe('playback with signing', () => {
      beforeEach(() => {
        MediaUrlSigner.get().configure(config.endpoints.media_urls);
        vi.spyOn(window.HTMLMediaElement.prototype, 'load').mockImplementation(
          vi.fn(),
        );
        vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(
          vi.fn().mockResolvedValue(undefined),
        );
      });

      afterEach(() => {
        MediaUrlSigner.get().configure(undefined);
        vi.restoreAllMocks();
      });

      it('should sign for playback without changing the action or the store', async () => {
        const action = createSayMsgAction({ audio_url: canonicalUrl });
        const before = JSON.stringify(store.getState());
        const { getByTestId } = render(React.createElement(SayMsgComp, action));

        fireEvent.mouseDown(getByTestId('mediaplayer'));

        const audio = getByTestId('audio') as HTMLAudioElement;
        await waitFor(() =>
          expect(audio.src).toBe(canonicalUrl + '?X-Amz-Signature=test'),
        );
        expect(action.audio_url).toBe(canonicalUrl);
        const after = JSON.stringify(store.getState());
        expect(after).toBe(before);
        expect(after).not.toContain('X-Amz-Signature');
      });
    });
  });
});
