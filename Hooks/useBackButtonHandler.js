import {useDispatch, useSelector} from 'react-redux';
import {
  changeSelectedConversationId,
  removePath,
} from '../Store/StoreInterface';
import {BackHandler} from 'react-native';
import {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';

function useBackButtonHandler() {
  return () => {
    const dispatch = useDispatch();
    useEffect(() => {
      function backButtonHandler() {
        dispatch(changeSelectedConversationId(null));
        return true;
      }
      BackHandler.addEventListener('hardwareBackPress', backButtonHandler);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', backButtonHandler);
      };
    }, []);
  };
}

export default useBackButtonHandler;
