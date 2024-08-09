import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'User',
  initialState: {},
  reducers: {
    fetchUserData(state, action) {
      return {...action.payload};
    },
    updateUserData(state, action) {
      return {...state, ...action.payload};
    },
  },
});

const {fetchUserData, updateUserData} = userSlice.actions;
export {userSlice, fetchUserData, updateUserData};
