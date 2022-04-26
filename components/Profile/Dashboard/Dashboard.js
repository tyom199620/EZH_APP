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
    StatusBar,
    Modal,
    Dimensions,
    ScrollView,
    SafeAreaView,
    TouchableHighlight,
    ImageBackground,
    PanResponder,
    RefreshControl,
    ActivityIndicator
} from 'react-native';

const screenHeight = Dimensions.get('window').height;
const {width, height} = Dimensions.get('window');
import Svg, {Path, Defs, G, ClipPath} from "react-native-svg"
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AuthContext} from "../../AuthContext/context";

import OrderListComponent from '../includes/orderList.js';
import StatisticsCardsComponent from '../includes/statisticsCards';
import ChartComponent from '../../chart/chart';
import HeaderComponent from '../includes/header';

import axios from 'axios';

import ConnectShopMessage from "../includes/connectShopMessage";
import ChooseTareefMessage from "../includes/chooseTareefMessage";

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user_name: null,
            user_email: null,
            refreshing: false,
            shop_id: null,

            shop_list: [''],

            tariffInfo: [],
            sortOfDate: 'yesterday',
            loading: true,

            isDemo: '',

            right: 20
        };
    }


    handleChangeShopId = (shop_id) => {
        this.setState({shop_id: shop_id})
    }

    handleRefreshModal = () => {
        this.setState({
            right: -2000
        })
    }

    _onRefresh = () => {
        this.setShopList();
        this.setTariffInfo();

        console.log(this.state.shop_id, '11111')

        this.setState({refreshing: true, right: 20});

        let _this = this;
        setTimeout(function () {

            //  alert("Refreshed")
            // _this.setState({refreshing: false});
            _this.setState({refreshing: false});

        }, 10)

    }

    changeSortOfDate = (date) => {
        this.setState({
            sortOfDate: date
        })
    }

    setShopList = async () => {
        try {
            let userToken = await AsyncStorage.getItem('userToken');
            let AuthStr = 'Bearer ' + userToken;

            axios.get('https://lk.e-zh.ru/api/shops', {
                headers: {'Authorization': AuthStr},
                "content-type": "application/json",
            }).then(
                (response) => {
                    console.log()

                    let shops = response.data;
                    let shop_list = [];


                    for (let i = 0; i < shops.length; i++) {
                        shop_list.push({
                            'label': shops[i].name,
                            'value': shops[i].id,
                        })
                    }

                    this.setState({

                        shop_list: shop_list
                    })
                },


                (err) => {
                    console.log('setStatisticData err.response', err.response)
                },
            );

        } catch (e) {
            // read error
        }

    }

    setAuthUserInfo = async () => {
        try {
            let userToken = await AsyncStorage.getItem('userToken');
            let AuthStr = 'Bearer ' + userToken;
            console.log()

            axios.get('https://lk.e-zh.ru/api/user', {headers: {'Authorization': AuthStr}})
                .then(response => {
                    if (response.status === 200) {
                        this.setState({
                            user_email: response.data.email,
                            user_name: response.data.name,
                        });
                    }
                });
        } catch (e) {
            // read error
        }

    }

    // tarifi stugum

    // setTariff = async () => {
    //     try {
    //         let userToken = await AsyncStorage.getItem('userToken');
    //         let AuthStr = 'Bearer ' + userToken;
    //         fetch(`https://lk.e-zh.ru/api/user/tariff`, {
    //                 method: "POST",
    //                 headers: {'Authorization': AuthStr},
    //             }
    //         )
    //             .then((response) => {
    //                 return response.json()
    //             })
    //             .then((response) => {
    //                 this.setState({
    //                     tariffInfo: response
    //
    //                 })
    //                 //  console.log(this.state.tariffInfo, ' TARIF INFO')
    //             })
    //     } catch (e) {
    //         console.log("ERROR")
    //     }
    // }

    setTariffInfo = async () => {
        let userToken = await AsyncStorage.getItem('userToken');
        let AuthStr = 'Bearer ' + userToken;
        try {
            fetch(`https://lk.e-zh.ru/api/user/is_demo`, {

                method: 'POST',
                headers: {'Authorization': AuthStr}
            }).then((response) => {
                return response.json()
            })
                .then((response) => {
                    this.setState({
                        isDemo: response
                    })
                    console.log(response, ' TARIF ACTIVE')
                })
        } catch (e) {
            //////
        }
    }


    componentDidMount() {
        this.setAuthUserInfo().then(r => console.log());
        this.setShopList().then(r => console.log());
        this.setTariffInfo().then(r => console.log())

        this.focusListener = this.props.navigation.addListener("focus", () => {
            this.setState({
                loading: true
            })
            this.setTariffInfo().then(r => console.log())
        });
    }

    static contextType = AuthContext

    signOut = () => {
        this.context.signOut();
        AsyncStorage.removeItem('userToken');
    }

    render() {
        console.log(this.state.refreshing)
        return (
            <View style={styles.container}>

                <HeaderComponent
                    user_info={{'name': this.state.user_name, 'email': this.state.user_email}}
                    navigation={this.props.navigation}
                    isDemo={this.state.isDemo}
                />


                {this.state.shop_list.length === 0 &&
                    <ConnectShopMessage onRefresh={this._onRefresh} closeModal={this.handleRefreshModal} right={this.state.right}/>}

                {this.state.shop_list.length !== 0 && this.state.isDemo === true ?
                    <ChooseTareefMessage onRefresh={this._onRefresh} closeModal={this.handleRefreshModal} right={this.state.right}/> : null}


                <ScrollView nestedScrollEnabled={true} style={styles.mainBodyWrapper} ref={(e) => {
                    this.fScroll = e
                }} refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                    />
                }>
                    <StatisticsCardsComponent
                        refresh={this.state.refreshing}
                        changeShopId={this.handleChangeShopId.bind(this)}
                        onDateChange={this.changeSortOfDate}
                    />
                    {this.state.shop_list.length !== 0 && <View>
                        <ChartComponent
                            refresh={this.state.refreshing}
                            shop_id={this.state.shop_id}
                            changeShopId={this.handleChangeShopId.bind(this)}
                        />
                        <OrderListComponent
                            fscroll={this.fScroll}
                            refresh={this.state.refreshing}
                            navigationProps={this.props.navigation}
                            sortData={this.state.sortOfDate}
                            shop_id={this.state.shop_id}
                            isDemo={this.state.isDemo}
                        />
                    </View>}
                    <View style={{height: 20, width: '100%'}}></View>
                </ScrollView>

            </View>
        );
    }
}


const styles = StyleSheet.create({
    slider: {
        alignSelf: 'center',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    buttonSelected: {
        width: 20,
        height: 20,
        borderRadius: 15,
        backgroundColor: '#00203314',
    },
    buttonInActive: {
        width: 10,
        height: 10,
        borderRadius: 15,
        backgroundColor: '#00203314',
    },
    dotButtonsWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        top: -40
    },
    viewBox: {
        // paddingHorizontal: 20,
        justifyContent: 'flex-start',
        width: width,
        alignItems: 'center',
        // backgroundColor: 'red',
    },
    ImageBackgroundWrapper: {
        // width:'100%',
        width: width - 48,
        height: 220,
        borderRadius: 7,
        // overflow: 'hidden'
    },
    ImageBackgroundInfoItemSvg: {
        marginBottom: 5
    },
    ImageBackgroundRefreshWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    ImageBackgroundRefreshBTN: {
        marginRight: 14
    },

    ImageBackgroundInfoWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10
    },

    ImageBackgroundInfoItem: {
        width: '25%',
        alignItems: 'center',

    },

    ImageBackgroundInfoItemBottom: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ImageBackgroundContainer: {
        width: '100%',
        height: '100%',
    },

    customImage: {
        width: '100%',
        height: '100%',
    },
    customSlide: {
        width: width - 48,
        backgroundColor: 'green',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 280
    },
    ImageBackground: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
        alignSelf: 'center',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        zIndex: 6
    },
    dotContainer: {
        backgroundColor: 'transparent',
        position: 'absolute',
        bottom: -5
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: StatusBar.currentHeight,

    },
    headerWrapper: {
        width: '100%',
        height: 60,
        paddingHorizontal: 23,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#00416633'
    },
    headerRight: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuToggle: {
        width: 25,
        height: 19
    },
    userInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 31
    },
    profilePhotoWrapper: {
        width: 35,
        height: 35,
        borderRadius: 80,
        overflow: 'hidden',
        marginRight: 12
    },
    profilePhoto: {
        width: '100%',
        height: '100%'
    },
    userInfoNameWrapper: {
        justifyContent: 'center',

    },
    userInfoName: {
        fontSize: 16,
        color: "#002033",
        marginTop: 5
    },
    userInfoDopInfo: {
        fontSize: 12,
        color: "#00203399"
    },
    mainBodyWrapper: {
        width: '100%',
        padding: 24,
        backgroundColor: "#fafafa",
        paddingBottom: 20
    },
    mainBodyTitle: {
        color: '#002033',
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 12
    },
    timeButtons: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    timeButton: {
        flexShrink: 1,
        height: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 4,
        paddingHorizontal: 13,
    },
    timeButtonActive: {
        backgroundColor: "#0078D2",
    },
    timeButtonTextActive: {
        color: 'white',
    },
    timeButtonText: {},
    blueBackground: {}
});
