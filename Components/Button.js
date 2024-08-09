import {Text, TouchableOpacity} from 'react-native';

function Button({
  onPress,
  styleButton,
  styleText,
  text,
  children,
  disabled,
  icon,
}) {
  return (
    <TouchableOpacity style={styleButton} onPress={onPress} disabled={disabled}>
      <Text style={styleText}>
        {text}{icon}
      </Text>
      {children}
    </TouchableOpacity>
  );
}
export default Button;
