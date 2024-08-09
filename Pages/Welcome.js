import {Image, Modal, Text, View} from 'react-native';
import {storage} from '../utils/storage';
import {useEffect, useState} from 'react';
import {
  changeIsLoggedIn,
  fetchUserData,
  useGetUserByTokenMutation,
} from '../Store/StoreInterface';
import {useDispatch, useSelector} from 'react-redux';
import socket from '../utils/SocketConfig';
import style from '../AppStyling';
import Button from '../Components/Button';
import logoImg from '../Assets/logo.png';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import NextPageIcon from 'react-native-vector-icons/AntDesign';

function Welcome() {
  ///////////////////// CONFIGS //////////////////////////////////
  const navigation = useNavigation();

  const dispatch = useDispatch();
  /////////////////////// USESELECTERS ///////////////////////////

  const user = useSelector(state => state.user);
  ///////////////////////////// STATES //////////////////////////////
  const [userToken, setUserToken] = useState(storage.getString('QUICKN_TOKEN'));

  const [isUserLoggedInFromOtherDevice, setIsUserLoggedInFromOtherDevice] =
    useState(false);

  ////////////////////////// APIS ///////////////////////////////////

  const [getUserByToken, getUserByTokenResponse] = useGetUserByTokenMutation();

  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: {
        display: 'none',
      },
    });
    return () =>
      navigation.setOptions({
        tabBarStyle: undefined,
      });
  }, []);

  useEffect(() => {
    if (userToken && userToken !== '') {
      const isAdmin = userToken.includes('admin');
      getUserByToken({isAdmin: isAdmin, token: userToken.split(' ')[1]});
    }
  }, [userToken]);

  useEffect(() => {
    if (
      !getUserByTokenResponse.isLoading &&
      !getUserByTokenResponse.isUninitialized
    ) {
      if (getUserByTokenResponse.isError) {
      } else {
        dispatch(
          fetchUserData({
            ...getUserByTokenResponse.data.user,
            token: getUserByTokenResponse.data.token,
          }),
        );
        if (getUserByTokenResponse.data.user.isOnline)
          setIsUserLoggedInFromOtherDevice(true);
        else {
          dispatch(changeIsLoggedIn(true));

          const userToken = user.isAdmin
            ? `admin ${getUserByTokenResponse.data.token}`
            : `Bearer ${getUserByTokenResponse.data.token}`;
          storage.set('QUICKN_TOKEN', userToken);
        }
      }
    }
  }, [getUserByTokenResponse]);

  ////////////////////// HOOKS  //////////////////////

  function closeModal() {
    setIsUserLoggedInFromOtherDevice(false);
  }

  function handleLogoutFromThisDevice() {
    closeModal();

    dispatch(fetchUserData({}));

    dispatch(changeIsLoggedIn(false));

    const userToken = user.isAdmin
      ? `admin ${user.token}`
      : `Bearer ${user.token}`;

    storage.set('QUICKN_TOKEN', userToken);
  }

  async function handleLogoutFromOtherDevices() {
    closeModal();
    await socket.emit('logoutUser', {receiverId: user._id});

    dispatch(changeIsLoggedIn(true));
  }

  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <LinearGradient colors={['#06788D', '#06818D', '#00A2A2']}>
      <View style={{height: '100%', position: 'relative'}}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            marginBottom: '5%',
            marginTop: '20%',
          }}>
          <Image source={logoImg} style={style.logoImgStyle} />
          <Text
            style={{
              textAlign: 'center',
              marginTop: 35,
              fontSize: 16,
              color: 'white',
              fontWeight: 400,
            }}>
            Welcome to QuickN
          </Text>
        </View>

        <Button
          icon={<NextPageIcon name="arrowright" color="white" size={25} />}
          styleButton={{
            position: 'absolute',
            bottom: 0,
            right: 0,
          }}
          onPress={() => navigation.navigate('Login')}
          styleText={style.submitFormButtonText}
        />

        {isUserLoggedInFromOtherDevice ? (
          <Modal
            visible={isUserLoggedInFromOtherDevice}
            animationType="slide"
            transparent={true}
            onRequestClose={closeModal}
            style={{justifyContent: 'center'}}>
            <View
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                height: '100%',
                paddingRight: '6%',
                paddingLeft: '6%',
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  padding: '2%',
                  borderRadius: 7,
                  justifyContent: 'center',
                  alignItems: 'center',
                  // backgroundColor: 'red',
                }}>
                <Text
                  style={[
                    style.conversationNameText,
                    {
                      textAlign: 'left',
                      fontSize: 13,
                      minWidth: '88%',
                      fontSize: 13,
                    },
                  ]}>
                  You are already loggedin from other device
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 20,
                    justifyContent: 'center',
                  }}>
                  <Button
                    text="Logout from other devices"
                    styleButton={style.submitFormButton}
                    styleText={[
                      style.submitFormButtonText,
                      {fontSize: 10, borderRadius: 7},
                    ]}
                    onPress={handleLogoutFromOtherDevices}
                  />
                  <Button
                    styleButton={style.submitFormButton}
                    styleText={[
                      style.submitFormButtonText,
                      {fontSize: 10, borderRadius: 7},
                    ]}
                    text="Logout from this device"
                    onPress={handleLogoutFromThisDevice}
                  />
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          ''
        )}
      </View>
    </LinearGradient>
  );
}
export default Welcome;
