import {Image, Text, View} from 'react-native';
import style from '../AppStyling';
import Button from '../Components/Button';
import profilePic from '../Assets/contact-icon-empty.png';

function useConfigAnnouncementReport() {
  return signeduser => {
    // console.log(222, signeduser);
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: '2%',
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
            signeduser.avatar
              ? {
                  uri: signeduser.avatar,
                }
              : profilePic
          }
        />
        <Text
          style={[
            style.conversationNameText,
            {fontSize: 10, paddingLeft: '1%'},
          ]}>
          {signeduser.username}
        </Text>
        <Text
          style={[
            style.conversationNameText,
            {
              flex: 1,
              fontSize: 10,
              paddingLeft: '1%',
              textAlign: 'right',
            },
          ]}
        />
        <View>
          <Text style={{fontSize: 10, paddingRight: '1%', color: 'gray'}}>
            {new Date(signeduser.checkedAt).toISOString().split('T')[0]}
          </Text>
          <Text
            style={{
              fontSize: 10,
              alignSelf: 'flex-end',
              paddingRight: '1%',
              color: 'gray',
            }}>
            {new Date(signeduser.checkedAt)
              .toISOString()
              .split('T')[1]
              .split('.')[0]
              .substring(0, 5)}
          </Text>
        </View>
      </View>
    );
  };
}
export default useConfigAnnouncementReport;
