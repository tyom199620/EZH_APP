import React, {Component} from 'react';
import {
    Text, Alert, Button, View, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator
} from 'react-native';
// import { TextInput } from 'react-native-paper';
import {LinearGradient} from 'expo-linear-gradient';
import axios from 'axios';
import {AuthContext} from '../AuthContext/context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from "expo-linking";
import Svg, {Path, Defs, G, ClipPath} from "react-native-svg";

import SvgUri from 'react-native-svg-uri';


// const { signIn } = React.useContext(AuthContext);

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            check_textInputChange: false,
            secureTextEntry: true,
            isValidEmail: true,
            existEmail: true,
            isValidPassword: true,
        };
    }

    static contextType = AuthContext

    checkEmail = () => {
        const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(this.state.email) === true) {
            return true;
        } else {
            return false;
        }

    }


    checkPassword = () => {
        let password = this.state.password;
        if (password.length > 5) {
            return true;
        } else {
            return false;
        }

    }

    ConfirmEmail = () => {
        this.props.navigation.navigate('ResetPassword')
    }


    goToResetPSW = () => {
        this.props.navigation.navigate('ResetPassword')
    }
    redirectToOfertaLink = () => {
        WebBrowser.openBrowserAsync('https://lk.e-zh.ru/docs/%D0%9E%D1%84%D0%B5%D1%80%D1%82%D0%B0%20%D0%92%D0%92.pdf');
    }
    redirectToPrivacyPolicy = () => {
        WebBrowser.openBrowserAsync('https://lk.e-zh.ru/docs/%D0%9F%D0%BE%D0%BB%D0%B8%D1%82%D0%B8%D0%BA%D0%B0%20%D0%BA%D0%BE%D0%BD%D1%84%D0%B8%D0%B4%D0%B5%D0%BD%D1%86%D0%B8%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D1%81%D1%82%D0%B8.pdf');
    }

    loginHandle = (email, password) => {
        if (!this.checkEmail()) {
            this.setState({
                isValidEmail: false
            })
        } else {
            this.setState({
                isValidEmail: true
            })
            if (!this.checkPassword()) {

                this.setState({
                    isValidPassword: false
                })
            } else {

                this.setState({
                    isValidPassword: true
                })

                const req = {
                    email: email, password: password,
                };
                axios.post('https://lk.e-zh.ru/api/login', req).then((response) => {
                        if (response.status === 200) {

                            let verified_at = response.data.user.verified_at

                            if (verified_at === null) {
                                let token = response.data.token


                                this.props.navigation.navigate("ConfirmEmail", {
                                    token: token,
                                })
                                return false
                            }

                            let foundUser = {
                                email: response.data.user.email, name: response.data.user.name, token: response.data.token,
                            }
                            this.context.signIn(foundUser);

                        }
                    },

                    (err) => {
                        if (err.response.status === 404 && err.response.data === 'User does not exist') {
                            this.setState({
                                existEmail: false
                            })
                        }
                        if (err.response.status === 401) {
                            this.setState({
                                isValidPassword: false
                            })
                        }
                    },);
            }
        }


    }

    _handleOpenWithLinking = () => {
        Linking.openURL('https://lk.e-zh.ru/register').then();
    };
    handleRegistration = () => {
        this.props.navigation.navigate("Register")
    };

    render() {

        return (

            <View style={styles.container}>

                <View>
                    <Image
                        style={{
                            width: 220, height: 220,
                        }}
                        source={(require("../../assets/img/preload.png"))}
                    />
                </View>


                <Text style={styles.inputext}>
                    Вход в систему
                </Text>

                <Text style={styles.label}>Email пользователя</Text>
                <TextInput
                    value={this.state.email}
                    onChangeText={(email) => this.setState({email})}
                    style={styles.input}
                    underlineColorAndroid="transparent"
                    placeholder='Введите Email'
                />

                {this.state.existEmail === false && <Text style={{
                    color: 'red',
                    fontSize: 8,
                    maxWidth: 300,
                    width: '100%',
                    marginBottom: 10,
                    position: 'relative',
                    top: -2
                }}>Пользователей с данной почтой не существует</Text>}

                {this.state.isValidEmail === false && <Text style={{
                    color: 'red',
                    fontSize: 8,
                    maxWidth: 300,
                    width: '100%',
                    marginBottom: 10,
                    position: 'relative',
                    top: -2
                }}>Введите коректный Email</Text>}
                <View style={styles.labelPswWrapper}>
                    <Text style={styles.labelPsw}>Пароль</Text>

                    <TouchableOpacity style={{}} onPress={() => this.ConfirmEmail()}>
                        <Text style={{color: '#0078D2', fontSize: 14}}>Забыли пароль?</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    value={this.state.password}
                    onChangeText={(password) => this.setState({password})}
                    secureTextEntry={true}
                    style={styles.input}
                    underlineColorAndroid='transparent'
                    placeholder='Введите Пароль'

                />

                {this.state.isValidPassword === false && <Text style={{
                    color: 'red',
                    fontSize: 8,
                    maxWidth: 300,
                    width: '100%',
                    marginBottom: 10,
                    position: 'relative',
                    top: -2
                }}>Неверный пароль</Text>}
                <LinearGradient colors={['#0078D2', '#0078D2']} style={styles.linearGradient}>

                    <TouchableOpacity style={styles.loginButton}
                        // onPress={this.onLogin.bind(this)}
                                      onPress={() => this.loginHandle(this.state.email, this.state.password)}
                    >
                        <Text style={styles.loginButtonText}>Войти</Text>
                    </TouchableOpacity>

                </LinearGradient>


                <TouchableOpacity style={[styles.goToRegister]} onPress={() => this.handleRegistration()}>
                    <Text style={{color: '#0078D2', fontSize: 16}}>
                        Зарегистрироваться
                    </Text>

                    <SvgUri
                        style={{marginRight: 5, marginLeft: 15, fontSize: 16}}
                        width="16"
                        height="16"
                        source={require('../../assets/img/registrationArrow.svg')}/>
                </TouchableOpacity>


                <View style={{}}>
                    <Text style={{
                        maxWidth: 300, width: '100%', textAlign: 'left', fontSize: 13, lineHeight: 14, marginTop: 90,
                    }}>

                        Авторизуясь я принимаю <Text style={{color: '#20a8d8'}}
                                                     onPress={this.redirectToOfertaLink}>оферту</Text> и <Text
                        style={{color: '#20a8d8'}} onPress={this.redirectToPrivacyPolicy}>политику
                        конфиденциальности</Text> сервиса.
                    </Text>
                </View>
            </View>);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },

    labelPswWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 300,
        width: '100%',
        marginBottom: 8
    },

    label: {
        maxWidth: 300,
        width: '100%',
        color: '#00203373',
        fontSize: 14,
        textAlign: 'left',
        marginBottom: 8
    },

    labelPsw: {
        color: '#00203373',
        fontSize: 14,
        textAlign: 'left',
    },
    input: {
        maxWidth: 300,
        width: '100%',
        height: 45,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15,
        borderRadius: 4,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#00426947',
        fontSize: 16,
        color: '#002033',
    },
    inputext: {
        width: '100%',
        textAlign: 'center',
        fontWeight: 'bold',
        lineHeight: 38.4,
        marginBottom: 40,
        fontSize: 25,
        color: '#002033',
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
    linearGradient: {
        borderRadius: 4,
        marginBottom: 30,
        width: '100%',
        maxWidth: 300,

    },
    dontHaveAccount: {
        marginTop: 60,
        fontWeight: 'normal',
        fontSize: 14,
        color: '#8B94A3'
    },
    goToRegister: {
        color: '#00395ccc',
        borderWidth: 1,
        borderColor: '#0078D2',
        maxWidth: 300,
        width: '100%',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 10,

    }, goToRegisterText: {
        color: '#00395ccc',
        fontSize: 18,
        textAlign: "center",
        padding: 10
    },
    socLinksWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 196
    },
    socLinkImg: {
        width: 32,
        height: 32
    }
});
