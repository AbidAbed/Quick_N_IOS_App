import {useDispatch, useSelector} from 'react-redux';
import ModalList from '../../ModalList';
import {useEffect, useState} from 'react';
import useConfigForwardMessageHandler from '../../../Hooks/useConfigForwardMessageHandler';
import useFilterUsersWithNoConversations from '../../../Hooks/useFilterUsersWithNoConversations';
import {View} from 'react-native';
import style from '../../../AppStyling';
import Button from '../../Button';
import {
  addUserConversation,
  usePostForwardMessageMutation,
} from '../../../Store/StoreInterface';
import socket from '../../../utils/SocketConfig';
import ForwardMessageIcon from 'react-native-vector-icons/Entypo';
import ContinueIcon from 'react-native-vector-icons/AntDesign';
import useSortItems from '../../../Hooks/useSortItems';

function ForwardMessageHandler({
  setIsForwardMessageModalOpen,
  isForwardMessageModalOpen,
  message,
  setMessages,
  handleAppendMessage,
}) {
  ///////////////////// CONFIGS //////////////////////////////////

  const dispatch = useDispatch();

  /////////////////////// USESELECTERS ///////////////////////////
  const userConversations = useSelector(state => state.conversations).map(
    usrConversation => {
      return {...usrConversation, isAConversation: true};
    },
  );
  const selectedConversationId = useSelector(
    state => state.config.selectedConversationId,
  );

  const users = useSelector(state => state.users);
  const user = useSelector(state => state.user);

  ///////////////////////////// STATES //////////////////////////////

  const [addedUsers, setAddedUsers] = useState([]);
  const [addedConversations, setAddedConversations] = useState([]);
  const [usersWithoutConversation, setUsersWithoutConversation] = useState([
    ...useFilterUsersWithNoConversations({userConversations, users, user}),
  ]);

  ////////////////////////// APIS ///////////////////////////////////

  const [postForwardMessage, postForwardMessageResponse] =
    usePostForwardMessageMutation();

  //////////////////////// USEEFFECTS ////////////////////////////////

  useEffect(() => {
    if (
      !postForwardMessageResponse.isUninitialized &&
      !postForwardMessageResponse.isLoading
    ) {
      if (postForwardMessageResponse.isError) {
        //console.log('ERROR FORWARDING THE MESSAGE');
      } else {
        //EXTRACT ONLINE USERS FROM THE CONVERSATIONS RESPONSE
        const onlineUsersToForward = [
          ...addedUsers,
          ...addedConversations,
        ].reduce((prev, curr) => {
          if (curr.isAConversation) {
            const membersIds = curr.members.filter(
              member => member !== user._id,
            );

            const onlineMembers = users.reduce((prevUsr, currUsr) => {
              const isUserAMember = membersIds.find(
                memberId => memberId === currUsr._id,
              );
              if (isUserAMember && currUsr.isOnline)
                return {...prevUsr, [currUsr._id]: {...currUsr}};
              else return {...prevUsr};
            }, {});

            return {...prev, ...onlineMembers};
          } else {
            if (curr._id === user._id) return {...prev};

            if (curr.isOnline) return {...prev, [curr._id]: {...curr}};
            else return {...prev};
          }
        }, {});

        //REFORMAT THE ARRAY TO EMIT MESSAGES , STARTING A CONVERSATION AND DISPATCH NEW CONVERSATIONS
        const chatsToForwardMessageAndCreateConversations =
          postForwardMessageResponse.data.reduce((prev, curr) => {
            const onlineMembers = Object.entries(onlineUsersToForward).reduce(
              (prevOnlineUsrs, currOnlineUsr) => {
                const isOnlineUserAMember = curr.conversation.members.find(
                  memberId => memberId === currOnlineUsr[0],
                );

                if (isOnlineUserAMember && isOnlineUserAMember !== user._id)
                  return [...prevOnlineUsrs, {...currOnlineUsr[1]}];
                else return [...prevOnlineUsrs];
              },
              [],
            );

            const isAnOldConversation = addedConversations.find(
              addedConversation =>
                addedConversation._id === curr.conversation._id,
            );

            if (isAnOldConversation) {
              return [
                ...prev,
                {
                  isAnOldConversation: true,
                  onlineMembers: [...onlineMembers],
                  newMessage: {...curr.newMsg},
                  conversation: {...curr.conversation},
                },
              ];
            } else {
              return [
                ...prev,
                {
                  isAnOldConversation: false,
                  onlineMembers: [...onlineMembers],
                  newMessage: {...curr.newMsg},
                  conversation: {...curr.conversation},
                },
              ];
            }
          }, []);

        ////console.log(chatsToForwardMessageAndCreateConversations);

        //STARTING EMITTING AND DISPATCHING
        chatsToForwardMessageAndCreateConversations.map(
          singleConversationUsrMsg => {
            //EMITING THE SEND FORWARDED MESSAGE
            if (
              selectedConversationId ===
              singleConversationUsrMsg.conversation._id
            )
              handleAppendMessage({
                text: singleConversationUsrMsg.newMessage.text,
                file: singleConversationUsrMsg.newMessage.file,
                _id: singleConversationUsrMsg.newMessage._id,
                senderId: singleConversationUsrMsg.newMessage.sender,
                convId: singleConversationUsrMsg.newMessage.conversationId,
                isForwarded: true,
                hiddenFor: [...singleConversationUsrMsg.newMessage.hiddenFor],
                createdAt: singleConversationUsrMsg.newMessage.createdAt,
              });

            singleConversationUsrMsg.onlineMembers.map(onlineUser => {
              socket.emit('forwardMsg', {
                senderId: user._id,
                receiverId: onlineUser._id,
                message: {...singleConversationUsrMsg.newMessage},
                convId: singleConversationUsrMsg.newMessage.conversationId,
                senderUsername: user.username,
                senderAvatar: user.avatar,
                _id: message._id,
                createdAt: message.createdAt,
              });
            });

            //EMITTING THE START A CONVERSATION FOR NEW CONVERSATIONS

            if (!singleConversationUsrMsg.isAnOldConversation) {
              if (singleConversationUsrMsg.onlineMembers.length !== 0) {
                socket.emit('startConversation', {
                  senderId: user._id,
                  receiverId: singleConversationUsrMsg.onlineMembers[0]._id,
                  convId: singleConversationUsrMsg.conversation._id,
                });
              }

              dispatch(
                addUserConversation({
                  ...singleConversationUsrMsg.conversation,
                  latestMessage: {...message},
                  isUnread: true,
                }),
              );
            }
          },
        );

        setIsForwardMessageModalOpen(false);
      }
    }
  }, [postForwardMessageResponse]);
  ////////////////////// HOOKS  /////////////////////////////////////
  function handleAddConversation(conversation) {
    ////console.log(conversation);
    setAddedConversations([{...conversation}, ...addedConversations]);
  }

  function handleRemoveConversation(conversation) {
    const newConversations = addedConversations.filter(
      addedConversation => addedConversation._id !== conversation._id,
    );

    setAddedConversations([...newConversations]);
  }
  function handleAddUser(addedUser) {
    ////console.log(addedUser, 4444);
    setAddedUsers([{...addedUser}, ...addedUsers]);
  }

  function handleRemoveUser(removedUser) {
    const newUsers = addedUsers.filter(
      addedUser => addedUser._id !== removedUser._id,
    );

    setAddedUsers([...newUsers]);
  }

  function handleFowrwardMessage() {
    if (addedUsers.length === 0 && addedConversations.length === 0) {
      ////console.log('YOU SHOULD FORWARD MESSAGE TO AT LEAST ONE USER');
    } else {
      ////console.log(addedConversations, addedUsers);
      postForwardMessage({
        isAdmin: user.isAdmin,
        token: user.token,
        msgId: message._id,
        forwardedConversationsArr: [
          ...addedConversations.map(addedConversation => addedConversation._id),
        ],
        usersForwardedArr: [...addedUsers.map(addedUser => addedUser._id)],
      });
    }
  }
  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <ModalList
      pageName="Forward message"
      description="Forward message to"
      configHook={useConfigForwardMessageHandler(
        handleAddConversation,
        handleRemoveConversation,
        addedConversations,
        handleAddUser,
        handleRemoveUser,
        addedUsers,
      )}
      isModalPressed={isForwardMessageModalOpen}
      setIsModalPressed={setIsForwardMessageModalOpen}
      listItems={[...userConversations, ...usersWithoutConversation].sort(
        useSortItems('convName'),
      )}
      isLoading={postForwardMessageResponse.isLoading}
      searchKey="convName">
      <View>
        {addedUsers.length !== 0 || addedConversations.length !== 0 ? (
          <Button
            icon={<ContinueIcon name="arrowright" size={25} color="white" />}
            onPress={handleFowrwardMessage}
            styleButton={[
              style.submitFormButton,
              {
                borderRadius: 50,
                borderWidth: 1,
                borderColor: '#B0B2B3',
                backgroundColor: '#058095',
                width: '100%',
                height: '100%',
              },
            ]}
            styleText={style.submitFormButtonText}
          />
        ) : (
          <></>
        )}
      </View>
    </ModalList>
  );
}
export default ForwardMessageHandler;
