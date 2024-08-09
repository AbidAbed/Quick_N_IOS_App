import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
const announcementsAPI = createApi({
  reducerPath: 'announcementsAPI',
  baseQuery: fetchBaseQuery({baseUrl: 'https://novel-era.co/quickn/api/v1'}),
  endpoints: builder => ({
    getAnnouncements: builder.query({
      query: requestData => {
        return {
          method: 'GET',
          url: `/announcement`,
          headers: requestData.isAdmin
            ? {admin_header: `admin ${requestData.token}`}
            : {token_header: `Bearer ${requestData.token}`},
        };
      },
    }),
    putAnnouncementSing: builder.mutation({
      query: requestData => {
        return {
          method: 'PUT',
          url: `/announcement/userChecked/${requestData.userId}/${requestData.announcementId}`,
          headers: requestData.isAdmin
            ? {admin_header: `admin ${requestData.token}`}
            : {token_header: `Bearer ${requestData.token}`},
        };
      },
    }),
    postAddAnnouncement: builder.mutation({
      query: requestData => {
        return {
          method: 'POST',
          url: '/announcement/addAnnouncement',
          headers: requestData.isAdmin
            ? {admin_header: `admin ${requestData.token}`}
            : {token_header: `Bearer ${requestData.token}`},
          body: {
            announcementTitle: requestData.announcementTitle,
            announcementText: requestData.announcementText,
          },
        };
      },
    }),
    postGeneratePdf: builder.mutation({
      query: requestData => {
        return {
          method: 'POST',
          url: `/announcement/generate-pdf`,
          body: {...requestData.pdfData},
          headers: requestData.isAdmin
            ? {admin_header: `admin ${requestData.token}`}
            : {token_header: `Bearer ${requestData.token}`},
        };
      },
    }),
  }),
});

const {
  useGetAnnouncementsQuery,
  usePutAnnouncementSingMutation,
  usePostAddAnnouncementMutation,
  usePostGeneratePdfMutation,
} = announcementsAPI;
export {
  announcementsAPI,
  usePutAnnouncementSingMutation,
  useGetAnnouncementsQuery,
  usePostAddAnnouncementMutation,
  usePostGeneratePdfMutation,
};
