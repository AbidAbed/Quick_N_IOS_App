import {useEffect, useState} from 'react';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';
import useUpload from '../Hooks/useUpload';
import {useDispatch, useSelector} from 'react-redux';
import Button from './Button';
import style from '../AppStyling';
import socket from '../utils/SocketConfig';
import {
  updateConversation,
  updateGroup,
  updateUserData,
  usePostMessageMutation,
} from '../Store/StoreInterface';
import {View} from 'react-native';
import {func} from 'prop-types';

function FilePicker({
  FilePickerMode,
  options,
  buttonChildren,
  buttonText,
  buttonStyle,
  buttonParentStyle,
  buttonIcon,
}) {
  ///////////////////// CONFIGS //////////////////////////////////
  const dispatch = useDispatch();
  /////////////////////// USESELECTERS ///////////////////////////
  const user = useSelector(state => state.user);
  const {selectedConversationId} = useSelector(state => state.config);

  ///////////////////////////// STATES //////////////////////////////
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [fileBlop, setFileBlop] = useState(null);
  const [fileObject, setFileOBject] = useState(null);
  ////////////////////////// APIS ///////////////////////////////////
  const [createFileObject, uploadFile] = useUpload({
    isAvatar:
      FilePickerMode === 'uploadGroupAvatar' ||
      FilePickerMode === 'uploadUserAvatar',
  });
  const [postMessage, postMessageResponse] = usePostMessageMutation();
  //////////////////////// USEEFFECTS ////////////////////////////////

  useEffect(() => {
    if (
      !postMessageResponse.isLoading &&
      !postMessageResponse.isUninitialized
    ) {
      if (postMessageResponse.isError) {
      } else {
        uploadFile({
          ...fileBlop,
          fileId: fileObject._id,
          token: user.token,
          isAdmin: user.isAdmin,
        });

        options.handleAppendMessage({
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
        const notHiddenFromOnlineUsers = options.chatMembers.filter(
          chatMember => {
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
          },
        );

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
    if (isFilePicked) {
      switch (FilePickerMode) {
        case 'uploadUserAvatar':
          uploadUserAvatar();
          break;
        case 'uploadGroupAvatar':
          uploadGroupAvatar();
          break;
        case 'sendFileMessage':
          sendFileMessage();
          break;
        case 'createGroupAvatar':
          createGroupAvatar();
          break;
      }
      setIsFilePicked(false);
    }
  }, [isFilePicked]);

  ////////////////////// HOOKS  //////////////////////
  async function uploadUserAvatar() {
    try {
      const pickedImage = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: false,
        multiple: false,
        mediaType: 'photo',
      });

      const uploadFileResponse = await uploadFile({
        pathToFileToUpload: pickedImage.path,
        token: user.token,
        isAdmin: user.isAdmin,
        fileName:
          pickedImage.path.split('/')[pickedImage.path.split('/').length - 1],
        fileId: '',
        mimeType: 'image/jpg',
      });

      dispatch(
        updateUserData({
          ...user,
          avatar: `https://novel-era.co/quickn/api/v1/message/file/binary?fileId=${
            JSON.parse(uploadFileResponse.data)._id
          }&page=1`,
        }),
      );
      options.handleLoadImageFromDevice(
        `https://novel-era.co/quickn/api/v1/message/file/binary?fileId=${
          JSON.parse(uploadFileResponse.data)._id
        }&page=1`,
      );
      //SHOULD EDIT THE AVATAR THAT IS EDITED TODO
    } catch (err) {
      console.log(err);
    }
  }
  async function uploadGroupAvatar() {
    try {
      const pickedImage = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: false,
        multiple: false,
        mediaType: 'photo',
      });

      const uploadFileResponse = await uploadFile({
        pathToFileToUpload: pickedImage.path,
        token: user.token,
        isAdmin: user.isAdmin,
        fileName:
          pickedImage.path.split('/')[pickedImage.path.split('/').length - 1],
        fileId: '',
        mimeType: 'image/jpg',
      });

      dispatch(
        updateGroup({
          ...options.group,
          avatar: JSON.parse(uploadFileResponse.data)._id,
        }),
      );
      dispatch(
        updateConversation({
          _id: options.group.conversationId,
          convAvatar: JSON.parse(uploadFileResponse.data)._id,
        }),
      );
      options.updateGroupAvatar(JSON.parse(uploadFileResponse.data)._id);
    } catch (err) {
      console.log(err);
    }
  }
  async function sendFileMessage() {
    try {
      const pickedDoc = await DocumentPicker.pickSingle({
        allowMultiSelection: false,
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.ppt,
          DocumentPicker.types.pptx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
          DocumentPicker.types.audio,
          DocumentPicker.types.images,
          DocumentPicker.types.video,
        ],
      });

      // console.log(pickedDoc);
      let mimeType = pickedDoc.type.split('/')[0];
      switch (mimeType) {
        case 'image':
          mimeType = 'image/png';
          break;
        case 'audio':
          mimeType = 'audio/webm';
          break;
        case 'video':
          mimeType = 'video/mp4';
          break;
        case 'application':
          mimeType = pickedDoc.type;
          break;
      }

      const responseFileCreated = await createFileObject({
        token: user.token,
        isAdmin: user.isAdmin,
        fileName: pickedDoc.name.split('.')[0],
      });

      setFileOBject(JSON.parse(responseFileCreated.data));

      setFileBlop({
        pathToFileToUpload: pickedDoc.uri,
        fileName: pickedDoc.name,
        mimeType: mimeType,
      });

      postMessage({
        isAdmin: user.isAdmin,
        token: user.token,
        sender: user._id,
        text: null,
        conversationId: selectedConversationId,
        file: JSON.parse(responseFileCreated.data)._id,
        hiddenFor: [...options.hiddenFromUsers],
      });
    } catch (err) {
      console.log(err);
    }
  }
  async function createGroupAvatar() {
    try {
      const pickedImage = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: false,
        multiple: false,
        mediaType: 'photo',
      });

      options.setCreateGroupAvatarPath({
        fileName:
          pickedImage.path.split('/')[pickedImage.path.split('/').length - 1],
        fileId: '',
        mimeType: 'image/jpg',
        path: pickedImage.path,
      });
    } catch (err) {
      console.log(err);
    }
  }
  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <View style={{...buttonParentStyle}}>
      <Button
        text={buttonText}
        styleText={style.submitFormButtonText}
        styleButton={[{...buttonStyle}]}
        onPress={() => {
          setIsFilePicked(true);
        }}
        icon={buttonIcon}>
        {buttonChildren}
      </Button>
    </View>
  );
}
export default FilePicker;
