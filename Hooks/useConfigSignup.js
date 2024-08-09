import usePasswordValidator from './Validators/usePasswordValidator';
import useUsernameValidator from './Validators/useUsernameValidator';
import useConfirmPasswordValidator from './Validators/useConfirmPasswordValidator';
import useEmailValidator from './Validators/useEmailValidator';

function useConfigSignup() {
  return [
    {
      lable: 'Username',
      state: 'username',
      placeHolder: 'username',
      validator: useUsernameValidator,
    },
    {
      lable: 'Email',
      placeHolder: 'email',
      state: 'email',
      validator: useEmailValidator,
    },
    {
      lable: 'Password',
      placeHolder: 'password',
      state: 'password',
      validator: usePasswordValidator,
      isPassword: true,
    },
    {
      lable: 'Confirm Password',
      placeHolder: 'Repeate Password',
      state: 'cpassword',
      validator: useConfirmPasswordValidator,
      isPassword: true,
    },
  ];
}
export default useConfigSignup;
