import {useEffect, useState} from 'react';
import {PermissionsAndroid, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {usePostMessageMutation} from '../Store/StoreInterface';
import useUpload from '../Hooks/useUpload';
import Button from '../Components/Button';
import style from '../AppStyling';
import socket from '../utils/SocketConfig';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import MicIcon from 'react-native-vector-icons/Feather';
import PauseIcon from 'react-native-vector-icons/Feather';
import StopIcon from 'react-native-vector-icons/FontAwesome5';
import ResumeIcon from 'react-native-vector-icons/FontAwesome5';
import CancelIcon from 'react-native-vector-icons/MaterialIcons';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Toast from 'react-native-toast-message';

const audioRecorderPlayer = new AudioRecorderPlayer();

function AudioRecorder({
  handleAppendMessage,
  chatMembers,
  hiddenFromUsers,
  setIsRecordingParent,
  isRecordingParent,
  isHiddenMode,
}) {
  ///////////////////// CONFIGS //////////////////////////////////

  /////////////////////// USESELECTERS ///////////////////////////

  const user = useSelector(state => state.user);
  const {selectedConversationId} = useSelector(state => state.config);

  ///////////////////////////// STATES //////////////////////////////

  const [isRecording, setIsRecording] = useState(isRecordingParent);

  const [isPaused, setIsPaused] = useState(false);
  const [startingTime, setStartingTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [fileName, setFileName] = useState('');
  const [blopAudio, setBlopAudio] = useState();
  const [fileObject, setFileOBject] = useState();

  //   const [messageObject, setMessageObject] = useState();

  ////////////////////////// APIS ///////////////////////////////////
  const [createFileObject, uploadFile] = useUpload({isAvatar: false});
  const [postMessage, postMessageResponse] = usePostMessageMutation();

  ////////////////////// HOOKS  //////////////////////

  async function handleStartRecording() {
    try {
      const fileNameStr = 'quickn_' + new Date(Date.now()).toISOString();

      setFileName(fileNameStr);
      const grant = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );

      if (grant === 'granted') {
        await audioRecorderPlayer.startRecorder();
        setStartingTime(Date.now());
        setDuration(0);
        setIsRecording(true);
        setIsRecordingParent(true);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function handleStopRecording() {
    try {
      setIsRecording(false);
      setIsRecordingParent(false);
      setIsPaused(false);
      const recordedAudio = await audioRecorderPlayer.stopRecorder();

      setBlopAudio(recordedAudio);

      const currentEndingTime = Date.now();
      setDuration(duration + currentEndingTime - startingTime);

      const responseFileCreated = await createFileObject({
        token: user.token,
        isAdmin: user.isAdmiN,
        fileName: fileName,
      });

      setFileOBject(JSON.parse(responseFileCreated.data));

      postMessage({
        isAdmin: user.isAdmin,
        token: user.token,
        sender: user._id,
        text: null,
        conversationId: selectedConversationId,
        file: JSON.parse(responseFileCreated.data)._id,
        hiddenFor: [...hiddenFromUsers],
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function handlePauseRecording() {
    try {
      if (!isPaused) {
        await audioRecorderPlayer.pausePlayer();
        const currentEndingTime = Date.now();
        setDuration(duration + currentEndingTime - startingTime);
        setIsPaused(true);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function handleResumeRecording() {
    try {
      if (isPaused) {
        await audioRecorderPlayer.resumeRecorder();
        setStartingTime(Date.now());
        setIsPaused(false);
      }
    } catch (err) {
      console.log(err);
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

  async function handleDiscardRecording() {
    try {
      if (isRecording) {
        setIsRecording(false);
        setIsRecordingParent(false);
        setIsPaused(false);
        const audioFilePath = await audioRecorderPlayer.stopRecorder();
        await ReactNativeBlobUtil.fs.unlink(audioFilePath);

        console.log('Recording discarded.');
      }
    } catch (error) {
      console.error('Error discarding recording:', error);
    }
  }
  //////////////////////// USEEFFECTS ////////////////////////////////

  useEffect(() => {
    if (
      !postMessageResponse.isLoading &&
      !postMessageResponse.isUninitialized
    ) {
      if (postMessageResponse.isError) {
        Toast.show({
          type: 'error',
          text1: 'failed to upload audio',
        });
      } else {
        uploadFile({
          pathToFileToUpload: blopAudio,
          token: user.token,
          isAdmin: 'true',
          fileName: fileName,
          fileId: fileObject._id,
          mimeType: 'audio/webm',
        });

        handleAppendMessage({
          text: null,
          file: fileObject._id,
          _id: postMessageResponse.data._id,
          senderId: user._id,
          convId: postMessageResponse.data.conversationId,
          isForwarded: false,
          hiddenFor: [...postMessageResponse.data.hiddenFor],
          createdAt: postMessageResponse.data.createdAt,
        });

        //SENDING AUDIOS IN HIDDEN MODE
        const notHiddenFromOnlineUsers = chatMembers.filter(chatMember => {
          const isHiddenFromUser = postMessageResponse.data.hiddenFor.find(
            usrId => usrId === chatMember._id,
          );

          if (!isHiddenFromUser && chatMember.isOnline) {
            if (postMessageResponse.data.hiddenFor.length !== 0)
              socket.emit('getHiddenMsg', {
                senderId: user._id,
                receiverId: chatMember._id,
                text: null,
                file: fileObject._id,
                convId: postMessageResponse.data.conversationId,
                senderUsername: user.username,
                _id: postMessageResponse.data._id,
                createdAt: postMessageResponse.data.createdAt,
                senderAvatar: user.avatar,
              });
            return true;
          } else return false;
        });

        //SENDING AUDIOS PUBLICALLY
        if (postMessageResponse.data.hiddenFor.length === 0) {
          notHiddenFromOnlineUsers.map(notHiddenFromUserMember => {
            socket.emit('sendMessage', {
              senderId: user._id,
              receiverId: notHiddenFromUserMember._id,
              text: null,
              file: fileObject._id,
              convId: postMessageResponse.data.conversationId,
              senderUsername: user.username,
              _id: postMessageResponse.data._id,
              createdAt: postMessageResponse.data.createdAt,
              senderAvatar: user.avatar,
            });
          });
        }
      }
    }
  }, [postMessageResponse]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      setTimeout(() => {
        if (isRecording && !isPaused) {
          setCurrentTime(Date.now());
        }
      }, 0);
    }
  }, [isRecording, isPaused, currentTime]);

  ////////////////////// RETURNED COMPONENTS //////////////////////

  // <View
  // // style={{width: '100%', height: '100%'}}
  // >
  // <View
  //   style={{
  //     flexDirection: 'row',
  //     // width: '100%', height: '100%'
  //   }}>
  return !isRecording ? (
    <Button
      styleButton={[
        style.submitFormButton,
        isHiddenMode ? {backgroundColor: '#696969'} : '',

        // {width: '100%', height: '100%'},
        {
          borderRadius: 30,
          borderWidth: 1,
          borderColor: '#B0B2B3',
          backgroundColor: isHiddenMode ? '#696969' : '#058095',
        },
      ]}
      styleText={{
        color: 'white',
        textAlign: 'center',
        padding: '1%',
      }}
      icon={
        <MicIcon
          name="mic"
          size={20}
          style={{borderRadius: 30}}
          color={isHiddenMode ? '#B0B2B3' : 'white'}
        />
      }
      onPress={handleStartRecording}
    />
  ) : (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 7,
        borderWidth: 1,
        borderColor: 'black',
        backgroundColor: isHiddenMode ? '#696969' : 'transparent',
        // width: '100%', height: '100%'
      }}>
      <View style={{flexDirection: 'row', paddingLeft: '2%'}}>
        {isPaused ? (
          <Button
            styleButton={
              [
                // style.submitFormButton,
                // {width: '25%', height: '100%'},
              ]
            }
            styleText={style.submitFormButtonText}
            icon={<ResumeIcon name="play" size={20} color="green" />}
            onPress={handleResumeRecording}
          />
        ) : (
          <Button
            styleButton={[
              // style.submitFormButton,
              // {width: '25%', height: '100%'},
              {borderRadius: 30},
            ]}
            styleText={style.submitFormButtonText}
            icon={<PauseIcon name="pause" size={20} color="white" />}
            onPress={handlePauseRecording}
          />
        )}
        <Button
          styleButton={[
            // style.submitFormButton,
            {borderRadius: 30},
            // {width: '25%', height: '100%'},
          ]}
          icon={<StopIcon name="stop" size={20} color="red" />}
          styleText={style.submitFormButtonText}
          onPress={handleStopRecording}
        />

        <Button
          styleButton={[
            // style.submitFormButton,
            {borderRadius: 30},
            // {width: '25%', height: '100%'},
          ]}
          icon={<CancelIcon name="cancel" size={20} color="#B0B2B3" />}
          styleText={style.submitFormButtonText}
          onPress={handleDiscardRecording}
        />
      </View>
      <View style={{flex: 1, alignItems: 'flex-end', paddingRight: '2%'}}>
        <Text
        // style={{width: '50%', height: '100%'}}
        >
          {formatRecordingTime(currentTime - startingTime + duration)}
        </Text>
      </View>
    </View>
  );
}
export default AudioRecorder;

{
  // </View>
  /* </View> */
}
