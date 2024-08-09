import {Text} from 'react-native';
import {MenuOption} from 'react-native-popup-menu';
import {usePutUnHideMessageFromAllMutation} from '../../../Store/StoreInterface';
import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import socket from '../../../utils/SocketConfig';
import UnHideIcon from 'react-native-vector-icons/Entypo';
function UnhideMessageMenuOption({
  message,
  setMessageState,
  setHiddenFromUsers,
}) {
  ///////////////////// CONFIGS //////////////////////////////////
  /////////////////////// USESELECTERS ///////////////////////////
  const user = useSelector(state => state.user);
  const users = useSelector(state => state.users);

  ///////////////////////////// STATES //////////////////////////////
  ////////////////////////// APIS ///////////////////////////////////
  const [putUnhideMessageFromAll, putUnhideMessageFromAllResponse] =
    usePutUnHideMessageFromAllMutation();

  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    if (
      !putUnhideMessageFromAllResponse.isLoading &&
      !putUnhideMessageFromAllResponse.isUninitialized
    ) {
      if (putUnhideMessageFromAllResponse.isError) {
      } else {
        setHiddenFromUsers([]);

        //EXTRACTING HIDDENFROM USERS WHO ARE ONLINE
        const unhidenFromOnlineUsers = users.filter(usr => {
          const isHiddenFromUser = message.hiddenFor.find(
            hiddenFromUsr => hiddenFromUsr === usr._id,
          );
          if (isHiddenFromUser && usr.isOnline) return true;
          else return false;
        });

        const senderUser = users.find(usr => usr._id === message.sender);
        unhidenFromOnlineUsers.map(onlineUnhiddenFromUser => {
          socket.emit('getHiddenMsg', {
            senderId: message.sender,
            receiverId: onlineUnhiddenFromUser._id,
            text: message.text,
            file: message.file,
            convId: message.conversationId,
            senderUsername: senderUser.username,
            _id: message._id,
            createdAt: message.createdAt,
            senderAvatar: senderUser.avatar,
          });
        });

        setMessageState({...message, hiddenFor: []});
      }
    }
  }, [putUnhideMessageFromAllResponse]);
  ////////////////////// HOOKS  //////////////////////
  function handleUnHideMessage() {
    putUnhideMessageFromAll({
      isAdmin: user.isAdmin,
      token: user.token,
      msgId: message._id,
    });
  }
  ////////////////////// RETURNED COMPONENTS //////////////////////
  return (
    <MenuOption onSelect={handleUnHideMessage}>
      <UnHideIcon name="eye" size={15} color="gray" />
    </MenuOption>
  );
}
export default UnhideMessageMenuOption;
