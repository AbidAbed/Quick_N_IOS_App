import {Text} from 'react-native';
import {MenuOption} from 'react-native-popup-menu';
import {usePutHideMessageFromAllMutation} from '../../../Store/StoreInterface';
import {useSelector} from 'react-redux';
import {useEffect} from 'react';
import socket from '../../../utils/SocketConfig';
import HideAllIcon from 'react-native-vector-icons/MaterialIcons';
function HideFromAllMembersMessageMenuOption({
  message,
  setMessageState,
  setHiddenMode,
  setHiddenFromUsers,
}) {
  ///////////////////// CONFIGS //////////////////////////////////

  /////////////////////// USESELECTERS ///////////////////////////
  const user = useSelector(state => state.user);
  const users = useSelector(state => state.users);
  const [selectedConversation] = useSelector(
    state => state.conversations,
  ).filter(conversation => conversation._id === message.conversationId);

  ///////////////////////////// STATES //////////////////////////////

  ////////////////////////// APIS ///////////////////////////////////
  const [putHideMessageFromAll, putHideMessageFromAllResponse] =
    usePutHideMessageFromAllMutation();

  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    if (
      !putHideMessageFromAllResponse.isLoading &&
      !putHideMessageFromAllResponse.isUninitialized
    ) {
      if (putHideMessageFromAllResponse.isError) {
      } else {
        setMessageState({...putHideMessageFromAllResponse.data});
        //EXTRACTING USERS WHO ARE HIDDEN FROM SEING THE MESSAGE AND THEY ARE MEMBERS OF CONVERSATION
        const hiddenFromUsers = users.filter(usr => {
          const isUserHiddenFrom =
            putHideMessageFromAllResponse.data.hiddenFor.find(
              hiddenFromUsr => hiddenFromUsr === usr._id,
            );
          if (isUserHiddenFrom) return true;
          else return false;
        });

        setHiddenFromUsers([...hiddenFromUsers]);

        //EXTRACTING USERS WHO ARE HIDDEN AND ONLINE FROM SEING THE MESSAGE AND THEY ARE MEMBERS OF CONVERSATION
        const onlineHiddenFromUsers = hiddenFromUsers.filter(
          hiddenFromUser => hiddenFromUser.isOnline,
        );

        //EXTRACTING THE PREVIOUS USERS IDS
        const onlineHiddenFromUsersIds = onlineHiddenFromUsers.map(
          hiddenFromOnlineUser => hiddenFromOnlineUser._id,
        );

        socket.emit('messageDeleted', {
          message_id: message._id,
          conversationId: message.conversationId,
          members: [...onlineHiddenFromUsersIds],
          senderId: message.sender,
        });
      }
    }
  }, [putHideMessageFromAllResponse]);
  ////////////////////// HOOKS  //////////////////////
  function handleHideMessage() {
    const usersInGroup = selectedConversation.members.filter(
      member => member !== user._id,
    );
    setHiddenMode(true);
    //console.log(usersInGroup);
    putHideMessageFromAll({
      isAdmin: user.isAdmin,
      token: user.token,
      msgId: message._id,
      usersInGroup: usersInGroup,
    });
  }

  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <MenuOption onSelect={handleHideMessage}>
      <HideAllIcon name="archive" size={15} color="gray" />
    </MenuOption>
  );
}
export default HideFromAllMembersMessageMenuOption;
