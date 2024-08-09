import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
const conversationsAPI = createApi({
  reducerPath: 'conversationsAPI',
  baseQuery: fetchBaseQuery({baseUrl: 'https://novel-era.co/quickn/api/v1'}),
  endpoints: builder => ({
    getUserConversations: builder.query({
      query: userData => {
        return {
          method: 'GET',
          url: `/conversation/${userData.userId}`,
          headers: userData.isAdmin
            ? {admin_header: `admin ${userData.token}`}
            : {token_header: `Bearer ${userData.token}`},
        };
      },
    }),
    createConversation: builder.mutation({
      query: requestData => {
        return {
          method: 'POST',
          url: '/conversation',
          headers: requestData.isAdmin
            ? {admin_header: `admin ${requestData.token}`}
            : {token_header: `Bearer ${requestData.token}`},
          body: {
            senderId: requestData.senderId,
            receiverId: requestData.receiverId,
          },
        };
      },
    }),
    getConversationById: builder.mutation({
      query: requestData => {
        return {
          method: 'GET',
          url: `/conversation/getConversation/${requestData.convId}`,
          headers: requestData.isAdmin
            ? {admin_header: `admin ${requestData.token}`}
            : {token_header: `Bearer ${requestData.token}`},
        };
      },
    }),
  }),
});

const {
  useGetUserConversationsQuery,
  useCreateConversationMutation,
  useGetConversationByIdMutation,
} = conversationsAPI;
export {
  useGetConversationByIdMutation,
  conversationsAPI,
  useGetUserConversationsQuery,
  useCreateConversationMutation,
};
