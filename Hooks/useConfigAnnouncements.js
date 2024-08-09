import {Text, View} from 'react-native';
import Button from '../Components/Button';
import style from '../AppStyling';

function useConfigAnnouncements(user, onSign) {
  return announcement => {
    const isUserSigned = announcement.checkedUsers.find(
      checkedUser => checkedUser.userId !== user._id,
    );
    return isUserSigned !== undefined ||
      announcement.checkedUsers.length === 0 ? (
      <View
        style={{
          backgroundColor: 'transparent',
          paddingBottom: '5%',
          borderRadius: 7,
        }}>
        <View
          style={{
            backgroundColor: 'white',
            padding: '5%',
            borderRadius: 7,
          }}>
          <Text
            style={[
              style.conversationNameText,
              {fontWeight: 'bold', fontSize: 15, textAlign: 'center'},
            ]}>
            {announcement.announcementTitle}
          </Text>
          <Text style={style.conversationNameText}>
            {announcement.announcementText}
          </Text>
          <Button
            onPress={() => onSign(announcement)}
            styleButton={[
              style.submitFormButton,
              {
                width: '20%',
                padding: '0%',
                alignItems: 'center',
                alignSelf: 'center',
              },
            ]}
            styleText={[
              // style.submitFormButtonText,
              {
                width: '50%',
                padding: '2%',
                textAlign: 'center',
                color: 'white',
              },
            ]}
            text="Sign"
          />
        </View>
      </View>
    ) : (
      ''
    );
  };
}
export default useConfigAnnouncements;
