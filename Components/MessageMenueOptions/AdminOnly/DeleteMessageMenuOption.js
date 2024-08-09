import {useDispatch, useSelector} from 'react-redux';
import {
  updateLeatestMessage,
  useDeleteMessageMutation,
} from '../../../Store/StoreInterface';
import {MenuOption} from 'react-native-popup-menu';
import {Text} from 'react-native';
import Button from '../../Button';
import style from '../../../AppStyling';
import {useEffect} from 'react';
import socket from '../../../utils/SocketConfig';
import TrackPlayer from 'react-native-track-player';
import DeleteIcon from 'react-native-vector-icons/Foundation';

function DeleteMessageMenuOption({
  message,
  setMessages,
  onlineUsers,
  hiddenFromUsers,
  messages,
}) {
  ///////////////////// CONFIGS //////////////////////////////////

  const dispatch = useDispatch();
  /////////////////////// USESELECTERS ///////////////////////////
  const user = useSelector(state => state.user);
  const conversationMessageDeletedFrom = useSelector(state => {
    const foundConversation = state.conversations.find(
      usrConv => message.conversationId === usrConv._id,
    );
    return foundConversation;
  });
  ///////////////////////////// STATES //////////////////////////////

  ////////////////////////// APIS ///////////////////////////////////
  const [deleteMessage, deleteMessageResponse] = useDeleteMessageMutation();

  //////////////////////// USEEFFECTS ////////////////////////////////

  useEffect(() => {
    if (
      !deleteMessageResponse.isFetching &&
      !deleteMessageResponse.isUninitialized
    ) {
      if (deleteMessageResponse.isError) {
        console.log('ERROR TO DELETE MESSAGE');
        // console.log(deleteMessageResponse);
      } else {
        if (
          message._id === conversationMessageDeletedFrom?.latestMessage?._id
        ) {
          dispatch(
            updateLeatestMessage({
              convId: message.conversationId,
              latestMessage: {
                ...conversationMessageDeletedFrom.latestMessage,
                text: 'This message was deleted',
              },
            }),
          );
        }

        const newMessages = messages.filter(msg => msg._id !== message._id);

        setMessages([...newMessages]);

        if (message.file !== null) {
          handleRemoveAudioFromQueue();
        }

        const onlineUsersNotHiddenFromIds = Object.entries(onlineUsers).reduce(
          (prev, curr) => {
            const isOnlineUserHiddenFrom = hiddenFromUsers.find(
              hiddenFromUser => hiddenFromUser._id === curr[0],
            );

            if (isOnlineUserHiddenFrom || user._id === curr[0])
              return [...prev];
            else return [...prev, curr[0]];
          },
          [],
        );
        socket.emit('messageDeleted', {
          message_id: message._id,
          conversationId: message.conversationId,
          members: [...onlineUsersNotHiddenFromIds],
          senderId: user._id,
        });
      }
    }
  }, [deleteMessageResponse]);

  //console.log('onlineUsers.length', Object.keys(onlineUsers).length);

  ////////////////////// HOOKS  //////////////////////

  function handleDeleteMessage() {
    if (user.isAdmin) {
      if (user._id !== message.sender) {
        console.log('ERROR USR IS NOT THE SENDER');
      } else {
        deleteMessage({
          conversationId: message.conversationId,
          msgId: message._id,
          token: user.token,
          isAdmin: user.isAdmin,
        });
      }
    } else {
      //console.log('ERROR USR IS NOT AN ADMIN');
    }
  }

  async function handleRemoveAudioFromQueue() {
    try {
      const audioQueue = await TrackPlayer.getQueue();
      const updatedTracks = audioQueue.filter(
        track => track.id !== message.file,
      );

      if (audioQueue.length !== updatedTracks.length)
        await TrackPlayer.setQueue([...updatedTracks]);

      // console.log((await TrackPlayer.getQueue()).length);
    } catch (err) {
      console.log(err);
    }
  }
  ////////////////////// RETURNED COMPONENTS //////////////////////
  return (
    <MenuOption onSelect={handleDeleteMessage}>
      <DeleteIcon name="trash" size={15} color="gray" />
    </MenuOption>
  );
}
export default DeleteMessageMenuOption;
