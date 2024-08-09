import {Provider} from 'react-redux';
import {Store} from './Store/StoreInterface';
import Root from './Components/Root';
import TrackPlayer, {Capability} from 'react-native-track-player';
import {useEffect} from 'react';
import {MenuProvider} from 'react-native-popup-menu';

async function setUpTrackPlayerUpdates() {
  try {
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SeekTo,
        Capability.Stop,
      ],
      stopWithApp: true,
      alwaysPauseOnInterruption: true,
      playThroughEarpieceAndroid: false,
    });
  } catch (err) {
    //console.log(err);
  }
}

function App() {
  useEffect(() => {
    async function setUpAudioPlayer() {
      try {
        await TrackPlayer.setupPlayer();
        await setUpTrackPlayerUpdates();
      } catch (err) {
        //console.log(err);
      }
    }

    setUpAudioPlayer();
  }, []);

  return (
    <Provider store={Store}>
      <MenuProvider>
        <Root />
      </MenuProvider>
    </Provider>
  );
}

export default App;
