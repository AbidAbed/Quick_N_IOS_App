function usePasswordValidator(state, value) {
  if (value.length === 0) return `${state} should not be empty`;
  else if (value.length < 8)
    return `${state} should include at least 8 characters`;
  else return '';
}
export default usePasswordValidator;
