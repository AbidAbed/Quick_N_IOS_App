function useUsernameValidator(state, value) {
  if (value.length === 0) return `${state} should not be empty`;
  else if (value.includes(' '))
    return `${state} should not include whitespaces`;
  else if (value.length < 5)
    return `${state} should contain at least 5 characters`;
  else return '';
}
export default useUsernameValidator;
