import {Text} from 'react-native';
import {MenuOption} from 'react-native-popup-menu';
import HideIcon from 'react-native-vector-icons/Entypo';
function HideFromSingleMemberMessageMenuOption({setIsHiddenFromPopupOpen}) {
  ///////////////////// CONFIGS //////////////////////////////////

  /////////////////////// USESELECTERS ///////////////////////////

  ///////////////////////////// STATES //////////////////////////////

  ////////////////////////// APIS ///////////////////////////////////

  //////////////////////// USEEFFECTS ////////////////////////////////

  ////////////////////// HOOKS  //////////////////////
  function handleHideMessage() {
    setIsHiddenFromPopupOpen(true);
  }

  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <MenuOption onSelect={handleHideMessage}>
      <HideIcon name="eye-with-line" size={15} color="gray" />
    </MenuOption>
  );
}
export default HideFromSingleMemberMessageMenuOption;
