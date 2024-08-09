import {Image, Text, View} from 'react-native';
import Button from '../Components/Button';
import style from '../AppStyling';
import profilePic from '../Assets/contact-icon-empty.png';
import selectedIcon from '../Assets/Selected.png';
import groupPic from '../Assets/groupPic.png';
function useConfigForwardMessageHandler(
  handleAddConversation,
  handleRemoveConversation,
  addedConversations,
  handleAddUser,
  handleRemoveUser,
  addedusers,
) {
  return item => {
    return (
      <View>
        <View style={{flexDirection: 'row'}}>
          {item.isAConversation ? (
            <>
              {addedConversations.filter(
                conversation => conversation._id === item._id,
              ).length !== 0 ? (
                <Button
                  styleButton={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: '2%',
                  }}
                  styleText={style.submitFormButtonText}
                  onPress={() => handleRemoveConversation(item)}>
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
                        item.convAvatar
                          ? {
                              uri: `https://novel-era.co/quickn/api/v1/message/file/binary?fileId=${item?.convAvatar}&page=1`,
                            }
                          : groupPic
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
                    style={[
                      style.conversationNameText,
                      {fontSize: 10, paddingLeft: '1%'},
                    ]}>
                    {item.convName}
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
                  onPress={() => handleAddConversation(item)}>
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
                      item.convAvatar
                        ? {
                            uri: `https://novel-era.co/quickn/api/v1/message/file/binary?fileId=${item?.convAvatar}&page=1`,
                          }
                        : groupPic
                    }
                  />
                  <Text
                    style={[
                      style.conversationNameText,
                      {fontSize: 10, paddingLeft: '1%'},
                    ]}>
                    {item.convName}
                  </Text>
                </Button>
              )}
            </>
          ) : addedusers.filter(usr => usr._id === item._id).length !== 0 ? (
            <Button
              styleButton={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: '2%',
              }}
              styleText={style.submitFormButtonText}
              onPress={() => handleRemoveUser(item)}>
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
                    item.avatar
                      ? {
                          uri: item.avatar,
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
                style={[
                  style.conversationNameText,
                  {fontSize: 10, paddingLeft: '1%'},
                ]}>
                {item.username}
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
              onPress={() => handleAddUser(item)}>
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
                  item.avatar
                    ? {
                        uri: item.avatar,
                      }
                    : profilePic
                }
              />
              <Text
                style={[
                  style.conversationNameText,
                  {fontSize: 10, paddingLeft: '1%'},
                ]}>
                {item.username}
              </Text>
            </Button>
          )}
        </View>
      </View>
    );
  };
}
export default useConfigForwardMessageHandler;
