import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Text, View, FlatList} from 'react-native';
import {useEffect, useRef, useState} from 'react';
function ConversationHeader({users, setusers}) {
  ///////////////////// CONFIGS //////////////////////////////////
  const flatListRef = useRef(null);

  ///////////////////////////// STATES //////////////////////////////
  const [screenIndex, setScreenIndex] = useState(0);

  const [usersList, setusersList] = useState([]);

  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    const interval = setInterval(() => {
      // Auto-scroll to the next item
      if (flatListRef.current) {
        if (screenIndex < usersList.length - 1) setScreenIndex(screenIndex + 1);
        else setScreenIndex(0);

        const newIndex = (screenIndex + 1) % usersList.length;
        flatListRef.current.scrollToIndex({index: newIndex, animated: true});
      }
    }, 2000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(interval);
  }, [screenIndex, usersList]);

  useEffect(() => {
    setusersList(users);
  }, [users]);
  
  ////////////////////// RETURNED COMPONENTS //////////////////////
  return (
    <GestureHandlerRootView>
      <FlatList
        horizontal
        ref={flatListRef}
        showsHorizontalScrollIndicator={false}
        data={usersList}
        renderItem={({item}) => (
          <Text>
            {item.username}
            {',   '}
          </Text>
        )}
        keyExtractor={item => item._id}
      />
    </GestureHandlerRootView>
  );
}
export default ConversationHeader;
