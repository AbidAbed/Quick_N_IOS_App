import {Image, Modal, Text, View} from 'react-native';
import Button from './Button';
import {useEffect, useState} from 'react';
import style from '../AppStyling';
import AudioPlayer from './AudioPlayer';
// import VideoPlayer from 'react-native-video-player';
// import AudioPlayer from './AudioPlayer';

//PROBLEM WITH VIDEO PLAYING SHOULD BE FIXED

import BackIcon from 'react-native-vector-icons/Ionicons';
import NextPage from 'react-native-vector-icons/MaterialCommunityIcons';
import PrevPage from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
function DocumentFilesModal({
  fileObj,
  isModalVisible,
  isNextAndPrevAvailable,
  isVideo,
  setIsOpened,
  isAudio,
  senderId,
  isHidden,
}) {
  ///////////////////// CONFIGS //////////////////////////////////

  /////////////////////// USESELECTERS ///////////////////////////
  ///////////////////////////// STATES //////////////////////////////
  const [page, setPage] = useState(1);
  const [isNextPage, setIsNextPage] = useState(true);
  const [isPrevPage, setIsPrevPage] = useState(false);
  const [modalVisible, setModalVisible] = useState(isModalVisible);
  const [error, setError] = useState(null);

  const [videoWidth, setVideoWidth] = useState(null);
  const [videoHeight, setVideoHeight] = useState(null);

  ////////////////////////// APIS ///////////////////////////////////
  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    if (isModalVisible) setModalVisible(isModalVisible);
  }, [isModalVisible]);

  // useEffect(() => {
  //   // Initialize the Audio instance
  //   Audio.setCategory('Playback');
  // }, []);

  ////////////////////// HOOKS  //////////////////////

  function closeModal() {
    setModalVisible(false);
    setIsOpened(false);
  }

  function handleImageLoad() {}

  function handleImageError() {
    if (page !== 1) {
      setIsNextPage(false);
      setError('Final page');
    } else setError("Couldn't load file");
  }

  function handleNextpage() {
    setPage(page + 1);
    if (page + 1) setIsPrevPage(true);
  }

  function handlePrevPage() {
    setPage(page - 1);
    if (page - 1 === 1) setIsPrevPage(false);
    setIsNextPage(true);
    setError(null);
  }

  function onVideoLoadingError(err) {
    //console.log(err);
  }

  function onVideoBuffering(buff) {
    // //console.log(buff);
  }
  const onVideoLoad = data => {
    setVideoWidth(data.naturalSize.width);
    setVideoHeight(data.naturalSize.height);
  };

  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <View>
      {!isAudio ? (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
          style={{height: '100%', width: '100%'}}>
          <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              height: '100%',
              width: '100%',
              position: 'relative',
            }}>
            <Button
              icon={
                <BackIcon name="arrow-back-outline" size={20} color="white" />
              }
              onPress={closeModal}
              styleButton={[
                style.submitFormButton,
                {
                  // position: 'absolute',
                  // top: 0,
                  // left: 0,

                  backgroundColor: 'transparent',
                },
              ]}
              styleText={[style.submitFormButtonText, {textAlign: 'left'}]}
            />
            {/**Video player */}
            {/** OR  */}
            {/**Image And Documents */}
            {isVideo ? (
              <Video
                style={style.backgroundVideo}
                videoWidth={videoWidth}
                videoHeight={videoHeight}
                fullscreen={true}
                source={{
                  uri: `https://novel-era.co/quickn/api/v1/message/file/binary?fileId=${fileObj._id}&page=1.mp4`,
                }}
                controls={true}
                onLoad={onVideoLoad}
                controlsStyle={{zIndex: 2}}
              />
            ) : (
              <>
                {error !== null ? (
                  <View
                    style={{
                      width: '100%',
                      height: `${isNextAndPrevAvailable ? '80%' : '100%'}`,
                      backgroundColor: 'white',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={[style.conversationNameText, {color: 'red'}]}>
                      {error}
                    </Text>
                  </View>
                ) : (
                  <Image
                    style={{
                      width: '100%',
                      height: `${isNextAndPrevAvailable ? '80%' : '100%'}`,
                    }}
                    source={{
                      uri: `https://novel-era.co/quickn/api/v1/message/file/binary?fileId=${fileObj._id}&page=${page}`,
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                )}

                <View style={{flexDirection: 'row'}}>
                  {isPrevPage && isNextAndPrevAvailable && (
                    <Button
                      icon={
                        <PrevPage name="less-than" size={20} color="white" />
                      }
                      onPress={handlePrevPage}
                      styleButton={[
                        style.submitFormButton,
                        {
                          flexDirection: 'row',
                          flex: 1,
                          backgroundColor: 'transparent',
                          backgroundColor: 'black',
                          borderRadius: 7,
                        },
                      ]}
                      styleText={[
                        style.submitFormButtonText,
                        {textAlign: 'left'},
                      ]}
                    />
                  )}
                  {isNextPage && isNextAndPrevAvailable && (
                    <Button
                      icon={
                        <NextPage name="greater-than" size={20} color="white" />
                      }
                      onPress={handleNextpage}
                      styleButton={[
                        style.submitFormButton,
                        {
                          flexDirection: 'row',
                          flex: 1,
                          backgroundColor: 'black',
                          borderRadius: 7,
                        },
                      ]}
                      styleText={[
                        style.submitFormButtonText,
                        {textAlign: 'left'},
                      ]}
                    />
                  )}
                </View>
              </>
            )}
          </View>
        </Modal>
      ) : (
        <></>
      )}

      {/**Audio Player */}
      {isAudio ? (
        <AudioPlayer
          src={`https://novel-era.co/quickn/api/v1/message/file/binary?fileId=${fileObj._id}&page=1`}
          _id={fileObj._id}
          senderId={senderId}
          isHidden={isHidden}
        />
      ) : (
        <></>
      )}
    </View>
  );
}
export default DocumentFilesModal;
