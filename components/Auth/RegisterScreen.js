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
import DropDownPicker from "react-native-custom-dropdown";

import * as Svg from 'react-native-svg';
import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirm_pass: '',

            name_error: null,
            email_error: null,
            phone_error: null,
            password_error: null,
            confirm_password_error: null,

            registered: false

        };
    }

    go = () => {
        const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(this.state.email) === true) {
            alert('valid');
        } else {
            alert();
        }

    }

    redirectToOfertaLink = () => {
        WebBrowser.openBrowserAsync('https://lk.e-zh.ru/docs/%D0%9E%D1%84%D0%B5%D1%80%D1%82%D0%B0%20%D0%92%D0%92.pdf');
    }

    redirectToPrivacyPolicy = () => {
        WebBrowser.openBrowserAsync('https://lk.e-zh.ru/docs/%D0%9F%D0%BE%D0%BB%D0%B8%D1%82%D0%B8%D0%BA%D0%B0%20%D0%BA%D0%BE%D0%BD%D1%84%D0%B8%D0%B4%D0%B5%D0%BD%D1%86%D0%B8%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D1%81%D1%82%D0%B8.pdf');
    }

    handleRegistration = async () => {
        let {name, password, email, phone, confirm_pass} = this.state;

        let req = {name: name, password: password, email: email, phone: phone}

        if ( password !== confirm_pass) {
            this.setState({
                confirm_password_error: 'Поли не совпадают!'
            })

            return false;
        }

        try {
            fetch(`https://lk.e-zh.ru/api/register`, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        req
                    },
                    body: JSON.stringify({
                        name: name,
                        password: password,
                        email: email,
                        phone: phone
                    })
                }
            ).then((response) => {
                return response.json()
            })
                .then((response) => {
                    if (response.errors?.name || response.errors?.email || response.errors?.phone || response.errors?.password) {
                        this.setState({
                            name_error: response.errors?.name,
                            email_error: response.errors?.email,
                            phone_error: response.errors?.phone,
                            password_error: response.errors?.password,

                        })
                    } else {
                        this.setState({
                            name_error: null,
                            email_error: null,
                            phone_error: null,
                            password_error: null,
                        })
                    }
                    console.log(response)

                    if (!response.errors ) {

                        this.setState({
                            name: '',
                            email: '',
                            phone: '',
                            password: '',
                            confirm_pass: '',
                        })

                        console.log('USER_CREATED_STATUS_OK');

                        let token = response.token

                        this.props.navigation.navigate('ConfirmEmail', {
                            token: token,
                        })
                    }
                })
        } catch (error) {
            console.log(error, 'Catch error');
        }
    }

    goToLogin = () => {
        this.props.navigation.navigate('Login')
    }
    goToResetPSW = () => {
        this.props.navigation.navigate('ResetPassword')
    }


    onLogin() {
        const {email, password} = this.state;
        Alert.alert('Credentials', `${email} + ${password}`);
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView  horizontal={false} style={{padding:15, width:'100%'}}>
                    <View style={{marginTop: 50, justifyContent: 'center',alignItems:'center', width:'100%',}}>
                        <View style={styles.registerText}>
                            <Text style={{
                                fontSize: 25,
                                fontWeight: 'bold',
                                marginBottom: 10,
                                alignSelf: 'flex-start'
                            }}> Регистрация </Text>
                            <Text style={{color: '#00203373', fontSize: 14, alignSelf: 'flex-start'}}> Создайте ваш
                                аккаунт </Text>
                        </View>

                        {/*START ФИО*/}
                        <View style={{width: '100%'}}>
                            <View style={{padding: 20, width:'100%'}}>

                                {/*<Text style={styles.label}>ФИО</Text>*/}

                                <View style={{flexDirection: 'row', width:'100%',}}>
                                    <View style={styles.inputBoxStyle}>
                                        <Image
                                            style={{width: 22, height: 22,}}
                                            source={require('../../assets/img/registericons/user-outline_icon-icons.com_56871.png')}
                                        />
                                    </View>
                                    <TextInput
                                        value={this.state.name}
                                        onChangeText={(name) => this.setState({name})}
                                        style={[styles.input, ]}
                                        underlineColorAndroid="transparent"
                                        placeholder='ФИО'
                                    />

                                </View>
                                {this.state.name_error &&
                                    <Text style={{color: 'red', fontSize: 10, marginBottom: 5}}>{this.state.name_error}</Text>
                                }
                                <View style={{marginBottom: 10}}/>


                                {/*END ФИО*/}

                                <View style={styles.emailWrapper}>
                                    <View style={styles.inputBoxStyle}>
                                        <Image
                                            style={{width: 22, height: 22,}}
                                            source={require('../../assets/img/registericons/email_mail_4598.png')}
                                        />
                                    </View>
                                    <TextInput
                                        value={this.state.email}
                                        onChangeText={(email) => this.setState({email})}
                                        style={styles.input}
                                        underlineColorAndroid="transparent"
                                        placeholder='Введите Email'
                                        autoCapitalize='none'
                                    />
                                </View>
                                {this.state.email_error &&
                                    <Text style={{color: 'red', fontSize: 10, marginBottom: 5}}>{this.state.email_error}</Text>}
                                <View style={{marginBottom: 10}}/>

                                <View style={{flexDirection: 'row',}}>
                                    <View style={styles.inputBoxStyle}>
                                        <Image
                                            style={{width: 22, height: 22,}}
                                            source={require('../../assets/img/registericons/phone_icon_136322.png')}
                                        />
                                    </View>
                                    <TextInput
                                        value={this.state.phone}
                                        onChangeText={(phone) => this.setState({phone})}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        underlineColorAndroid='transparent'
                                        placeholder='Введите Номер'
                                    />
                                </View>
                                {this.state.phone_error &&
                                    <Text style={{color: 'red', fontSize: 10, marginBottom: 5}}>{this.state.phone_error}</Text>}
                                <View style={{marginBottom: 10}}/>


                                <View style={{flexDirection: 'row',}}>
                                    <View style={styles.inputBoxStyle}>
                                        <Image
                                            style={{width: 22, height: 22,}}
                                            source={require('../../assets/img/registericons/lock-outlined-padlock-symbol-for-security-interface_icon-icons.com_57803.png')}
                                        />
                                    </View>
                                    <TextInput
                                        value={this.state.password}
                                        onChangeText={(password) => this.setState({password})}
                                        secureTextEntry={true}
                                        style={styles.input}
                                        underlineColorAndroid='transparent'
                                        placeholder='Введите Пароль'
                                        autoCapitalize='none'

                                    />
                                </View>
                                {this.state.password_error &&
                                    <Text style={{color: 'red', fontSize: 10, marginBottom: 5}}>{this.state.password_error}</Text>}
                                <View style={{marginBottom: 10}}/>

                                <View style={{flexDirection: 'row'}}>
                                    <View style={styles.inputBoxStyle}>
                                        <Image
                                            style={{width: 22, height: 22,}}
                                            source={require('../../assets/img/registericons/lock-outlined-padlock-symbol-for-security-interface_icon-icons.com_57803.png')}
                                        />
                                    </View>
                                    {/*<Text style={styles.label}>Пароль еще раз</Text>*/}
                                    <TextInput
                                        value={this.state.confirm_pass}
                                        onChangeText={(confirm_pass) => this.setState({confirm_pass})}
                                        secureTextEntry={true}
                                        style={styles.input}
                                        underlineColorAndroid='transparent'
                                        placeholder='Повторите Пароль'
                                        autoCapitalize='none'
                                    />
                                </View>
                                {this.state.confirm_password_error &&
                                    <Text style={{color: 'red', fontSize: 10, marginBottom: 5}}>Пароли не совподают</Text>}
                                <View style={{marginBottom: 10}}/>

                                <View style={{alignItems: 'center', width: '100%'}}>
                                    <LinearGradient colors={['#0078D2', '#0078D2']} style={styles.linearGradient}>
                                        <TouchableOpacity style={styles.loginButton}
                                                          onPress={this.handleRegistration}>

                                            <Text style={styles.loginButtonText}>Зарегистрироваться</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                                <View>
                                    <View style={{marginBottom: 30, alignItems: 'center'}}>
                                        <Text style={{
                                            width: '100%',
                                            fontSize: 13,
                                            lineHeight: 14,
                                            marginTop: 90,
                                            alignSelf: 'flex-start',
                                            textAlign:'center'
                                        }}>

                                            Регистрируясь я принимаю <Text style={{color: '#20a8d8', zIndex: 1}}
                                                                           onPress={this.redirectToOfertaLink}>оферту</Text> и <Text
                                            style={{color: '#20a8d8', zIndex: 1}}
                                            onPress={this.redirectToPrivacyPolicy}>политику
                                            конфиденциальности</Text> сервиса.
                                        </Text>
                                    </View>
                                </View>

                                <View style={{width: '100%', alignItems: 'center',}}>
                                    {/*line*/}
                                    {/*<View style={{*/}
                                    {/*    width: '100%',*/}
                                    {/*    backgroundColor: 'grey',*/}
                                    {/*    height: 2,*/}
                                    {/*    marginBottom: 10,*/}
                                    {/*    marginTop: 10,*/}
                                    {/*}}/>*/}
                                    <Text style={{textAlign: 'center', marginBottom: 10}}>
                                        Уже зарегистрированы?
                                    </Text>
                                    <LinearGradient colors={['#0078D2', '#0078D2']} style={styles.linearGradient}>
                                        <TouchableOpacity style={styles.loginButton} onPress={() => this.goToLogin()}>
                                            <Text style={styles.loginButtonText}>Войти</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: 'white',
        width: '100%',
    },
    inputBoxStyle: {
        backgroundColor: '#DEE4E8',
        height: 45,
        padding: 10,
        borderRadius: 5,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },
    existAccountWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    labelPswWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 300,
        width: '100%',
        marginBottom: 8
    },
    emailWrapper: {
        width: '100%',
        height: 45,
        flexDirection: "row"
    }
    ,
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
        // maxWidth: 257,
        height: 45,
        padding: 11,
        borderRadius: 4,
        marginBottom: 5,
        backgroundColor: 'white',
        fontSize: 16,
        color: '#002033',
        borderWidth: 1,
        borderColor: '#00426947',
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        flex:1
    },
    goToLogin: {
        fontSize: 18,
        color: '#00395ccc'
    }
    ,
    inputext: {
        width: '100%',
        fontWeight: 'bold',
        lineHeight: 38.4,
        marginBottom: 40,
        fontSize: 25,
        color: '#002033',

        alignSelf: 'flex-start'
    },
    loginButton: {
        fontSize: 18,
        color: 'white',
        // maxWidth: 300,
        width: '100%',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center'

    },
    loginButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,

    },
    linearGradient: {
        borderRadius: 4,
        // maxWidth: 340,
        width: '100%',
        alignItems: 'center',
        alignSelf: 'flex-start'
    },
    dontHaveAccount: {
        marginTop: 60,
        fontWeight: 'normal',
        fontSize: 14,
        color: '#8B94A3'
    },
    goToRegister: {
        color: '#00395ccc'
    },
    goToRegisterText: {
        color: '#00395ccc',
        marginTop: 12,
        fontWeight: 'normal',
        fontSize: 18,
        width:'100%'
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
    },
    registerText: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 25,
        alignSelf: 'flex-start',
        marginLeft: 15
    }
});


{/*START Email*/
}
{/*<View style={styles.labelPswWrapper}>*/
}
{/*    /!*<Text style={styles.labelPsw}>Email</Text>*!/*/
}
{/*    <TouchableOpacity style={{}} onPress={() => this.goToResetPSW()}>*/
}
{/*        <Text style={{color: '#0078D2', fontSize: 14}}>Забыли пароль?</Text>*/
}
{/*    </TouchableOpacity>*/
}
{/*</View>*/
}
