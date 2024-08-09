import {View, Text, Modal} from 'react-native';
import Form from '../Components/Form';
import {useEffect, useState} from 'react';
import useConfigLogin from '../Hooks/useConfigLogin';
import style from '../AppStyling';
import {
  changeIsLoggedIn,
  fetchUserData,
  usePostLoginMutation,
} from '../Store/StoreInterface';
import {useDispatch, useSelector} from 'react-redux';
import Button from '../Components/Button';
import socket from '../utils/SocketConfig';
import {storage} from '../utils/storage';
import {useNavigation} from '@react-navigation/native';
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
function Login() {
  ///////////////////// CONFIGS //////////////////////////////////
  const dispatch = useDispatch();
  const navigation = useNavigation();

  /////////////////////// USESELECTERS ///////////////////////////

  const user = useSelector(state => state.user);
  ///////////////////////////// STATES //////////////////////////////

  //POST login response error (if any)
  const [responseError, setResponseError] = useState('');

  const [isUserLoggedInFromOtherDevice, setIsUserLoggedInFromOtherDevice] =
    useState(false);
  ////////////////////////// APIS ///////////////////////////////////

  //POST login API
  const [postLogin, postLoginResponse] = usePostLoginMutation();

  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    if (!postLoginResponse.isLoading && !postLoginResponse.isUninitialized) {
      if (postLoginResponse.isError) {
        setResponseError('Invalid Credentials');
      } else {
        //dispatch user
        setResponseError('SUCCESS');
        if (postLoginResponse.data.user.isOnline)
          setIsUserLoggedInFromOtherDevice(true);
        else {
          dispatch(changeIsLoggedIn(true));
          const userToken = user.isAdmin
            ? `admin ${postLoginResponse.data.token}`
            : `Bearer ${postLoginResponse.data.token}`;
          storage.set('QUICKN_TOKEN', userToken);
        }

        dispatch(
          fetchUserData({
            ...postLoginResponse.data.user,
            token: postLoginResponse.data.token,
          }),
        );
      }
    }
  }, [postLoginResponse]);
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
  ////////////////////// HOOKS  //////////////////////

  function closeModal() {
    setIsUserLoggedInFromOtherDevice(false);
  }

  function handleLogoutFromThisDevice() {
    closeModal();
    dispatch(fetchUserData({}));
    dispatch(changeIsLoggedIn(false));
  }

  async function handleLogoutFromOtherDevices() {
    closeModal();
    await socket.emit('logoutUser', {receiverId: user._id});

    dispatch(changeIsLoggedIn(true));
    const userToken = user.isAdmin
      ? `admin ${user.token}`
      : `Bearer ${user.token}`;
    storage.set('QUICKN_TOKEN', userToken);
    navigation.navigate('Conversations-child');
  }

  function handleLogin(state) {
    setResponseError('');
    postLogin({...state});
  }
  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <LinearGradient colors={['#06788D', '#06818D', '#00A2A2']}>
      <GestureHandlerRootView>
        <ScrollView
          contentContainerStyle={{
            height: '100%',
            position: 'relative',
          }}>
          {isUserLoggedInFromOtherDevice ? (
            <Modal
              visible={isUserLoggedInFromOtherDevice}
              animationType="fade"
              transparent={true}
              onRequestClose={closeModal}
              style={{backgroundColor: 'white', justifyContent: 'center'}}>
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
                        color: 'black',
                        textAlign: 'left',
                        fontSize: 13,
                        minWidth: '88%',
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
                      styleText={[style.submitFormButtonText, {fontSize: 10}]}
                      onPress={handleLogoutFromOtherDevices}
                    />
                    <Button
                      styleButton={style.submitFormButton}
                      styleText={[style.submitFormButtonText, {fontSize: 10}]}
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

          <Form
            onSubmit={handleLogin}
            responseError={responseError}
            config={useConfigLogin()}
            onSubmimsubmitButtonText="Login"
            submitButtonStyle={style.submitFormButton}
            submitButtonTextStyle={style.submitFormButtonText}
            isLoading={postLoginResponse.isLoading}
            bottomChildren={
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                  // backgroundColor: 'red',
                  paddingBottom: '13%',
                }}>
                <Text style={{color: 'white'}}>Don't have an account ?</Text>
                <Button
                  text="Register"
                  styleButton={{}}
                  styleText={[
                    style.submitFormButtonText,
                    {color: 'white', textDecorationLine: 'underline'},
                  ]}
                  onPress={() => navigation.navigate('Signup')}
                />
              </View>
            }
          />
        </ScrollView>
      </GestureHandlerRootView>
    </LinearGradient>
  );
}
export default Login;
