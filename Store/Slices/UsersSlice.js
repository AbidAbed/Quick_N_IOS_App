import {createSlice} from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: [],
  reducers: {
    fetchUsersData(state, action) {
      return [...action.payload];
    },
    updateOnlineUserStatus(state, action) {
      const otherUsers = state.filter(usr => usr._id !== action.payload.userId);

      let [updatedUser] = state.filter(
        usr => usr._id === action.payload.userId,
      );

      // //console.log(8888,updatedUser);

      if (action.payload.isOnline)
        return [{...updatedUser, isOnline: true}, ...otherUsers];
      else return [...otherUsers, {...updatedUser, isOnline: false}];
    },
  },
});

const {fetchUsersData, updateOnlineUserStatus} = usersSlice.actions;
export {usersSlice, fetchUsersData, updateOnlineUserStatus};
