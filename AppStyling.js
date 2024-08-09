import {StyleSheet} from 'react-native';

const style = StyleSheet.create({
  labelForm: {
    color: 'white',
    fontSize: 11,
    paddingTop: '3%',
    paddingLeft: '3%',
    // borderWidth: 2,
    // borderRadius: 1,
  },
  inputForm: {
    borderWidth: 2,
    borderRadius: 7,
    color: 'black',
    padding: 10,
    fontSize: 12,
    height: 35,
    // marginBottom: 20,
    borderWidth: 0,
    borderColor: 'black',
    backgroundColor: 'white',
    // marginLeft: 5,
    // marginRight: 5,
    // placeholderTextColor: 'gray',
  },
  submitFormButton: {
    backgroundColor: '#0e6e82',
    padding: '1%',
    borderRadius: 7,
    justifyContent: 'center',
  },
  editGroupNameButton: {
    backgroundColor: '#0e6e82',
    fontSize: 5,
    marginBottom: 20,
    marginRight: 5,
    padding: 4,
  },
  changeGroupImgButton: {
    backgroundColor: '#0e6e82',
    maxWidth: 200,
    padding: 5,
    borderRadius: 7,
  },
  cancelSearchButton: {
    backgroundColor: '#0e6e82',
    paddingLeft: 35,
    paddingRight: 35,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 7,
    marginBottom: 20,
  },
  createGroupButton: {
    backgroundColor: '#0e6e82',
    paddingLeft: 35,
    paddingRight: 35,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 7,
    width: '45%',
  },
  addMemberButton: {
    backgroundColor: '#0e6e82',
    marginLeft: 100,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  addAnnouncemetButton: {
    backgroundColor: '#0e6e82',
    marginBottom: 15,
    padding: 4,
    maxWidth: 170,
  },
  announcementRepButton: {
    backgroundColor: '#0e6e82',
    padding: 4,
    marginBottom: 5,
    maxWidth: 170,
  },
  enterChatBtn: {
    backgroundColor: 'white',
    marginRight: 240,
    marginBottom: 5,
  },
  submitFormButtonText: {
    color: 'white',
    textAlign: 'center',
    padding: '1%',
  },
  conversationNameText: {
    color: 'black',
    marginLeft: 5,
    marginBottom: 5,
  },
  announcemetNameText: {
    color: 'black',
    fontSize: 15,
    marginBottom: 7,
    padding: 2,
    marginTop: 3,
  },
  announcemetBodyText: {
    color: 'black',
    fontSize: 12,
    marginBottom: 7,
    padding: 2,
  },
  backgroundVideo: {
    position: 'absolute',
    top: '5%',
    bottom: '3%',
    left: '3%',
    right: '3%',
    borderRadius: 7,
    zIndex: 90, // Ensure the video is rendered above other elements
  },
  logoImgStyle: {
    width: '100%', // Ensure the image takes up the full width // Set the height of the image
    // Ensure the image fits within the specified dimensions without cropping
    alignItems: 'center',
    justifyContent: 'center',
    objectFit: 'contain',
    resizeMode: 'contain',
  },
  logoImgStyleForm: {
    width: '50%', // Ensure the image takes up the full width
    height: 80, // Set the height of the image
    resizeMode: 'contain', // Ensure the image fits within the specified dimensions without cropping
    marginBottom: 15, // Adjust margin if needed
    marginTop: 15,
  },
});

export default style;
