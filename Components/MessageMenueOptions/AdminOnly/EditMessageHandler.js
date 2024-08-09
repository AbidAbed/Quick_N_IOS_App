import {MenuOption} from 'react-native-popup-menu';
import {ActivityIndicator, Text, View} from 'react-native';
import Button from '../../Button';
import Input from '../../Input';
import {useEffect, useState} from 'react';
import style from '../../../AppStyling';
import {
  updateLeatestMessage,
  usePutMessageMutation,
} from '../../../Store/StoreInterface';
import {useDispatch, useSelector} from 'react-redux';
import socket from '../../../utils/SocketConfig';
import CancelIcon from 'react-native-vector-icons/MaterialIcons';
import SaveIcon from 'react-native-vector-icons/Feather';
function EditMessageHandler({
  message,
  setIsEditingParentState,
  isEditingParentState,
  setMessageState,
  onlineUsers,
  hiddenFromUsers,
}) {
  ///////////////////// CONFIGS //////////////////////////////////
  const dispatch = useDispatch();
  /////////////////////// USESELECTERS ///////////////////////////
  const conversationMessageDeletedFrom = useSelector(state => {
    const foundConversation = state.conversations.find(
      usrConv => message.conversationId === usrConv._id,
    );
    return foundConversation;
  });
  const user = useSelector(state => state.user);

  ///////////////////////////// STATES //////////////////////////////
  const [isEditing, setIsEditing] = useState(isEditingParentState);
  const [messageValue, setMessageValue] = useState(message.text);
  const [messageValueError, setMessageValueError] = useState('');
  ///////////////////////// APIS ///////////////////////////////////

  const [putMessage, putMessageResponse] = usePutMessageMutation();

  //////////////////////// USEEFFECTS ////////////////////////////////

  useEffect(() => {
    setIsEditing(isEditingParentState);
  }, [isEditingParentState]);

  useEffect(() => {
    if (!putMessageResponse.isUninitialized && !putMessageResponse.isLoading) {
      if (putMessageResponse.isError) {
        //console.log('ERROR TO UPDATE MESSAGE');
      } else {
        if (
          message._id === conversationMessageDeletedFrom?.latestMessage?._id
        ) {
          dispatch(
            updateLeatestMessage({
              convId: message.conversationId,
              latestMessage: {
                ...conversationMessageDeletedFrom.latestMessage,
                text:
                  '*EDITED*, ' +
                  conversationMessageDeletedFrom.latestMessage.text,
              },
            }),
          );
        }
        setMessageState({...message, text: messageValue});
        setIsEditing(false);
        setIsEditingParentState(false);

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

        socket.emit('updatedMessage', {
          message_id: message._id,
          conversationId: message.conversationId,
          members: [...onlineUsersNotHiddenFromIds],
          senderId: user._id,
          newText: messageValue,
        });
      }
    }
  }, [putMessageResponse]);
  ////////////////////// HOOKS  //////////////////////

  function onMessageChange(text) {
    setMessageValue(text);
    //console.log(text);
    if (text === '') setMessageValueError("Edited message can't be empty");
    else setMessageValueError('');
  }

  function onCancelEdit() {
    setIsEditing(false);
    setIsEditingParentState(false);
    setMessageValue(message.text);
    setMessageValueError('');
  }

  function onSave() {
    if (messageValueError === '') {
      putMessage({
        isAdmin: user.isAdmin,
        token: user.token,
        newText: messageValue,
        conversationId: message.conversationId,
        msgId: message._id,
      });
    }
  }
  ////////////////////// RETURNED COMPONENTS //////////////////////
  return (
    <View style={{alignItems: 'center'}}>
      {isEditing ? (
        putMessageResponse.isLoading ? (
          <ActivityIndicator
            size="small" 
            color="#058095"
            style={{height: '1%'}}
          />
        ) : (
          <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
            <Button
              icon={<CancelIcon name="cancel" size={20} />}
              onPress={onCancelEdit}
              styleButton={[]}
              styleText={style.submitFormButtonText}
            />
            {message.text !== messageValue && messageValue !== '' ? (
              <Button
                icon={<SaveIcon name="save" size={20} />}
                onPress={onSave}
                // styleButton={style.submitFormButton}
                styleText={style.submitFormButtonText}
              />
            ) : (
              false
            )}

            <Input
              value={messageValue}
              onChange={onMessageChange}
              placeHolder="Edit message"
              isDisabled={false}
              style={{
                backgroundColor: 'white',
                fontSize: 7,
                // maxWidth: '100%',
                color: 'gray',
              }}
            />
            {/* {messageValueError !== '' && (
              <Text style={style.conversationNameText}>
                {messageValueError}
              </Text>
            )} */}
          </View>
        )
      ) : (
        <></>
      )}
    </View>
  );
}
export default EditMessageHandler;
