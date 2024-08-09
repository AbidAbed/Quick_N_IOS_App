import {createSlice} from '@reduxjs/toolkit';

const groupSlice = createSlice({
  name: 'group',
  initialState: [],
  reducers: {

    addGroup(state, action) {
      const foundGroup = state.find(group => group._id === action.payload._id);

      if (foundGroup) return state;
      else return [...state, {...action.payload}];
    },

    updateGroup(state, action) {
      const [foundGroup] = state.filter(
        group => group._id === action.payload._id,
      );
      const otherGroups = state.filter(group => group !== action.payload._id);

      if (foundGroup) return [{...action.payload}, ...otherGroups];
      else return state;
    },

    updateGroupMembersByConversationId(state, action) {
      const [foundGroup] = state.filter(
        group => group.conversationId === action.payload._id,
      );
      const otherGroups = state.filter(
        group => group.conversationId !== action.payload._id,
      );

      if (foundGroup)
        return [
          {...foundGroup, groupMembers: [...action.payload.members]},
          ...otherGroups,
        ];
      else return state;
    },

    deleteGroupByConversationId(state, action) {
      const newUserGroups = state.filter(
        group => group.conversationId !== action.payload._id,
      );

      return [...newUserGroups];
    },

  },
});


const {
  addGroup,
  updateGroup,
  updateGroupMembersByConversationId,
  deleteGroupByConversationId,
} = groupSlice.actions;

export {
  groupSlice,
  addGroup,
  updateGroup,
  updateGroupMembersByConversationId,
  deleteGroupByConversationId,
};
