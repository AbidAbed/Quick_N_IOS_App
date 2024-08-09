import {createSlice} from '@reduxjs/toolkit';

const configSlice = createSlice({
  name: 'config',
  initialState: {
    isLoggedIn: false,
    selectedConversationId: null,
    searchedMessageId: null,
    lastAnnouncementUpdateTime: null,
    path: 'Conversations',
  },
  reducers: {
    changeIsLoggedIn(state, action) {
      return {...state, isLoggedIn: action.payload};
    },
    changeSelectedConversationId(state, action) {
      return {...state, selectedConversationId: action.payload};
    },
    changeSearchedMessageId(state, action) {
      return {...state, searchedMessageId: action.payload};
    },
    changeLastAnnouncementUpdateTime(state, action) {
      return {...state, lastAnnouncementUpdateTime: action.payload};
    },
    changePath(state, action) {
      return {...state, path: action.payload};
    },
  },
});

const {
  changeIsLoggedIn,
  changeSelectedConversationId,
  changeSearchedMessageId,
  changeLastAnnouncementUpdateTime,
  changePath,
} = configSlice.actions;
export {
  changeIsLoggedIn,
  changeSelectedConversationId,
  changeSearchedMessageId,
  configSlice,
  changeLastAnnouncementUpdateTime,
  changePath,
};
