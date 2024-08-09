import {Image, PermissionsAndroid, Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Login from '../Pages/Login';
import Signup from '../Pages/Signup';
import Welcome from '../Pages/Welcome';
import Conversations from '../Pages/Conversations';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Announcements from '../Pages/Announcements';
import Profile from '../Pages/Profile';
import Logout from '../Pages/Logout';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import Button from './Button';
import style from '../AppStyling';
import logoImg from '../Assets/logo.png';
import {changePath} from '../Store/StoreInterface';
const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();
import ThreeDotsIcon from 'react-native-vector-icons/Entypo';
import {useEffect} from 'react';
function Root() {
  const isLoggedIn = useSelector(state => state.config.isLoggedIn);
  const {path} = useSelector(state => state.config);
  const dispatch = useDispatch();

  function navigateToPath(path) {
    dispatch(changePath(path));
  }

  async function reqPerm() {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
  }
  useEffect(() => {
    reqPerm();
  }, []);

  const {selectedConversationId} = useSelector(state => state.config);
  return (
    <View style={{backgroundColor: 'white'}}>
      {/**BANNER IF USER IS LOGGEDIN */}
      {isLoggedIn && selectedConversationId === null ? (
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            backgroundColor: '#058095',

            height: '10%',
          }}>
          <View
            style={{
              backgroundColor: '#058095',

              width: '50%',
              height: '100%',
              justifyContent: 'flex-start',
              flexDirection: 'row',

              alignSelf: 'center',
            }}>
            <View
              style={{
                width: '50%',
                height: '41%',
                alignSelf: 'center',
              }}>
              <Image
                source={logoImg}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  resizeMode: 'contain',
                }}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#058095',
              justifyContent: 'flex-end',
              width: '50%',
            }}>
            <View style={{alignSelf: 'center', flexDirection: 'row'}}>
              {/**TODO SEARCH */}
              {/* <Text>Search</Text> */}
              <Menu>
                <MenuTrigger>
                  <View
                    style={{
                      justifyContent: 'center',
                    }}>
                    <ThreeDotsIcon
                      name="dots-three-vertical"
                      size={20}
                      color="white"
                    />
                  </View>
                </MenuTrigger>

                <MenuOptions
                  optionsContainerStyle={{
                    marginTop: '4%',
                    borderRadius: 7,
                    alignItems: 'flex-start',
                    backgroundColor: 'red',
                    marginRight: '4%',
                    position: 'relative',
                  }}
                  style={{
                    backgroundColor: 'white',
                    flexDirection: 'column',
                    borderRadius: 7,
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    marginRight: '5%',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                  }}>
                  <MenuOption
                    // style={{backgroundColor: 'red'}}
                    onSelect={() => {
                      navigateToPath('Profile');
                    }}>
                    <Text
                      style={{
                        fontSize: 10,
                        color: 'black',
                      }}>
                      Profile
                    </Text>
                  </MenuOption>
                  <MenuOption
                    onSelect={() => {
                      navigateToPath('Logout');
                    }}>
                    <Text
                      style={{
                        fontSize: 10,
                        color: 'black',
                      }}>
                      Logout
                    </Text>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>
          </View>
        </View>
      ) : (
        false
      )}

      <View style={{width: '100%', height: '100%'}}>
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="Conversations"
            backBehavior="history"
            screenOptions={{
              tabBarStyle: {
                backgroundColor: '#058095',
              },
              tabBarActiveTintColor: 'white',
              // tabBarInactiveTintColor: 'white',
              tabBarIndicatorStyle: {
                backgroundColor: '#0e6e82',
                borderBottomWidth: 5,
                borderBottomColor: 'white',
              },
              tabBarIndicatorContainerStyle: {
                backgroundColor: '#058095',
              },
              tabBarItemStyle: {
                // backgroundColor: '#0e6e82',
              },
            }}>
            {/** options for placing icons */}

            {/**HIDDEN ROUTES , CAN BE ACCESSED ONLY FROM THE MENU*/}
            {isLoggedIn && (
              <Tab.Screen name="Conversations">
                {() => (
                  <Stack.Navigator
                    backBehavior="history"
                    screenOptions={{
                      tabBarStyle: {
                        backgroundColor: '#058095',
                      },
                      // tabBarItemStyle: {
                      //   // backgroundColor: '#0e6e82',
                      // },
                      tabBarActiveTintColor: 'white',
                      tabBarInactiveTintColor: 'white',
                      tabBarIndicatorStyle: {
                        backgroundColor: '#058095',

                        borderBottomWidth: 5,
                        borderBottomColor: 'white',
                      },
                    }}>
                    <Tab.Screen
                      name="Conversations-child"
                      options={{headerShown: false}}
                      component={Conversations}
                    />
                    <Tab.Screen
                      name="Profile"
                      component={Profile}
                      options={{headerShown: false}}
                    />
                    <Tab.Screen
                      name="Logout"
                      component={Logout}
                      options={{headerShown: false}}
                    />
                  </Stack.Navigator>
                )}
              </Tab.Screen>
            )}

            {/**DISABLE NAVIGATION TO ANNOUNCEMENTS IF USER OPENED A CHAT */}

            {selectedConversationId === null &&
            path !== 'Profile' &&
            path !== 'Logout' &&
            isLoggedIn ? (
              <Tab.Screen name="Announcements" component={Announcements} />
            ) : (
              false
            )}

            {!isLoggedIn && <Tab.Screen name="Welcome" component={Welcome} />}
            {!isLoggedIn && <Tab.Screen name="Login" component={Login} />}
            {!isLoggedIn && <Tab.Screen name="Signup" component={Signup} />}
          </Tab.Navigator>
        </NavigationContainer>
      </View>
    </View>
  );
}
export default Root;
