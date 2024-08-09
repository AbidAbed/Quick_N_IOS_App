import useEmailValidator from './Validators/useEmailValidator';
import usePasswordValidator from './Validators/usePasswordValidator';
import useUsernameValidator from './Validators/useUsernameValidator';

function useConfigProfile({username, email}) {
  return [
    {
      lable: 'Username',
      state: 'username',
      placeHolder: username,
      validator: useUsernameValidator,
    },
    {
      lable: 'Email',
      placeHolder: email,
      state: 'email',
      validator: useEmailValidator,
    },
    {
      lable: 'New Password',
      placeHolder: 'New Password',
      state: 'password',
      validator: usePasswordValidator,
      isPassword: true,
    },
  ];
}
export default useConfigProfile;
