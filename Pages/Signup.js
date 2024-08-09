import {View, Text} from 'react-native';
import Form from '../Components/Form';
import {useEffect, useState} from 'react';
import style from '../AppStyling';
import useConfigSignup from '../Hooks/useConfigSignup';
import {usePostSignupMutation} from '../Store/StoreInterface';
import {useNavigation} from '@react-navigation/native';
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import PrevPageIcon from 'react-native-vector-icons/AntDesign';
import Button from '../Components/Button';

function Signup() {
  ///////////////////// CONFIGS //////////////////////////////////
  //To navigate the user to other route
  const navigation = useNavigation();

  /////////////////////// USESELECTERS ///////////////////////////

  ///////////////////////////// STATES //////////////////////////////
  //POST signup response error (if any)
  const [responseError, setResponseError] = useState('');
  ////////////////////////// APIS ///////////////////////////////////

  //POST signup API
  const [postSignup, postSignupResponse] = usePostSignupMutation();
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
    if (!postSignupResponse.isLoading && !postSignupResponse.isUninitialized) {
      ////console.log(postSignupResponse);
      if (postSignupResponse.isError) {
        setResponseError(
          'Try again with diffrent username, or check your typing',
        );
      } else {
        setResponseError('SUCCESS');
        navigation.navigate('Login');
      }
    }
  }, [postSignupResponse]);
  ////////////////////// HOOKS  //////////////////////

  function handleSignup(state) {
    setResponseError('');
    postSignup(state);
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
          <Button
            icon={<PrevPageIcon name="arrowleft" color="white" size={25} />}
            styleButton={{
              position: 'absolute',
              bottom: 0,
              left: 0,
            }}
            onPress={() => navigation.navigate('Login')}
            styleText={style.submitFormButtonText}
          />
          <Form
            onSubmit={handleSignup}
            responseError={responseError}
            config={useConfigSignup()}
            onSubmimsubmitButtonText="Signup"
            submitButtonStyle={style.submitFormButton}
            submitButtonTextStyle={style.submitFormButtonText}
            isLoading={postSignupResponse.isLoading}
          />
        </ScrollView>
      </GestureHandlerRootView>
    </LinearGradient>
  );
}
export default Signup;
