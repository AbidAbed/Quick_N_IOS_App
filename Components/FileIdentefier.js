import {useEffect, useState} from 'react';
import {
  useGetFileBinaryMutation,
  useGetFileObjectQuery,
} from '../Store/StoreInterface';
import {useDispatch, useSelector} from 'react-redux';
import useConfigFile from '../Hooks/useConfigFile';
import Button from './Button';
import style from '../AppStyling';
import {ActivityIndicator, Text, View} from 'react-native';
import DownloadIcon from 'react-native-vector-icons/Feather';
import FullScreenIcon from 'react-native-vector-icons/Entypo';
import AudioIcon from 'react-native-vector-icons/FontAwesome';
import VideoIcon from 'react-native-vector-icons/Entypo';
import ImageIcon from 'react-native-vector-icons/EvilIcons';
import DocumentIcon from 'react-native-vector-icons/Ionicons';

function FileIdentefier({fileId, isHidden, senderId}) {
  ///////////////////// CONFIGS //////////////////////////////////

  const dispatch = useDispatch();
  /////////////////////// USESELECTERS ///////////////////////////
  const user = useSelector(state => state.user);

  ///////////////////////////// STATES //////////////////////////////

  const [binaryFile, setBinaryFile] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  const [isOpened, setIsOpened] = useState(false);
  const [isDownloadPressed, setIsDownloadPressed] = useState(false);
  ////////////////////////// APIS ///////////////////////////////////
  const getFileObjectResponse = useGetFileObjectQuery({
    fileId: fileId,
    isAdmin: user.isAdmin,
    token: user.token,
  });

  const [getBinaryFile, getBinaryFileResponse] = useGetFileBinaryMutation();

  //////////////////////// USEEFFECTS ////////////////////////////////

  useEffect(() => {
    if (
      !getFileObjectResponse.isUninitialized &&
      !getFileObjectResponse.isLoading
    ) {
      if (getFileObjectResponse.isError) {
      } else {
        setFileObject({...getFileObjectResponse.data});
        if (
          getFileObjectResponse.data !== null &&
          getFileObjectResponse.data.isUploading &&
          isDownloadPressed
        )
          setTimeout(() => {
            getFileObjectResponse.refetch();
          }, 2000);
      }
    }
  }, [getFileObjectResponse]);

  useEffect(() => {
    if (
      !getBinaryFileResponse.isUninitialized &&
      !getBinaryFileResponse.isLoading
    ) {
      if (getBinaryFileResponse.isError) {
      } else {
        setBinaryFile(getBinaryFileResponse.data);
      }
    }
  }, [getBinaryFileResponse]);

  useEffect(() => {
    if (fileObject !== null && fileObject.isUploading && isDownloadPressed)
      getFileObjectResponse.refetch();
  }, [isDownloadPressed]);

  ////////////////////// HOOKS  //////////////////////

  function handleDownloadPressed() {
    setIsDownloadPressed(true);
  }

  ////////////////////// RETURNED COMPONENTS //////////////////////
  return (
    <View>
      {/* <Text>{fileObject !== null ? fileObject.filename : 'File'}</Text> */}
      {isDownloadPressed ? (
        fileObject === null || fileObject.isUploading ? (
          <ActivityIndicator size="small" color="#058095" />
        ) : fileObject !== null &&
          fileObject.isUploaded &&
          !fileObject.isUploading ? (
          <>
            {/** IF ANY TYPE OTHER THAN AUDIO */}
            {fileObject.type !== 'wav' ? (
              <>
                <Button
                  text="Downloaded"
                  styleText={{
                    fontSize: 7,
                    paddingLeft: '2%',
                    color: isDownloadPressed
                      ? '#00BEBE'
                      : isHidden
                      ? '#BFBFBF'
                      : senderId === user._id
                      ? '#30414C'
                      : '#BFBFBF',
                  }}
                  onPress={() => setIsOpened(true)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={[
                        style.submitFormButtonText,
                        {
                          color: isDownloadPressed
                            ? '#00BEBE'
                            : isHidden
                            ? '#BFBFBF'
                            : senderId === user._id
                            ? '#30414C'
                            : '#BFBFBF',
                        },
                        isDownloadPressed
                          ? {textDecorationLine: 'underline'}
                          : '',
                      ]}>
                      {fileObject.filename.length > 20
                        ? fileObject.filename.substr(0, 20) + ' ...'
                        : fileObject.filename}
                    </Text>

                    {fileObject?.type === 'mp4' ? (
                      <VideoIcon
                        name="controller-play"
                        color={
                          isDownloadPressed
                            ? '#00BEBE'
                            : isHidden
                            ? '#BFBFBF'
                            : senderId === user._id
                            ? '#30414C'
                            : '#BFBFBF'
                        }
                        size={20}
                      />
                    ) : fileObject?.type === 'wav' ? (
                      <AudioIcon
                        name="file-audio-o"
                        color={
                          isDownloadPressed
                            ? '#00BEBE'
                            : isHidden
                            ? '#BFBFBF'
                            : senderId === user._id
                            ? '#30414C'
                            : '#BFBFBF'
                        }
                        size={20}
                      />
                    ) : fileObject?.type === 'png' ||
                      fileObject?.type === 'jpg' ||
                      fileObject?.type === 'jpeg' ? (
                      <ImageIcon
                        name="image"
                        color={
                          isDownloadPressed
                            ? '#00BEBE'
                            : isHidden
                            ? '#BFBFBF'
                            : senderId === user._id
                            ? '#30414C'
                            : '#BFBFBF'
                        }
                        size={20}
                      />
                    ) : (
                      <DocumentIcon
                        name="document-outline"
                        color={
                          isDownloadPressed
                            ? '#00BEBE'
                            : isHidden
                            ? '#BFBFBF'
                            : senderId === user._id
                            ? '#30414C'
                            : '#BFBFBF'
                        }
                        size={20}
                      />
                    )}
                  </View>
                </Button>
              </>
            ) : (
              <></>
            )}

            {useConfigFile(
              fileObject,
              getBinaryFile,
              binaryFile,
              isOpened,
              setIsOpened,
              isHidden,
              senderId,
            )}
          </>
        ) : (
          <Text>Error file failed to be uploaded</Text>
        )
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}>
          <Button
            icon={
              <DownloadIcon
                name="download"
                size={20}
                color={
                  isDownloadPressed
                    ? '#00BEBE'
                    : isHidden
                    ? '#BFBFBF'
                    : senderId === user._id
                    ? 'white'
                    : '#BFBFBF'
                }
              />
            }
            // styleButton={[style.submitFormButton]}
            styleText={style.submitFormButtonText}
            onPress={handleDownloadPressed}
          />
          {fileObject !== null ? (
            fileObject.type === 'wav' ? (
              <Text
                style={{
                  justifyContent: 'center',
                  alignSelf: 'center',
                  alignContent: 'center',
                  color: isDownloadPressed
                    ? '#00BEBE'
                    : isHidden
                    ? '#BFBFBF'
                    : senderId === user._id
                    ? '#30414C'
                    : '#BFBFBF',
                }}>
                Audio
              </Text>
            ) : (
              <Text
                style={{
                  justifyContent: 'center',
                  alignSelf: 'center',
                  alignContent: 'center',
                  color: 'black',
                  color: isDownloadPressed
                    ? '#00BEBE'
                    : isHidden
                    ? '#BFBFBF'
                    : senderId === user._id
                    ? '#30414C'
                    : '#BFBFBF',
                }}>
                {fileObject.filename.length > 20
                  ? fileObject.filename.substr(0, 20) + ' ...'
                  : fileObject.filename}
              </Text>
            )
          ) : (
            <ActivityIndicator
              size="small"
              color="#058095"
              // style={{width: '100%'}}
            />
          )}

          {fileObject?.type === 'mp4' ? (
            <VideoIcon
              name="controller-play"
              color={
                isDownloadPressed
                  ? '#00BEBE'
                  : isHidden
                  ? '#BFBFBF'
                  : senderId === user._id
                  ? '#30414C'
                  : '#BFBFBF'
              }
              size={20}
            />
          ) : fileObject?.type === 'wav' ? (
            <AudioIcon
              name="file-audio-o"
              color={
                isDownloadPressed
                  ? '#00BEBE'
                  : isHidden
                  ? '#BFBFBF'
                  : senderId === user._id
                  ? '#30414C'
                  : '#BFBFBF'
              }
              size={20}
            />
          ) : fileObject?.type === 'png' ||
            fileObject?.type === 'jpg' ||
            fileObject?.type === 'jpeg' ? (
            <ImageIcon
              name="image"
              color={
                isDownloadPressed
                  ? '#00BEBE'
                  : isHidden
                  ? '#BFBFBF'
                  : senderId === user._id
                  ? '#30414C'
                  : '#BFBFBF'
              }
              size={20}
            />
          ) : (
            <DocumentIcon
              name="document-outline"
              color={
                isDownloadPressed
                  ? '#00BEBE'
                  : isHidden
                  ? '#BFBFBF'
                  : senderId === user._id
                  ? '#30414C'
                  : '#BFBFBF'
              }
              size={20}
            />
          )}
        </View>
      )}
    </View>
  );
}
export default FileIdentefier;
