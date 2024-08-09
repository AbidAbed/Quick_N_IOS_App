import useAnnouncementBodyValidator from './Validators/useAnnouncementBodyValidator';
import useAnnouncementTitleValidator from './Validators/useAnnouncementTitleValidator';

function useConfigAddAnnouncement() {
  return [
    {
      lable: '',
      state: 'announcementTitle',
      placeHolder: 'Title',
      validator: useAnnouncementTitleValidator,
    },
    {
      lable: '',
      placeHolder: 'Body',
      state: 'announcementBody',
      validator: useAnnouncementBodyValidator,
    },
  ];
}
export default useConfigAddAnnouncement;
