import React, {Component} from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions, Pressable,
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
            right: 20,

        }
    }

    _handleOpenWithLinking = () => {
        Linking.openURL('https://lk.e-zh.ru/shops/welcome').then();
    };

    handleCloseModal = () => {
        this.setState({right: -2000})
        console.log(111);
    }

    render() {

        return (

            <View style={[styles.alertMessageStyle, {right: this.state.right,}]}>
                <View style={{flexDirection: 'row', padding: 5}}>
                    <View style={{padding: 10, marginTop: 5}}>
                        <Svg
                            width={20}
                            height={20}
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <Path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10zm0-17.143c.789 0 1.429.64 1.429 1.429v7.143a1.429 1.429 0 01-2.858 0V4.286c0-.79.64-1.429 1.429-1.429zm0 14.286c.868 0 1.572-.64 1.572-1.429s-.704-1.428-1.572-1.428c-.868 0-1.571.64-1.571 1.428 0 .79.703 1.429 1.571 1.429z"
                                fill="#FAFAFA"
                            />
                        </Svg>
                    </View>
                    <View style={{marginTop: 5}}>


                        <Text style={{color: '#FAFAFA', fontSize: 13}}>
                            Для продолжения работы необходимо {'\n'}подключить магазин
                        </Text>
                    </View>
                    <TouchableOpacity onPress={this.handleCloseModal} style={{marginLeft: 18, width: 50, height: 30}}>
                        <Text style={{color: '#FAFAFA', fontSize: 12,}}>
                            X
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={{padding: 10}} onPress={this._handleOpenWithLinking}>
                    <Text style={styles.addShopButtonStyle}>
                        Добавить магазин
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    alertMessageStyle: {
        backgroundColor: '#24C38E',
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
        top: 120,
        zIndex: 1

    },
    addShopButtonStyle: {
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
