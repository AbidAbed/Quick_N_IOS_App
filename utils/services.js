import TrackPlayer from 'react-native-track-player';
import { Event } from 'react-native-track-player';
module.exports = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteSeek, () => TrackPlayer.seekTo());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
};
