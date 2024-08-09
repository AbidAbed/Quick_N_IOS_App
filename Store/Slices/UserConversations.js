import {createSlice} from '@reduxjs/toolkit';

const userConversations = createSlice({
  name: 'userConversations',
  initialState: [],
  reducers: {
    fetchUserConversations(state, action) {
      return [...action.payload];
    },
    addUserConversation(state, action) {
      const [dublicatedConversations] = state.filter(
        conversation => conversation._id === action.payload._id,
      );
      if (dublicatedConversations) return state;
      else {
        return [{...action.payload}, ...state];
      }
    },
    updateConversationMembers(state, action) {
      const [foundConversation] = state.filter(
        conversation => conversation._id === action.payload._id,
      );
      const otherConversations = state.filter(
        conversation => conversation._id !== action.payload._id,
      );
      if (foundConversation)
        return [
          {...foundConversation, members: [...action.payload.members]},
          ...otherConversations,
        ];
      else return state;
    },
    deleteConversation(state, action) {
      const newUserConversations = state.filter(
        conversation => conversation._id !== action.payload._id,
      );

      return [...newUserConversations];
    },
    updateConversation(state, action) {
      const [foundConversation] = state.filter(
        conversation => conversation._id === action.payload._id,
      );
      const otherConversations = state.filter(
        conversation => conversation._id !== action.payload._id,
      );
      if (foundConversation)
        return [
          {...foundConversation, ...action.payload},
          ...otherConversations,
        ];
      else return state;
    },
    updateLeatestMessage(state, action) {
      const [foundConversation] = state.filter(
        conversation => conversation._id === action.payload.convId,
      );

      const otherConversations = state.filter(
        conversation => conversation._id !== action.payload.convId,
      );

      if (foundConversation)
        return [
          {
            ...foundConversation,
            latestMessage: {...action.payload.latestMessage},
          },
          ...otherConversations,
        ];
      else return state;
    },
    updateConversationNotificationById(state, action) {
      const [foundConversation] = state.filter(
        conversation => conversation._id === action.payload.convId,
      );

      const otherConversations = state.filter(
        conversation => conversation._id !== action.payload.convId,
      );

      // console.log(111,action.payload);
      if (foundConversation)
        return [
          {
            ...foundConversation,
            isUnread: action.payload.isUnread,
          },
          ...otherConversations,
        ];
      else return state;
    },
  },
});

const {
  fetchUserConversations,
  addUserConversation,
  updateConversationMembers,
  deleteConversation,
  updateConversation,
  updateLeatestMessage,
  updateConversationNotificationById,
} = userConversations.actions;
export {
  userConversations,
  fetchUserConversations,
  addUserConversation,
  updateConversationMembers,
  deleteConversation,
  updateConversation,
  updateLeatestMessage,
  updateConversationNotificationById,
};
