import {MenuOption} from 'react-native-popup-menu';
import {Text} from 'react-native';
import ForwardIcon from 'react-native-vector-icons/FontAwesome';

function ForwardMessageMenuOption({setIsForwardMessageModalOpen}) {
  ////////////////////// HOOKS  //////////////////////
  function onEdit() {
    setIsForwardMessageModalOpen(true);
  }
  return (
    <MenuOption onSelect={onEdit}>
      <ForwardIcon name="mail-forward" size={15} color="gray" />
    </MenuOption>
  );
}
export default ForwardMessageMenuOption;
