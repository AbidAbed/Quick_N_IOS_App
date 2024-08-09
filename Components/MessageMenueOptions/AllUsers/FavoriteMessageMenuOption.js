import {MenuOption} from 'react-native-popup-menu';
import {Text} from 'react-native';
import {useSelector} from 'react-redux';
import {
  usePatchFavouriteMessageMutation,
  usePatchRemoveFavouriteMessageMutation,
} from '../../../Store/StoreInterface';
import {useEffect} from 'react';
import FavouriteIcon from 'react-native-vector-icons/Feather';
import UnFavouriteIcon from 'react-native-vector-icons/FontAwesome';
function FavoriteMessageMenuOption({message, conversation, setMessageState}) {
  ///////////////////// CONFIGS //////////////////////////////////

  /////////////////////// USESELECTERS ///////////////////////////
  const user = useSelector(state => state.user);
  ///////////////////////////// STATES //////////////////////////////

  ////////////////////////// APIS ///////////////////////////////////
  const [patchFavouriteMessage, patchFavouriteMessageResponse] =
    usePatchFavouriteMessageMutation();
  const [patchRemoveFavouriteMessage, patchRemoveFavouriteMessageResponse] =
    usePatchRemoveFavouriteMessageMutation();
  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    if (
      !patchFavouriteMessageResponse.isLoading &&
      !patchFavouriteMessageResponse.isUninitialized
    ) {
      if (patchFavouriteMessageResponse.isError) {
        //console.log(patchFavouriteMessageResponse, 'EEEEEEEERRRRORRRRRR fav');
      } else {
        setMessageState({...message, isFavorite: true});
      }
    }
  }, [patchFavouriteMessageResponse]);
  useEffect(() => {
    if (
      !patchRemoveFavouriteMessageResponse.isLoading &&
      !patchRemoveFavouriteMessageResponse.isUninitialized
    ) {
      if (patchRemoveFavouriteMessageResponse.isError) {
      } else {
        setMessageState({...message, isFavorite: false});
      }
    }
  }, [patchRemoveFavouriteMessageResponse]);
  ////////////////////// HOOKS  //////////////////////

  function handleFavouriteClicked() {
    if (message.isFavorite) {
      patchRemoveFavouriteMessage({
        token: user.token,
        isAdmin: user.isAdmin,
        msgId: message._id,
      });
    } else {
      patchFavouriteMessage({
        token: user.token,
        isAdmin: user.isAdmin,
        msgId: message._id,
      });
    }
  }
  ////////////////////// RETURNED COMPONENTS //////////////////////
  return (
    <MenuOption onSelect={handleFavouriteClicked}>
      {message.isFavorite ? (
        <UnFavouriteIcon name="star" size={15} color="gray" />
      ) : (
        <FavouriteIcon name="star" size={15} color="gray" />
      )}
    </MenuOption>
  );
}
export default FavoriteMessageMenuOption;
