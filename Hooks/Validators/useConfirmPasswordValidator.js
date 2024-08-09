function useConfirmPasswordValidator(state, value, oldValue) {
  // //console.log(value,oldValue);
  if (value !== oldValue) return `Confirm password and password must match`;
  else if (value === '') return `Confirm password must not be empty`;
  else return '';
}
export default useConfirmPasswordValidator;
9