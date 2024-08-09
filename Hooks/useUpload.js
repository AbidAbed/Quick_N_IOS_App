import ReactNativeBlobUtil from 'react-native-blob-util';

function useUpload({isAvatar}) {
  async function uploadFile({
    pathToFileToUpload,
    token,
    isAdmin,
    fileName,
    fileId,
    mimeType,
  }) {
    const tokenObject = isAdmin
      ? {admin_header: `admin ${token}`}
      : {token_header: `Bearer ${token}`};
    try {
      // UPLOAD THE FILE
      // console.log({
      //   pathToFileToUpload,
      //   token,
      //   isAdmin,
      //   fileName,
      //   fileId,
      //   mimeType,
      // });

      // console.log(mimeType);
      const response = await ReactNativeBlobUtil.fetch(
        'POST',
        `https://novel-era.co/quickn/api/v1/message/upload${
          isAvatar ? '/profilePic' : ''
        }`,
        {
          'Content-Type': 'multipart/form-data',
          ...tokenObject,
        },
        [
          {
            name: 'fileId',
            data: fileId,
          },
          {
            name: 'file',
            filename: fileName,
            data: ReactNativeBlobUtil.wrap(pathToFileToUpload),
            type: mimeType,
          },
        ],
      );

      // console.log(response, mimeType);
      return response;
    } catch (err) {
      console.log(err);
    }
  }

  async function createFileObject({token, isAdmin, fileName}) {
    try {
      const tokenObject = isAdmin
        ? {admin_header: `admin ${token}`}
        : {token_header: `Bearer ${token}`};

      const response = await ReactNativeBlobUtil.fetch(
        'POST',
        'https://novel-era.co/quickn/api/v1/message/createFileObj',
        {
          'Content-Type': 'application/json',
          ...tokenObject,
        },
        JSON.stringify({filename: fileName}),
      );

      return response;
    } catch (err) {
      console.log(err);
    }
  }

  return [createFileObject, uploadFile];
}

export default useUpload;
