import {MenuOption} from 'react-native-popup-menu';
import {Text} from 'react-native';
import EditIcon from 'react-native-vector-icons/AntDesign';

function EditMessageMenuOption({setIsEditingParentState}) {
  ////////////////////// HOOKS  //////////////////////
  function onEdit() {
    setIsEditingParentState(true);
  }
  return (
    <MenuOption onSelect={onEdit}>
      <EditIcon name="edit" size={15} color="gray" />
      {/* {isEditing ? (
        <View style={{flexD}}>
          <Button text="Cancel" onPress={onCancelEdit} />
          <Button text="Save" onPress={onSave} />
          <Input
            value={messageValue}
            onChange={onMessageChange}
            placeHolder="Edit message"
            isDisabled={false}
          />
        </View>
      ) : (
        <></>
      )} */}
    </MenuOption>
  );
}
export default EditMessageMenuOption;
