import DocumentFilesModal from '../Components/DocumentFilesModal';

function useConfigFile(
  fileObj,
  getBinaryFile,
  binaryFile,
  isOpened,
  setIsOpened,
  isHidden,
  senderId,
) {
  switch (fileObj.type) {
    case 'png':
      return (
        <DocumentFilesModal
          isModalVisible={isOpened}
          fileObj={fileObj}
          isNextAndPrevAvailable={false}
          setIsOpened={setIsOpened}
          senderId={senderId}
          isHidden={isHidden}
        />
      );
    case 'wav':
      return (
        <DocumentFilesModal
          isModalVisible={isOpened}
          fileObj={fileObj}
          isNextAndPrevAvailable={false}
          setIsOpened={setIsOpened}
          isAudio={true}
          senderId={senderId}
          isHidden={isHidden}
        />
      );
    case 'mp4':
      return (
        <DocumentFilesModal
          isModalVisible={isOpened}
          fileObj={fileObj}
          isNextAndPrevAvailable={false}
          isVideo={true}
          setIsOpened={setIsOpened}
          senderId={senderId}
          isHidden={isHidden}
        />
      );
    case 'jpg':
      return (
        <DocumentFilesModal
          isModalVisible={isOpened}
          fileObj={fileObj}
          isNextAndPrevAvailable={false}
          setIsOpened={setIsOpened}
          senderId={senderId}
          isHidden={isHidden}
        />
      );
    case 'jpeg':
      return (
        <DocumentFilesModal
          isModalVisible={isOpened}
          fileObj={fileObj}
          isNextAndPrevAvailable={false}
          setIsOpened={setIsOpened}
          senderId={senderId}
          isHidden={isHidden}
        />
      );
    default:
      //console.log(55555);
      return (
        <DocumentFilesModal
          isModalVisible={isOpened}
          fileObj={fileObj}
          setIsOpened={setIsOpened}
          isNextAndPrevAvailable={true}
          senderId={senderId}
          isHidden={isHidden}
        />
      );
  }
}
export default useConfigFile;
