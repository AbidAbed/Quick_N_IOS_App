function useAnnouncementTitleValidator(state, value) {
  if (value.length >= 50) {
    return 'Maximum allowed characters exceeded for announcement title , 50';
  } else if (value.length <= 10) {
    return 'Minimum allowed characters for announcement title are 10';
  }
  return '';
}
export default useAnnouncementTitleValidator;
