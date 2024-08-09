import {Image, Text, View} from 'react-native';
import style from '../AppStyling';
import Button from '../Components/Button';
import profilePic from '../Assets/contact-icon-empty.png';
import LeaveGroupIcon from 'react-native-vector-icons/Ionicons';
import KickMember from 'react-native-vector-icons/Ionicons';
function useConfigGroupSettings(handleRemove, loggedInUser) {
  return user => {
    return (
      <View style={{paddingLeft: '2%', paddingRight: '10%'}}>
        <View
          style={{
            flexDirection: 'row',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2%',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                {fontSize: 10, padding: '1%'},
              ]}>
              {user.username}
            </Text>
          </View>

          {loggedInUser.isAdmin ? (
            <Button
              // styleButton={style.submitFormButton}
              // styleText={style.submitFormButtonText}
              icon={
                loggedInUser._id === user._id ? (
                  <LeaveGroupIcon name="exit-outline" size={25} color="gray"/>
                ) : (
                  <KickMember name="person-remove-outline" size={25} color="gray"/>
                )
              }
              onPress={() => handleRemove(user)}
            />
          ) : (
            ''
          )}
        </View>
      </View>
    );
  };
}
export default useConfigGroupSettings;
