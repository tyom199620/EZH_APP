import * as React from 'react';
import {
    Button,
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    StatusBar,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import {NavigationContainer, getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LoginComponent from './components/Auth/LoginScreen';
import RegisterComponent from './components/Auth/RegisterScreen';
import ResetPasswordComponent from './components/Auth/ResetPassword';
import DashboardComponent from './components/Profile/Dashboard/Dashboard';
import ProductAnalyticsComponent from './components/Profile/ProductAnalytics/ProductAnalytics';
import SingleArticle from "./components/Profile/ProductAnalytics/SingleArticle";
import ConfirmEmailComponent from "./components/Auth/ConfirmEmailCode"

import OrderListComponent from "./components/Profile/includes/orderList"

import {LinearGradient} from 'expo-linear-gradient';


import {AuthContext} from './components/AuthContext/context';
// import AsyncStorage from '@react-native-community/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage'


import axios from 'axios';

function LoginScreen({navigation}) {
    return (
        <LoginComponent navigation={navigation}/>
    );
}

function RegisterScreen({navigation}) {
    return (
        <RegisterComponent navigation={navigation}/>
    );
}



function ProductAnalyticsScreen({navigation}) {
    return (
        <ProductAnalyticsComponent navigation={navigation}/>
    );
}

function ResetPasswordScreen({navigation}) {
    return (
        <ResetPasswordComponent navigation={navigation}/>
    );
}

function ConfirmEmailScreen({route, navigation}){
    let token = route.params.token;
    return(
        <ConfirmEmailComponent token={token} navigation={navigation}/>
    )
}

function DashboardScreen({navigation}) {
    return (
        <DashboardComponent navigation={navigation}/>
    );
}

function ProductScreen({route, navigation}) {
    const {params} = route.params;
    const {url_date} = route.params;
    return (
        <SingleArticle url_date={url_date} article={params} navigation={navigation}/>
    )
}


// const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();


const tabBarStyle = {
    height: 90,
    backgroundColor: 'white',
    elevation: 0,
    borderTopColor: 'white',
    width: Dimensions.get('window').width - 50,
    marginTop: 0,
    marginRight: 'auto',
    marginBottom: 0,
    marginLeft: 'auto',
}


export default function App() {

    const [isLoading, setIsLoading] = React.useState(true);
    const [userToken, setUserToken] = React.useState(null);

    const initialLoginState = {
        isLoading: true,
        userEmail: null,
        userToken: null,
    };

    const loginReducer = (prevState, action) => {
        switch (action.type) {
            case 'RETRIEVE_TOKEN':
                return {
                    ...prevState,
                    userToken: action.token,
                    isLoading: false,
                };
            case 'LOGIN':
                return {
                    ...prevState,
                    userEmail: action.email,
                    userToken: action.token,
                    isLoading: false,
                };
            case 'LOGOUT':
                return {
                    ...prevState,
                    userName: null,
                    userToken: null,
                    isLoading: false,
                };
            case 'REGISTER':
                return {
                    ...prevState,
                    userName: action.id,
                    userToken: action.token,
                    isLoading: false,
                };
        }
    };

    const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);

    const authContext = React.useMemo(() => ({
        signIn: async (foundUser) => {
            // setIsLoading(true);
            const userToken = String(foundUser.token);
            const userEmail = foundUser.email;
            // setUserToken(userToken);

            console.log('AuthUser', foundUser);

            try {
                await AsyncStorage.setItem('userToken', userToken);
            } catch (e) {
                console.log(e);
            }
            dispatch({type: 'LOGIN', email: userEmail, token: userToken});
        },
        signOut: async () => {
            try {
                await AsyncStorage.removeItem('userToken');
                setIsLoading(false);

            } catch (e) {
                console.log(e);
            }
            dispatch({type: 'LOGOUT'});
        },
        signUp: () => {
            // setIsLoading(false);
        }
    }), []);


    // Проверка при входе в приложение.

    React.useEffect(() => {
        setTimeout(async () => {

            let userToken;
            userToken = null;
            try {
                userToken = await AsyncStorage.getItem('userToken');
                setIsLoading(false);

            } catch (e) {
                console.log(e);
            }
            dispatch({type: 'RETRIEVE_TOKEN', token: userToken});
        }, 1000);
    }, []);


    if (isLoading) {
        return (
            <View style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white'
            }}>
                <ActivityIndicator size="large" color="0078D2"/>
            </View>
        );
    }

    return (
        <AuthContext.Provider value={authContext}>
            <NavigationContainer>
                {loginState.userToken !== null ? (
                        <Tab.Navigator
                            initialRouteName="Dashboard"
                            screenOptions={({route}) => ({
                                tabBarShowLabel: false,
                                headerShown: false,
                                tabBarActiveTintColor: '#2EB6A5',
                                tabBarInactiveTintColor: 'gray',
                                tabBarStyle: tabBarStyle,
                                tabBarIcon: ({focused, color, size}) => {
                                    // let iconName;
                                    //
                                    // switch (route.name){
                                    //   case 'Feeds':
                                    //     iconName = focused ? require('./assets/img/search_active.png') : require('./assets/img/search.png');
                                    //     return <Image style={{ width: 30, height: 30 }} source={iconName}/>
                                    //     break;
                                    //   case 'WishList':
                                    //     iconName = focused ? require('./assets/img/heart_active.png') : require('./assets/img/heart.png');
                                    //     return <Image style={{ width: 33, height: 30 }} source={iconName}/>
                                    //     break;
                                    //   case 'Chat':
                                    //     iconName = focused ? require('./assets/img/chat_active.png') : require('./assets/img/chat.png')  ;
                                    //     return <Image style={{ width: 30, height: 30 }} source={iconName}/>
                                    //     break;
                                    //   case 'Profile':
                                    //     iconName = focused ? require('./assets/img/profile_active.png') : require('./assets/img/profile.png')  ;
                                    //     return <Image style={{ width: 30, height: 30 }} source={iconName}/>
                                    //     break;
                                    //   default:
                                    // }

                                }
                            })}
                        >

                            <Tab.Screen name="Dashboard" component={DashboardScreen}
                                        options={({route}) => ({
                                            tabBarButton: () => null,
                                            tabBarStyle: {display: 'none'}
                                        })}
                            />

                            <Tab.Screen name="ProductAnalytics" component={ProductAnalyticsScreen}
                                        options={({route}) => ({
                                            tabBarButton: () => null,
                                            tabBarStyle: {display: 'none'}
                                        })}
                            />


                            {/*<Tab.Screen name="OrderList" component={OrderListScreen}*/}
                            {/*            options={({route}) => ({*/}
                            {/*                tabBarButton: () => null,*/}
                            {/*                tabBarStyle: {display: 'none'}*/}
                            {/*            })}*/}
                            {/*/>*/}

                            <Tab.Screen name="ProductList" component={ProductScreen}
                                        options={({route}) => ({
                                            tabBarButton: () => null,
                                            tabBarStyle: {display: 'none'}
                                        })}/>

                        </Tab.Navigator>
                    )

                    :


                    <Tab.Navigator
                        initialRouteName="Login"
                        screenOptions={({route}) => ({
                            tabBarShowLabel: false,
                            headerShown: false,
                            tabBarActiveTintColor: '#2EB6A5',
                            tabBarInactiveTintColor: 'gray',
                            tabBarStyle: tabBarStyle,
                        })}>

                        <Tab.Screen name="Login" component={LoginScreen}
                                    options={({route}) => ({
                                        tabBarButton: () => null,
                                        tabBarStyle: {display: 'none'},
                                    })}/>

                        <Tab.Screen name="Register" component={RegisterScreen}
                            options={({route}) => ({
                            tabBarButton: () => null,
                            tabBarStyle: {display: 'none'}
                        })}/>

                        <Tab.Screen name="ResetPassword" component={ResetPasswordScreen}
                                    options={({route}) => ({
                                        tabBarButton: () => null,
                                        tabBarStyle: {display: 'none'}
                                    })}/>

                        <Tab.Screen name="ConfirmEmail" component={ConfirmEmailScreen}
                                    options={({route}) => ({
                                        tabBarButton: () => null,
                                        tabBarStyle: {display: 'none'}
                                    })}/>


                    </Tab.Navigator>

                }
            </NavigationContainer>
        </AuthContext.Provider>
    );
}
