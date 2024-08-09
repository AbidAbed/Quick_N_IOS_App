import {useSelector} from 'react-redux';
import style from '../../../AppStyling';
import {usePutHideMessageMutation} from '../../../Store/StoreInterface';
import {useState, useEffect} from 'react';
import ModalList from '../../ModalList';
import useConfigHiddenFromMembers from '../../../Hooks/useConfigHiddenFromMembers';
import Button from '../../Button';
import {Text} from 'react-native';
import socket from '../../../utils/SocketConfig';
import HideIcon from 'react-native-vector-icons/Entypo';
import ContinueIcon from 'react-native-vector-icons/AntDesign';

function HideSingleMessageHandler({
  message,
  setMessageState,
  setIsHiddenFromPopupOpen,
  setHiddenMode,
  setHiddenFromUsers,
  isHiddenFromPopupOpen,
  hiddenFromUsers,
}) {
  ///////////////////// CONFIGS //////////////////////////////////

  /////////////////////// USESELECTERS ///////////////////////////

  const [selectedConversation] = useSelector(
    state => state.conversations,
  ).filter(conversation => conversation._id === message.conversationId);

  const users = useSelector(state => state.users);

  const user = useSelector(state => state.user);
  ///////////////////////////// STATES //////////////////////////////

  const [usersMembersNotHiddenFrom, setUsersMembersNotHiddenFrom] = useState(
    [],
  );

  const [pickedHiddenFromUsers, setPickedHiddenFromUsers] = useState([]);

  ////////////////////////// APIS ///////////////////////////////////
  const [putHideMessage, putHideMessageResponse] = usePutHideMessageMutation();

  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    //FINDING USERS WHO ARE MEMBERS
    const usersMembers = users.filter(usr => {
      const memberUser = selectedConversation?.members.find(
        memberId => memberId === usr._id,
      );

      if (memberUser && memberUser !== user._id) return true;
      else return false;
    });

    //FINDING USERS WHO ARE MEMBERS AND HIDDON FROM THE MESSAGE
    const hiddenUsersIds = [
      ...hiddenFromUsers.map(hiddenUser => hiddenUser._id),
      ...message.hiddenFor,
    ];

    //EXTRACTING NOT HIDDEN FROM USERS, FROM USERS MEMBERS WHO ARE NOT HIDDEN
    const usersMembersNotHiddenFrom = usersMembers.filter(userMember => {
      const isUserMemberHiddenFrom = hiddenUsersIds.find(
        hiddenFromUserId => hiddenFromUserId === userMember._id,
      );

      if (!isUserMemberHiddenFrom) return true;
      else return false;
    });

    //EXTRACTING HIDDEN FROM USERS, FROM THE HIDDEN MODE WHO ARE NOT HIDDEN FROM TH MESSAGE
    const usersNotHiddenFromMessageButFromHiddenMode = hiddenFromUsers.filter(
      hiddenFromUser => {
        const isUserHiddenFromMessage = message.hiddenFor.find(
          usrId => usrId === hiddenFromUser._id,
        );
        //console.log(isUserHiddenFromMessage);
        if ((isUserHiddenFromMessage, 'isUserHiddenFromMessage')) return false;
        else return true;
      },
    );

    setPickedHiddenFromUsers([...usersNotHiddenFromMessageButFromHiddenMode]);

    setHiddenMode(true);

    setUsersMembersNotHiddenFrom([
      ...usersNotHiddenFromMessageButFromHiddenMode,
      ...usersMembersNotHiddenFrom,
    ]);
  }, [selectedConversation, hiddenFromUsers, message.hiddenFor]);

  useEffect(() => {
    if (
      !putHideMessageResponse.isLoading &&
      !putHideMessageResponse.isUninitialized
    ) {
      if (putHideMessageResponse.isError) {
        //console.log('ERROR HIDING MESSAGE');
      } else {
        setIsHiddenFromPopupOpen(false);
        //SHOULD ADD HIDDEN FROM USERS

        setMessageState({
          ...message,
          hiddenFor: [
            ...message.hiddenFor,
            pickedHiddenFromUsers.map(hiddenFromUser => hiddenFromUser._id),
          ],
        });

        setHiddenFromUsers([...pickedHiddenFromUsers]);

        const onlineHiddenFromUsers = users
          .filter(usr => {
            const isUsrHiddenFrom = pickedHiddenFromUsers.find(
              hiddenFromUser => hiddenFromUser._id === usr._id,
            );

            if (isUsrHiddenFrom && usr.isOnline) return true;
            else return false;
          })
          .map(usr => usr._id);

        //SHOULD BE EDITED IF MESSAGE SHOULD BE UPDATED FOR OTHER USERS WHO IS HIDDEN
        socket.emit('messageDeleted', {
          message_id: message._id,
          conversationId: message.conversationId,
          members: [...onlineHiddenFromUsers],
          senderId: message.sender,
        });
      }
    }
  }, [putHideMessageResponse]);
  ////////////////////// HOOKS  //////////////////////

  function handleHideFromMember(member) {
    setPickedHiddenFromUsers([...pickedHiddenFromUsers, {...member}]);
  }

  function handleUnHideFromMember(member) {
    const newPickedHiddenFromUsers = pickedHiddenFromUsers.filter(
      pickedHiddenFromUser => pickedHiddenFromUser._id !== member._id,
    );

    setPickedHiddenFromUsers([...newPickedHiddenFromUsers]);
  }

  function handleHideMessage() {
    if (pickedHiddenFromUsers.length !== 0) {
      putHideMessage({
        isAdmin: user.isAdmin,
        token: user.token,
        hiddenArr: [...pickedHiddenFromUsers],
        msgId: message._id,
      });
    } else {
      //console.log('HIDDEN USERS IS NOT ALLOWED TO  BE EMPTY');
    }
  }
  ////////////////////// RETURNED COMPONENTS //////////////////////
  return (
    <>
      {isHiddenFromPopupOpen && selectedConversation?.isGroup ? (
        <ModalList
          pageName="Hide message"
          description="Hide the messages from"
          configHook={useConfigHiddenFromMembers(
            handleHideFromMember,
            handleUnHideFromMember,
            pickedHiddenFromUsers,
          )}
          isModalPressed={isHiddenFromPopupOpen}
          setIsModalPressed={isOpen => setIsHiddenFromPopupOpen(isOpen)}
          listItems={[...usersMembersNotHiddenFrom].sort(
            useSortItems('username'),
          )}
          isLoading={putHideMessageResponse.isLoading}
          searchKey="username">
          {pickedHiddenFromUsers.length !== 0 ? (
            <Button
              icon={<ContinueIcon name="arrowright" size={25} color="white" />}
              styleButton={[
                style.submitFormButton,
                {
                  width: '100%',
                  height: '100%',
                  borderRadius: 60,
                  borderWidth: 1,
                  borderColor: '#B0B2B3',
                  backgroundColor: '#058095',
                },
              ]}
              styleText={style.submitFormButtonText}
              onPress={handleHideMessage}
            />
          ) : (
            <Text>Must Select At Least One User</Text>
          )}
        </ModalList>
      ) : (
        <></>
      )}
    </>
  );
}
export default HideSingleMessageHandler;
