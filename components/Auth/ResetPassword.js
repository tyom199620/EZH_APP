import React, { Component } from 'react';
import { Text, Alert, Button, View, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
// import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
        };
    }

    go = () => {
        const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(this.state.email) === true){
            alert('valid');
        }
        else{
            alert();
        }

    }




    goToFeeds = () => {
        this.props.navigation.navigate('Feeds')
    }

    goToRegister = () => {
        this.props.navigation.navigate('Register')
    }
    goToResetPSW = () => {
        this.props.navigation.navigate('ResetPassword')
    }

    goToLogin = () => {
        this.props.navigation.navigate('Login')
    }

    onLogin() {
        const { email, password } = this.state;
        Alert.alert('Credentials', `${email} + ${password}`);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.inputext}> Восстановить пароль </Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    value={this.state.email}
                    onChangeText={(email) => this.setState({ email })}
                    style={styles.input}
                    underlineColorAndroid="transparent"
                />

                <LinearGradient colors={['#0078D2', '#0078D2']} style={styles.linearGradient} >

                    <TouchableOpacity  style={styles.loginButton} onPress={() => this.goToFeeds()}  >
                        <Text style={styles.loginButtonText}>Восстановить</Text>
                    </TouchableOpacity>

                </LinearGradient>


                <TouchableOpacity  style={styles.goToRegister} onPress={() => this.goToLogin()} >
                    <Text style={styles.goToRegisterText}>Вернуться назад</Text>
                </TouchableOpacity>
            </View>
        );
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
        justifyContent:'space-between',
        alignItems: 'center',
        maxWidth:300,
        width: '100%',
        marginBottom:8
    },

    label:{
        maxWidth:300,
        width: '100%',
        color:'#00203373',
        fontSize:14,
        textAlign:'left',
        marginBottom:8
    },

    labelPsw:{
        color:'#00203373',
        fontSize:14,
        textAlign:'left',
    }
    ,
    input: {
        maxWidth:300,
        width: '100%',
        height: 45,
        padding: 15,
        marginBottom: 15,
        borderRadius:4,
        backgroundColor: 'white',
        borderWidth:1,
        borderColor:'#00426947',
    },
    inputext: {
        width: '100%',
        textAlign:'center',
        fontWeight:'bold',
        lineHeight: 38.4,
        marginBottom: 40,
        fontSize: 25,
        color:'#002033'
    },
    loginButton: {
        fontSize: 18,
        color:'white',
        maxWidth:300,
        width: '100%',
        height: 48,
        justifyContent:'center',
        alignItems: 'center'

    },
    loginButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,

    },
    linearGradient: {
        borderRadius: 4,
        marginBottom: 30,
        maxWidth:300,
        width: '100%',
    },
    dontHaveAccount: {
        marginTop: 60,
        fontWeight: 'normal',
        fontSize:14,
        color:'#8B94A3'
    },
    goToRegister: {
        color:'#00395ccc'
    },
    goToRegisterText: {
        color:'#00395ccc',
        marginTop: 12,
        fontWeight: 'normal',
        fontSize:18,
    },
    socLinksWrapper:{
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'center',
        width: 196
    },
    socLinkImg:{
        width: 32,
        height: 32
    }
});
