import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
const userAPI = createApi({
  reducerPath: 'userAPI',
  baseQuery: fetchBaseQuery({baseUrl: 'https://novel-era.co/quickn/api/v1'}),
  endpoints: builder => ({
    //POST login on backend
    postLogin: builder.mutation({
      query: loginData => {
        return {
          method: 'POST',
          url: '/auth/signin',
          body: {...loginData},
        };
      },
    }),

    //POST signup on backend
    postSignup: builder.mutation({
      query: signupData => {
        return {
          method: 'POST',
          url: '/auth/signup',
          body: {...signupData},
        };
      },
    }),

    //Get user

    getUser: builder.mutation({
      query: userData => {
        return {
          method: 'GET',
          url: `auth/getUser/${userData.userId}`,
          headers: userData.isAdmin
            ? {admin_header: `admin ${userData.token}`}
            : {token_header: `Bearer ${userData.token}`},
        };
      },
    }),

    getUsers: builder.query({
      query: userData => {
        return {
          method: 'GET',
          url: '/auth/getAllUsers',
          headers: userData.isAdmin
            ? {admin_header: `admin ${userData.token}`}
            : {token_header: `Bearer ${userData.token}`},
        };
      },
    }),

    putUpdateUser: builder.mutation({
      query: requestData => {
        return {
          method: 'POST',
          headers: requestData.isAdmin
            ? {admin_header: `admin ${requestData.token}`}
            : {token_header: `Bearer ${requestData.token}`},
          body: {...requestData.userData},
          url: `/auth/updateUserProfile/${requestData.userId}`,
        };
      },
    }),

    getUserByToken: builder.mutation({
      query: requestData => {
        return {
          url: '/auth/users/singleUser/bytoken',
          method: 'GET',
          headers: requestData.isAdmin
            ? {admin_header: `admin ${requestData.token}`}
            : {token_header: `Bearer ${requestData.token}`},
        };
      },
    }),
  }),
});

const {
  usePostLoginMutation,
  usePostSignupMutation,
  useGetUsersQuery,
  usePutUpdateUserMutation,
  useGetUserByTokenMutation,
} = userAPI;
export {
  userAPI,
  usePostLoginMutation,
  usePostSignupMutation,
  usePutUpdateUserMutation,
  useGetUserByTokenMutation,
  useGetUsersQuery,
};
