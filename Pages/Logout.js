import {useEffect, useState} from 'react';
import {Modal, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Button from '../Components/Button';
import style from '../AppStyling';
import {storage} from '../utils/storage';
import {
  changeIsLoggedIn,
  changePath,
  fetchUserData,
} from '../Store/StoreInterface';
import socket from '../utils/SocketConfig';
import {useNavigation, useIsFocused} from '@react-navigation/native';

function Logout() {
  ///////////////////// CONFIGS //////////////////////////////////
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  /////////////////////// USESELECTERS ///////////////////////////
  const user = useSelector(state => state.user);
  ///////////////////////////// STATES //////////////////////////////
  const [isModalOpened, setIsModalOpened] = useState(true);
  ////////////////////////// APIS ///////////////////////////////////

  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    if (isFocused) {
      setIsModalOpened(true);
    }
  }, [isFocused]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      dispatch(changePath('Conversations'));
    });

    return unsubscribe;
  }, []);
  ////////////////////// HOOKS  //////////////////////

  function handleConfirmLogout() {
    storage.set('QUICKN_TOKEN', '');
    dispatch(changeIsLoggedIn(false));
    dispatch(fetchUserData({}));
    socket.disconnect();
    setIsModalOpened(false);
  }

  function handleModalClose() {
    navigation.goBack();
    setIsModalOpened(false);
    dispatch(changePath('Conversations'));
  }
  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <View>
      <Modal
        visible={isModalOpened}
        onRequestClose={handleModalClose}
        animationType="slide"
        transparent={true}>
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
              Are you sure?
            </Text>
            <View
              style={{
                flexDirection: 'row',
                gap: 20,
                justifyContent: 'center',
              }}>
              <Button
                text="Cancel"
                styleButton={style.submitFormButton}
                styleText={[
                  style.submitFormButtonText,
                  {fontSize: 10, borderRadius: 7},
                ]}
                onPress={handleModalClose}
              />
              <Button
                styleButton={style.submitFormButton}
                styleText={[
                  style.submitFormButtonText,
                  {fontSize: 10, borderRadius: 7},
                ]}
                text="Logout"
                onPress={handleConfirmLogout}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
export default Logout;
