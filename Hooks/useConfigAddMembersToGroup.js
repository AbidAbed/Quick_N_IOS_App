import {Image, Text, View} from 'react-native';
import Button from '../Components/Button';
import style from '../AppStyling';
import profilePic from '../Assets/contact-icon-empty.png';
import selectedIcon from '../Assets/Selected.png';
function useConfigAddMembersToGroup(
  handleAddMember,
  handleRemoveMember,
  addedusers,
) {
  return user => {
    return addedusers.filter(usr => usr._id === user._id).length !== 0 ? (
      <Button
        styleButton={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: '2%',
        }}
        styleText={style.submitFormButtonText}
        onPress={() => handleRemoveMember(user)}>
        <View
          style={{
            position: 'relative',
            flexDirection: 'row',
            width: 30,
            height: 30,
          }}>
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

          <Image
            style={{
              width: 10,
              height: 10,
              alignSelf: 'center',
              borderRadius: 50,
              objectFit: 'contain',
              resizeMode: 'contain',
              position: 'absolute',
              bottom: 0,
              right: 0,
            }} // Adjust dimensions as needed
            source={selectedIcon}
          />
        </View>

        <Text
          style={[style.conversationNameText, {fontSize: 10, padding: '1%'}]}>
          {user.username}
        </Text>
      </Button>
    ) : (
      <Button
        styleButton={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: '2%',
        }}
        styleText={style.submitFormButtonText}
        onPress={() => handleAddMember(user)}>
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
          style={[style.conversationNameText, {fontSize: 10, padding: '1%'}]}>
          {user.username}
        </Text>
      </Button>
    );
  };
}
export default useConfigAddMembersToGroup;
