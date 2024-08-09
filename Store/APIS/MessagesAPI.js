import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
const messagesAPI = createApi({
  reducerPath: 'messagesAPI',
  baseQuery: fetchBaseQuery({baseUrl: 'https://novel-era.co/quickn/api/v1'}),
  endpoints: builder => ({
    //GET user group
    getConversationMessages: builder.mutation({
      query: userData => {
        return {
          method: 'GET',
          url: `/message/${userData.conversationId}`,
          params: {...userData.messageQuery},
          headers: userData.isAdmin
            ? {admin_header: `admin ${userData.token}`}
            : {token_header: `Bearer ${userData.token}`},
        };
      },
    }),
    postMessage: builder.mutation({
      query: messageData => {
        return {
          method: 'POST',
          url: '/message',
          headers: messageData.isAdmin
            ? {admin_header: `admin ${messageData.token}`}
            : {token_header: `Bearer ${messageData.token}`},
          body: {
            sender: messageData.sender,
            text: messageData.text,
            conversationId: messageData.conversationId,
            file: messageData.file,
            hiddenFor: messageData.hiddenFor,
          },
        };
      },
    }),
    getFileBinary: builder.mutation({
      query: fileMessageData => {
        return {
          method: 'GET',
          url: '/message/file/binary',
          params: {fileId: fileMessageData.fileId, page: fileMessageData.page},
          headers: fileMessageData.isAdmin
            ? {admin_header: `admin ${fileMessageData.token}`}
            : {token_header: `Bearer ${fileMessageData.token}`},
        };
      },
    }),
    getFileObject: builder.query({
      query: fileMessageData => {
        return {
          method: 'GET',
          url: `/message/getFile/${fileMessageData.fileId}`,
          headers: fileMessageData.isAdmin
            ? {admin_header: `admin ${fileMessageData.token}`}
            : {token_header: `Bearer ${fileMessageData.token}`},
        };
      },
    }),
    deleteMessage: builder.mutation({
      query: requestObject => {
        return {
          method: 'DELETE',
          url: `/message/${requestObject.conversationId}/${requestObject.msgId}`,
          headers: requestObject.isAdmin
            ? {admin_header: `admin ${requestObject.token}`}
            : {token_header: `Bearer ${requestObject.token}`},
        };
      },
    }),
    putMessage: builder.mutation({
      query: requestObject => {
        return {
          method: 'PUT',
          url: `/message/${requestObject.conversationId}/${requestObject.msgId}`,
          headers: requestObject.isAdmin
            ? {admin_header: `admin ${requestObject.token}`}
            : {token_header: `Bearer ${requestObject.token}`},
          body: {newText: requestObject.newText},
        };
      },
    }),
    postForwardMessage: builder.mutation({
      query: requestObject => {
        return {
          method: 'POST',
          url: `/message/forwardMsg/${requestObject.msgId}`,
          headers: requestObject.isAdmin
            ? {admin_header: `admin ${requestObject.token}`}
            : {token_header: `Bearer ${requestObject.token}`},
          body: {
            forwardedConversationsArr: [
              ...requestObject.forwardedConversationsArr,
            ],
            usersForwardedArr: [...requestObject.usersForwardedArr],
          },
        };
      },
    }),
    patchFavouriteMessage: builder.mutation({
      query: requestObject => {
        return {
          method: 'PATCH',
          url: `/message/favortite-msg/${requestObject.msgId}`,
          headers: requestObject.isAdmin
            ? {admin_header: `admin ${requestObject.token}`}
            : {token_header: `Bearer ${requestObject.token}`},
        };
      },
    }),
    patchRemoveFavouriteMessage: builder.mutation({
      query: requestObject => {
        return {
          method: 'PATCH',
          url: `/message/remove-favorite-msg/${requestObject.msgId}`,
          headers: requestObject.isAdmin
            ? {admin_header: `admin ${requestObject.token}`}
            : {token_header: `Bearer ${requestObject.token}`},
        };
      },
    }),
    putHideMessage: builder.mutation({
      query: requestObject => {
        return {
          method: 'PUT',
          url: `/message/hidePrevMsg/${requestObject.msgId}`,
          headers: requestObject.isAdmin
            ? {admin_header: `admin ${requestObject.token}`}
            : {token_header: `Bearer ${requestObject.token}`},
          body: {hiddenArr: [...requestObject.hiddenArr]},
        };
      },
    }),
    putHideMessageFromAll: builder.mutation({
      query: requestObject => {
        return {
          method: 'PUT',
          url: `/message/archiveMsg/${requestObject.msgId}`,
          headers: requestObject.isAdmin
            ? {admin_header: `admin ${requestObject.token}`}
            : {token_header: `Bearer ${requestObject.token}`},
          body: {usersInGroup: [...requestObject.usersInGroup]},
        };
      },
    }),
    putUnHideMessageFromAll: builder.mutation({
      query: requestObject => {
        return {
          method: 'PUT',
          url: `/message/resetArchivedMsg/${requestObject.msgId}`,
          headers: requestObject.isAdmin
            ? {admin_header: `admin ${requestObject.token}`}
            : {token_header: `Bearer ${requestObject.token}`},
        };
      },
    }),
  }),
});

const {
  useGetConversationMessagesMutation,
  usePostMessageMutation,
  useGetFileBinaryMutation,
  useGetFileObjectQuery,
  useDeleteMessageMutation,
  usePutMessageMutation,
  usePostForwardMessageMutation,
  usePatchFavouriteMessageMutation,
  usePatchRemoveFavouriteMessageMutation,
  usePutHideMessageMutation,
  usePutHideMessageFromAllMutation,
  usePutUnHideMessageFromAllMutation,
} = messagesAPI;
export {
  messagesAPI,
  useGetConversationMessagesMutation,
  usePostMessageMutation,
  useGetFileBinaryMutation,
  useGetFileObjectQuery,
  useDeleteMessageMutation,
  usePutMessageMutation,
  usePostForwardMessageMutation,
  usePatchRemoveFavouriteMessageMutation,
  usePatchFavouriteMessageMutation,
  usePutHideMessageMutation,
  usePutHideMessageFromAllMutation,
  usePutUnHideMessageFromAllMutation,
};
