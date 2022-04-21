import React, {Component} from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Svg, {Path} from "react-native-svg";
import * as Linking from "expo-linking";


const screenHeight = Dimensions.get('window').height;
const {width, height} = Dimensions.get('window');


export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modalVisibility: true,
            right: 20
        }
    }


    _handleOpenWithLinking = () => {
        Linking.openURL('https://lk.e-zh.ru/tariff').then();
    };
    handleCloseModal = () => {
        this.setState({right: -2000})
        console.log(111);
    }

    render() {

        return (
            <View style={[styles.alertMessageStyle, {right: this.state.right,}]}>
                <View style={{flexDirection: 'row', padding: 5}}>
                    <View style={{padding: 10,  marginTop: 5}}>
                        <Svg
                            width={8}
                            height={20}
                            viewBox="0 0 8 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <Path
                                d="M8 17.717l-.26 1.208c-.783.35-1.408.617-1.874.8-.465.184-1.007.275-1.624.275-.947 0-1.683-.263-2.209-.785-.525-.525-.788-1.19-.788-1.996 0-.312.019-.633.059-.96.04-.328.103-.697.19-1.109l.978-3.923c.087-.376.16-.732.22-1.068a5.24 5.24 0 00.09-.92c0-.5-.092-.851-.275-1.048-.182-.197-.53-.296-1.045-.296-.253 0-.513.046-.778.134-.266.09-.493.176-.684.256l.261-1.21c.641-.296 1.253-.549 1.839-.759C2.686 6.106 3.239 6 3.762 6c.941 0 1.667.258 2.177.773.51.516.764 1.185.764 2.009 0 .17-.017.47-.053.9-.035.43-.1.824-.196 1.183l-.973 3.907c-.08.314-.152.673-.214 1.077a6.252 6.252 0 00-.095.913c0 .519.102.873.306 1.061.206.189.561.282 1.066.282.236 0 .506-.047.805-.14.298-.094.516-.177.651-.248zM8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                fill="#fff"
                            />
                        </Svg>
                    </View>
                    <View style={{ marginTop: 5}}>
                        <Text style={{color: '#FAFAFA', fontSize: 13}}>
                            Выберите тариф для использования всех{'\n'}функций приложения
                        </Text>
                    </View>
                    <TouchableOpacity onPress={this.handleCloseModal} style={{marginLeft: 12, width: 30, height: 30}}>
                        <Text style={{color: '#FAFAFA', fontSize: 10,}}>
                            X
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity  style={{padding: 10}} onPress={this._handleOpenWithLinking}>
                    <Text style={styles.addShopButtonStyle}>
                        Выбрать тариф
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    alertMessageStyle: {
        backgroundColor: '#F38B01',
        width: 350,
        height: 120,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
        elevation: 16,
        borderRadius: 10,
        position: 'absolute',
        top: 0,
        marginTop: 120,
        zIndex: 1

    },
    addShopButtonStyle:{
        width: 170,
        height: 45,
        color: 'white',
        borderRadius: 10,
        backgroundColor: 'rgba(250, 250, 250, 0.16)',
        textAlign: 'center',
        paddingTop: 10,
        marginLeft: 35
    }
});
