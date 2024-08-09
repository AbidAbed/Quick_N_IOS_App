import {useDispatch, useSelector} from 'react-redux';
import {
  changePath,
  updateUserData,
  usePutUpdateUserMutation,
} from '../Store/StoreInterface';
import {useEffect, useState} from 'react';
import useConfigProfile from '../Hooks/useConfigProfile';
import style from '../AppStyling';
import Form from '../Components/Form';
import {Image, View} from 'react-native';
import Button from '../Components/Button';
import profilePic from '../Assets/contact-icon-empty.png';
import {useNavigation} from '@react-navigation/native';
import FilePicker from '../Components/FilePicker';
import LinearGradient from 'react-native-linear-gradient';
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import BackIcon from 'react-native-vector-icons/Ionicons';

function Profile() {
  ///////////////////// CONFIGS //////////////////////////////////
  const dispatch = useDispatch();
  const navigation = useNavigation();

  /////////////////////// USESELECTERS ///////////////////////////
  const user = useSelector(state => state.user);
  ///////////////////////////// STATES //////////////////////////////
  const [responseError, setResponseError] = useState('');
  const [updatedAvatar, setUpdatedAvatar] = useState(null);
  const [configArr, setConfigArr] = useState(
    useConfigProfile({username: user.username, email: user.email}),
  );

  const [isErrorLoadingImage, setIsErrorLoadingImage] = useState(false);
  ////////////////////////// APIS ///////////////////////////////////
  const [putUpdateUser, putUpdateUserResponse] = usePutUpdateUserMutation();

  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    if (
      !putUpdateUserResponse.isLoading &&
      !putUpdateUserResponse.isUninitialized
    ) {
      if (putUpdateUserResponse.isError) {
        setResponseError('Failed to update profile');
      } else {
        dispatch(updateUserData({...putUpdateUserResponse.data}));
        setResponseError('SUCCESS');
      }
    }
  }, [putUpdateUserResponse]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      dispatch(changePath('Conversations'));
    });

    return unsubscribe;
  }, []);

  ////////////////////// HOOKS  //////////////////////
  function handleUpdateProfile(dataState) {
    setResponseError('');
    const dataStateValidation = configArr.reduce((prev, curr) => {
      const validationError = curr.validator(curr.state, dataState[curr.state]);
      if (validationError === '')
        return {...prev, [curr.state]: dataState[curr.state]};
      else return prev;
    }, {});

    //console.log(dataStateValidation);
    if (Object.entries(dataStateValidation).length !== 0)
      if (updatedAvatar !== null)
        putUpdateUser({
          isAdmin: user.isAdmin,
          token: user.token,
          userId: user._id,
          userData: {...dataStateValidation},
        });
      else
        putUpdateUser({
          isAdmin: user.isAdmin,
          token: user.token,
          userId: user._id,
          userData: {...dataStateValidation},
        });
    else if (updatedAvatar !== null) {
      //console.log('Image picked');
    } else setResponseError('You should edit at least one info');
  }

  function handleLoadImageFromDevice(avatar) {
    putUpdateUser({
      isAdmin: user.isAdmin,
      token: user.token,
      userId: user._id,
      userData: {avatar: avatar},
    });
  }

  // console.log(user.avatar);
  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <LinearGradient colors={['#06788D', '#06818D', '#00A2A2']}>
          <Form
            onSubmit={handleUpdateProfile}
            responseError={responseError}
            config={useConfigProfile({
              username: user.username,
              email: user.email,
            })}
            onSubmimsubmitButtonText="Update"
            submitButtonStyle={style.submitFormButton}
            submitButtonTextStyle={style.submitFormButtonText}
            isLoading={putUpdateUserResponse.isLoading}
            noValidationBeforeSubmit={true}>
            <View style={{alignSelf: 'flex-start'}}>
              <Button
                icon={
                  <BackIcon name="arrow-back-outline" size={20} color="white" />
                }
                onPress={() => navigation.goBack()}
                styleButton={[
                  style.submitFormButton,
                  {width: '20%', backgroundColor: 'transparent'},
                ]}
                styleText={style.submitFormButtonText}
              />
            </View>

            <FilePicker
              FilePickerMode="uploadUserAvatar"
              buttonChildren={
                <Image
                  style={{
                    width: '100%',
                    height: '100%',
                    alignSelf: 'center',
                    borderRadius: 50,
                    objectFit: 'contain',
                    resizeMode: 'contain',
                    // borderWidth: 1,
                    // borderColor: 'gray',
                  }} // Adjust dimensions as needed
                  source={
                    user.avatar && !isErrorLoadingImage
                      ? {
                          uri: user.avatar,
                        }
                      : profilePic
                  }
                  onError={() => setIsErrorLoadingImage(true)}
                  onLoad={() => setIsErrorLoadingImage(false)}
                />
              }
              buttonParentStyle={{
                width: '27%',
                height: '17%',
                alignSelf: 'center',
                marginTop: '10%',
              }}
              buttonStyle={{
                width: '100%',
                height: '100%',
                alignSelf: 'center',
                backgroundColor: 'transparent',
              }}
              options={{handleLoadImageFromDevice: handleLoadImageFromDevice}}
            />
          </Form>
        </LinearGradient>
      </ScrollView>
    </GestureHandlerRootView>
  );
}
export default Profile;
