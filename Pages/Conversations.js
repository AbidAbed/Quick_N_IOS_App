import {useDispatch, useSelector} from 'react-redux';
import {
  addGroup,
  addUserConversation,
  changeIsLoggedIn,
  changeLastAnnouncementUpdateTime,
  changeSelectedConversationId,
  deleteGroupByConversationId,
  fetchAnnouncements,
  fetchUserConversations,
  fetchUsersData,
  updateAnnouncement,
  updateGroupMembersByConversationId,
  updateOnlineUserStatus,
  useCreateConversationMutation,
  useGetAnnouncementsQuery,
  useGetConversationByIdMutation,
  useGetGroupByConversationIdMutation,
  useGetUserConversationsQuery,
  useGetUsersQuery,
  usePostCreateGroupMutation,
  usePutAnnouncementSingMutation,
} from '../Store/StoreInterface';
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import style from '../AppStyling';
import Button from '../Components/Button';
import Group from './Group';
import SingleChat from './SingleChat';
import socket from '../utils/SocketConfig';
import ModalList from '../Components/ModalList';
import useConfigStartAChat from '../Hooks/useConfigStartAChat';
import {FlatList, GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  deleteConversation,
  updateConversationMembers,
  updateConversationNotificationById,
  updateLeatestMessage,
} from '../Store/StoreInterface';
import useSortItems from '../Hooks/useSortItems';
import useConfigAnnouncements from '../Hooks/useConfigAnnouncements';
import TrackPlayer from 'react-native-track-player';
import {storage} from '../utils/storage';
import groupPic from '../Assets/groupPic.png';
import profilePic from '../Assets/contact-icon-empty.png';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import Input from '../Components/Input';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import OnlineStatus from 'react-native-vector-icons/FontAwesome';
import BackIcon from 'react-native-vector-icons/Ionicons';
import ChatIcon from 'react-native-vector-icons/MaterialIcons';
import FilePicker from '../Components/FilePicker';
import useConfigAddMembersToGroup from '../Hooks/useConfigAddMembersToGroup';
import useUpload from '../Hooks/useUpload';
import ContinueIcon from 'react-native-vector-icons/AntDesign';
function Conversations() {
  ///////////////////// CONFIGS //////////////////////////////////

  const dispatch = useDispatch();
  const navigation = useNavigation();
  /////////////////////// USESELECTERS ///////////////////////////

  const {selectedConversationId, path} = useSelector(state => state.config);
  const announcements = useSelector(state => state.announcements);

  const user = useSelector(state => state.user);

  const userConversations = useSelector(state => state.conversations);

  const users = useSelector(state => state.users);
  ///////////////////////////// STATES //////////////////////////////
  const [renderedComponent, setRenderedComponent] = useState(<></>);

  const [isStartAChatPressed, setIsStartAChat] = useState(false);

  const [isCreateGroupPressed, setIsCreateGroupPressed] = useState(false);

  const [createGroupMembers, setCreateGroupMembers] = useState([]);

  const [createGroupName, setCreateGroupName] = useState('');

  const [createGroupError, setCreateGroupError] = useState('');

  const [nonCheckedAnnouncements, setNnonCheckedAnnouncements] = useState(
    announcements.filter(announcement => {
      const isAnnouncementCheck = announcement.checkedUsers.find(
        checkedUser => checkedUser.userId === user._id,
      );
      if (isAnnouncementCheck) return false;
      else return true;
    }),
  );

  const [singleChatUsers, setSingleChatUsers] = useState(
    userConversations.reduce((prevUserConversation, currUserConversation) => {
      if (currUserConversation.isGroup) return {...prevUserConversation};

      const singleChatMemberId = currUserConversation.members.find(
        memberId => memberId !== user._id,
      );

      const singleChatUser = users.find(usr => singleChatMemberId === usr._id);

      return {
        ...prevUserConversation,
        [singleChatUser?._id]: {...singleChatUser},
      };
    }, {}),
  );

  const [createGroupAvatarPath, setCreateGroupAvatarPath] = useState(null);
  ////////////////////////// APIS ///////////////////////////////////
  const [postCreateGroup, postCreateGroupResponse] =
    usePostCreateGroupMutation();

  const [createConversation, createConversationResponse] =
    useCreateConversationMutation();

  const [getGroubByConversationId, getGroubByConversationIdResponse] =
    useGetGroupByConversationIdMutation();

  const [putAnnouncementSing, putAnnouncementSignResponse] =
    usePutAnnouncementSingMutation();

  const getAnnouncementsResponse = useGetAnnouncementsQuery({
    isAdmin: user.isAdmin,
    token: user.token,
  });

  const getUsersResponse = useGetUsersQuery({
    isAdmin: user.isAdmin,
    token: user.token,
  });

  const [getConversationById, getConversationByIdResponse] =
    useGetConversationByIdMutation();

  //Get user conversations
  const getUserConversationsResponse = useGetUserConversationsQuery({
    userId: user._id,
    token: user.token,
    isAdmin: user.isAdmin,
  });

  const [createFileObject, uploadFile] = useUpload({isAvatar: true});

  //////////////////////// USEEFFECTS ////////////////////////////////

  useEffect(() => {
    setNnonCheckedAnnouncements(
      announcements.filter(announcement => {
        const isAnnouncementCheck = announcement.checkedUsers.find(
          checkedUser => checkedUser.userId === user._id,
        );
        if (isAnnouncementCheck) return false;
        else return true;
      }),
    );
  }, [announcements]);

  useEffect(() => {
    if (
      !putAnnouncementSignResponse.isLoading &&
      !putAnnouncementSignResponse.isUninitialized
    ) {
      if (putAnnouncementSignResponse.isError) {
      } else {
        dispatch(updateAnnouncement({...putAnnouncementSignResponse.data}));
        putAnnouncementSignResponse.data.checkedUsers.map(checkedUser => {
          if (checkedUser.userId === user._id)
            socket.emit('announcementSign', {
              userId: user._id,
              userName: user.username,
              signTime: checkedUser.checkedAt,
              announcementId: putAnnouncementSignResponse.data._id,
              checkedUserObjectId: checkedUser._id,
            });
        });
      }
    }
  }, [putAnnouncementSignResponse]);

  useEffect(() => {
    if (
      !getAnnouncementsResponse.isLoading &&
      !getAnnouncementsResponse.isUninitialized
    ) {
      if (getAnnouncementsResponse.isError) {
      } else {
        dispatch(fetchAnnouncements([...getAnnouncementsResponse.data]));
        dispatch(changeLastAnnouncementUpdateTime(Date.now()));
      }
    }
  }, [getAnnouncementsResponse]);

  useEffect(() => {
    if (!getUsersResponse.isUninitialized && !getUsersResponse.isLoading) {
      if (getUsersResponse.isError) {
      } else {
        dispatch(fetchUsersData(getUsersResponse.currentData));
      }
    }
  }, [getUsersResponse]);

  useEffect(() => {
    if (
      !getUserConversationsResponse.isLoading &&
      !getUserConversationsResponse.isUninitialized
    ) {
      if (getUserConversationsResponse.isError) {
      } else {
        dispatch(fetchUserConversations(getUserConversationsResponse.data));
      }
    }
  }, [getUserConversationsResponse]);

  useEffect(() => {
    TrackPlayer.setQueue([]);
    if (selectedConversationId === null) {
      setRenderedComponent(
        <GestureHandlerRootView style={{height: '90%'}}>
          <FlatList
            style={{gap: 15}}
            scrollEnabled={true}
            data={userConversations}
            renderItem={({item}) => {
              return (
                <View
                  style={{
                    gap: 0,
                    borderBottomWidth: 0.5,
                    borderColor: 'black',
                    marginTop: 14,
                    padding: 8,
                  }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      backgroundColor: 'white',
                      width: '100%',
                      alignItems: 'center',
                    }}
                    onPress={() => handleConversationClick(item._id)}>
                    {/**latestMessage */}
                    {/* <Button
                    text={item.convName}
                    onPress={() => {
                      handleConversationClick(item._id);
                    }}
                    styleButton={[
                      style.enterChatBtn,
                      {width: '80%', maxWidth: 300},
                    ]}
                    styleText={style.conversationNameText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  /> */}
                    <View
                      style={{
                        resizeMode: 'contain',
                        position: 'relative',
                      }}>
                      <Image
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: 'contain',
                          resizeMode: 'contain',
                          borderRadius: 40,
                          // marginRight: 10,
                        }}
                        source={
                          item.convAvatar
                            ? {
                                uri: item.isGroup
                                  ? `https://novel-era.co/quickn/api/v1/message/file/binary?fileId=${item?.convAvatar}&page=1`
                                  : item.convAvatar,
                              }
                            : item.isGroup
                            ? groupPic
                            : profilePic
                        }
                      />

                      {!item.isGroup &&
                      singleChatUsers[
                        item.members.find(memberId => memberId !== user._id)
                      ]?.isOnline ? (
                        <OnlineStatus
                          name="circle"
                          color={`${
                            singleChatUsers[
                              item.members.find(
                                memberId => memberId !== user._id,
                              )
                            ]?.isOnline
                              ? '#76b55c'
                              : ''
                          }`}
                          style={{position: 'absolute', bottom: 0, right: 0}}
                        />
                      ) : (
                        false
                      )}
                    </View>

                    <View style={{flexDirection: 'column'}}>
                      <View>
                        <Text
                          style={[
                            style.conversationNameText,
                            {fontWeight: 'bold'},
                          ]}>
                          {item.convName}
                        </Text>
                      </View>
                      <View
                        style={{alignItems: 'flex-start', paddingLeft: '5%'}}>
                        {item.latestMessage?._id &&
                        item.latestMessage?.file !== null ? (
                          item.isGroup ? (
                            <Text style={{color: 'gray'}}>
                              <Text style={{fontWeight: 'bold', color: 'gray'}}>
                                {
                                  users.find(
                                    usr =>
                                      usr._id === item.latestMessage?.sender,
                                  ).username
                                }
                              </Text>
                              : File ...
                            </Text>
                          ) : (
                            <Text style={{color: 'gray'}}>File </Text>
                          )
                        ) : item.latestMessage?.text !== null ? (
                          item.latestMessage?.text?.length > 20 ? (
                            item.isGroup ? (
                              <Text style={{color: 'gray'}}>
                                <Text
                                  style={{fontWeight: 'bold', color: 'gray'}}>
                                  {
                                    users.find(
                                      usr =>
                                        usr._id === item.latestMessage?.sender,
                                    ).username
                                  }
                                </Text>
                                : {item.latestMessage?.text.substring(0, 20)}{' '}
                                ...
                              </Text>
                            ) : (
                              <Text style={{color: 'gray'}}>
                                {item.latestMessage?.text.substring(0, 20)} ...
                              </Text>
                            )
                          ) : item.latestMessage?.text?.length <= 20 &&
                            item.latestMessage?.text?.length !== 0 ? (
                            item.isGroup ? (
                              <Text style={{color: 'gray'}}>
                                <Text style={{fontWeight: 'bold'}}>
                                  {
                                    users.find(
                                      usr =>
                                        usr._id === item.latestMessage?.sender,
                                    )?.username
                                  }
                                  :
                                </Text>
                                <Text style={{color: 'gray'}}>
                                  {' '}
                                  {item.latestMessage?.text}
                                </Text>
                              </Text>
                            ) : (
                              <Text style={{color: 'gray'}}>
                                {item.latestMessage?.text}
                              </Text>
                            )
                          ) : (
                            <Text style={{color: 'gray'}}>
                              ... new created chat
                            </Text>
                          )
                        ) : (
                          <Text style={{color: 'gray'}}>
                            ... new created chat
                          </Text>
                        )}
                      </View>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        alignSelf: 'flex-end',
                      }}>
                      <Text style={{fontSize: 10, color: 'gray'}}>
                        {
                          new Date(item.latestMessage.createdAt)
                            .toISOString()
                            .split('T')[0]
                        }
                      </Text>
                      <Text style={{fontSize: 10, color: 'gray'}}>
                        {new Date(item.latestMessage.createdAt)
                          .toISOString()
                          .split('T')[1]
                          .split('.')[0]
                          .substring(0, 5)}
                      </Text>
                      {item.isUnread ? (
                        <Icon name="notifications" size={15} color="#0e6e82" />
                      ) : (
                        ''
                      )}
                      {/* {item.isUnread ? console.log(item.convName) : ''} */}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
            keyExtractor={item => item._id}
          />
        </GestureHandlerRootView>,
      );
    } else {
      const [selectedConversation] = userConversations.filter(
        conversation => conversation._id === selectedConversationId,
      );
      if (selectedConversation?.isGroup)
        setRenderedComponent(
          <Group>
            {selectedConversationId !== null ? (
              <Button
                icon={
                  <BackIcon name="arrow-back-outline" size={20} color="white" />
                }
                onPress={() => dispatch(changeSelectedConversationId(null))}
                styleButton={[
                  style.submitFormButton,
                  {backgroundColor: 'transparent'},
                ]}
                styleText={style.submitFormButtonText}
              />
            ) : (
              <></>
            )}
          </Group>,
        );
      else
        setRenderedComponent(
          <SingleChat>
            {selectedConversationId !== null ? (
              <Button
                icon={
                  <BackIcon name="arrow-back-outline" size={20} color="white" />
                }
                onPress={() => dispatch(changeSelectedConversationId(null))}
                styleButton={[
                  style.submitFormButton,
                  {backgroundColor: 'transparent'},
                ]}
                styleText={style.submitFormButtonText}
              />
            ) : (
              <></>
            )}
          </SingleChat>,
        );
    }
  }, [selectedConversationId, userConversations, users, singleChatUsers]);

  useEffect(() => {
    setSingleChatUsers(
      userConversations.reduce((prevUserConversation, currUserConversation) => {
        if (currUserConversation.isGroup) return {...prevUserConversation};

        const singleChatMemberId = currUserConversation.members.find(
          memberId => memberId !== user._id,
        );

        const singleChatUser = users.find(
          usr => singleChatMemberId === usr._id,
        );

        return {
          ...prevUserConversation,
          [singleChatUser?._id]: {...singleChatUser},
        };
      }, {}),
    );
  }, [userConversations, users]);

  useEffect(() => {
    if (
      !createConversationResponse.isLoading &&
      !createConversationResponse.isUninitialized
    ) {
      if (createConversationResponse.isError) {
      } else {
        //Should emit
        dispatch(
          addUserConversation({
            ...createConversationResponse.data,
            latestMessage: {
              createdAt: createConversationResponse.data.createdAt,
            },
          }),
        );

        const [receiveruser] = users.filter(
          usr => usr._id === createConversationResponse.originalArgs.receiverId,
        );
        if (receiveruser && receiveruser.isOnline)
          socket.emit('startConversation', {
            senderId: user._id,
            receiverId: receiveruser._id,
            convId: createConversationResponse.data._id,
          });
        dispatch(
          changeSelectedConversationId(createConversationResponse.data._id),
        );
      }
    }
  }, [createConversationResponse]);

  useEffect(() => {
    if (
      !getConversationByIdResponse.isLoading &&
      !getConversationByIdResponse.isUninitialized
    ) {
      if (getConversationByIdResponse.isError) {
      } else {
        dispatch(addUserConversation({...getConversationByIdResponse.data}));
        if (getConversationByIdResponse.data.isGroup)
          getGroubByConversationId({
            conversationId: getConversationByIdResponse.data._id,
            isAdmin: user.isAdmin,
            token: user.token,
          });
      }
    }
  }, [getConversationByIdResponse]);

  useEffect(() => {
    if (
      !getGroubByConversationIdResponse.isUninitialized &&
      !getGroubByConversationIdResponse.isLoading
    ) {
      if (getGroubByConversationIdResponse.isError) {
      } else {
        dispatch(addGroup({...getGroubByConversationIdResponse.data}));
      }
    }
  }, [getGroubByConversationIdResponse]);

  useEffect(() => {
    socket.emit('addUser', {
      userId: user._id,
      token: `${user.isAdmin ? 'admin' : 'Bearer'} ${user.token}`,
      timestamp: Date.now(),
    });
    socket.on('onlineUserId', userId => {
      dispatch(updateOnlineUserStatus({isOnline: true, userId: userId}));
      // console.log('on', userId);
    });
    socket.on('offlineUserId', userId => {
      dispatch(updateOnlineUserStatus({isOnline: false, userId: userId}));
      // console.log('off', userId);
    });

    socket.on('startConversation', ({senderId, convId}) => {
      getConversationById({
        isAdmin: user.isAdmin,
        token: user.token,
        convId: convId,
      });
    });

    socket.on('addedToGroup', ({senderId, convId, addedUsersMembersIds}) => {
      const [isCurrentUserAdded] = addedUsersMembersIds.filter(
        usrId => usrId === user._id,
      );

      ////console.log(989898, user._id, isCurrentUserAdded);
      if (isCurrentUserAdded) {
        getConversationById({
          convId: convId,
          isAdmin: user.isAdmin,
          token: user.token,
        });
      } else {
        dispatch(
          updateConversationMembers({
            _id: convId,
            members: addedUsersMembersIds,
          }),
        );

        dispatch(
          updateGroupMembersByConversationId({
            _id: convId,
            members: addedUsersMembersIds,
          }),
        );
      }
    });

    socket.on('removedFromGroup', data => {
      const {senderId, convId, removedUserId} = data;
      if (removedUserId === user._id) {
        dispatch(deleteConversation({_id: convId}));
        dispatch(deleteGroupByConversationId({_id: convId}));
        if (selectedConversationId === convId)
          dispatch(changeSelectedConversationId(null));
      } else {
        const [conversationToBeEdited] = userConversations.filter(
          conversation => {
            ////console.log(conversation._id, convId);
            return conversation._id === convId;
          },
        );
        ////console.log(9007, conversationToBeEdited);
        const newMembers = conversationToBeEdited.members.filter(
          member => member !== removedUserId,
        );
        if (conversationToBeEdited)
          dispatch(
            updateConversationMembers({
              _id: convId,
              members: newMembers,
            }),
          );
        dispatch(
          updateGroupMembersByConversationId({
            _id: convId,
            members: newMembers,
          }),
        );
      }
    });

    socket.on('broadcastAnnouncement', () => {
      getAnnouncementsResponse.refetch();
    });

    socket.on(
      'announcementSign',
      ({userId, userName, signTime, announcementId, checkedUserObjectId}) => {
        const [announcementToUpdate] = announcements.filter(
          announcement => announcement._id === announcementId,
        );
        if (announcementToUpdate) {
          dispatch(
            updateAnnouncement({
              ...announcementToUpdate,
              checkedUsers: [
                {
                  userId: userId,
                  username: userName,
                  checkedAt: signTime,
                  _id: checkedUserObjectId,
                },
                ...announcementToUpdate.checkedUsers,
              ],
            }),
          );
        }
      },
    );

    socket.on('logoutUser', () => {
      storage.set('QUICKN_TOKEN', '');
      dispatch(changeIsLoggedIn(false));
    });

    return () => {
      socket.off('onlineUserId');
      socket.off('offlineUserId');
      socket.off('startConversation');
      socket.off('addedToGroup');
      socket.off('removedFromGroup');
      socket.off('broadcastAnnouncement');
      socket.off('announcementSign');
      socket.off('logoutUser');
    };
  }, [userConversations, users, announcements]);

  useEffect(() => {
    if (
      !postCreateGroupResponse.isLoading &&
      !postCreateGroupResponse.isUninitialized
    ) {
      if (postCreateGroupResponse.isError) {
      } else {
        setIsCreateGroupPressed(false);
        dispatch(
          addUserConversation({
            ...postCreateGroupResponse.data.conversation,
            convName: postCreateGroupResponse.data.newGroup.groupName,
          }),
        );
        dispatch(addGroup({...postCreateGroupResponse.data.newGroup}));

        const receiversOnlineUsers = users.filter(usr => {
          const [foundUser] =
            postCreateGroupResponse.data.conversation.members.filter(
              convMember => convMember === usr._id,
            );

          ////console.log(121212, foundUser);
          if (foundUser && foundUser._id !== user._id && usr.isOnline)
            return true;
          else return false;
        });

        receiversOnlineUsers.map(receiverOnlineUser => {
          socket.emit('startConversation', {
            senderId: user._id,
            receiverId: receiverOnlineUser._id,
            convId: postCreateGroupResponse.data.conversation._id,
          });
        });

        dispatch(
          changeSelectedConversationId(
            postCreateGroupResponse.data.conversation._id,
          ),
        );
        setCreateGroupError('');
        setCreateGroupMembers([]);
        setCreateGroupName('');
      }
    }
  }, [postCreateGroupResponse]);

  useEffect(() => {
    if (selectedConversationId)
      navigation.getParent().setOptions({
        tabBarStyle: {
          display: 'none',
        },
      });

    // console.log(navigation);
    return () =>
      navigation.getParent().setOptions({
        tabBarStyle: undefined,
      });
  }, [selectedConversationId]);

  useEffect(() => {
    navigation.navigate(path);
    if (path === 'Profile' || path === 'Logout') {
      navigation.getParent().setOptions({
        tabBarStyle: {
          display: 'none',
        },
      });
      return () =>
        navigation.getParent().setOptions({
          tabBarStyle: undefined,
        });
    }
  }, [path]);

  useEffect(() => {
    navigation.navigate('Conversations');
  }, []);

  useEffect(() => {
    if (selectedConversationId === null) {
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
          if (
            (selectedConversationId !== null &&
              selectedConversationId !== convId) ||
            selectedConversationId === null
          )
            dispatch(
              updateConversationNotificationById({
                convId: convId,
                isUnread: true,
              }),
            );
        },
      );

      socket.on('messageDeleted', recData => {
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
      });

      socket.on(
        'updatedMessage',
        ({senderId, conversationId, message_id, newText}) => {
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
        },
      );

      socket.on('getHiddenMsg', async newMsg => {
        try {
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
        } catch (err) {
          //console.log(err);
        }
      });

      return () => {
        socket.off('getMessage');
        socket.off('messageDeleted');
        socket.off('updatedMessage');
        socket.off('getHiddenMsg');
      };
    }
  }, [userConversations, selectedConversationId]);
  ////////////////////// HOOKS  //////////////////////

  function onSign(addAnnouncement) {
    putAnnouncementSing({
      userId: user._id,
      announcementId: addAnnouncement._id,
      token: user.token,
      isAdmin: user.isAdmin,
    });
  }

  function handleStartAChat(usr) {
    setIsStartAChat(false);
    const [existConversation] = userConversations.filter(
      conversation => conversation.convName === usr.username,
    );
    if (existConversation) {
      setIsStartAChat(false);
      dispatch(changeSelectedConversationId(existConversation._id));
    } else {
      createConversation({
        isAdmin: user.isAdmin,
        token: user.token,
        senderId: user._id,
        receiverId: usr._id,
      });
    }
  }

  function handleConversationClick(conversationId) {
    dispatch(changeSelectedConversationId(conversationId));
  }

  function handleUserAddedToCreateGroup(user) {
    setCreateGroupMembers([{...user}, ...createGroupMembers]);
  }

  function handleUserRemovedFromCreateGroup(user) {
    setCreateGroupMembers(
      createGroupMembers.filter(usr => usr._id !== user._id),
    );
  }

  async function handleCreateGroup() {
    ////console.log(createGroupMembers);
    if (createGroupName !== '' && createGroupMembers.length !== 0) {
      const addedGroupMembersIds = createGroupMembers.map(
        groupMember => groupMember._id,
      );

      let uploadFileResponse = null;

      if (createGroupAvatarPath !== null) {
        uploadFileResponse = await uploadFile({
          fileId: '',
          fileName: createGroupAvatarPath.fileName,
          isAdmin: user.isAdmin,
          mimeType: createGroupAvatarPath.mimeType,
          token: user.token,
          pathToFileToUpload: createGroupAvatarPath.path,
        });
      }

      postCreateGroup({
        isAdmin: user.isAdmin,
        token: user.token,
        addedGroupMembers: [...addedGroupMembersIds],
        groupName: createGroupName,
        creatorId: user._id,
        fileId:
          uploadFileResponse !== null
            ? JSON.parse(uploadFileResponse.data)._id
            : null,
      });
    } else {
      if (createGroupName === '') setCreateGroupError('Group must have a name');
      else if (createGroupMembers.length === 0)
        setCreateGroupError('Group must have at least one member');
    }
  }

  ////////////////////// ADDITIONAL COMPONENTS //////////////////////
  const createGroupModalListHeader = (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
      }}>
      <View
        style={{
          // height: '100%',
          alignItems: 'center',
          backgroundColor: 'transparent',
          // paddingBottom: '5%',
        }}>
        <FilePicker
          FilePickerMode="createGroupAvatar"
          buttonChildren={
            <Image
              style={{
                width: 70,
                height: 70,
                borderRadius: 50,
                borderWidth: 1,
                borderColor: 'gray',
                objectFit: 'contain',
                resizeMode: 'contain',
              }} // Adjust dimensions as needed
              source={
                createGroupAvatarPath !== null
                  ? {uri: createGroupAvatarPath.path}
                  : groupPic
              }
            />
          }
          buttonParentStyle={{
            // width: '100%',
            // height: '100%',
            flex: 1,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            // alignItems: 'center',
          }}
          buttonStyle={{
            flex: 1,
            justifyContent: 'center',
          }}
          options={{
            createGroupAvatarPath: createGroupAvatarPath,
            setCreateGroupAvatarPath: setCreateGroupAvatarPath,
          }}
        />
      </View>

      <View
        style={{
          // width: '100%',
          // height: '50%',
          // paddingLeft: '5%',
          flex: 1,
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
        <Input
          value={createGroupName}
          isDisabled={!user.isAdmin}
          placeHolder="Enter group name"
          onChange={gName => setCreateGroupName(gName)}
          style={[
            style.inputForm,
            {
              backgroundColor: 'transparent',
              width: '100%',
              // height: '50%',
              borderBottomWidth: 1,
              borderRadius: 12,
              borderColor: 'gray',
            },
          ]} // Take 80% of the width
        />
      </View>
    </View>
  );

  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <View
      style={{
        backgroundColor: 'white',
        height: `${selectedConversationId === null ? '80%' : '100%'}`,
      }}>
      {/**START A CHAT OR CREATE GROUP MENU */}
      {selectedConversationId === null ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: '#0e6e82',
            marginRight: '5%',
            marginBottom: '5%',
            zIndex: 2,
            borderRadius: 60,
            borderWidth: 1,
            borderColor: '#B0B2B3',
          }}>
          {user.isAdmin ? (
            <Menu
              style={{
                backgroundColor: 'transparent',
                borderRadius: 60,
              }}>
              <MenuTrigger
                style={{
                  backgroundColor: '#058095',
                  borderRadius: 60,
                }}>
                <View
                  style={{
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    borderRadius: 60,
                  }}>
                  <ChatIcon name="chat" size={25} color="white" />
                </View>
              </MenuTrigger>

              <MenuOptions
                optionsContainerStyle={{
                  width: 'fit-content',
                  borderRadius: 7,
                  alignItems: 'flex-start',
                  backgroundColor: 'white',
                  // position: 'relative',
                }}
                style={{
                  backgroundColor: 'white',
                  flexDirection: 'column',
                  borderRadius: 7,
                  flex: 1,
                  justifyContent: 'center',
                  // position: 'absolute',
                }}>
                <MenuOption
                  onSelect={() => {
                    setIsStartAChat(!isStartAChatPressed);
                  }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: 'black',
                    }}>
                    New Chat
                  </Text>
                </MenuOption>
                {user.isAdmin ? (
                  <MenuOption
                    onSelect={() => {
                      setIsCreateGroupPressed(!isCreateGroupPressed);
                    }}>
                    <Text
                      style={{
                        fontSize: 10,
                        color: 'black',
                      }}>
                      New Group
                    </Text>
                  </MenuOption>
                ) : (
                  <></>
                )}
              </MenuOptions>
            </Menu>
          ) : (
            <Button
              styleButton={{
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                borderRadius: 50,
              }}
              icon={<ChatIcon name="chat" size={25} color="white" />}
              onPress={() => {
                setIsStartAChat(!isStartAChatPressed);
              }}
            />
          )}
        </View>
      ) : (
        <></>
      )}

      {/**Announcements For Non Admins To Sign */}
      {!user.isAdmin &&
      announcements.length !== 0 &&
      nonCheckedAnnouncements.length !== 0 ? (
        <ModalList
          pageName="New announcements to sign"
          description=""
          configHook={useConfigAnnouncements(user, onSign)}
          listItems={[...nonCheckedAnnouncements].sort(
            useSortItems('announcementTitle'),
          )}
          isModalPressed={nonCheckedAnnouncements.length !== 0}
          setIsModalPressed={() => {}}
          isLoading={putAnnouncementSignResponse.isLoading}
          searchKey="announcementTitle"
          isNotClosable={true}
          modalStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
        />
      ) : (
        <></>
      )}

      {/** Start A Chat Modal*/}
      {isStartAChatPressed ? (
        <ModalList
          pageName="Start a new chat"
          description="Users on QuickN"
          listItems={[...users]
            .sort(useSortItems('username'))
            .filter(usr => usr._id !== user._id)}
          configHook={useConfigStartAChat(handleStartAChat)}
          setIsModalPressed={setIsStartAChat}
          isModalPressed={isStartAChatPressed}
          isLoading={createConversationResponse.isLoading}
          searchKey="username"
        />
      ) : (
        <></>
      )}

      {/** Create Group Modal*/}
      {isCreateGroupPressed && user.isAdmin ? (
        <ModalList
          pageName="New group"
          description="Add members on QuickN"
          listItems={[...users]
            .sort(useSortItems('username'))
            .filter(usr => usr._id !== user._id)}
          configHook={useConfigAddMembersToGroup(
            handleUserAddedToCreateGroup,
            handleUserRemovedFromCreateGroup,
            createGroupMembers,
          )}
          headerComponent={createGroupModalListHeader}
          setIsModalPressed={setIsCreateGroupPressed}
          isModalPressed={isCreateGroupPressed}
          /* SHOULD BE EDITED */
          isLoading={postCreateGroupResponse.isLoading}
          searchKey="username">
          {createGroupMembers.length !== 0 && createGroupName !== '' ? (
            <Button
              onPress={handleCreateGroup}
              icon={<ContinueIcon name="arrowright" size={25} color="white" />}
              styleButton={[
                style.submitFormButton,
                {
                  width: '100%',
                  height: '100%',
                  borderRadius: 70,
                  borderWidth: 1,
                  borderColor: '#B0B2B3',
                  backgroundColor: '#058095',
                },
              ]}
              styleText={[style.submitFormButtonText, {fontSize: 14}]}
            />
          ) : (
            <></>
          )}
        </ModalList>
      ) : (
        <></>
      )}

      {/** User Conversations And Loading spinner*/}
      {getUserConversationsResponse &&
      (getUserConversationsResponse.isLoading ||
        getUserConversationsResponse.isUninitialized) ? (
        <ActivityIndicator
          size="large"
          color="#058095"
          style={{height: '100%'}}
        />
      ) : userConversations.length === 0 ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: '90%',
          }}>
          <Text style={{color: 'gray'}}>
            You Don't Have Any Conversations Yet
          </Text>
        </View>
      ) : (
        renderedComponent
      )}
    </View>
  );
}

export default Conversations;
