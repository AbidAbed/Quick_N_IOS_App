import ReactNativeBlobUtil from 'react-native-blob-util';

async function createFileObject({token, isAdmin, fileName}) {
  try {
    const response = await ReactNativeBlobUtil.fetch(
      'POST',
      'https://novel-era.co/quickn/api/v1/message/createFileObj',
      {
        'Content-Type': 'application/json',
        token_header: `Bearer ${token}`,
      },
      JSON.stringify({filename: fileName}),
    );

    return response;
  } catch (err) {
    console.log(err);
  }
}
export default createFileObject;
