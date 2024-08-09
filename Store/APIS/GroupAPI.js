import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
const groupAPI = createApi({
  reducerPath: 'groupAPI',
  baseQuery: fetchBaseQuery({baseUrl: 'https://novel-era.co/quickn/api/v1'}),
  endpoints: builder => ({
    //GET user group
    getGroupByConversationId: builder.mutation({
      query: userData => {
        return {
          method: 'GET',
          url: `/group/getGroup/${userData.conversationId}`,
          headers: userData.isAdmin
            ? {admin_header: `admin ${userData.token}`}
            : {token_header: `Bearer ${userData.token}`},
        };
      },
    }),
    postCreateGroup: builder.mutation({
      query: requestData => {
        return {
          method: 'POST',
          url: `/group/createGroup/${requestData.creatorId}`,
          headers: requestData.isAdmin
            ? {admin_header: `admin ${requestData.token}`}
            : {token_header: `Bearer ${requestData.token}`},
          body: {
            addedGroupMembers: requestData.addedGroupMembers,
            groupName: requestData.groupName,
            fileId: requestData.fileId,
          },
        };
      },
    }),
    putUpdateGroup: builder.mutation({
      query: requestData => {
        return {
          method: 'PUT',
          url: `group/updateGroup/${requestData.conversationId}`,
          headers: requestData.userData.isAdmin
            ? {admin_header: `admin ${requestData.userData.token}`}
            : {token_header: `Bearer ${requestData.userData.token}`},
          body: {...requestData.groupData},
        };
      },
    }),
    deleteMemberFromGroup: builder.mutation({
      query: requestData => {
        return {
          method: 'DELETE',
          body: {
            conversationId: requestData.conversationId,
            userId: requestData.userId,
          },
          url: '/group/user',
          headers: requestData.isAdmin
            ? {admin_header: `admin ${requestData.token}`}
            : {token_header: `Bearer ${requestData.token}`},
        };
      },
    }),
  }),
});

const {
  useGetGroupByConversationIdMutation,
  usePostCreateGroupMutation,
  usePutUpdateGroupMutation,
  useDeleteMemberFromGroupMutation,
} = groupAPI;
export {
  groupAPI,
  useGetGroupByConversationIdMutation,
  usePostCreateGroupMutation,
  usePutUpdateGroupMutation,
  useDeleteMemberFromGroupMutation,
};
