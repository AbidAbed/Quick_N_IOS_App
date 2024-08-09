import usePasswordValidator from './Validators/usePasswordValidator';
import useUsernameValidator from './Validators/useUsernameValidator';

function useConfigLogin() {
  return [
    {
      lable: 'Username',
      state: 'username',
      placeHolder: 'username',
      validator: useUsernameValidator,
    },
    {
      lable: 'Password',
      placeHolder: 'password',
      state: 'password',
      validator: usePasswordValidator,
      isPassword: true,
    },
  ];
}
export default useConfigLogin;
