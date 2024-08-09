import {Keyboard, Modal, Text, TouchableOpacity, View} from 'react-native';
import {
  FlatList,
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import style from '../AppStyling';
import Button from '../Components/Button';
import {useEffect, useState} from 'react';
import Form from '../Components/Form';
import useConfigAddAnnouncement from '../Hooks/useConfigAddAnnouncement';
import {
  changeLastAnnouncementUpdateTime,
  usePostAddAnnouncementMutation,
  usePostGeneratePdfMutation,
} from '../Store/StoreInterface';
import {addAnnouncement} from '../Store/Slices/AnnouncementsSlice';
import socket from '../utils/SocketConfig';
import ModalList from '../Components/ModalList';
import useConfigAnnouncementReport from '../Hooks/useConfigAnnouncementReport';
import useSortItems from '../Hooks/useSortItems';
import useHandleDownloadPdf from '../Hooks/useHandleDownloadPdf';
import useHandleDownloadFullReportPdf from '../Hooks/useHandleDownloadFullReportPdf';
import Input from '../Components/Input';
import SendIcon from 'react-native-vector-icons/Ionicons';
import ContinueIcon from 'react-native-vector-icons/AntDesign';

function Announcements() {
  ///////////////////// CONFIGS //////////////////////////////////
  const dispatch = useDispatch();

  /////////////////////// USESELECTERS ///////////////////////////
  const user = useSelector(state => state.user);
  const announcements = useSelector(state => state.announcements);
  const users = useSelector(state => state.users);

  ///////////////////////////// STATES //////////////////////////////
  const [announcementReport, setAnnouncementReport] = useState(null);
  const [addAnnouncementIsPressed, setAddAnnouncemetIsPressed] =
    useState(false);
  const [addAnnouncementResponseError, setAddAnnouncementResponseError] =
    useState('');
  const [addAnnouncementTitle, setAddAnnouncementTitle] = useState('');
  const [addAnnouncementSubject, setAddAnnouncementSubject] = useState('');
  const [addAnnouncementValidationError, setAddAnnouncementValidationError] =
    useState('');

  const [isFocused, setIsFocused] = useState(false);

  ////////////////////////// APIS ///////////////////////////////////
  const [postAddAnnouncement, postAddAnnouncementResponse] =
    usePostAddAnnouncementMutation();
  // const [postGeneratePdf, postGeneratePdfResponse] =
  //   usePostGeneratePdfMutation();

  const postDownloadFullReport = useHandleDownloadFullReportPdf();
  const postDownloadPdf = useHandleDownloadPdf();

  //////////////////////// USEEFFECTS ////////////////////////////////

  // useEffect(() => {
  //   if (
  //     !postGeneratePdfResponse.isUninitialized &&
  //     !postGeneratePdfResponse.isLoading
  //   ) {
  //     if (postGeneratePdfResponse.isError) {
  //       //console.log('IS ERROR');
  //     } else {
  //     }
  //   }
  // }, [postGeneratePdfResponse]);

  useEffect(() => {
    if (
      !postAddAnnouncementResponse.isLoading &&
      !postAddAnnouncementResponse.isUninitialized
    ) {
      if (postAddAnnouncementResponse.isError) {
        setAddAnnouncementResponseError('Error occurred');
      } else {
        dispatch(addAnnouncement({...postAddAnnouncementResponse.data}));
        socket.emit('broadcastAnnouncement');
        setAddAnnouncemetIsPressed(false);
        dispatch(changeLastAnnouncementUpdateTime(Date.now()));
        setAddAnnouncementResponseError('SUCCESS');
        setAddAnnouncementSubject('');
        setAddAnnouncementTitle('');
      }
    }
  }, [postAddAnnouncementResponse]);

  useEffect(() => {
    if (announcementReport !== null) {
      const [updatedAnnouncement] = announcements.filter(announcement => {
        // //console.log(announcement._id, announcementReport._id);
        // //console.log(125487, announcement);
        return announcement._id === announcementReport._id;
      });
      // //console.log(
      //   updatedAnnouncement.checkedUsers,
      //   announcementReport.checkedUsers,
      // );
      if (updatedAnnouncement) {
        setAnnouncementReport({
          ...announcementReport,
          checkedUsers: [...updatedAnnouncement.checkedUsers],
        });
      }
    }
  }, [announcements]);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsFocused(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []); // Empty dependency array to ensure this effect runs only once
  ////////////////////// HOOKS  //////////////////////
  function handleGetAnnouncementReport(item) {
    setAnnouncementReport(item);
    // //console.log(item._id);
  }

  function handleGetAnnouncementReportPdf(announcement) {
    pdfData = {
      announcementTitle: announcement?.announcementTitle,
      checkedUsers: announcement.checkedUsers.map(checkedUser => ({
        username: checkedUser?.username,
        checkedAt: `${
          new Date(checkedUser.checkedAt).getMonth() + 1
        } / ${new Date(checkedUser.checkedAt).getDate()} / ${new Date(
          checkedUser.checkedAt,
        ).getFullYear()} __ ${
          new Date(checkedUser.checkedAt).getHours() - 12
        } : ${
          new Date(checkedUser.checkedAt).getMinutes() < 10
            ? `0${new Date(checkedUser.checkedAt).getMinutes()}`
            : new Date(checkedUser.checkedAt).getMinutes()
        } ${new Date(checkedUser.checkedAt).getHours() < 12 ? 'am' : 'pm'}`,
      })),
    };

    postDownloadPdf({pdfData: {...pdfData}, token: user.token});
    //console.log(5222);
  }

  function handleGetAnnouncementsReportPdf() {
    const pdfData =
      announcements &&
      announcements.map(announcement => ({
        announcementTitle: announcement?.announcementTitle,

        checkedUsers: announcement?.checkedUsers.map(checkedUser => ({
          username: checkedUser?.username,
          checkedAt: `${
            new Date(checkedUser.checkedAt).getMonth() + 1
          } / ${new Date(checkedUser.checkedAt).getDate()} / ${new Date(
            checkedUser.checkedAt,
          ).getFullYear()} __ ${
            new Date(checkedUser.checkedAt).getHours() - 12
          } : ${
            new Date(checkedUser.checkedAt).getMinutes() < 10
              ? `0${new Date(checkedUser.checkedAt).getMinutes()}`
              : new Date(checkedUser.checkedAt).getMinutes()
          } ${new Date(checkedUser.checkedAt).getHours() < 12 ? 'am' : 'pm'}`,
        })),

        announcement_created_time: `${
          new Date(announcement?.createdAt).getMonth() + 1
        } / ${new Date(announcement?.createdAt).getDate()} / ${new Date(
          announcement?.createdAt,
        ).getFullYear()} __ ${
          new Date(announcement?.createdAt).getHours() - 12
        } : ${
          new Date(announcement?.createdAt).getMinutes() < 10
            ? `0${new Date(announcement?.createdAt).getMinutes()}`
            : new Date(announcement?.createdAt).getMinutes()
        } ${new Date(announcement?.createdAt).getHours() < 12 ? 'am' : 'pm'}`,
      }));
    postDownloadFullReport({token: user.token, pdfData});
  }

  function onAddAnnouncement() {
    postAddAnnouncement({
      isAdmin: user.isAdmin,
      token: user.token,
      announcementTitle: addAnnouncementTitle,
      announcementText: addAnnouncementSubject,
    });
  }
  function handleFocusTextInput() {
    setIsFocused(true);
  }

  function handleBlurTextInput() {
    setIsFocused(false);
    // console.log(111);
  }
  ////////////////////// ADDITIONAL COMPONENTS //////////////////////
  function singleAnnouncementReportModalListHeader(selectedAnnouncement) {
    return (
      <Button
        text={selectedAnnouncement.announcementTitle}
        styleButton={[
          style.submitFormButton,
          {backgroundColor: '#E8E7E7', borderRadius: 10},
        ]}
        styleText={[
          style.submitFormButtonText,
          {color: 'gray', fontWeight: 'bold'},
        ]}
        onPress={() => handleGetAnnouncementReportPdf(announcementReport)}
      />
    );
  }

  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <View
      style={{
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'white',
      }}>
      {/**Add Announcement Button For Admins Only */}

      {/**Get Announcements Report PDF Button For Admins Only */}
      {user.isAdmin ? (
        <View
          style={{height: '10%', justifyContent: 'flex-end', padding: '1%'}}>
          <Button
            text="Download All Report"
            styleButton={[style.addAnnouncemetButton, {borderRadius: 7}]}
            styleText={style.submitFormButtonText}
            onPress={handleGetAnnouncementsReportPdf}
          />
        </View>
      ) : (
        <></>
      )}

      {/**Add Announcement Popup */}
      {/* {addAnnouncementIsPressed ? (
        <Modal
          visible={addAnnouncementIsPressed}
          onRequestClose={() => {
            setAddAnnouncemetIsPressed(false);
          }}
          animationType="slide"
          transparent={true}
          style={{height: '100%'}}>
          <GestureHandlerRootView>
            <ScrollView
              style={{
                height: '100%',
                backgroundColor: 'gray',
                width: '100%',
              }}>
              <Button
                text="Close"
                styleButton={style.submitFormButton}
                styleText={style.submitFormButtonText}
                onPress={() => setAddAnnouncemetIsPressed(false)}
              />
              <Form
                onSubmit={onAddAnnouncement}
                responseError={addAnnouncementResponseError}
                config={useConfigAddAnnouncement()}
                onSubmimsubmitButtonText="Add"
                submitButtonStyle={style.submitFormButton}
                submitButtonTextStyle={style.submitFormButtonText}
                isLoading={postAddAnnouncementResponse.isLoading}
              />
            </ScrollView>
          </GestureHandlerRootView>
        </Modal>
      ) : (
        <></>
      )} */}

      {/**Get Announcement Report Modal  */}

      {announcementReport !== null ? (
        <ModalList
          pageName="Announcement info"
          description="Signed by"
          listItems={[
            ...users.reduce((prevUsrs, currUsr) => {
              const isuserSigned = announcementReport.checkedUsers.find(
                signedUsr => signedUsr.userId === currUsr._id,
              );
              // console.log(currUsr);
              if (isuserSigned)
                return [
                  ...prevUsrs,
                  {...currUsr, checkedAt: isuserSigned.checkedAt},
                ];
              else return [...prevUsrs];
            }, []),
          ].sort(useSortItems('username'))}
          configHook={useConfigAnnouncementReport()}
          headerComponent={singleAnnouncementReportModalListHeader(
            announcementReport,
          )}
          setIsModalPressed={() => setAnnouncementReport(null)}
          isModalPressed={announcementReport !== null}
          isLoading={false}
          searchKey="username"
        />
      ) : (
        <></>
      )}

      {announcements && announcements.length !== 0 ? (
        <GestureHandlerRootView>
          <FlatList
            data={announcements ? announcements : []}
            style={{height: user.isAdmin ? (isFocused ? '40%' : '55%') : '80%'}}
            renderItem={({item}) => {
              return user.isAdmin ? (
                <TouchableOpacity
                  style={{hyphenationFactor: 1}}
                  onPress={() => handleGetAnnouncementReport(item)}>
                  <View style={{padding: '2%'}}>
                    <View
                      style={{
                        flexDirection: 'column',
                        borderWidth: 0,
                        backgroundColor: '#e0e0e0',
                        padding: 8,
                        borderRadius: 7,
                        marginBottom: 20,
                        position: 'relative',
                      }}>
                      {/**Button To Get A Specific Announcement Report ADMIN ONLY*/}
                      <View>
                        <Text
                          ellipsizeMode="tail"
                          style={[
                            style.announcemetNameText,
                            {alignSelf: 'center', fontWeight: 'bold'},
                          ]}>
                          {item.announcementTitle}
                        </Text>
                        <Text style={[style.announcemetBodyText]}>
                          {item.announcementText}
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingBottom: '1%',
                          alignSelf: 'flex-end',
                        }}>
                        <Text
                          style={{
                            fontSize: 10,
                            paddingRight: '1%',
                            color: 'gray',
                          }}>
                          {new Date(item.createdAt).toISOString().split('T')[0]}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            alignSelf: 'flex-end',
                            paddingRight: '1%',
                            color: 'gray',
                          }}>
                          {new Date(item.createdAt)
                            .toISOString()
                            .split('T')[1]
                            .split('.')[0]
                            .substring(0, 5)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={{padding: '2%', flexDirection: 'column'}}>
                  <View style={{padding: '2%'}}>
                    <View
                      style={{
                        flexDirection: 'column',
                        borderWidth: 0,
                        backgroundColor: '#e0e0e0',
                        padding: 8,
                        borderRadius: 10,
                        marginBottom: 20,
                        position: 'relative',
                      }}>
                      {/**Button To Get A Specific Announcement Report ADMIN ONLY*/}
                      <View>
                        <Text
                          ellipsizeMode="tail"
                          style={[
                            style.announcemetNameText,
                            {alignSelf: 'center', fontWeight: 'bold'},
                          ]}>
                          {item.announcementTitle}
                        </Text>
                        <Text style={[style.announcemetBodyText]}>
                          {item.announcementText}
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingBottom: '5%',
                          flexDirection: 'column',
                          alignSelf: 'flex-end',
                        }}>
                        <Text
                          style={{
                            fontSize: 10,
                            paddingRight: '1%',
                            color: 'gray',
                          }}>
                          {new Date(item.createdAt).toISOString().split('T')[0]}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            alignSelf: 'flex-end',
                            paddingRight: '1%',
                            color: 'gray',
                          }}>
                          {new Date(item.createdAt)
                            .toISOString()
                            .split('T')[1]
                            .split('.')[0]
                            .substring(0, 5)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
            keyExtractor={item => item._id}
          />
        </GestureHandlerRootView>
      ) : (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: isFocused ? '40%' : '55%',
          }}>
          <Text style={{color: 'gray'}}>No Announcements Yet</Text>
        </View>
      )}

      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          backgroundColor: 'transparent',
          minHeight: '1%',
        }}>
        {user.isAdmin ? (
          <GestureHandlerRootView
            style={{
              flex: 1,
              backgroundColor: 'transparent',
            }}>
            <ScrollView
              contentContainerStyle={{
                // flex: 1,
                backgroundColor: 'transparent',
              }}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps={'always'}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  // width: '100%',
                  justifyContent: 'center',
                  // height: '100%',
                  alignItems: 'center',
                  paddingLeft: '5%',
                  paddingRight: '5%',
                  paddingTop: '2%',
                }}>
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flext-start',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: 'gray',
                    flex: 1,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                      borderRadius: 20,
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 10,
                        padding: '2%',
                        color: 'gray',
                      }}>
                      Title :
                    </Text>
                    <Input
                      onBlur={handleBlurTextInput}
                      onFocus={handleFocusTextInput}
                      value={addAnnouncementTitle}
                      onChange={setAddAnnouncementTitle}
                      placeHolder="Announcement title"
                      style={{
                        fontSize: 10,
                        flex: 1,
                        padding: '1%',
                      }}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      flex: 1,
                      borderRadius: 20,
                    }}>
                    <Input
                      onBlur={handleBlurTextInput}
                      onFocus={handleFocusTextInput}
                      value={addAnnouncementSubject}
                      onChange={setAddAnnouncementSubject}
                      placeHolder="Write your Announcement here ..."
                      style={{fontSize: 10, flex: 1, padding: '1%'}}
                    />
                  </View>
                </View>
                <View style={{paddingLeft: '2%', paddingTop: '4%'}}>
                  <Button
                    icon={
                      <SendIcon
                        name="send-sharp"
                        color="white"
                        size={20}
                        style={{alignSelf: 'center'}}
                      />
                    }
                    styleButton={[
                      style.addAnnouncemetButton,
                      {
                        borderRadius: 50,
                        borderWidth: 1,
                        borderColor: '#B0B2B3',
                        backgroundColor: '#058095',
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}
                    styleText={style.submitFormButtonText}
                    onPress={() => onAddAnnouncement()}
                  />
                </View>
              </View>
            </ScrollView>
          </GestureHandlerRootView>
        ) : (
          <></>
        )}
      </View>
    </View>
  );
}
export default Announcements;
