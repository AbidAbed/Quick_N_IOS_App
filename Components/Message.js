import {Image, Text, View} from 'react-native';
import FileIdentefier from './FileIdentefier';
import {useDispatch, useSelector} from 'react-redux';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import {useEffect, useState} from 'react';
import useConfigMessageMenuOption from '../Hooks/useConfigMessageMenuOption';
import EditMessageHandler from './MessageMenueOptions/AdminOnly/EditMessageHandler';
import ForwardMessageMenuOption from './MessageMenueOptions/AllUsers/ForwardMessageMenuOption';
import ForwardMessageHandler from './MessageMenueOptions/AllUsers/ForwardMessageHandler';
import HideSingleMessageHandler from './MessageMenueOptions/AdminOnly/HideSingleMessageHandler';
import profilePic from '../Assets/contact-icon-empty.png';
import FavouriteIcon from 'react-native-vector-icons/AntDesign';
import Button from './Button';

function Message({
  message,
  sendersUsers,
  setMessages,
  messages,
  onlineUsers,
  hiddenFromUsers,
  handleAppendMessage,
  setHiddenFromUsers,
  setHiddenMode,
  selectedConversation,
}) {
  ///////////////////// CONFIGS //////////////////////////////////
  const dispatch = useDispatch();
  ///////////////////////////// STATES //////////////////////////////
  const [messageState, setMessageState] = useState(message);

  const [isEditingParentState, setIsEditingParentState] = useState(false);

  const [isForwardMessageModalOpen, setIsForwardMessageModalOpen] =
    useState(false);

  const [isHiddenFromPopupOpen, setIsHiddenFromPopupOpen] = useState(false);

  const [messageTextCounter, setMessageTextCounter] = useState(20);

  /////////////////////// USESELECTERS ///////////////////////////
  const user = useSelector(state => state.user);

  const conversation = useSelector(state => state.conversations).find(
    conv => conv._id === messageState.conversationId,
  );

  ////////////////////////// APIS ///////////////////////////////////

  //////////////////////// USEEFFECTS ////////////////////////////////

  useEffect(() => {
    setMessageState(message);
  }, [message]);

  ////////////////////// HOOKS  //////////////////////

  ////////////////////// RETURNED COMPONENTS //////////////////////
  //console.log(messageState);
  return (
    <View
      style={[
        messageState.sender === user._id
          ? {paddingRight: '3%', paddingLeft: '3%'}
          : {paddingLeft: '3%', paddingRight: '3%'},
        {flex: 1},
      ]}>
      <Menu
        style={{
          flexDirection:
            messageState.sender === user._id ? 'row-reverse' : 'row',
          paddingVertical: 8, // Adjust padding as needed
        }}>
        <MenuTrigger
          triggerOnLongPress={true}
          style={{
            backgroundColor: messageState.hiddenFor.length
              ? '#696969'
              : messageState.sender === user._id
              ? '#B0CED7'
              : 'white',
            padding: '4%',
            borderRadius: 7,
            position: 'relative',
            paddingLeft: '2%',
          }}>
          {/* AVATAR */}
          {/* Assuming there's an avatar component here */}

          {messageState.isForwarded ? (
            <Text style={{color: `#5F9EA0`, fontSize: 10}}>Forwarded</Text>
          ) : null}

          {/** FOR GROUPS ONLY */}
          {selectedConversation?.isGroup && messageState.sender !== user._id ? (
            <View
              style={{
                flexDirection: 'row',
                paddingLeft: '2%',
                paddingBottom: '3%',
              }}>
              <Image
                style={{
                  width: 20,
                  height: 20,
                  objectFit: 'contain',
                  resizeMode: 'contain',
                  borderRadius: 40,
                  // marginRight: 10,
                }}
                source={
                  sendersUsers[messageState.sender].avatar
                    ? {
                        uri: sendersUsers[messageState.sender].avatar,
                      }
                    : profilePic
                }
              />

              <Text style={{paddingLeft: '3%', fontSize: 11}}>
                {sendersUsers[messageState.sender].username}
              </Text>
            </View>
          ) : (
            false
          )}

          <View
            style={{
              flex: 1,
              flexDirection: 'row',
            }}>
            {/* CHECK IF FILE OR MESSAGE */}
            {isEditingParentState ? (
              // CHECK IF MESSAGE IS BEING EDITED //
              <EditMessageHandler
                message={messageState}
                setIsEditingParentState={setIsEditingParentState}
                isEditingParentState={isEditingParentState}
                setMessageState={setMessageState}
                onlineUsers={onlineUsers}
                hiddenFromUsers={hiddenFromUsers}
              />
            ) : messageState.file !== null ? (
              <FileIdentefier
                fileId={messageState.file}
                isHidden={message.hiddenFor.length !== 0}
                senderId={message.sender}
              />
            ) : messageState.text.length > messageTextCounter ? (
              <View>
                <Text
                  style={{
                    color:
                      messageState.sender === user._id
                        ? messageState.hiddenFor.length !== 0
                          ? 'white'
                          : 'black'
                        : 'black',
                    paddingLeft: '3%',
                    paddingRight: '3%',
                    fontSize: 10,
                  }}>
                  {messageState.text.substring(0, messageTextCounter)}
                </Text>
                <Button
                  text="show more ..."
                  styleText={{
                    fontSize: 10,
                    color: `${
                      messageState.hiddenFor.length !== 0 ? 'white' : 'gray'
                    }`,
                  }}
                  onPress={() => setMessageTextCounter(messageTextCounter + 20)}
                />
              </View>
            ) : messageState.text.length < messageTextCounter - 20 ? (
              <View>
                <Text
                  style={{
                    color:
                      messageState.sender === user._id
                        ? messageState.hiddenFor.length !== 0
                          ? 'white'
                          : 'black'
                        : 'black',
                    paddingLeft: '3%',
                    paddingRight: '3%',
                    fontSize: 10,
                  }}>
                  {messageState.text}
                </Text>
                <Button
                  text="...show less"
                  styleText={{fontSize: 10}}
                  onPress={() => setMessageTextCounter(20)}
                />
              </View>
            ) : (
              <View>
                <Text
                  style={{
                    color:
                      messageState.sender === user._id
                        ? messageState.hiddenFor.length !== 0
                          ? 'white'
                          : 'black'
                        : 'black',
                    paddingLeft: '3%',
                    paddingRight: '3%',
                    fontSize: 10,
                  }}>
                  {messageState.text}
                </Text>
              </View>
            )}
          </View>

          {messageState.isFavorite && messageState.sender === user._id ? (
            // <Text>ISFAV</Text>
            <FavouriteIcon name="star" size={11} color="gold" />
          ) : null}

          <View
            style={{
              paddingRight: '3%',
              alignSelf: 'flex-end',
            }}>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 6,
                color: `${
                  messageState.hiddenFor.length !== 0 ? 'white' : 'gray'
                }`,
              }}>
              {new Date(messageState.createdAt)
                .toISOString()
                .split('T')[1]
                .split('.')[0]
                .substring(0, 5)}
            </Text>
          </View>
        </MenuTrigger>

        <MenuOptions
          optionsContainerStyle={{
            width: '65%',
            alignSelf: 'center',
          }}
          style={[
            {
              backgroundColor: '#C0C0C0',
              flexDirection: 'row',
              position: 'absolute',
              top: 0,
              borderRadius: 7,
            },
            message.sender === user._id ? {right: 0} : {left: 0},
          ]}>
          {useConfigMessageMenuOption({
            message: messageState,
            setMessages,
            messages,
            onlineUsers,
            hiddenFromUsers,
            user,
            conversation,
            isEditingParentState,
            setIsEditingParentState: setIsEditingParentState,
            setIsForwardMessageModalOpen,
            setMessageState,
            setIsHiddenFromPopupOpen,
            setHiddenMode,
            setHiddenFromUsers,
          })}
        </MenuOptions>
      </Menu>

      {isForwardMessageModalOpen ? (
        <ForwardMessageHandler
          setIsForwardMessageModalOpen={setIsForwardMessageModalOpen}
          isForwardMessageModalOpen={isForwardMessageModalOpen}
          message={messageState}
          handleAppendMessage={handleAppendMessage}
        />
      ) : null}

      {/* POPUP TO HIDE MESSAGES FROM USERS */}
      {isHiddenFromPopupOpen ? (
        <HideSingleMessageHandler
          message={messageState}
          setMessageState={setMessageState}
          setIsHiddenFromPopupOpen={setIsHiddenFromPopupOpen}
          setHiddenMode={setHiddenMode}
          isHiddenFromPopupOpen={isHiddenFromPopupOpen}
          setHiddenFromUsers={setHiddenFromUsers}
          hiddenFromUsers={hiddenFromUsers}
        />
      ) : null}
    </View>
  );
}
export default Message;
