import {useDispatch, useSelector} from 'react-redux';
import {
  addGroup,
  changeSelectedConversationId,
  updateGroup,
  updateGroupMembersByConversationId,
  useDeleteMemberFromGroupMutation,
  useGetGroupByConversationIdMutation,
  usePutUpdateGroupMutation,
} from '../Store/StoreInterface';
import {useEffect, useState, useRef} from 'react';
import useBackButtonHandler from '../Hooks/useBackButtonHandler';
import {Text, View, FlatList, Image} from 'react-native';
import Messages from '../Components/Messages';
import useConfigSendersUsers from '../Hooks/configSendersUsers';
import ConversationHeader from '../Components/ConversationHeader';
import ModalList from '../Components/ModalList';
import {
  deleteConversation,
  updateConversation,
  updateConversationMembers,
} from '../Store/Slices/UserConversations';
import useConfigAddMembersToGroup from '../Hooks/useConfigAddMembersToGroup';
import Button from '../Components/Button';
import style from '../AppStyling';
import socket from '../utils/SocketConfig';
import useConfigGroupSettings from '../Hooks/useConfigGroupSettings';
import useSortItems from '../Hooks/useSortItems';
import groupPic from '../Assets/groupPic.png';
import Input from '../Components/Input';
import FilePicker from '../Components/FilePicker';
import {
  Menu,
  MenuTrigger,
  MenuOption,
  MenuOptions,
} from 'react-native-popup-menu';
import ThreeDotsIcon from 'react-native-vector-icons/Entypo';
import SaveIcon from 'react-native-vector-icons/Feather';
import AddUserIcon from 'react-native-vector-icons/AntDesign';
import ContinueIcon from 'react-native-vector-icons/AntDesign';

function Group({children}) {
  ///////////////////// CONFIGS //////////////////////////////////

  const dispatch = useDispatch();

  const flatListRef = useRef(null);

  useBackButtonHandler()();

  /////////////////////// USESELECTERS ///////////////////////////

  const selectedConversationId = useSelector(
    state => state.config.selectedConversationId,
  );

  const user = useSelector(state => state.user);

  const [selectedGroup] = useSelector(state => state.groups).filter(
    group => group.conversationId === selectedConversationId,
  );

  const selectedConversation = [
    ...useSelector(state => state.conversations),
  ].find(
    conversation =>
      selectedConversationId && conversation._id === selectedConversationId,
  );

  const users = useSelector(state => state.users);

  ///////////////////////////// STATES //////////////////////////////

  const [addMembersError, setAddMembersError] = useState('');

  const [addedGroupMembers, setAddedGroupMembers] = useState([]);

  const [usersGroupMembers, setUsersGroupMembers] = useState(
    users.filter(usr => {
      if (!selectedConversation) return false;
      const isExist = selectedConversation?.members.find(
        member => member === usr._id,
      );
      if (isExist) return true;
      else return false;
    }),
  );

  const [isGroupSettingsPressed, setIsGroupSettingsPressed] = useState(false);
  const [isAddMembersPressed, setIsAddMembersPressed] = useState(false);
  const [groupSettingsError, setGroupSettingsError] = useState('');

  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [editedGroupName, setEditedGroupNamge] = useState('');

  const [isErrorLoadingImage, setIsErrorLoadingImage] = useState('');

  ////////////////////////// APIS ///////////////////////////////////

  const [getGroup, getGroupResponse] = useGetGroupByConversationIdMutation();

  const [putUpdateGroup, putUpdateGroupResponse] = usePutUpdateGroupMutation();

  const [deleteMemberFromGroup, deleteMemberFromGroupResponse] =
    useDeleteMemberFromGroupMutation();

  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    setUsersGroupMembers(
      users.filter(usr => {
        if (!selectedConversation) return false;
        const isExist = selectedConversation?.members.find(member => {
          return member === usr._id;
        });
        if (isExist) return true;
        else return false;
      }),
    );
  }, [users, selectedConversationId]);

  useEffect(() => {
    if (selectedGroup === undefined && selectedConversationId !== null) {
      getGroup({
        token: user.token,
        isAdmin: user.isAdmin,
        conversationId: selectedConversationId,
      });
    }
    if (selectedConversationId === null) {
      setIsAddMembersPressed(false);
      setIsGroupSettingsPressed(false);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (!getGroupResponse.isUninitialized && !getGroupResponse.isLoading) {
      if (getGroupResponse.isError) {
      } else {
        dispatch(addGroup(getGroupResponse.data));
      }
    }
  }, [getGroupResponse]);

  useEffect(() => {
    if (
      !putUpdateGroupResponse.isLoading &&
      !putUpdateGroupResponse.isUninitialized
    ) {
      if (putUpdateGroupResponse.isError) {
      } else {
        setIsAddMembersPressed(false);

        const receiversOnlineUsers = users.filter(usr => {
          const [foundUser] = putUpdateGroupResponse.data.filter(
            responseMemberUsr => responseMemberUsr === usr._id,
          );

          if (foundUser && foundUser !== user._id && usr.isOnline) {
            return true;
          } else return false;
        });

        /** THIS MEANS THE NAME IS UPDATED */
        /** ELSE IF, THIS MEANS THE MEMBERS ARE UPDATED */
        /** ELSE , THIS MEANS THE AVATAR IS UPDATED */

        //ISUUE , THE GROUP NAME AND AVATAR SHOULD BE SENT INSTEAD OF REFETCH , TODO
        if (editedGroupName !== '') {
          dispatch(
            updateGroup({
              ...selectedGroup,
              groupName: editedGroupName,
              groupMembers: [...putUpdateGroupResponse.data],
            }),
          );
          dispatch(
            updateConversation({
              ...selectedConversation,
              convName: editedGroupName,
            }),
          );
          setEditedGroupNamge('');

          receiversOnlineUsers.map(receiverOnlineUser => {
            socket.emit('groupIsUpdated', {
              senderId: user._id,
              receiverId: receiverOnlineUser._id,
            });
          });
        } else if (putUpdateGroupResponse.data !== usersGroupMembers) {
          dispatch(
            updateGroup({
              ...selectedGroup,
              groupMembers: [...putUpdateGroupResponse.data],
            }),
          );

          const newMembers = users.filter(usr => {
            const [foundUser] = addedGroupMembers.filter(
              addedUser => addedUser._id === usr._id,
            );

            if (foundUser && user._id !== foundUser._id) return true;
            else return false;
          });

          setUsersGroupMembers([...newMembers, ...usersGroupMembers]);
          setAddedGroupMembers([]);
          receiversOnlineUsers.map(receiverOnlineUser => {
            socket.emit('addedToGroup', {
              senderId: user._id,
              receiverId: receiverOnlineUser._id,
              convId: selectedConversationId,
              addedUsersMembersIds: putUpdateGroupResponse.data,
            });
          });
        } else {
          receiversOnlineUsers.map(receiverOnlineUser => {
            socket.emit('groupIsUpdated', {
              senderId: user._id,
              receiverId: receiverOnlineUser._id,
            });
          });
        }
      }
    }
  }, [putUpdateGroupResponse]);

  useEffect(() => {
    if (
      !deleteMemberFromGroupResponse.isLoading &&
      !deleteMemberFromGroupResponse.isUninitialized
    ) {
      if (deleteMemberFromGroupResponse.isError) {
      } else {
        //edits to store should be made
        const newMembers = usersGroupMembers.filter(
          usrMember =>
            usrMember._id !== deleteMemberFromGroupResponse.originalArgs.userId,
        );
        //newMembers
        const newMembersIds = newMembers.map(newMember => newMember._id);
        dispatch(
          updateConversationMembers({
            _id: selectedConversationId,
            members: [...newMembersIds],
          }),
        );

        dispatch(
          updateGroupMembersByConversationId({
            _id: selectedConversationId,
            members: [...newMembersIds],
          }),
        );

        setUsersGroupMembers([...newMembers]);

        const onlineUsers = usersGroupMembers.filter(
          usr => usr.isOnline && usr._id !== user._id,
        );

        if (user._id === deleteMemberFromGroupResponse.originalArgs.userId) {
          setIsGroupSettingsPressed(false);
          dispatch(changeSelectedConversationId(null));
          dispatch(deleteConversation({_id: selectedConversationId}));
        }
        onlineUsers.map(usr => {
          socket.emit('removedFromGroup', {
            senderId: user._id,
            receiverId: usr._id,
            convId: selectedConversationId,
            removedUserId: deleteMemberFromGroupResponse.originalArgs.userId,
          });
        });
      }
    }
  }, [deleteMemberFromGroupResponse]);

  ////////////////////// HOOKS  //////////////////////

  function handleUserAddedToCreateGroup(user) {
    setAddedGroupMembers([{...user}, ...addedGroupMembers]);
  }

  function handleUserRemovedFromCreateGroup(user) {
    setAddedGroupMembers(addedGroupMembers.filter(usr => usr._id !== user._id));
  }

  function handleUpdateGroup() {
    if (selectedConversationId && addedGroupMembers.length !== 0) {
      const addedGroupMembersIds = addedGroupMembers.map(
        groupMember => groupMember._id,
      );
      putUpdateGroup({
        userData: {isAdmin: user.isAdmin, token: user.token},
        groupData: {membersId: [...addedGroupMembersIds]},
        conversationId: selectedConversationId,
      });
    } else {
      if (addedGroupMembers.length === 0)
        setAddMembersError('Group must have at least one member');
    }
  }

  function handleSaveUpdateGroupSettings() {
    if (editedGroupName !== '') {
      putUpdateGroup({
        userData: {token: user.token, isAdmin: user.isAdmin},
        groupData: {newGroupName: editedGroupName},
        conversationId: selectedConversationId,
      });
    } else setGroupSettingsError('You must enter a valid group name');
    //TODO Add loading image handling
    // else if(loade)
  }

  function handleRemoveMember(usr) {
    deleteMemberFromGroup({
      isAdmin: user.isAdmin,
      token: user.token,
      conversationId: selectedConversationId,
      userId: usr._id,
    });
  }

  function onErrorLoadImage(data) {
    setIsErrorLoadingImage('Error loading the image');
  }
  function onLoadImage(data) {}

  function updateGroupAvatar(avatar) {
    putUpdateGroup({
      userData: {isAdmin: user.isAdmin, token: user.token},
      groupData: {avatar: avatar},
      conversationId: selectedConversationId,
    });
  }

  ////////////////////// ADDITIONAL COMPONENTS //////////////////////
  const groupInfoModalListHeader = (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'red',
      }}>
      {user.isAdmin ? (
        <View
          style={{
            // height: '100%',
            width: '100%',
            alignItems: 'center',
            // paddingBottom: '5%',
          }}>
          <FilePicker
            FilePickerMode="uploadGroupAvatar"
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
                  selectedGroup?.avatar && !isErrorLoadingImage
                    ? {
                        uri: `https://novel-era.co/quickn/api/v1/message/file/binary?fileId=${selectedGroup?.avatar}&page=1`,
                      }
                    : groupPic
                }
                onError={error => {
                  onErrorLoadImage(error);
                }}
                onLoad={onLoadImage}
              />
            }
            buttonParentStyle={
              {
                // width: '100%',
                // height: '100%',
              }
            }
            buttonStyle={{
              // width: '100%',
              // height: '100%',
              justifyContent: 'center',
            }}
            options={{
              updateGroupAvatar: updateGroupAvatar,
              group: {...selectedGroup},
            }}
          />
        </View>
      ) : (
        <View
          style={{
            width: '100%',
            // height: '100%',
            alignSelf: 'center',
            backgroundColor: 'transparent',
          }}>
          <Image
            style={{
              width: 70,
              height: 70,
              borderRadius: 50,
              objectFit: 'contain',
              resizeMode: 'contain',
              borderRadius: 50,
            }} // Adjust dimensions as needed
            source={
              selectedGroup?.avatar && !isErrorLoadingImage
                ? {
                    uri: `https://novel-era.co/quickn/api/v1/message/file/binary?fileId=${selectedGroup?.avatar}&page=1`,
                  }
                : groupPic
            }
            onError={error => {
              onErrorLoadImage(error);
            }}
            onLoad={onLoadImage}
          />
        </View>
      )}

      <View
        style={{
          width: '100%',
          // height: '50%',
          // paddingLeft: '5%',
          justifyContent: 'center',
        }}>
        <Input
          value={editedGroupName}
          isDisabled={!user.isAdmin}
          placeHolder={
            isEditingGroupName ? 'Enter group name' : selectedGroup?.groupName
          }
          onChange={gName => setEditedGroupNamge(gName)}
          style={[
            style.inputForm,
            {
              backgroundColor: 'transparent',
              width: '100%',
              // height: '50%',
              textAlign: 'center',
              borderBottomWidth: 1,
              borderRadius: 7,
              borderColor: 'gray',
              flex: 1,
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
        width: '100%',
        height: '100%',
      }}>
      <View
        style={{
          flexDirection: 'row',
          flex: 1.5,
          justifyContent: 'flex-start',
          alignItems: 'center',
          backgroundColor: '#058095',
        }}>
        <View>{children}</View>
        <View>
          <Image
            style={{
              borderRadius: 50,
              width: 50,
              height: 50,
              backgroundColor: 'transparent',
            }} // Adjust dimensions as needed
            source={
              selectedGroup?.avatar && !isErrorLoadingImage
                ? {
                    uri: `https://novel-era.co/quickn/api/v1/message/file/binary?fileId=${selectedGroup?.avatar}&page=1`,
                  }
                : groupPic
            }
            onError={error => {
              onErrorLoadImage(error);
            }}
            onLoad={onLoadImage}
          />
        </View>
        <View>
          <Text style={{color: 'white', padding: '1%', fontSize: 19}}>
            {selectedConversation?.convName}
          </Text>
        </View>
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Menu>
            <MenuTrigger>
              <View style={{justifyContent: 'center'}}>
                <ThreeDotsIcon
                  name="dots-three-vertical"
                  size={20}
                  color="white"
                />
              </View>
            </MenuTrigger>

            <MenuOptions
              optionsContainerStyle={{
                marginTop: '4%',
                borderRadius: 7,
                alignItems: 'flex-start',
                backgroundColor: 'red',
                marginRight: '4%',
                position: 'relative',
              }}
              style={{
                backgroundColor: 'white',
                flexDirection: 'column',
                borderRadius: 7,
                flex: 1,
                justifyContent: 'center',
                backgroundColor: 'white',
                marginRight: '5%',
                position: 'absolute',
                top: 0,
                right: 0,
              }}>
              <MenuOption
                onSelect={() => {
                  setIsGroupSettingsPressed(!isGroupSettingsPressed);
                }}>
                <Text style={{fontSize: 10, color: 'black'}}>Group Info</Text>
              </MenuOption>

              {/** Add Members MenuOption*/}
              {user.isAdmin ? (
                <MenuOption
                  onSelect={() => {
                    setIsAddMembersPressed(!isAddMembersPressed);
                  }}>
                  <Text style={{fontSize: 10, color: 'black'}}>
                    Add Members
                  </Text>
                </MenuOption>
              ) : (
                <></>
              )}
            </MenuOptions>
          </Menu>
        </View>
      </View>

      {/** Add Members Tp Group Modal*/}
      {isAddMembersPressed && user.isAdmin && users ? (
        <ModalList
          pageName="Add members to group"
          description="Add members on QuickN"
          listItems={[
            ...users.filter(usr => {
              const [isUsrAMember] = usersGroupMembers.filter(
                memberUsr => memberUsr._id === usr._id,
              );
              if (isUsrAMember) return false;
              else return true;
            }),
          ].sort(useSortItems('username'))}
          configHook={useConfigAddMembersToGroup(
            handleUserAddedToCreateGroup,
            handleUserRemovedFromCreateGroup,
            addedGroupMembers,
          )}
          setIsModalPressed={setIsAddMembersPressed}
          isModalPressed={isAddMembersPressed}
          /* SHOULD BE EDITED */
          isLoading={putUpdateGroupResponse.isLoading}
          searchKey="username">
          {addedGroupMembers.length !== 0 ? (
            <Button
              icon={<ContinueIcon name="arrowright" size={25} color="white" />}
              onPress={handleUpdateGroup}
              styleButton={[
                style.submitFormButton,
                {
                  borderRadius: 60,
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

          {/**TO DO ADD TOASTFY */}
          {/* {addMembersError !== '' ? (
              <Text style={style.conversationNameText}>{addMembersError}</Text>
            ) : (
              ''
            )} */}
        </ModalList>
      ) : (
        <></>
      )}

      {/** Group Info Modal*/}
      {isGroupSettingsPressed && usersGroupMembers ? (
        <ModalList
          pageName="Group info"
          description="Group members"
          listItems={[...usersGroupMembers].sort(useSortItems('username'))}
          configHook={useConfigGroupSettings(handleRemoveMember, user)}
          headerComponent={groupInfoModalListHeader}
          setIsModalPressed={setIsGroupSettingsPressed}
          isModalPressed={isGroupSettingsPressed}
          /* SHOULD BE EDITED */
          isLoading={
            putUpdateGroupResponse.isLoading ||
            deleteMemberFromGroupResponse.isLoading
          }
          searchKey="username">
          {user.isAdmin && editedGroupName !== '' ? (
            <Button
              icon={<ContinueIcon name="arrowright" size={25} color="white" />}
              onPress={handleSaveUpdateGroupSettings}
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
            />
          ) : (
            ''
          )}
          {/* {groupSettingsError !== '' ? (
                <Text style={style.conversationNameText}>
                  {groupSettingsError}
                </Text>
              ) : (
                ''
              )} */}
        </ModalList>
      ) : (
        <></>
      )}

      {/**HEADER THAT SHOWS GROUP MEMBERS */}
      {/* {usersGroupMembers && (
        <ConversationHeader
          users={[...usersGroupMembers].sort(useSortItems('username'))}
          setusers={setUsersGroupMembers}
        />
      )} */}

      <View
        style={{
          flex: 10,
        }}>
        {usersGroupMembers && (
          <Messages conversationId={selectedConversationId} />
        )}
      </View>
    </View>
  );
}
export default Group;
