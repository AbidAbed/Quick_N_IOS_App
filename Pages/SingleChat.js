import {useDispatch, useSelector} from 'react-redux';
import useBackButtonHandler from '../Hooks/useBackButtonHandler';
import ConversationHeader from '../Components/ConversationHeader';
import {useState} from 'react';
import {Image, Text, View} from 'react-native';
import Messages from '../Components/Messages';
import useConfigSendersUsers from '../Hooks/configSendersUsers';
import profilePic from '../Assets/contact-icon-empty.png';
function SingleChat({children}) {
  ///////////////////// CONFIGS //////////////////////////////////
  const dispatch = useDispatch();
  useBackButtonHandler()();
  /////////////////////// USESELECTERS ///////////////////////////
  const selectedConversationId = useSelector(
    state => state.config.selectedConversationId,
  );

  const user = useSelector(state => state.user);

  const [selectedConversation] = useSelector(
    state => state.conversations,
  ).filter(
    conversation =>
      selectedConversationId && conversation._id === selectedConversationId,
  );

  const users = useSelector(state => state.users);
  ///////////////////////////// STATES //////////////////////////////
  const [conversationMembers, setConversationMembers] = useState(
    users.filter(usr => {
      if (!selectedConversation) return false;
      const isExist = selectedConversation.members.find(
        member => member === usr._id,
      );
      if (isExist) return true;
      else return false;
    }),
  );
  ////////////////////////// APIS ///////////////////////////////////
  //////////////////////// USEEFFECTS ////////////////////////////////
  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <View style={{width: '100%', height: '100%'}}>
      <View
        style={{
          flexDirection: 'row',
          flex: 2,
          justifyContent: 'flex-start',
          alignItems: 'center',
          backgroundColor: '#058095',
        }}>
        <View>{children}</View>
        <View>
          <Image
            style={{borderRadius: 50, width: 50, height: 50}} // Adjust dimensions as needed
            source={
              selectedConversation?.convAvatar
                ? {
                    uri: selectedConversation?.convAvatar,
                  }
                : profilePic
            }
          />
        </View>
        <View>
          <Text style={{color: 'white', padding: '1%', fontSize: 20}}>
            {selectedConversation?.convName}
          </Text>
        </View>
      </View>

      {/* {conversationMembers && (
        <ConversationHeader
          users={conversationMembers}
          setusers={setConversationMembers}
        />
      )} */}

      <View
        style={{
          flex: 10,
        }}>
        {conversationMembers && (
          <Messages
            sendersUsers={useConfigSendersUsers(conversationMembers)}
            conversationId={selectedConversationId}
          />
        )}
      </View>
    </View>
  );
}

export default SingleChat;
