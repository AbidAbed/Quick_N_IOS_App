function useEmailValidator(state, value) {
  if(value.length === 0) return `${state} should not be empty`;
  else if (value.includes(' ')) return `${state} must not include whitespaces`;
  else if (!value.includes('@') || !value.includes('.'))
    return `${state} must be a valid email address`;
  else return '';
}
export default useEmailValidator;
