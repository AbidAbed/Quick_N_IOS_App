import ReactNativeBlobUtil from 'react-native-blob-util';
import {Platform, Share} from 'react-native';

function useHandleDownloadFullReportPdf() {
  var date = new Date();
  const {
    dirs: {DownloadDir, DocumentDir},
  } = ReactNativeBlobUtil.fs;
  const {config} = ReactNativeBlobUtil;
  const isIOS = Platform.OS === 'ios';
  const aPath = Platform.select({ios: DocumentDir, android: DownloadDir});
  const fPath =
    aPath +
    '/' +
    date.toISOString().split('T')[0] +
    '_' +
    date.toISOString().split('T')[1].split('.')[0] +
    '_AllAnnouncementsReport.pdf';

  const configOptions = Platform.select({
    ios: {
      fileCache: true,
      path: fPath,
      notification: true,
    },
    android: {
      fileCache: true,
      path: fPath,
      addAndroidDownloads: {
        notification: true,
        title: `"All Announcements Report" report is downloading`,
        description: 'A pdf file.',
        mime: 'application/pdf',
        mediaScannable: true,
      },
    },
  });

  return async ({pdfData, token}) => {
    try {
      const response = await config(configOptions).fetch(
        'POST',
        'https://novel-era.co/quickn/api/v1/announcement/generate-full-pdf-report',
        {
          token_header: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        JSON.stringify(pdfData),
      );
      // Open the downloaded PDF file using a suitable application
      if (response && response.path) {
        const filePath = response.path();

        if (isIOS) {
          // Share the file with the iOS Share Sheet
          Share.share({
            url: `file://${filePath}`,
            title: 'PDF Report',
            message: 'Check out the PDF report!',
          });
        } else {
          // Only execute this code on Android
          await ReactNativeBlobUtil.android.actionViewIntent(
            filePath,
            'application/pdf',
          );
        }
      } else {
        console.error('Invalid response or file path not found.');
      }
    } catch (error) {
      console.error('Error generating or downloading PDF:', error);
    }
  };
}

export default useHandleDownloadFullReportPdf;
