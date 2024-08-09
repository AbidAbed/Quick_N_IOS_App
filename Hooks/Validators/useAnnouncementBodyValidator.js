function useAnnouncementBodyValidator(state, value) {
  if (value.length >= 280) {
    return 'Maximum allowed characters exceeded for announcement body , 280';
  } else if (value.length <= 10) {
    return 'Minimum allowed characters  for announcement body are 10';
  } else if (!value) return 'Announcement body is not allowed to be empty';
  return '';
}
export default useAnnouncementBodyValidator;
