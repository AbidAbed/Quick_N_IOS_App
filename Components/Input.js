import {TextInput} from 'react-native';
function Input({
  style,
  value,
  onChange,
  placeHolder,
  isDisabled,
  onFocus,
  onBlur,
  isPassword,
}) {
  return (
    <TextInput
      onBlur={onBlur}
      style={style}
      onFocus={onFocus}
      onChangeText={text => onChange(text)}
      value={value}
      placeholder={placeHolder}
      editable={!isDisabled}
      placeholderTextColor="#B0B2B3"
      secureTextEntry={isPassword ? true : false}
      multiline={isPassword ? false : true}
    />
  );
}
export default Input;
