import {createSlice} from '@reduxjs/toolkit';

const announcementsSlice = createSlice({
  name: 'Announcements',
  initialState: [],
  reducers: {
    fetchAnnouncements(state, action) {
      return [...action.payload];
    },
    updateAnnouncement(state, action) {
      const [foundAnnouncement] = state.filter(
        announcement => announcement._id === action.payload._id,
      );

      const otherAnnouncements = state.filter(
        announcement => announcement._id !== action.payload._id,
      );

      if (foundAnnouncement) return [action.payload, ...otherAnnouncements];
      else return state;
    },
    addAnnouncement(state, action) {
      const [dublicatedAnnouncement] = state.filter(
        announcement => announcement._id === action.payload._id,
      );
      if (dublicatedAnnouncement) return state;
      else {
        return [{...action.payload}, ...state];
      }
    },
  },
});

const {fetchAnnouncements, updateAnnouncement, addAnnouncement} =
  announcementsSlice.actions;
export {
  announcementsSlice,
  fetchAnnouncements,
  updateAnnouncement,
  addAnnouncement,
};
