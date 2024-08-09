import {useDispatch, useSelector} from 'react-redux';
import {
  updateConversationNotificationById,
  updateLeatestMessage,
  useGetConversationMessagesMutation,
  usePostMessageMutation,
} from '../Store/StoreInterface';
import {useEffect, useReducer, useRef, useState} from 'react';
import useConfigMessagesState from '../Hooks/useConfigMessagesState';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Keyboard,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Button from './Button';
import Input from './Input';
import style from '../AppStyling';
import socket from '../utils/SocketConfig';
import Message from './Message';
import configSendersUsers from '../Hooks/configSendersUsers';
import ModalList from './ModalList';
import useConfigHiddenFromMembers from '../Hooks/useConfigHiddenFromMembers';
import {binarySearchHiddenMessage} from '../Hooks/binarySearchHiddenMessage';
import AudioRecorder from './AudioRecorder';
import FilePicker from './FilePicker';
import ChatBackground from '../Assets/ChatBackground.jpeg';
import ChatBackgroundHiddenMode from '../Assets/ChatBackgroundHiddenMode.jpeg';
import AttachFileIcon from 'react-native-vector-icons/Entypo';
import SendIcon from 'react-native-vector-icons/Ionicons';
import AddUserToHiddenFrom from 'react-native-vector-icons/MaterialIcons';
import ChatIcon from 'react-native-vector-icons/MaterialIcons';
import HideIcon from 'react-native-vector-icons/Entypo';
import ScrollDownIcon from 'react-native-vector-icons/AntDesign';
import ContinueIcon from 'react-native-vector-icons/AntDesign';
import useSortItems from '../Hooks/useSortItems';

function reducer(state, action) {
  return {...state, [action.type]: action.payload};
}

function Messages({conversationId}) {
  ///////////////////// CONFIGS //////////////////////////////////

  const flatListRef = useRef(null);
  const translateY = useRef(new Animated.Value(0)).current;

  const dispatch = useDispatch();

  /////////////////////// USESELECTERS ///////////////////////////
  const user = useSelector(state => state.user);

  const {searchedMessageId} = useSelector(state => state.config);

  const [selectedConversation] = useSelector(
    state => state.conversations,
  ).filter(
    conversation => conversationId && conversation._id === conversationId,
  );

  const users = useSelector(state => state.users);

  ///////////////////////////// STATES //////////////////////////////
  const [messagesState, editMessagesState] = useReducer(
    reducer,
    useConfigMessagesState(),
  );

  //ONLINE USERS IN THIS GROUP
  const [onlineUsers, setOnlineUsers] = useState(
    Object.entries(configSendersUsers(users))
      .filter(usr => {
        const isOnlineUserMember = selectedConversation?.members.find(
          member => member === usr[1]._id,
        );
        if (
          usr[1].isOnline &&
          isOnlineUserMember &&
          isOnlineUserMember !== user._id
        )
          return true;
        else return false;
      })
      .reduce((prev, cur) => {
        return {...prev, [cur[0]]: {...cur[1]}};
      }, {}),
  );

  ////////////////////////// APIS ///////////////////////////////////

  const [getMessages, getMessagesResponse] =
    useGetConversationMessagesMutation();
  const [postMessage, postMessageResponse] = usePostMessageMutation();

  //////////////////////// USEEFFECTS ////////////////////////////////

  useEffect(() => {
    getMessages({
      messageQuery: {},
      token: user.token,
      isAdmin: user.isAdmin,
      conversationId: conversationId,
    });

    dispatch(
      updateConversationNotificationById({
        convId: conversationId,
        isUnread: false,
      }),
    );
  }, []);

  useEffect(() => {
    if (!messagesState.isHiddenMode)
      editMessagesState({type: 'hiddenFromUsers', payload: []});
  }, [messagesState.isHiddenMode]);

  useEffect(() => {
    const usersMembers = users.filter(usr => {
      const memberUser = selectedConversation?.members.find(
        memberId => memberId === usr._id,
      );

      if (memberUser && memberUser !== user._id) return true;
      else return false;
    });

    editMessagesState({type: 'chatMembers', payload: [...usersMembers]});
  }, [selectedConversation]);

  useEffect(() => {
    if (
      !getMessagesResponse.isUninitialized &&
      !getMessagesResponse.isLoading
    ) {
      if (getMessagesResponse.isError) {
      } else {
        handleAppendMessages(getMessagesResponse.data);
        setTimeout(() => {
          editMessagesState({type: 'isDoneFetching', payload: true});
        }, 3000);
      }
    }
  }, [getMessagesResponse]);

  useEffect(() => {
    socket.on(
      'getMessage',
      ({
        senderId,
        text,
        file,
        convId,
        senderUsername,
        _id,
        senderAvatar,
        isForwarded,
      }) => {
        if (convId === conversationId) {
          handleAppendMessage({
            text,
            file,
            _id,
            senderId,
            convId,
            isForwarded,
            hiddenFor: [],
            createdAt: Date.now(),
          });
        }
        dispatch(
          updateLeatestMessage({
            convId: convId,
            latestMessage: {
              sender: senderId,
              text,
              file,
              conversationId: convId,
              _id,
              isForwarded,
              createdAt: Date.now(),
            },
          }),
        );
        dispatch(
          updateConversationNotificationById({
            convId: convId,
            isUnread: true,
          }),
        );
      },
    );

    socket.on('messageDeleted', recData => {
      if (recData.conversationId === conversationId) {
        const newMessages = messagesState.messages.filter(
          message => message._id !== recData.message_id,
        );
        editMessagesState({type: 'messages', payload: [...newMessages]});
      } else {
        const conversationRecMsg = userConversations.find(
          usrConver => usrConver._id === recData.conversationId,
        );

        if (conversationRecMsg.latestMessage._id === recData.message_id)
          dispatch(
            updateLeatestMessage({
              convId: conversationRecMsg._id,
              latestMessage: {
                ...conversationRecMsg.latestMessage,
                text: 'This message was deleted',
              },
            }),
          );
      }
    });

    socket.on(
      'updatedMessage',
      ({senderId, conversationId, message_id, newText}) => {
        if (conversationId === selectedConversation?._id) {
          const newMessages = messagesState.messages.map(message => {
            if (message._id === message_id) {
              return {...message, text: newText};
            } else return message;
          });

          editMessagesState({type: 'messages', payload: [...newMessages]});
        } else {
          const conversationRecMsg = userConversations.find(
            usrConver => usrConver._id === recData.conversationId,
          );

          if (conversationRecMsg.latestMessage._id === recData.message_id)
            dispatch(
              updateLeatestMessage({
                convId: conversationRecMsg._id,
                latestMessage: {
                  ...conversationRecMsg.latestMessage,
                  text: 'EDITED ' + conversationRecMsg.latestMessage.text,
                },
              }),
            );
        }
      },
    );

    socket.on('getHiddenMsg', async newMsg => {
      try {
        if (newMsg.conversationId === selectedConversation._id) {
          const messagesAfterHidden = await binarySearchHiddenMessage(
            JSON.parse(JSON.stringify(messagesState.messages)),
            {
              ...newMsg,
              hiddenFor: [],
              sender: newMsg.senderId,
              conversationId: newMsg.convId,
            },
          );
          editMessagesState({
            type: 'messages',
            payload: [...messagesAfterHidden],
          });
        } else {
          const conversationRecMsg = userConversations.find(
            usrConver => usrConver._id === newMsg.convId,
          );

          if (conversationRecMsg.latestMessage._id === newMsg._id)
            dispatch(
              updateLeatestMessage({
                convId: conversationRecMsg._id,
                latestMessage: {
                  ...conversationRecMsg.latestMessage,
                  text: 'HIDDEN ' + conversationRecMsg.latestMessage.text,
                },
              }),
            );
        }
      } catch (err) {
        //console.log(err);
      }
    });

    // return () => {
    //   socket.off('getMessage');
    //   socket.off('messageDeleted');
    //   socket.off('updatedMessage');
    //   socket.off('getHiddenMsg');
    // };
  }, [messagesState.messages]);

  useEffect(() => {
    if (
      !postMessageResponse.isLoading &&
      !postMessageResponse.isUninitialized
    ) {
      if (postMessageResponse.isError) {
      } else {
        //should be edited for files

        Object.keys(onlineUsers).map(usr => {
          const isMemberUserInHidden = postMessageResponse.data.hiddenFor.find(
            usrId => usrId === usr,
          );
          //I HATE DOING THIS !!!! BUT THAT'S THE WAY IT'S
          if (
            postMessageResponse.data.hiddenFor.length !== 0 &&
            !isMemberUserInHidden &&
            usr !== user._id
          )
            socket.emit('getHiddenMsg', {
              senderId: user._id,
              receiverId: usr,
              text: postMessageResponse.data.text,
              file: null,
              convId: conversationId,
              senderUsername: user.username,
              _id: postMessageResponse.data._id,
              createdAt: postMessageResponse.data.createdAt,
              senderAvatar: user.avatar,
            });
          else if (!isMemberUserInHidden && usr !== user._id)
            socket.emit('sendMessage', {
              senderId: user._id,
              receiverId: usr,
              text: postMessageResponse.data.text,
              file: null,
              convId: conversationId,
              senderUsername: user.username,
              _id: postMessageResponse.data._id,
              createdAt: postMessageResponse.data.createdAt,
              senderAvatar: user.avatar,
            });
        });

        handleAppendMessage({
          text: postMessageResponse.data.text,
          file: null,
          _id: postMessageResponse.data._id,
          senderId: postMessageResponse.data.sender,
          convId: postMessageResponse.data.conversationId,
          hiddenFor: [...postMessageResponse.data.hiddenFor],
          createdAt: postMessageResponse.data.createdAt,
        });
      }
    }
  }, [postMessageResponse]);

  useEffect(() => {
    setOnlineUsers(
      Object.entries(configSendersUsers(users))
        .filter(usr => {
          const isOnlineUserMember = selectedConversation?.members.find(
            member => member === usr[1]._id,
          );
          if (usr[1].isOnline && isOnlineUserMember) return true;
          else return false;
        })
        .reduce((prev, cur) => {
          return {...prev, [cur[0]]: {...cur[1]}};
        }, {}),
    );
  }, [users]);

  useEffect(() => {
    if (messagesState.isNewMessage) {
      if (
        messagesState.messages[messagesState.messages.length - 1].sender !==
        user._id
      ) {
        if (
          messagesState.contentHeight - messagesState.flatListHeight <=
            messagesState.currentYPosition &&
          messagesState.currentYPosition <=
            messagesState.contentHeight - messagesState.flatListHeight
        )
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({animated: true});
          }, 0);
      } else {
        dispatch(
          updateLeatestMessage({
            convId:
              messagesState.messages[messagesState.messages.length - 1]
                .conversationId,
            latestMessage: {
              text: messagesState.messages[messagesState.messages.length - 1]
                .text,
              _id: messagesState.messages[messagesState.messages.length - 1]
                ._id,
              file: messagesState.messages[messagesState.messages.length - 1]
                .file,
              conversationId:
                messagesState.messages[messagesState.messages.length - 1]
                  .conversationId,
              sender:
                messagesState.messages[messagesState.messages.length - 1]
                  .sender,
              isForwarded:
                messagesState.messages[messagesState.messages.length - 1]
                  .isForwarded,
              hiddenFor: [
                ...messagesState.messages[messagesState.messages.length - 1]
                  .hiddenFor,
              ],
              createdAt:
                messagesState.messages[messagesState.messages.length - 1]
                  .createdAt,
            },
          }),
        );
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 0);
      }
    }
  }, [messagesState.isNewMessage]);

  //SCROLL IF USER OPENED THE KEYBOARD

  // useEffect(() => {
  //   if (messagesState.isMessageInputFocused)
  //     setTimeout(() => {
  //       flatListRef.current.scrollToEnd({animated: true});
  //     }, 1);

  //   const keyboardDidHideListener = Keyboard.addListener(
  //     'keyboardDidHide',
  //     () => {
  //       setTimeout(() => {
  //         flatListRef.current.scrollToEnd({animated: true});
  //       }, 1);
  //     },
  //   );

  //   const keyboardDidShowListener = Keyboard.addListener(
  //     'keyboardDidShow',
  //     () => {
  //       setTimeout(() => {
  //         flatListRef.current.scrollToEnd({animated: true});
  //       }, 1);
  //     },
  //   );

  //   return () => {
  //     keyboardDidHideListener.remove();
  //     keyboardDidShowListener.remove();
  //   };
  // }, [messagesState.isMessageInputFocused]);
  ////////////////////// HOOKS  //////////////////////

  function handleScroll(event) {
    const {contentSize, contentOffset} = event.nativeEvent;
    if (
      !messagesState.isNoEnd &&
      contentSize.height - messagesState.flatListHeight - 50 <=
        contentOffset.y &&
      contentOffset.y <= contentSize.height - messagesState.flatListHeight &&
      !messagesState.isInitialFetch
    ) {
      getMessages({
        messageQuery: {message_id: messagesState.bottomMessageId, newer: true},
        token: user.token,
        isAdmin: user.isAdmin,
        conversationId: conversationId,
      });
      editMessagesState({
        type: 'isEndReached',
        payload: true,
      });
    } else if (
      !messagesState.isNoTop &&
      0 <= contentOffset.y &&
      contentOffset.y <= 10 &&
      !messagesState.isInitialFetch
    ) {
      getMessages({
        messageQuery: {message_id: messagesState.topMessageId, newer: false},
        token: user.token,
        isAdmin: user.isAdmin,
        conversationId: conversationId,
      });
      editMessagesState({
        type: 'isTopReached',
        payload: true,
      });
      // setTimeout(() => {
      //   flatListRef.current.scrollToOffset({
      //     offset: (contentSize.height / messagesState.messages.length) * 5,
      //     animated: true,
      //   });
      // }, 0);
      flatListRef.current.scrollToOffset({
        offset: (contentSize.height / messagesState.messages.length) * 5,
        animated: true,
      });
    }

    editMessagesState({
      type: 'currentYPosition',
      payload: contentOffset.y,
    });
  }

  function handleMessageTextChange(text) {
    editMessagesState({
      type: 'messageText',
      payload: text,
    });
  }

  function handleSendMessage() {
    //should be edited for files
    editMessagesState({
      type: 'messageText',
      payload: '',
    });

    if (messagesState.messageText !== '') {
      postMessage({
        isAdmin: user.isAdmin,
        token: user.token,
        sender: user._id,
        text: messagesState.messageText,
        conversationId: conversationId,
        file: null,
        hiddenFor: [...messagesState.hiddenFromUsers],
      });
    }
  }

  function handleScrollDownButton() {
    editMessagesState({
      type: 'isNewMessage',
      payload: false,
    });
    setTimeout(() => {
      flatListRef.current.scrollToEnd({animated: true});
    }, 0);
  }

  function handleContentHeightChange(contentWidth, contentHeight) {
    editMessagesState({
      type: 'contentHeight',
      payload: contentHeight,
    });

    if (messagesState.isInitialFetch) {
      if (searchedMessageId !== null)
        // setTimeout(() => {
        //   flatListRef.current.scrollToEnd({animated: true});
        // }, 0);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 0);
      else {
        if (
          messagesState.flatListHeight > messagesState.contentHeight &&
          messagesState.topMessageId !== null &&
          messagesState.messages.length !== 0
        ) {
          editMessagesState({type: 'isTopReached', payload: true});
          editMessagesState({type: 'isInitialFetch', payload: true});
          getMessages({
            messageQuery: {
              message_id: messagesState.topMessageId,
              newer: false,
            },
            token: user.token,
            isAdmin: user.isAdmin,
            conversationId: conversationId,
          });
        } else
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({animated: true});
          }, 1000);
      }
    } else if (messagesState.isNewMessage) {
      if (
        messagesState.contentHeight - 2 * messagesState.flatListHeight <=
          messagesState.currentYPosition &&
        messagesState.currentYPosition <=
          messagesState.contentHeight - messagesState.flatListHeight
      ) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 0);
        editMessagesState({
          type: 'isNewMessage',
          payload: false,
        });
      }
    }
  }

  function handleLayoutChange(event) {
    const {height} = event.nativeEvent.layout;
    if (height !== 0 && messagesState.isInitialFetch)
      setTimeout(() => {
        flatListRef.current.scrollToEnd({animated: true});
        editMessagesState({
          type: 'isInitialFetch',
          payload: false,
        });
      }, 0);
    editMessagesState({
      type: 'flatListHeight',
      payload: height,
    });
  }

  function handleAppendMessages(messagesResponse) {
    // editMessagesState({type: 'messages', payload: messagesResponse});

    if (
      messagesState.bottomMessageId === null &&
      messagesState.topMessageId === null
    ) {
      if (messagesResponse.length === 0) return;
      editMessagesState({type: 'messages', payload: [...messagesResponse]});
      editMessagesState({
        type: 'bottomMessageId',
        payload: messagesResponse[messagesResponse.length - 1]._id,
      });
      editMessagesState({
        type: 'topMessageId',
        payload: messagesResponse[0]._id,
      });
      editMessagesState({
        type: 'isInitialFetch',
        payload: true,
      });
      if (searchedMessageId === null)
        editMessagesState({
          type: 'isNoEnd',
          payload: true,
        });
    } else {
      if (messagesState.isEndReached) {
        editMessagesState({
          type: 'isEndReached',
          payload: false,
        });

        if (messagesResponse.length === 0) {
          editMessagesState({
            type: 'isNoEnd',
            payload: true,
          });
        } else {
          editMessagesState({
            type: 'messages',
            payload: [...messagesState.messages, ...messagesResponse],
          });
          editMessagesState({
            type: 'bottomMessageId',
            payload: messagesResponse[messagesResponse.length - 1]._id,
          });
        }
      } else if (messagesState.isTopReached) {
        editMessagesState({
          type: 'isTopReached',
          payload: false,
        });

        if (messagesResponse.length === 0) {
          editMessagesState({
            type: 'isNoTop',
            payload: true,
          });
        } else {
          editMessagesState({
            type: 'messages',
            payload: [...messagesResponse, ...messagesState.messages],
          });

          editMessagesState({
            type: 'topMessageId',
            payload: messagesResponse[0]._id,
          });
        }
      } else {
      }
    }
  }

  function handleAppendMessage(message) {
    //{text, file, _id, senderId, convId} content of message object

    editMessagesState({
      type: 'bottomMessageId',
      payload: message._id,
    });

    editMessagesState({
      type: 'messages',
      payload: [
        ...messagesState.messages,
        {
          text: message.text,
          _id: message._id,
          file: message.file,
          conversationId: message.convId,
          sender: message.senderId,
          isForwarded: message.isForwarded,
          hiddenFor: [...message.hiddenFor],
          createdAt: message.createdAt,
        },
      ],
    });

    editMessagesState({
      type: 'isNewMessage',
      payload: true,
    });
  }

  function handleOpenHideFromMembersPopup() {
    editMessagesState({type: 'isHideFromMembersPopupOpen', payload: true});
  }

  function handleHideFromMember(memberUser) {
    editMessagesState({
      type: 'hiddenFromUsers',
      payload: [{...memberUser}, ...messagesState.hiddenFromUsers],
    });
  }

  function handleUnHideFromMember(memberUser) {
    const newHiddenFromUsers = messagesState.hiddenFromUsers.filter(
      hiddenMember => memberUser._id !== hiddenMember._id,
    );

    editMessagesState({
      type: 'hiddenFromUsers',
      payload: [...newHiddenFromUsers],
    });
  }

  function handleEnterHiddenMode() {
    editMessagesState({
      type: 'isHiddenMode',
      payload: true,
    });
  }

  function handleExistHiddenMode() {
    editMessagesState({
      type: 'isHiddenMode',
      payload: false,
    });
  }
  // const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 40;

  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <ImageBackground
      source={
        messagesState.isHiddenMode ? ChatBackgroundHiddenMode : ChatBackground
      }
      style={{
        flex: 1,
        resizeMode: 'cover', // or 'stretch' or 'contain'
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}>
      <View
        style={{
          height: '100%',
          flexDirection: 'column',
          width: '100%',
          // flex: 1,
        }}>
        {getMessagesResponse.isLoading || !messagesState.isDoneFetching ? (
          <ActivityIndicator
            size="large"
            color="#058095"
            style={{height: '100%'}}
          />
        ) : (
          false
        )}

        {/** MESSAGES LIST */}
        <GestureHandlerRootView style={{flex: 5}}>
          <FlatList
            ref={flatListRef}
            data={messagesState.messages}
            onLayout={handleLayoutChange}
            onContentSizeChange={handleContentHeightChange}
            onScroll={handleScroll}
            keyExtractor={item => item._id}
            renderItem={({item}) => {
              return (
                <Message
                  message={item}
                  sendersUsers={configSendersUsers(users)}
                  setMessages={newMessages =>
                    editMessagesState({
                      type: 'messages',
                      payload: [...newMessages],
                    })
                  }
                  handleAppendMessage={handleAppendMessage}
                  messages={messagesState.messages}
                  onlineUsers={onlineUsers}
                  hiddenFromUsers={messagesState.hiddenFromUsers}
                  setHiddenMode={isHiddenMode =>
                    editMessagesState({
                      type: 'isHiddenMode',
                      payload: isHiddenMode,
                    })
                  }
                  setHiddenFromUsers={hiddenFromUsers =>
                    editMessagesState({
                      type: 'hiddenFromUsers',
                      payload: [...hiddenFromUsers],
                    })
                  }
                  selectedConversation={selectedConversation}
                />
              );
            }}
          />
        </GestureHandlerRootView>

        {/**MESSAGES FOOTER , SHOWS SENDING OPTIONS */}
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            backgroundColor: 'transparent',
            minHeight: '1%',
          }}>
          <GestureHandlerRootView
            style={{
              flex: 1,
              backgroundColor: 'transparent',
            }}>
            <ScrollView
              contentContainerStyle={{flexGrow: 1}}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps={'always'}>
              <View
                style={{
                  // flex: 1,
                  flexDirection: 'column',
                  width: '100%',
                  justifyContent: 'center',
                  height: '100%',
                  alignItems: 'baseline',
                  backgroundColor: 'transparent',
                }}>
                {/**IF NEW MESSAGE APPEARED */}

                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'transparent',
                  }}>
                  {messagesState.isNewMessage &&
                  messagesState.messages[messagesState.messages.length - 1]
                    ?.sender !== user._id &&
                  !(
                    messagesState.contentHeight -
                      messagesState.flatListHeight -
                      50 <=
                      messagesState.currentYPosition &&
                    messagesState.currentYPosition <=
                      messagesState.contentHeight - messagesState.flatListHeight
                  ) ? (
                    <View
                      style={{
                        backgroundColor: 'transparent',
                        // height: '4%',
                        alignSelf: 'flex-end',
                      }}>
                      <Button
                        styleButton={[
                          style.submitFormButton,
                          // {width: '100%', height: '100%'},
                          {padding: '0%', borderRadius: 60},
                        ]}
                        icon={
                          <ScrollDownIcon
                            name="arrowdown"
                            color="white"
                            size={20}
                          />
                        }
                        styleText={style.submitFormButtonText}
                        onPress={handleScrollDownButton}
                      />
                    </View>
                  ) : (
                    false
                  )}
                </View>

                {/** SEND AND INPUT TEXT AREAT  */}
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    alignItems: 'center',
                    gap: 5,
                    paddingLeft: '3%',
                    paddingRight: '3%',
                  }}>
                  {/**MESSAGE INPUT TEXT && ATTACH FILE BUTTON && CHOOSE USERS TO HIDE FROM FOR ADMINS*/}
                  {!messagesState.isRecording ? (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        backgroundColor: messagesState.isHiddenMode
                          ? '#696969'
                          : 'white',
                        borderRadius: 7,
                        borderColor: 'transparent',
                        borderWidth: 1,
                        alignItems: 'center',
                      }}>
                      <Input
                        onChange={handleMessageTextChange}
                        value={messagesState.messageText}
                        onFocus={() =>
                          editMessagesState({
                            type: 'isMessageInputFocused',
                            payload: true,
                          })
                        }
                        onBlur={() =>
                          editMessagesState({
                            type: 'isMessageInputFocused',
                            payload: false,
                          })
                        }
                        style={[
                          style.inputForm,
                          {
                            backgroundColor: messagesState.isHiddenMode
                              ? '#696969'
                              : 'white',
                            color: messagesState.isHiddenMode
                              ? 'white'
                              : 'black',

                            flex: 1,
                            borderRadius: 7,
                          },
                        ]}
                        placeHolder="Type something ..."
                      />

                      {/** ATTACH FILE BUTTON*/}
                      <FilePicker
                        FilePickerMode="sendFileMessage"
                        options={{
                          hiddenFromUsers: [...messagesState.hiddenFromUsers],
                          handleAppendMessage: handleAppendMessage,
                          chatMembers: [...messagesState.chatMembers],
                        }}
                        buttonIcon={
                          <AttachFileIcon
                            name="attachment"
                            size={14}
                            color={`#B0B2B3`}
                          />
                        }
                        buttonStyle={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingRight: '3%',
                        }}
                      />
                      {/** CHOOSE USERS TO HIDE FROM FOR ADMINS */}
                      {messagesState.isHiddenMode &&
                      user.isAdmin &&
                      selectedConversation?.isGroup ? (
                        <Button
                          icon={
                            <AddUserToHiddenFrom
                              name="person-add-alt-1"
                              color={`#B0B2B3`}
                              size={14}
                            />
                          }
                          onPress={handleOpenHideFromMembersPopup}
                          styleButton={[
                            // style.submitFormButton,
                            // {width: '100%', height: '100%'},
                            {paddingRight: '3%'},
                          ]}
                          styleText={style.submitFormButtonText}
                        />
                      ) : (
                        false
                      )}

                      {/** ENTER, EXIST HIDDEN MODE*/}
                      {user.isAdmin && selectedConversation?.isGroup ? (
                        messagesState.isHiddenMode ? (
                          <Button
                            icon={
                              <HideIcon
                                name="eye"
                                color={`#B0B2B3`}
                                size={14}
                              />
                            }
                            onPress={handleExistHiddenMode}
                            styleButton={[
                              // style.submitFormButton,
                              // {width: '100%', height: '100%'},
                              {paddingRight: '3%'},
                            ]}
                            styleText={style.submitFormButtonText}
                          />
                        ) : (
                          <Button
                            icon={
                              <HideIcon
                                name="eye-with-line"
                                color={`#B0B2B3`}
                                size={14}
                              />
                            }
                            onPress={handleEnterHiddenMode}
                            styleButton={[
                              // style.submitFormButton,
                              // {width: '100%', height: '100%'},
                              {paddingRight: '3%'},
                            ]}
                            styleText={style.submitFormButtonText}
                          />
                        )
                      ) : (
                        false
                      )}
                    </View>
                  ) : (
                    false
                  )}

                  {/** SEND BUTTON*/}
                  {messagesState.messageText === '' ? (
                    // <View>
                    //{/** AUDIO RECORDER BUTTON*/}
                    <AudioRecorder
                      handleAppendMessage={handleAppendMessage}
                      chatMembers={messagesState.chatMembers}
                      hiddenFromUsers={messagesState.hiddenFromUsers}
                      isRecordingParent={messagesState.isRecording}
                      isHiddenMode={messagesState.isHiddenMode}
                      setIsRecordingParent={isRecording =>
                        editMessagesState({
                          type: 'isRecording',
                          payload: isRecording,
                        })
                      }
                    />
                  ) : (
                    // <View>
                    <Button
                      onPress={handleSendMessage}
                      styleButton={[
                        style.submitFormButton,
                        messagesState.isHiddenMode
                          ? {backgroundColor: '#696969'}
                          : {backgroundColor: '#058095'},

                        // {width: '100%', height: '100%'},
                        {
                          borderRadius: 30,
                          borderWidth: 1,
                          borderColor: '#B0B2B3',
                        },
                      ]}
                      styleText={{
                        color: 'white',
                        textAlign: 'center',
                        padding: '1%',
                      }}
                      icon={
                        <SendIcon
                          name="send-sharp"
                          size={20}
                          style={{borderRadius: 30}}
                          color={
                            messagesState.isHiddenMode ? '#B0B2B3' : 'white'
                          }
                        />
                      }
                    />
                    // </View>
                  )}
                </View>

                {/* </KeyboardAvoidingView> */}
              </View>
            </ScrollView>
          </GestureHandlerRootView>
        </View>

        {/**POPUP TO HIDE MESSAGES FROM USERES */}
        {messagesState.isHideFromMembersPopupOpen &&
        selectedConversation?.isGroup ? (
          <ModalList
            pageName="Hidden mode"
            description="Hide the new messages from"
            configHook={useConfigHiddenFromMembers(
              handleHideFromMember,
              handleUnHideFromMember,
              messagesState.hiddenFromUsers,
            )}
            isModalPressed={messagesState.isHideFromMembersPopupOpen}
            setIsModalPressed={isOpen =>
              editMessagesState({
                type: 'isHideFromMembersPopupOpen',
                payload: isOpen,
              })
            }
            listItems={[...messagesState.chatMembers].sort(
              useSortItems('username'),
            )}
            isLoading={false}
            searchKey="username">
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
                  backgroundColor: 'gray',
                },
              ]}
              styleText={style.submitFormButtonText}
              onPress={() =>
                editMessagesState({
                  type: 'isHideFromMembersPopupOpen',
                  payload: false,
                })
              }
            />
          </ModalList>
        ) : (
          false
        )}
      </View>
    </ImageBackground>
  );
}

export default Messages;
