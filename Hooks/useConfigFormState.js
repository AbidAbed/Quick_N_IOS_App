function useConfigFormState(config) {
  const states = config.reduce((prev, curr) => {
    return {...prev, [curr.state]: ''};
  }, {});
  return states;
}
export default useConfigFormState;
