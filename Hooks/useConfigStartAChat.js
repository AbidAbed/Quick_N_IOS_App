import {Image, Text, View} from 'react-native';
import Button from '../Components/Button';
import style from '../AppStyling';
import profilePic from '../Assets/contact-icon-empty.png';

function useConfigStartAChat(onStartAChat) {
  return user => {
    return (
      <View>
        <Button
          styleButton={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: '2%',
          }}
          styleText={style.submitFormButtonText}
          onPress={() => onStartAChat(user)}>
          <Image
            style={{
              width: 30,
              height: 30,
              alignSelf: 'center',
              borderRadius: 50,
              objectFit: 'contain',
              resizeMode: 'contain',
            }} // Adjust dimensions as needed
            source={
              user.avatar
                ? {
                    uri: user.avatar,
                  }
                : profilePic
            }
          />
          <Text
            style={[
              style.conversationNameText,
              {fontSize: 10, paddingLeft: '1%'},
            ]}>
            {user.username}
          </Text>
        </Button>
      </View>
    );
  };
}
export default useConfigStartAChat;
