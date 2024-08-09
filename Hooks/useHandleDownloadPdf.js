import ReactNativeBlobUtil from 'react-native-blob-util';
import { Platform, Share } from 'react-native';

const useHandleDownloadPdf = () => {
  return async ({ pdfData, token }) => {
    try {
      const downloadDir = ReactNativeBlobUtil.fs.dirs.DownloadDir;
      const response = await ReactNativeBlobUtil.config({
        path: `${downloadDir}/${pdfData.announcementTitle}.pdf`.replace(" ","-"),
        addAndroidDownloads: {
          notification: true,
          title: `${pdfData.announcementTitle}`,
          description: 'A pdf file.',
          mime: 'application/pdf',
          mediaScannable: true,
        },
      }).fetch(
        'POST',
        'https://novel-era.co/quickn/api/v1/announcement/generate-pdf',
        {
          token_header: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        JSON.stringify(pdfData),
      );

      // Open the downloaded PDF file using a suitable application
      if (response && response.path) {
        const filePath = response.path();

        if (Platform.OS === 'ios') {
          // Share the file with the iOS Share Sheet
          Share.share({
            url: `file://${filePath}`,
            title: `${pdfData.announcementTitle} Report`,
            message: 'Check out the PDF report!',
          });
        } else if (Platform.OS === 'android') {
          // Only execute this code on Android
          await ReactNativeBlobUtil.android.actionViewIntent(filePath, 'application/pdf');
        }
      } else {
        console.error('Invalid response or file path not found.');
      }
    } catch (error) {
      console.error('Error generating or downloading PDF:', error);
    }
  };
};

export default useHandleDownloadPdf;