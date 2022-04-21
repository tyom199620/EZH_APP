import React, {Component} from 'react';
import {
    Text,
    Alert,
    Button,
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    SafeAreaView,
    ScrollView
} from 'react-native';
// import { TextInput } from 'react-native-paper';
import {LinearGradient} from 'expo-linear-gradient';

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import Svg, {Path} from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AuthContext} from "../AuthContext/context";

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            confirm_code: '',
            error_message: false,
            error_message_text: '',
            user_token: this.props.token,
            messageVisible: false
        };
    }
    static contextType = AuthContext

    handleConfirmCode = () => {
        const {confirm_code} = this.state
        try {
            let userToken = this.props.token;
            let AuthStr = 'Bearer ' + userToken;

            fetch(`https://lk.e-zh.ru/api/user/verify`, {
                    method: "POST",
                    headers: {
                        'Authorization': AuthStr,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: confirm_code
                    })
                }
            ).then((response) => {
                return response.json()
            }).then((response) => {

                // console.log(response, 'resonse')

                if (response.hasOwnProperty('success')) {

                    let foundUser = {
                        token: this.props.token,
                        email: ''
                    }
                    this.context.signIn(foundUser);

                    console.log('LOGIIIIn')
                    // this.props.navigation.navigate(`Dashboard`)

                } else {

                    this.setState({
                        error_message: true
                    })
                }
                console.log(response)
            })

        } catch (e) {
            console.log(e)
        }
    }

    handleResendConfirmCode = () => {
        try {

            let userToken = this.props.token;
            let AuthStr = 'Bearer ' + userToken;
            fetch(`https://lk.e-zh.ru/api/user/verify/resend`, {
                    method: "POST",
                    headers: {
                        'Authorization': AuthStr,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            ).then((response) => {

                return response.json()

            }).then((response) => {
                this.setState({
                    messageVisible: true
                })
                setTimeout(()=>{this.setState({messageVisible: false})}, 6000)
                console.log(response)
            })
        } catch (e) {
            console.log(e)
        }
    }

    componentDidMount() {
       //  console.log(this.props.token, 'cdm token')
    }


    handleGoToBack = () => {
        this.props.navigation.navigate("Login")
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={{padding: 40, marginTop: '20%'}}>
                    <View style={styles.confirmBox}>
                        <TouchableOpacity style={{margin: 15}} onPress={this.handleGoToBack}>
                            <Svg
                                width={25}
                                height={25}
                                viewBox="0 0 10 9"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <Path
                                    d="M2.71 4l2.647-2.646L4.65.646.796 4.5 4.65 8.354l.707-.708L2.711 5H10V4H2.71z"
                                    fill="#00395C"
                                    fillOpacity={0.8}
                                />
                            </Svg>
                        </TouchableOpacity>
                        <View>
                            <Text style={{textAlign: 'center', marginTop: 30, fontWeight: 'bold', fontSize: 16}}>Подтверждение
                                email-адреса</Text>
                        </View>
                        <View>
                            <Text style={{padding: 30, textAlign: 'center', fontSize: 15}}>
                                На указанный Вами при регистрации адрес
                                электронной почты был выслан код подтверждения.
                                Пожалуйста, укажите его в поле ниже.</Text>
                        </View>
                        <View style={{padding: 20, alignItems: 'center'}}>

                            {this.state.messageVisible === true && <View style={{alignSelf: 'flex-start', paddingLeft: 20}}>
                                <Text style={{color: 'green'}}>
                                    Код повторно отправлен на Вашу{"\n"}почту
                                </Text>
                            </View>}

                            <TextInput
                                placeholder='Ваш код'
                                style={styles.input}
                                keyboardType='numeric'
                                maxLength={6}
                                onChangeText={(confirm_code) => this.setState({confirm_code})}
                            />
                            {this.state.error_message === true &&
                                <Text style={styles.errorMessageText}>Неверный код подтверждения </Text>}

                        </View>
                        <View
                            style={{alignSelf: 'center', width: '62%', alignItems: 'center', justifyContent: 'center'}}>
                            <TouchableOpacity style={styles.buttonStyle}>
                                <View style={{}}>
                                    <View style={{position: 'absolute', zIndex: 100, marginLeft: 15, marginTop: 18}}>
                                        <Svg width={14} xmlns="http://www.w3.org/2000/svg" height={14}
                                             viewBox="0 0 64 64">
                                            <Path
                                                fill="white"
                                                d="M16.074 55.049c.369.534.975.838 1.615.838.133 0 .269-.049.404-.076.098.016.193.064.292.064.575 0 1.134-.249 1.526-.681l43.514-43.521a2.008 2.008 0 10-2.84-2.841l-42.52 42.526-14.34-14.337a2.008 2.008 0 10-2.84 2.841l15.189 15.187z"
                                            />
                                        </Svg>
                                    </View>
                                    <View>
                                        <LinearGradient colors={['#0078D2', '#0078D2']} style={styles.linearGradient}>
                                            <TouchableOpacity style={styles.loginButton}
                                                              onPress={this.handleConfirmCode}>
                                                <Text style={styles.loginButtonText}>Подтвердить</Text>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{alignSelf: "center",}}>
                            <TouchableOpacity style={{marginTop: 10, padding: 2,}}
                                              onPress={this.handleResendConfirmCode}>
                                <Text style={{textAlign: 'center', color: '#0078D2',}}>Отправить код повторно</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{marginTop: 25}}/>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    confirmBox: {
        width: '100%',
        backgroundColor: 'rgba(245,239,239,0.42)',
        borderRadius: 10,
        alignSelf: 'center',
        justifyContent: 'center',

    },
    input: {
        width: '90%',
        borderWidth: 0.3,
        textAlign: 'center',
        height: 55,
        backgroundColor: 'white',
        borderRadius: 7,
        fontSize: 20,
    },
    buttonStyle: {
        marginTop: 4,
        width: '100%',
    },
    linearGradient: {
        borderRadius: 4,
        marginBottom: 20,
        width: '100%',
        maxWidth: 300,

    },
    loginButton: {
        color: 'white',
        width: '100%',
        maxWidth: 300,
        height: 48,
        justifyContent: 'center',
        borderRadius: 10

    },
    loginButtonText: {
        width: '100%',
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
    },
    errorMessageText: {
        fontSize: 12,
        color: 'red',
        marginTop: 6
    }
});

// <Svg
//     xmlns="http://www.w3.org/2000/svg"
//     x="0px"
//     y="0px"
//     viewBox="0 0 426.667 426.667"
//     xmlSpace="preserve"
//     enableBackground="new 0 0 426.667 426.667"
//     style={{width: 65, height: 65}}
// >
//     <Path
//         d="M213.333 0C95.518 0 0 95.514 0 213.333s95.518 213.333 213.333 213.333c117.828 0 213.333-95.514 213.333-213.333S331.157 0 213.333 0zm-39.134 322.918l-93.935-93.931 31.309-31.309 62.626 62.622 140.894-140.898 31.309 31.309-172.203 172.207z"
//         fill="#6ac259"
//     />
// </Svg>
