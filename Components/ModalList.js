import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  FlatList,
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import Button from './Button';
import Input from './Input';
import style from '../AppStyling';
import BackIcon from 'react-native-vector-icons/Ionicons';
import SearchIcon from 'react-native-vector-icons/AntDesign';
import CancelIcon from 'react-native-vector-icons/MaterialIcons';
function ModalList({
  configHook,
  listItems,
  isModalPressed,
  setIsModalPressed,
  isLoading,
  searchKey,
  children,
  isNotClosable,
  headerComponent,
  headerComponentStyle,
  footerComponentStyle,
  pageName,
  description,
  modalStyle,
  listStyle,
}) {
  ///////////////////// CONFIGS //////////////////////////////////
  const {width, height} = useWindowDimensions();
  /////////////////////// USESELECTERS ///////////////////////////

  ///////////////////////////// STATES //////////////////////////////
  const [isModalClosed, setIsModalClosed] = useState(isModalPressed);
  const [searchTerm, setSearchTerm] = useState('');
  const [listItemsState, setListItemsState] = useState([]);
  const [searchedItems, setSearchedItems] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  ////////////////////////// APIS ///////////////////////////////////

  //////////////////////// USEEFFECTS ////////////////////////////////

  useEffect(() => {
    setListItemsState(listItems);
    // setSearchTerm('');
  }, [listItems]);

  ////////////////////// HOOKS  //////////////////////
  function onSearchTermChange(text) {
    if (text !== '') {
      setSearchTerm(text);
      const filteredItems = listItemsState.filter(listItemsState =>
        listItemsState[searchKey].includes(text),
      );
      setSearchedItems(filteredItems);
    } else {
      setSearchTerm('');
      setSearchedItems([]);
    }
  }

  ////////////////////// RETURNED COMPONENTS //////////////////////

  return (
    <Modal
      visible={isModalClosed}
      onRequestClose={() => {
        if (!isNotClosable) {
          setIsModalClosed(false);
          setIsModalPressed(false);
        }
      }}
      animationType="slide"
      transparent={true}
      style={{height: '100%'}}>
      <View
        style={[
          {
            backgroundColor: 'white',
            height: '100%',
            // paddingBottom: '20%',
          },
          modalStyle,
        ]}>
        <GestureHandlerRootView>
          <ScrollView>
            <View>
              <View
                style={{
                  backgroundColor: '#058095',
                  flexDirection: 'row',
                  padding: '5%',
                  gap: 15,
                  alignItems: 'center',
                }}>
                <View style={{flexDirection: 'row', gap: 12}}>
                  {/**SING ANNOUNCEMENT NOT CLOSABLE */}
                  {isNotClosable ? (
                    ''
                  ) : (
                    <Button
                      onPress={() => {
                        setIsModalClosed(false);
                        setIsModalPressed(false);
                      }}
                      icon={
                        <BackIcon
                          name="arrow-back-outline"
                          size={20}
                          color="white"
                        />
                      }
                    />
                  )}

                  {!isSearching && (
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 15,
                        color: 'white',
                      }}>
                      {pageName}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'flex-end',
                    backgroundColor: isSearching ? 'white' : 'transparent',
                    borderRadius: 7,
                  }}>
                  {isSearching ? (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Input
                        onBlur={() => {}}
                        onFocus={() => {}}
                        value={searchTerm}
                        style={[style.inputForm, {flex: 1}]}
                        onChange={onSearchTermChange}
                        placeHolder="Enter Search Term"
                      />
                      <Button
                        // styleButton={style.cancelSearchButton}
                        // styleText={style.submitFormButtonText}
                        onPress={() => {
                          setSearchTerm('');
                          setIsSearching(false);
                        }}
                        icon={
                          <CancelIcon name="cancel" color="gray" size={20} />
                        }
                      />
                    </View>
                  ) : (
                    <Button
                      onPress={() => {
                        setIsSearching(true);
                      }}
                      icon={
                        <SearchIcon name="search1" size={20} color="white" />
                      }
                    />
                  )}
                </View>
              </View>

              <View style={{justifyContent: 'center', padding: '5%'}}>
                <View>{headerComponent}</View>
                <Text
                  style={{
                    flex: 1,
                    alignSelf: 'flex-start',
                    padding: '5%',
                    fontWeight: 'bold',
                    fontSize: 15,
                    justifyContent: 'flex-end',
                    textAlign: 'left',
                    paddingLeft: '10%',
                  }}>
                  {description}
                </Text>
              </View>
            </View>
          </ScrollView>
        </GestureHandlerRootView>

        {isLoading ? (
          <ActivityIndicator size="large" color="#058095" />
        ) : (
          <GestureHandlerRootView>
            <FlatList
              ListHeaderComponentStyle={headerComponentStyle}
              ListFooterComponentStyle={footerComponentStyle}
              data={searchTerm === '' ? listItemsState : searchedItems}
              renderItem={({item}) => {
                return configHook(item);
              }}
              keyExtractor={item => item._id}
              style={{height: '60%'}}
            />
          </GestureHandlerRootView>
        )}

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            // width: '15%',
            // height: '7%',
            marginRight: '3%',
            marginBottom: '3%',
            borderRadius: 60,
            justifyContent: 'center',
          }}>
          {children}
        </View>
      </View>
    </Modal>
  );
}
export default ModalList;
