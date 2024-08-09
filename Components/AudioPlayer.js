import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import TrackPlayer, {
  useProgress,
  Capability,
  usePlaybackState,
} from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import Button from './Button';
import style from '../AppStyling';
import PlayIcon from 'react-native-vector-icons/Entypo';
import PauseIcon from 'react-native-vector-icons/Feather';
import {useSelector} from 'react-redux';

function AudioPlayer({_id, src, isHidden, senderId}) {
  ///////////////////// CONFIGS //////////////////////////////////
  const progress = useProgress();
  const playbackState = usePlaybackState();
  /////////////////////// USESELECTERS ///////////////////////////
  const user = useSelector(state => state.user);
  ///////////////////////////// STATES //////////////////////////////

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentAudio, setCurrentAudio] = useState({
    isLoading: false,
    isPlaying: false,
    isEnded: false,
  });
  ////////////////////////// APIS ///////////////////////////////////

  ////////////////////// HOOKS  //////////////////////

  async function setupPlayer() {
    try {
      const tracksQueue = await TrackPlayer.getQueue();

      const pressedTrack = tracksQueue.reduce((prev, curr, index) => {
        if (curr.id === _id) return index;
        else return prev;
      }, -1);
      // //console.log('pressedTrack', pressedTrack);
      if (pressedTrack === -1) {
        await TrackPlayer.add([
          {
            id: _id,
            url: src,
            title: 'Recorded audio',
          },
        ]);
      }

      await TrackPlayer.pause();
      // setCurrentAudio({
      //   isLoading: false,
      //   isPlaying: false,
      //   isEnded: false,
      // });
      // const currentAudio = await TrackPlayer.getActiveTrack();
      // setCurrentPlayingAudio({...currentAudio, isPlaying: false});
    } catch (err) {
      //console.log(err);
    }
  }

  async function updateProgress(progress) {
    try {
      // //console.log(progress);
      const activeAudio = await TrackPlayer.getActiveTrack();
      const activeAudioIndex = await TrackPlayer.getActiveTrackIndex();
      // //console.log('activeAudio', activeAudioIndex);
      if (progress.duration !== 0 && activeAudio.id === _id) {
        setCurrentTime(progress.position);
        setDuration(progress.duration);
      }
    } catch (err) {
      //console.log(err);
    }
  }
  async function handlePlay() {
    const tracksQueue = await TrackPlayer.getQueue();

    const pressedTrack = tracksQueue.reduce((prev, curr, index) => {
      if (curr.id === _id) return index;
      else return prev;
    }, -1);

    // //console.log(
    //   'pressedTrack 2',
    //   pressedTrack,
    //   await TrackPlayer.getActiveTrackIndex(),
    // );

    if (pressedTrack !== -1) {
      await TrackPlayer.skip(pressedTrack);
      await TrackPlayer.play();
    }
  }

  async function handlePause() {
    const activeAudio = await TrackPlayer.getActiveTrack();

    if (activeAudio.id === _id) {
      await TrackPlayer.pause();
      setCurrentAudio({isPlaying: false, isLoading: false, isEnded: true});
    }
  }

  async function handleReplay() {
    const tracksQueue = await TrackPlayer.getQueue();

    const pressedTrack = tracksQueue.reduce((prev, curr, index) => {
      if (curr.id === _id) return index;
      else return prev;
    }, -1);

    if (pressedTrack !== -1) {
      await TrackPlayer.skip(pressedTrack);
      TrackPlayer.stop();
      setCurrentTime(0);
      TrackPlayer.seekTo(0);
      TrackPlayer.play();
    }
  }

  async function handleSeekTo(value) {
    const tracksQueue = await TrackPlayer.getQueue();

    const pressedTrack = tracksQueue.reduce((prev, curr, index) => {
      if (curr.id === _id) return index;
      else return prev;
    }, -1);

    if (pressedTrack !== -1) {
      setCurrentTime(value);
      TrackPlayer.seekTo(value);
      TrackPlayer.setVolume(value / duration);
    }
  }

  async function playBackStateHandler() {
    const loadingAudio = await TrackPlayer.getActiveTrack();

    if (playbackState.state === 'ready') {
      if (loadingAudio.id === _id)
        setCurrentAudio({
          isLoading: false,
          isPlaying: false,
          isEnded: false,
        });
      else
        setCurrentAudio({
          isLoading: false,
          isPlaying: false,
          isEnded: true,
        });
    }
    if (playbackState.state === 'loading') {
      if (loadingAudio.id === _id)
        setCurrentAudio({
          isLoading: true,
          isPlaying: false,
          isEnded: false,
        });
      else
        setCurrentAudio({
          isLoading: false,
          isPlaying: false,
          isEnded: true,
        });
    } else if (playbackState.state === 'ended') {
      setCurrentAudio({
        isLoading: false,
        isPlaying: false,
        isEnded: true,
      });
      await TrackPlayer.pause();
    } else if (playbackState.state === 'playing') {
      if (loadingAudio.id === _id)
        setCurrentAudio({
          isLoading: false,
          isPlaying: true,
          isEnded: false,
        });
      else
        setCurrentAudio({
          isLoading: false,
          isPlaying: false,
          isEnded: false,
        });
    }
  }

  function formatRecordingTime(timeInMiliseconds) {
    let seconds, munites, hours, timeFormat;

    timeFormat = '';

    seconds = munites = hours = 0;

    while (timeInMiliseconds > 1000) {
      seconds = seconds + Math.floor(timeInMiliseconds / 1000);
      if (seconds >= 60) {
        munites = munites + 1;
        seconds = seconds - 60;
      }
      if (munites >= 60) {
        hours = hours + 1;
        munites = munites - 60;
      }
      timeInMiliseconds = timeInMiliseconds / 1000;
    }

    if (hours < 9) timeFormat = `0${hours}`;
    else timeFormat = `${hours}`;
    if (munites < 9) timeFormat = `${timeFormat}:0${munites}`;
    else timeFormat = `${timeFormat}:${munites}`;
    if (seconds < 9) timeFormat = `${timeFormat}:0${seconds}`;
    else timeFormat = `${timeFormat}:${seconds}`;

    return timeFormat;
  }

  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    updateProgress(progress);
  }, [progress]);

  useEffect(() => {
    playBackStateHandler();
  }, [playbackState]); // Re-run effect when playback state changes

  useEffect(() => {
    setupPlayer();
  }, [_id, src]);

  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <View style={{flexDirection: 'row', width: '100%', alignItems: 'center'}}>
      <View>
        {currentAudio.isLoading ? (
          <ActivityIndicator
            size="small"
            color="#058095"
            style={{width: '100%'}}
          />
        ) : currentAudio.isEnded ? (
          <Button
            icon={
              <PlayIcon
                name="controller-play"
                color={isHidden ? '#00BEBE' : '#058095'}
                size={20}
              />
            }
            onPress={handlePlay}
            // styleButton={[
            //   style.submitFormButton,
            //   {backgroundColor: '#C0C0C0', justifyContent: 'center'},
            // ]}
            styleText={style.submitFormButtonText}
          />
        ) : currentAudio.isPlaying ? (
          <Button
            icon={
              <PauseIcon
                name="pause"
                color={isHidden ? '#00BEBE' : '#058095'}
                size={20}
              />
            }
            onPress={handlePause}
            // styleButton={[
            //   style.submitFormButton,
            //   {backgroundColor: '#C0C0C0', justifyContent: 'center'},
            // ]}
            styleText={style.submitFormButtonText}
          />
        ) : (
          <Button
            icon={
              <PlayIcon
                name="controller-play"
                color={isHidden ? '#00BEBE' : '#058095'}
                size={20}
              />
            }
            onPress={handlePlay}
            // styleButton={[
            //   style.submitFormButton,
            //   {backgroundColor: '#C0C0C0', justifyContent: 'center'},
            // ]}
            styleText={style.submitFormButtonText}
          />
        )}
      </View>

      <View
        style={{
          backgroundColor: isHidden
            ? '#505050'
            : senderId === user._id
            ? '#93B3BC'
            : '#D9D9D9',
          flexDirection: 'row',
          maxWidth: '80%',
          borderRadius: 7,
          padding: '1%',
          alignItems: 'center',
        }}>
        <View style={{flex: 1}}>
          <Slider
            value={currentTime}
            tapToSeek={true}
            onSlidingComplete={handleSeekTo}
            minimumValue={0}
            maximumValue={duration}
            disabled={true}
            minimumTrackTintColor={
              isHidden
                ? '#BFBFBF'
                : senderId === user._id
                ? '#B0CED7'
                : '#BFBFBF'
            }
            maximumTrackTintColor="#058095"
            style={{widthL: '100%'}}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
          <Text
            style={{
              color: isHidden
                ? '#A0A0A0'
                : senderId === user._id
                ? '#FFFFFF'
                : '#A0A0A0',
              paddingRight: '2%',
            }}>
            {formatRecordingTime(currentTime * 1000)}
          </Text>
        </View>
      </View>
      {/* <Button
          text="Replay"
          onPress={handleReplay}
          styleButton={style.submitFormButton}
          styleText={style.submitFormButtonText}
        /> */}
    </View>
  );
}

export default AudioPlayer;
