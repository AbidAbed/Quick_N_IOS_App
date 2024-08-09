import {Text} from 'react-native';

function Label({style, text}) {
  return <Text style={[{fontSize: 5}, style]}>{text}</Text>;
}
export default Label;
