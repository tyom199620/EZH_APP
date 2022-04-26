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
    ActivityIndicator,
    Platform
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import ImageSlider from 'react-native-image-slider';
import {BlurView} from 'expo-blur';
import ViewSlider from 'react-native-view-slider'

const screenHeight = Dimensions.get('window').height;
const {width, height} = Dimensions.get('window');
import Svg, {Path, Defs, G, ClipPath} from "react-native-svg"
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AuthContext} from "../../AuthContext/context";
import DropDownPicker from "react-native-custom-dropdown";

import moment from "moment";
import axios from 'axios';


export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tab_panel1_yesterday: false,
            tab_panel1_today: true,
            tab_panel1_week: false,
            tab_panel1_month: false,
            tab_panel1_all_time: false,
            stat_order: 1,
            statistic_data: {},
            shop_id: null,
            loading: false,
            shop_list: [],

            todayDate: moment().format('DD.MM.YYYY').toString(),
            weekFirstDayDate: moment().subtract(1,'week').format('DD.MM.YYYY'),
            weekLastDayDate: moment().format('DD.MM.YYYY'),
            monthFirstDay: moment().subtract(1,'month').format('DD.MM.YYYY'),
            monthYesterday: moment().subtract(1, 'days').format('DD.MM.YYYY'),
        }
    }


    setStatisticData = async () => {
        try {
            let userToken = await AsyncStorage.getItem('userToken');
            let AuthStr = 'Bearer ' + userToken;

            let stat_order = this.state.stat_order;
            let shop_id = this.state.shop_id;

            this.setState({loading: true})

            axios.get('https://lk.e-zh.ru/api/dashboard/stats?date=' + stat_order + '&article=null&size=null&shop_id=' + shop_id, {
                headers: {'Authorization': AuthStr},
                "content-type": "application/json",
            }).then(
                (response) => {

                    this.setState({loading: false})

                    let statistic_data = {
                        "orders_count": parseInt(response.data.orders_count).toFixed(0),
                        "sales_count": parseInt(response.data.sales_count).toFixed(0),
                        "income_orders": parseInt(response.data.income_orders).toFixed(1),
                        "income_sales": parseInt(response.data.income_sales).toFixed(1),
                        "buyout": parseInt(response.data.buyout),
                        "returns_count": parseInt(response.data.returns_count).toFixed(0),
                        "returns_price": parseInt(response.data.returns_price).toFixed(0),
                        "self_cost": parseInt(response.data.self_cost).toFixed(0),
                        "logistic": parseInt(response.data.logistic).toFixed(0),
                        "reward": parseInt(response.data.reward).toFixed(0),
                        "profit": parseInt(response.data.profit) < 0 ? 0 : response.data.profit.toFixed(0),
                        "returns_percent": parseInt(response.data.returns_percent).toFixed(0),
                        "buyout_count": parseInt(response.data.buyout_count).toFixed(0),
                        "buyout_price": parseInt(response.data.buyout_price).toFixed(0),

                        "date_start": (response.data.date_start),
                        "date_end": (response.data.date_end),

                    };

                    console.log(response.data.date_start, 'statistic')
                    this.setState({
                        statistic_data: statistic_data
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

    setShopList = async () => {
        try {
            let userToken = await AsyncStorage.getItem('userToken');
            let AuthStr = 'Bearer ' + userToken;

            axios.get('https://lk.e-zh.ru/api/shops', {
                headers: {'Authorization': AuthStr},
                "content-type": "application/json",
            }).then(
                (response) => {

                    let shops = response.data;
                    let shop_list = [
                        {
                            'label': 'Все магазины',
                            'value': null,
                        }
                    ];

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


    componentDidMount() {
        this.setStatisticData().then(r => console.log());
        this.setShopList().then(r => console.log());

    }

    componentDidUpdate(prevProps) {

        if (this.props.refresh === true && this.props.refresh !== prevProps.refresh) {

            this.setStatisticData().then(r => console.log());

        }

    }


    openTabPanel1 = async (tab_panel1_yesterday, tab_panel1_today, tab_panel1_week, tab_panel1_month, tab_panel1_all_time) => {
        let date;
        this.setState({
            tab_panel1_yesterday: tab_panel1_yesterday,
            tab_panel1_today: tab_panel1_today,
            tab_panel1_week: tab_panel1_week,
            tab_panel1_month: tab_panel1_month,
            tab_panel1_all_time: tab_panel1_all_time
        });
        if (tab_panel1_yesterday === true) {
            date = 'yesterday'
        } else if (tab_panel1_today === true) {
            date = '1'
            console.log('tab_panel1_today == open')
        } else if (tab_panel1_week === true) {
            date = '7'
            console.log('tab_panel1_week == open')
        } else if (tab_panel1_month === true) {
            date = '1+month'
        } else if (tab_panel1_all_time === true) {
            date = 'all'
            console.log('tab_panel1_all_time == open')
        }
        await this.setState({
            stat_order: date
        })

        this.setStatisticData()

        this.props.onDateChange(date)
    };


    changeShop = (item) => {
        this.setState({
            shop_id: item.value
        })

        this.props.changeShopId(item.value);


        this.setStatisticData().then(r => console.log());
    }


    render() {


        const images = [
            'https://placeimg.com/640/640/nature',
            'https://placeimg.com/640/640/people',
        ];

        return (

            <View style={styles.container}>

                <Text style={styles.mainBodyTitle}>Дашборд</Text>

                <View style={styles.timeButtons}>
                    <TouchableOpacity
                        style={this.state.tab_panel1_today === true ? {...styles.timeButton, ...styles.timeButtonActive} : {...styles.timeButton}}
                        onPress={() => {
                            this.openTabPanel1(false, true, false, false, false);
                        }}>

                        <Text style={this.state.tab_panel1_today === true ? {
                            color: 'white',
                            fontSize: 11
                        } : {color: 'black', fontSize: 11}}>Сегодня</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={this.state.tab_panel1_yesterday === true ? {...styles.timeButton, ...styles.timeButtonActive} : {...styles.timeButton}}
                        onPress={() => {
                            this.openTabPanel1(true, false, false, false, false);
                        }}>

                        <Text style={this.state.tab_panel1_yesterday === true ? {
                            color: 'white',
                            fontSize: 11
                        } : {color: 'black', fontSize: 11}}>Вчера</Text>
                    </TouchableOpacity>


                    <TouchableOpacity
                        style={this.state.tab_panel1_week === true ? {...styles.timeButton, ...styles.timeButtonActive} : {...styles.timeButton}}
                        onPress={() => {
                            this.openTabPanel1(false, false, true, false, false);
                        }}>
                        <Text style={this.state.tab_panel1_week === true ? {
                            color: 'white',
                            fontSize: 11
                        } : {color: 'black', fontSize: 11}}>Неделя</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={this.state.tab_panel1_month === true ? {...styles.timeButton, ...styles.timeButtonActive} : {...styles.timeButton}}
                        onPress={() => {
                            this.openTabPanel1(false, false, false, true, false);
                        }}>
                        <Text style={this.state.tab_panel1_month === true ? {
                            color: 'white',
                            fontSize: 11
                        } : {color: 'black', fontSize: 11}}>Месяц</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={this.state.tab_panel1_all_time === true ? {...styles.timeButton, ...styles.timeButtonActive} : {...styles.timeButton}}
                        onPress={() => {
                            this.openTabPanel1(false, false, false, false, true);
                        }}>
                        <Text style={this.state.tab_panel1_all_time === true ? {
                            color: 'white',
                            fontSize: 11
                        } : {color: 'black', fontSize: 11}}>Всё время</Text>
                    </TouchableOpacity>

                </View>


                <View style={[{width: '100%', marginBottom: 20}, (Platform.OS === 'ios') ? {zIndex: 30} : {}]}>
                    <DropDownPicker
                        items={this.state.shop_list}
                        defaultValue={this.state.filterCategory}
                        containerStyle={{height: 45}}
                        style={{
                            backgroundColor: '#fff',
                            width: '100%',
                        }}
                        placeholder='Магазины'
                        labelStyle={{
                            color: '#4C4C66',
                            width: '100%',
                        }}
                        itemStyle={{
                            justifyContent: 'flex-start',
                            height: 35
                        }}
                        dropDownStyle={{backgroundColor: '#fff'}}
                        onChangeItem={item => this.changeShop(item)}
                    />
                </View>

                <ImageSlider
                    style={{}}
                    images={images}
                    customSlide={({index, item, style, width}) => (
                        <View key={index} style={[style, styles.customSlide, {backgroundColor: '#fafafa'}]}>
                            {this.state.loading === true ?
                                <View style={{
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'white'
                                }}>
                                    <ActivityIndicator size="large" color="0078D2"/>
                                </View>
                                : null}
                            {
                                index % 2 === 0 ?
                                    <View style={styles.ImageBackgroundWrapper}>

                                        <ImageBackground source={require('../../../assets/img/blue.png')}
                                                         resizeMode="cover" style={styles.ImageBackground}>
                                            <View style={{width: '100%'}}>

                                                <View style={{marginTop: 10,}}>
                                                    {this.state.tab_panel1_yesterday === true ?
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignSelf: 'center'
                                                        }}>
                                                            <View>
                                                                <Svg style={[styles.ImageBackgroundInfoItemSvg,]}
                                                                     width={25}
                                                                     height={24} viewBox="0 0 25 24" fill="none"
                                                                     xmlns="http://www.w3.org/2000/svg">
                                                                    <Path
                                                                        d="M5.07129 1C4.519 1 4.07129 1.44772 4.07129 2V3H2.07129C1.519 3 1.07129 3.44772 1.07129 4V14C1.07129 14.5523 1.519 15 2.07129 15H14.0713C14.6236 15 15.0713 14.5523 15.0713 14V4C15.0713 3.44772 14.6236 3 14.0713 3H12.0713V2C12.0713 1.44772 11.6236 1 11.0713 1C10.519 1 10.0713 1.44772 10.0713 2V3H6.07129V2C6.07129 1.44772 5.62357 1 5.07129 1ZM3.07129 7H13.0713V13H3.07129V7Z"
                                                                        fill="white" fill="#fff"/>
                                                                </Svg>
                                                            </View>
                                                            <Text style={{
                                                                color: 'white',
                                                            }}>
                                                                с {this.state.monthYesterday} по {this.state.todayDate}
                                                            </Text>
                                                        </View>
                                                        : null}

                                                    {this.state.tab_panel1_today === true ?
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignSelf: 'center'
                                                        }}>
                                                            <View>
                                                                <Svg style={[styles.ImageBackgroundInfoItemSvg,]}
                                                                     width={25}
                                                                     height={24} viewBox="0 0 25 24" fill="none"
                                                                     xmlns="http://www.w3.org/2000/svg">
                                                                    <Path
                                                                        d="M5.07129 1C4.519 1 4.07129 1.44772 4.07129 2V3H2.07129C1.519 3 1.07129 3.44772 1.07129 4V14C1.07129 14.5523 1.519 15 2.07129 15H14.0713C14.6236 15 15.0713 14.5523 15.0713 14V4C15.0713 3.44772 14.6236 3 14.0713 3H12.0713V2C12.0713 1.44772 11.6236 1 11.0713 1C10.519 1 10.0713 1.44772 10.0713 2V3H6.07129V2C6.07129 1.44772 5.62357 1 5.07129 1ZM3.07129 7H13.0713V13H3.07129V7Z"
                                                                        fill="white" fill="#fff"/>
                                                                </Svg>
                                                            </View>
                                                            <Text style={{
                                                                color: 'white',
                                                            }}>
                                                                с {this.state.todayDate} по {this.state.todayDate}
                                                            </Text>
                                                        </View>
                                                        : null}

                                                    {this.state.tab_panel1_week === true ?
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignSelf: 'center'
                                                        }}>
                                                            <View>
                                                                <Svg style={[styles.ImageBackgroundInfoItemSvg,]}
                                                                     width={25}
                                                                     height={24} viewBox="0 0 25 24" fill="none"
                                                                     xmlns="http://www.w3.org/2000/svg">
                                                                    <Path
                                                                        d="M5.07129 1C4.519 1 4.07129 1.44772 4.07129 2V3H2.07129C1.519 3 1.07129 3.44772 1.07129 4V14C1.07129 14.5523 1.519 15 2.07129 15H14.0713C14.6236 15 15.0713 14.5523 15.0713 14V4C15.0713 3.44772 14.6236 3 14.0713 3H12.0713V2C12.0713 1.44772 11.6236 1 11.0713 1C10.519 1 10.0713 1.44772 10.0713 2V3H6.07129V2C6.07129 1.44772 5.62357 1 5.07129 1ZM3.07129 7H13.0713V13H3.07129V7Z"
                                                                        fill="white" fill="#fff"/>
                                                                </Svg>
                                                            </View>
                                                            <Text style={{
                                                                color: 'white',
                                                            }}>
                                                                с {this.state.weekFirstDayDate} по {this.state.weekLastDayDate}
                                                            </Text>
                                                        </View>
                                                        : null}

                                                    {this.state.tab_panel1_month === true ?
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignSelf: 'center'
                                                        }}>
                                                            <View>
                                                                <Svg style={[styles.ImageBackgroundInfoItemSvg,]}
                                                                     width={25}
                                                                     height={24} viewBox="0 0 25 24" fill="none"
                                                                     xmlns="http://www.w3.org/2000/svg">
                                                                    <Path
                                                                        d="M5.07129 1C4.519 1 4.07129 1.44772 4.07129 2V3H2.07129C1.519 3 1.07129 3.44772 1.07129 4V14C1.07129 14.5523 1.519 15 2.07129 15H14.0713C14.6236 15 15.0713 14.5523 15.0713 14V4C15.0713 3.44772 14.6236 3 14.0713 3H12.0713V2C12.0713 1.44772 11.6236 1 11.0713 1C10.519 1 10.0713 1.44772 10.0713 2V3H6.07129V2C6.07129 1.44772 5.62357 1 5.07129 1ZM3.07129 7H13.0713V13H3.07129V7Z"
                                                                        fill="white" fill="#fff"/>
                                                                </Svg>
                                                            </View>
                                                            <Text style={{
                                                                color: 'white',
                                                            }}>
                                                                с {this.state.monthFirstDay} по {this.state.todayDate}
                                                            </Text>
                                                        </View>
                                                        : null}

                                                    {this.state.tab_panel1_all_time === true ?
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignSelf: 'center'
                                                        }}>
                                                            <View>
                                                                <Svg style={[styles.ImageBackgroundInfoItemSvg,]}
                                                                     width={25}
                                                                     height={24} viewBox="0 0 25 24" fill="none"
                                                                     xmlns="http://www.w3.org/2000/svg">
                                                                    <Path
                                                                        d="M5.07129 1C4.519 1 4.07129 1.44772 4.07129 2V3H2.07129C1.519 3 1.07129 3.44772 1.07129 4V14C1.07129 14.5523 1.519 15 2.07129 15H14.0713C14.6236 15 15.0713 14.5523 15.0713 14V4C15.0713 3.44772 14.6236 3 14.0713 3H12.0713V2C12.0713 1.44772 11.6236 1 11.0713 1C10.519 1 10.0713 1.44772 10.0713 2V3H6.07129V2C6.07129 1.44772 5.62357 1 5.07129 1ZM3.07129 7H13.0713V13H3.07129V7Z"
                                                                        fill="white" fill="#fff"/>
                                                                </Svg>
                                                            </View>
                                                            <Text style={{
                                                                color: 'white',
                                                            }}>
                                                                с {this.state.statistic_data.date_start} по {this.state.statistic_data.date_end}
                                                            </Text>
                                                        </View>
                                                        : null}

                                                </View>
                                            </View>
                                            <View style={styles.ImageBackgroundContainer}>

                                                <View style={styles.ImageBackgroundRefreshWrapper}>
                                                    {/*<TouchableOpacity style={styles.ImageBackgroundRefreshBTN}>*/}
                                                    {/*    <Svg width={12} height={12} viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                                                    {/*        <Path d="M.5 0l1.18 1.376A5 5 0 0110.024 4H9v.004a4.002 4.002 0 00-6.668-1.867L3.5 3.5H0L.5 0zM.917 7.886A5 5 0 01.102 6h1.025a4.002 4.002 0 006.667 1.863L6.626 6.5h3.5l-.5 3.5-1.18-1.376a5 5 0 01-7.529-.738z"  fill="#fff" />*/}
                                                    {/*    </Svg>*/}
                                                    {/*</TouchableOpacity>*/}
                                                    {/*<Text style={{fontSize:12, color:'white'}}>обновлено </Text>*/}
                                                    {/*<Text style={{fontSize:12, color:'white'}}>сегодня </Text>*/}
                                                    {/*<Text style={{fontSize:12, color:'white'}}>в </Text>*/}
                                                    {/*<Text style={{fontSize:12, color:'white'}}>14:25 </Text>*/}
                                                </View>

                                                <View style={styles.ImageBackgroundInfoWrapper}>

                                                    {/*ЗАКАЗЫ*/}
                                                    <View style={styles.ImageBackgroundInfoItem}>

                                                        <Svg style={styles.ImageBackgroundInfoItemSvg} width={25}
                                                             height={24} viewBox="0 0 25 24" fill="none"
                                                             xmlns="http://www.w3.org/2000/svg">
                                                            <Path
                                                                d="M11.133 9h2.006V6h3.009V4h-3.01V1h-2.005v3h-3.01v2h3.01v3zM7.12 18a2 2 0 000 4c1.103 0 2.006-.9 2.006-2s-.903-2-2.006-2zm10.03 0a2 2 0 000 4c1.103 0 2.005-.9 2.005-2s-.902-2-2.006-2zm-9.86-3.25l.03-.12.903-1.63h7.472c.752 0 1.414-.41 1.755-1.03l3.872-7.01L19.578 4h-.01l-1.104 2-2.768 5h-7.04l-.131-.27L6.278 6l-.952-2-.943-2h-3.28v2H3.11l3.61 7.59-1.353 2.45c-.16.28-.251.61-.251.96 0 1.1.903 2 2.006 2h12.035v-2H7.542c-.13 0-.25-.11-.25-.25z"
                                                                fill="#fff"/>
                                                        </Svg>

                                                        <Text style={{
                                                            fontSize: 10,
                                                            color: 'white',
                                                            marginBottom: 15
                                                        }}>ЗАКАЗЫ</Text>
                                                        <Text style={{
                                                            fontSize: 15,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            marginBottom: 10
                                                        }}>{Math.floor(Math.round(this.state.statistic_data.income_orders))} ₽</Text>
                                                        <Text style={{
                                                            fontSize: 9,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            marginBottom: 35
                                                        }}> {this.state.statistic_data.orders_count} шт.</Text>

                                                        {/*<View style={styles.ImageBackgroundInfoItemBottom}>*/}
                                                        {/*    <Svg width={9} height={8} viewBox="0 0 9 8" fill="none"*/}
                                                        {/*         xmlns="http://www.w3.org/2000/svg">*/}
                                                        {/*        <Path*/}
                                                        {/*            d="M4.822 4.571L3.607 5.724a1.191 1.191 0 01-1.621 0 1.047 1.047 0 010-1.537L3.2 3.035 0 0h8.024v7.606L4.822 4.57z"*/}
                                                        {/*            fill="#fff"/>*/}
                                                        {/*    </Svg>*/}
                                                        {/*    <Text style={{*/}
                                                        {/*        fontSize: 10,*/}
                                                        {/*        color: 'white',*/}
                                                        {/*        fontWeight: 'bold',*/}
                                                        {/*        marginLeft: 2*/}
                                                        {/*    }}>+6%</Text>*/}
                                                        {/*</View>*/}
                                                    </View>


                                                    {/*ПРОДАЖИ*/}
                                                    <View style={styles.ImageBackgroundInfoItem}>
                                                        <Svg style={styles.ImageBackgroundInfoItemSvg} width={25}
                                                             height={24} viewBox="0 0 25 24" fill="none"
                                                             xmlns="http://www.w3.org/2000/svg">
                                                            <Path
                                                                d="M17.2 3.6H7.573c-.662 0-1.203.54-1.203 1.2V6c0 .66.541 1.2 1.203 1.2h9.629c.662 0 1.203-.54 1.203-1.2V4.8c0-.66-.541-1.2-1.203-1.2zm0 2.4H7.573V4.8h9.629V6zm2.408 14.4H5.165c-.662 0-1.203-.54-1.203-1.2V18h16.85v1.2c0 .66-.542 1.2-1.204 1.2zM17.513 9.132a1.208 1.208 0 00-1.107-.732h-8.04c-.48 0-.914.288-1.107.732L3.962 16.8h16.85l-3.299-7.668zM9.678 15.6h-.601a.595.595 0 01-.602-.6c0-.336.265-.6.602-.6h.601c.337 0 .602.264.602.6 0 .336-.265.6-.602.6zm0-2.4h-.601a.595.595 0 01-.602-.6c0-.336.265-.6.602-.6h.601c.337 0 .602.264.602.6 0 .336-.265.6-.602.6zm0-2.4h-.601a.595.595 0 01-.602-.6c0-.336.265-.6.602-.6h.601c.337 0 .602.264.602.6 0 .336-.265.6-.602.6zm3.01 4.8h-.603a.595.595 0 01-.601-.6c0-.336.264-.6.601-.6h.602c.337 0 .602.264.602.6 0 .336-.265.6-.602.6zm0-2.4h-.603a.595.595 0 01-.601-.6c0-.336.264-.6.601-.6h.602c.337 0 .602.264.602.6 0 .336-.265.6-.602.6zm0-2.4h-.603a.595.595 0 01-.601-.6c0-.336.264-.6.601-.6h.602c.337 0 .602.264.602.6 0 .336-.265.6-.602.6zm3.008 4.8h-.602a.595.595 0 01-.601-.6c0-.336.264-.6.601-.6h.602c.337 0 .602.264.602.6 0 .336-.265.6-.602.6zm0-2.4h-.602a.595.595 0 01-.601-.6c0-.336.264-.6.601-.6h.602c.337 0 .602.264.602.6 0 .336-.265.6-.602.6zm0-2.4h-.602a.595.595 0 01-.601-.6c0-.336.264-.6.601-.6h.602c.337 0 .602.264.602.6 0 .336-.265.6-.602.6z"
                                                                fill="#fff"/>
                                                        </Svg>
                                                        <Text style={{
                                                            fontSize: 10,
                                                            color: 'white',
                                                            marginBottom: 15
                                                        }}>ПРОДАЖИ</Text>
                                                        <Text style={{
                                                            fontSize: 15,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            marginBottom: 10
                                                        }}> {Math.floor(Math.round(this.state.statistic_data.income_sales))} ₽</Text>
                                                        <Text style={{
                                                            fontSize: 9,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            marginBottom: 35
                                                        }}> {this.state.statistic_data.sales_count} шт.</Text>

                                                        {/*<View style={styles.ImageBackgroundInfoItemBottom}>*/}
                                                        {/*    <Svg width={8} height={8} viewBox="0 0 8 8" fill="none"*/}
                                                        {/*         xmlns="http://www.w3.org/2000/svg">*/}
                                                        {/*        <Path*/}
                                                        {/*            d="M4.808 3.034L3.596 1.883a1.185 1.185 0 00-1.616 0 1.05 1.05 0 000 1.537L3.192 4.57 0 7.606h8V0L4.808 3.034z"*/}
                                                        {/*            fill="#fff"/>*/}
                                                        {/*    </Svg>*/}
                                                        {/*    <Text style={{*/}
                                                        {/*        fontSize: 10,*/}
                                                        {/*        color: 'white',*/}
                                                        {/*        fontWeight: 'bold',*/}
                                                        {/*        marginLeft: 2*/}
                                                        {/*    }}>-6%</Text>*/}
                                                        {/*</View>*/}
                                                    </View>

                                                    {/*ВЫКУП*/}
                                                    <View style={styles.ImageBackgroundInfoItem}>

                                                        <Svg style={styles.ImageBackgroundInfoItemSvg} width={25}
                                                             height={24} viewBox="0 0 25 24" fill="none"
                                                             xmlns="http://www.w3.org/2000/svg">
                                                            <Path
                                                                d="M21.655 18v1c0 1.1-.903 2-2.006 2H5.608c-1.114 0-2.006-.9-2.006-2V5c0-1.1.892-2 2.006-2h14.04c1.104 0 2.007.9 2.007 2v1h-9.027c-1.113 0-2.006.9-2.006 2v8c0 1.1.893 2 2.006 2h9.027zm-9.027-2h10.03V8h-10.03v8zm4.012-2.5a1.5 1.5 0 110-3 1.5 1.5 0 110 3z"
                                                                fill="#fff"/>
                                                        </Svg>

                                                        <Text style={{
                                                            fontSize: 10,
                                                            color: 'white',
                                                            marginBottom: 15
                                                        }}>ВЫКУП</Text>
                                                        <Text style={{
                                                            fontSize: 15,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            marginBottom: 10
                                                        }}>{this.state.statistic_data.buyout_price} ₽</Text>
                                                        <Text style={{
                                                            fontSize: 9,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            marginBottom: 35
                                                        }}>{this.state.statistic_data.buyout_count} шт.</Text>

                                                        {/*<View style={styles.ImageBackgroundInfoItemBottom}>*/}
                                                        {/*    <Svg width={9} height={8} viewBox="0 0 9 8" fill="none"*/}
                                                        {/*         xmlns="http://www.w3.org/2000/svg">*/}
                                                        {/*        <Path*/}
                                                        {/*            d="M4.822 4.571L3.607 5.724a1.191 1.191 0 01-1.621 0 1.047 1.047 0 010-1.537L3.2 3.035 0 0h8.024v7.606L4.822 4.57z"*/}
                                                        {/*            fill="#fff"/>*/}
                                                        {/*    </Svg>*/}
                                                        {/*    <Text style={{*/}
                                                        {/*        fontSize: 10,*/}
                                                        {/*        color: 'white',*/}
                                                        {/*        fontWeight: 'bold',*/}
                                                        {/*        marginLeft: 2*/}
                                                        {/*    }}>+7%</Text>*/}
                                                        {/*</View>*/}
                                                    </View>


                                                    {/*ВОЗВРАТЫ*/}
                                                    <View style={styles.ImageBackgroundInfoItem}>
                                                        <Svg width={35} height={30} viewBox="0 0 25 24" fill="none"
                                                             xmlns="http://www.w3.org/2000/svg">
                                                            <Path
                                                                d="M10.861 9V5l-7.02 7 7.02 7v-4.1c5.015 0 8.526 1.6 11.033 5.1-1.003-5-4.012-10-11.033-11z"
                                                                fill="#fff"/>
                                                        </Svg>
                                                        <Text style={{
                                                            fontSize: 10,
                                                            color: 'white',
                                                            marginBottom: 15
                                                        }}>ВОЗВРАТЫ</Text>
                                                        <Text style={{
                                                            fontSize: 15,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            marginBottom: 10
                                                        }}>{this.state.statistic_data.returns_price} ₽</Text>
                                                        <Text style={{
                                                            fontSize: 9,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            marginBottom: 35
                                                        }}> {this.state.statistic_data.returns_count} шт.</Text>

                                                        {/*<View style={styles.ImageBackgroundInfoItemBottom}>*/}
                                                        {/*    <Svg width={8} height={8} viewBox="0 0 8 8" fill="none"*/}
                                                        {/*         xmlns="http://www.w3.org/2000/svg">*/}
                                                        {/*        <Path*/}
                                                        {/*            d="M4.808 3.034L3.596 1.883a1.185 1.185 0 00-1.616 0 1.05 1.05 0 000 1.537L3.192 4.57 0 7.606h8V0L4.808 3.034z"*/}
                                                        {/*            fill="#fff"/>*/}
                                                        {/*    </Svg>*/}
                                                        {/*    <Text style={{*/}
                                                        {/*        fontSize: 10,*/}
                                                        {/*        color: 'white',*/}
                                                        {/*        fontWeight: 'bold',*/}
                                                        {/*        marginLeft: 2*/}
                                                        {/*    }}>-5%</Text>*/}
                                                        {/*</View>*/}
                                                    </View>

                                                </View>
                                            </View>

                                        </ImageBackground>

                                        <Image style={{
                                            position: 'absolute',
                                            zIndex: 5,
                                            top: 50,
                                            width: '100%',
                                            height: 222,
                                            opacity: 0.7
                                        }} source={require('../../../assets/img/blushadow.png')}/>
                                    </View>

                                    :

                                    <View style={styles.ImageBackgroundWrapper}>

                                        <ImageBackground source={require('../../../assets/img/green.png')}
                                                         resizeMode="cover" style={styles.ImageBackground}>
                                            <View style={{width: '100%'}}>

                                                <View style={{marginTop: 10,}}>
                                                    {this.state.tab_panel1_today === true ?
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignSelf: 'center'
                                                        }}>
                                                            <View>
                                                                <Svg style={[styles.ImageBackgroundInfoItemSvg,]}
                                                                     width={25}
                                                                     height={24} viewBox="0 0 25 24" fill="none"
                                                                     xmlns="http://www.w3.org/2000/svg">
                                                                    <Path
                                                                        d="M5.07129 1C4.519 1 4.07129 1.44772 4.07129 2V3H2.07129C1.519 3 1.07129 3.44772 1.07129 4V14C1.07129 14.5523 1.519 15 2.07129 15H14.0713C14.6236 15 15.0713 14.5523 15.0713 14V4C15.0713 3.44772 14.6236 3 14.0713 3H12.0713V2C12.0713 1.44772 11.6236 1 11.0713 1C10.519 1 10.0713 1.44772 10.0713 2V3H6.07129V2C6.07129 1.44772 5.62357 1 5.07129 1ZM3.07129 7H13.0713V13H3.07129V7Z"
                                                                        fill="white" fill="#fff"/>
                                                                </Svg>
                                                            </View>
                                                            <Text style={{
                                                                color: 'white',
                                                            }}>
                                                                с {this.state.todayDate} по {this.state.todayDate}
                                                            </Text>
                                                        </View>
                                                        : null}

                                                    {this.state.tab_panel1_week === true ?
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignSelf: 'center'
                                                        }}>
                                                            <View>
                                                                <Svg style={[styles.ImageBackgroundInfoItemSvg,]}
                                                                     width={25}
                                                                     height={24} viewBox="0 0 25 24" fill="none"
                                                                     xmlns="http://www.w3.org/2000/svg">
                                                                    <Path
                                                                        d="M5.07129 1C4.519 1 4.07129 1.44772 4.07129 2V3H2.07129C1.519 3 1.07129 3.44772 1.07129 4V14C1.07129 14.5523 1.519 15 2.07129 15H14.0713C14.6236 15 15.0713 14.5523 15.0713 14V4C15.0713 3.44772 14.6236 3 14.0713 3H12.0713V2C12.0713 1.44772 11.6236 1 11.0713 1C10.519 1 10.0713 1.44772 10.0713 2V3H6.07129V2C6.07129 1.44772 5.62357 1 5.07129 1ZM3.07129 7H13.0713V13H3.07129V7Z"
                                                                        fill="white" fill="#fff"/>
                                                                </Svg>
                                                            </View>
                                                            <Text style={{
                                                                color: 'white',
                                                            }}>
                                                                с {this.state.weekFirstDayDate} по {this.state.weekLastDayDate}
                                                            </Text>
                                                        </View>
                                                        : null}

                                                    {this.state.tab_panel1_month === true ?
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignSelf: 'center'
                                                        }}>
                                                            <View>
                                                                <Svg style={[styles.ImageBackgroundInfoItemSvg,]}
                                                                     width={25}
                                                                     height={24} viewBox="0 0 25 24" fill="none"
                                                                     xmlns="http://www.w3.org/2000/svg">
                                                                    <Path
                                                                        d="M5.07129 1C4.519 1 4.07129 1.44772 4.07129 2V3H2.07129C1.519 3 1.07129 3.44772 1.07129 4V14C1.07129 14.5523 1.519 15 2.07129 15H14.0713C14.6236 15 15.0713 14.5523 15.0713 14V4C15.0713 3.44772 14.6236 3 14.0713 3H12.0713V2C12.0713 1.44772 11.6236 1 11.0713 1C10.519 1 10.0713 1.44772 10.0713 2V3H6.07129V2C6.07129 1.44772 5.62357 1 5.07129 1ZM3.07129 7H13.0713V13H3.07129V7Z"
                                                                        fill="white" fill="#fff"/>
                                                                </Svg>
                                                            </View>
                                                            <Text style={{
                                                                color: 'white',
                                                            }}>
                                                                с {this.state.monthFirstDay} по {this.state.todayDate}
                                                            </Text>
                                                        </View>
                                                        : null}

                                                    {this.state.tab_panel1_all_time === true ?
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignSelf: 'center'
                                                        }}>
                                                            <View>
                                                                <Svg style={[styles.ImageBackgroundInfoItemSvg,]}
                                                                     width={25}
                                                                     height={24} viewBox="0 0 25 24" fill="none"
                                                                     xmlns="http://www.w3.org/2000/svg">
                                                                    <Path
                                                                        d="M5.07129 1C4.519 1 4.07129 1.44772 4.07129 2V3H2.07129C1.519 3 1.07129 3.44772 1.07129 4V14C1.07129 14.5523 1.519 15 2.07129 15H14.0713C14.6236 15 15.0713 14.5523 15.0713 14V4C15.0713 3.44772 14.6236 3 14.0713 3H12.0713V2C12.0713 1.44772 11.6236 1 11.0713 1C10.519 1 10.0713 1.44772 10.0713 2V3H6.07129V2C6.07129 1.44772 5.62357 1 5.07129 1ZM3.07129 7H13.0713V13H3.07129V7Z"
                                                                        fill="white" fill="#fff"/>
                                                                </Svg>
                                                            </View>
                                                            <Text style={{
                                                                color: 'white',
                                                            }}>
                                                                с {this.state.statistic_data.date_start} по {this.state.statistic_data.date_end}
                                                            </Text>
                                                        </View>
                                                        : null}

                                                </View>
                                            </View>
                                            <View style={styles.ImageBackgroundContainer}>

                                                <View style={styles.ImageBackgroundRefreshWrapper}>
                                                    {/*<TouchableOpacity style={styles.ImageBackgroundRefreshBTN}>*/}
                                                    {/*    <Svg width={12} height={12} viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                                                    {/*        <Path d="M.5 0l1.18 1.376A5 5 0 0110.024 4H9v.004a4.002 4.002 0 00-6.668-1.867L3.5 3.5H0L.5 0zM.917 7.886A5 5 0 01.102 6h1.025a4.002 4.002 0 006.667 1.863L6.626 6.5h3.5l-.5 3.5-1.18-1.376a5 5 0 01-7.529-.738z"  fill="#fff" />*/}
                                                    {/*    </Svg>*/}
                                                    {/*</TouchableOpacity>*/}
                                                    {/*<Text style={{fontSize:12, color:'white'}}>обновлено </Text>*/}
                                                    {/*<Text style={{fontSize:12, color:'white'}}>сегодня </Text>*/}
                                                    {/*<Text style={{fontSize:12, color:'white'}}>в </Text>*/}
                                                    {/*<Text style={{fontSize:12, color:'white'}}>14:25 </Text>*/}
                                                </View>

                                                <View style={styles.ImageBackgroundInfoWrapper}>

                                                    {/*Прибыль*/}
                                                    <View style={styles.ImageBackgroundInfoItem}>

                                                        <Svg style={styles.ImageBackgroundInfoItemSvg} width={24}
                                                             height={24} viewBox="0 0 24 24" fill="none"
                                                             xmlns="http://www.w3.org/2000/svg">
                                                            <Path
                                                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"
                                                                fill="#fff"/>
                                                        </Svg>
                                                        <Text style={{
                                                            fontSize: 10,
                                                            color: 'white',
                                                            marginBottom: 15
                                                        }}>ПРИБЫЛЬ</Text>
                                                        <Text style={{
                                                            fontSize: 15,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            marginBottom: 35
                                                        }}>{Math.floor(Math.round(this.state.statistic_data.profit))} ₽</Text>

                                                        {/*<View style={styles.ImageBackgroundInfoItemBottom}>*/}
                                                        {/*    <Svg width={9} height={8} viewBox="0 0 9 8" fill="none"*/}
                                                        {/*         xmlns="http://www.w3.org/2000/svg">*/}
                                                        {/*        <Path*/}
                                                        {/*            d="M4.822 4.571L3.607 5.724a1.191 1.191 0 01-1.621 0 1.047 1.047 0 010-1.537L3.2 3.035 0 0h8.024v7.606L4.822 4.57z"*/}
                                                        {/*            fill="#fff"/>*/}
                                                        {/*    </Svg>*/}
                                                        {/*    <Text style={{*/}
                                                        {/*        fontSize: 10,*/}
                                                        {/*        color: 'white',*/}
                                                        {/*        fontWeight: 'bold',*/}
                                                        {/*        marginLeft: 2*/}
                                                        {/*    }}>+6%</Text>*/}
                                                        {/*</View>*/}
                                                    </View>

                                                    {/*СЕБЕСТОИМ*/}
                                                    <View style={styles.ImageBackgroundInfoItem}>

                                                        <Svg style={styles.ImageBackgroundInfoItemSvg} width={24}
                                                             height={24} viewBox="0 0 24 24" fill="none"
                                                             xmlns="http://www.w3.org/2000/svg">
                                                            <Path
                                                                d="M21.41 11.41l-8.83-8.83c-.37-.37-.88-.58-1.41-.58H4c-1.1 0-2 .9-2 2v7.17c0 .53.21 1.04.59 1.41l8.83 8.83c.78.78 2.05.78 2.83 0l7.17-7.17c.78-.78.78-2.04-.01-2.83zM6.5 8C5.67 8 5 7.33 5 6.5S5.67 5 6.5 5 8 5.67 8 6.5 7.33 8 6.5 8z"
                                                                fill="#fff"/>
                                                        </Svg>

                                                        <Text style={{
                                                            fontSize: 10,
                                                            color: 'white',
                                                            marginBottom: 15
                                                        }}>СЕБЕСТОИМ.</Text>
                                                        <Text style={{
                                                            fontSize: 15,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            marginBottom: 35
                                                        }}> {Math.floor(Math.round(this.state.statistic_data.self_cost))} ₽</Text>

                                                        {/*<View style={styles.ImageBackgroundInfoItemBottom}>*/}
                                                        {/*    <Svg width={8} height={8} viewBox="0 0 8 8" fill="none"*/}
                                                        {/*         xmlns="http://www.w3.org/2000/svg">*/}
                                                        {/*        <Path*/}
                                                        {/*            d="M4.808 3.034L3.596 1.883a1.185 1.185 0 00-1.616 0 1.05 1.05 0 000 1.537L3.192 4.57 0 7.606h8V0L4.808 3.034z"*/}
                                                        {/*            fill="#fff"/>*/}
                                                        {/*    </Svg>*/}
                                                        {/*    <Text style={{*/}
                                                        {/*        fontSize: 10,*/}
                                                        {/*        color: 'white',*/}
                                                        {/*        fontWeight: 'bold',*/}
                                                        {/*        marginLeft: 2*/}
                                                        {/*    }}>-6%</Text>*/}
                                                        {/*</View>*/}
                                                    </View>

                                                    {/*ЛОГИСТИКА*/}
                                                    <View style={styles.ImageBackgroundInfoItem}>

                                                        <Svg style={styles.ImageBackgroundInfoItemSvg} width={24}
                                                             height={24} viewBox="0 0 24 24" fill="none"
                                                             xmlns="http://www.w3.org/2000/svg">
                                                            <Path
                                                                d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
                                                                fill="#fff"/>
                                                        </Svg>
                                                        <Text style={{
                                                            fontSize: 10,
                                                            color: 'white',
                                                            marginBottom: 15
                                                        }}>ЛОГИСТИКА</Text>
                                                        <Text style={{
                                                            fontSize: 15,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            marginBottom: 35
                                                        }}>{this.state.statistic_data.logistic}₽</Text>

                                                        {/*<View style={styles.ImageBackgroundInfoItemBottom}>*/}
                                                        {/*    <Svg width={9} height={8} viewBox="0 0 9 8" fill="none"*/}
                                                        {/*         xmlns="http://www.w3.org/2000/svg">*/}
                                                        {/*        <Path*/}
                                                        {/*            d="M4.822 4.571L3.607 5.724a1.191 1.191 0 01-1.621 0 1.047 1.047 0 010-1.537L3.2 3.035 0 0h8.024v7.606L4.822 4.57z"*/}
                                                        {/*            fill="#fff"/>*/}
                                                        {/*    </Svg>*/}
                                                        {/*    <Text style={{*/}
                                                        {/*        fontSize: 10,*/}
                                                        {/*        color: 'white',*/}
                                                        {/*        fontWeight: 'bold',*/}
                                                        {/*        marginLeft: 2*/}
                                                        {/*    }}>+7%</Text>*/}
                                                        {/*</View>*/}
                                                    </View>


                                                    {/*ВОЗНАГРАЖД.*/}
                                                    <View style={styles.ImageBackgroundInfoItem}>

                                                        <Svg style={styles.ImageBackgroundInfoItemSvg} width={25}
                                                             height={24} viewBox="0 0 34 24" fill="none"
                                                             xmlns="http://www.w3.org/2000/svg">
                                                            <Path
                                                                d="M27.5 15V3c0-1.65-1.35-3-3-3h-21c-1.65 0-3 1.35-3 3v12c0 1.65 1.35 3 3 3h21c1.65 0 3-1.35 3-3zM14 13.5c-2.49 0-4.5-2.01-4.5-4.5s2.01-4.5 4.5-4.5 4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm19.5-9V21c0 1.65-1.35 3-3 3H5v-3h25.5V4.5h3z"
                                                                fill="#fff"/>
                                                        </Svg>
                                                        <Text style={{
                                                            fontSize: 10,
                                                            color: 'white',
                                                            marginBottom: 15
                                                        }}>ВОЗНАГРАЖД.</Text>
                                                        <Text style={{
                                                            fontSize: 15,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            marginBottom: 35
                                                        }}>{this.state.statistic_data.reward}%</Text>

                                                        {/*<View style={styles.ImageBackgroundInfoItemBottom}>*/}
                                                        {/*    <Svg width={9} height={8} viewBox="0 0 9 8" fill="none"*/}
                                                        {/*         xmlns="http://www.w3.org/2000/svg">*/}
                                                        {/*        <Path*/}
                                                        {/*            d="M4.822 4.571L3.607 5.724a1.191 1.191 0 01-1.621 0 1.047 1.047 0 010-1.537L3.2 3.035 0 0h8.024v7.606L4.822 4.57z"*/}
                                                        {/*            fill="#fff"/>*/}
                                                        {/*    </Svg>*/}
                                                        {/*    <Text style={{*/}
                                                        {/*        fontSize: 10,*/}
                                                        {/*        color: 'white',*/}
                                                        {/*        fontWeight: 'bold',*/}
                                                        {/*        marginLeft: 2*/}
                                                        {/*    }}>+7%</Text>*/}
                                                        {/*</View>*/}
                                                    </View>


                                                </View>
                                            </View>
                                        </ImageBackground>

                                        <Image style={{
                                            position: 'absolute',
                                            top: 50,
                                            zIndex: 5,
                                            width: '100%',
                                            height: 222,
                                            opacity: 0.7
                                        }} source={require('../../../assets/img/greenshadow.png')}/>

                                    </View>
                            }

                        </View>

                    )}
                    customButtons={(position, move) => (
                        <View style={styles.dotButtonsWrapper}>
                            {images.map((image, index) => {
                                return (
                                    <TouchableHighlight
                                        key={index}
                                        underlayColor="#ccc"
                                        onPress={() => move(index)}
                                        style={{marginRight: 8}}
                                    >
                                        <View
                                            style={position === index ? styles.buttonSelected : styles.buttonInActive}>

                                        </View>
                                    </TouchableHighlight>
                                );
                            })}
                        </View>
                    )}
                />
            </View>
        );
    }
}

const order_list_styles = StyleSheet.create({
    orderListWrapper: {
        backgroundColor: 'white',
        borderRadius: 5,
        width: '100%',
        height: 330,
        position: 'relative',
        // top:-20,
        padding: 20,
        marginBottom: 20
    },
    ordersListButtonsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15
    },
    orderListItemWrapper: {
        width: "100%",
        height: 70,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#0020330d',
        marginBottom: 15
    },

    orderListItemLeft: {
        width: 50,
        height: 50,
        borderRadius: 15,
        marginRight: 10
    },
    orderListItemLeftImg: {
        width: '100%',
        height: '100%',
    },
    orderListItemRight: {},
    orderListItemTittle: {
        fontSize: 12,
        color: "#002033",
        fontWeight: 'normal',
        marginBottom: 8

    },
    orderListItemInfoWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    orderListItemInfoLeft: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginRight: 13
    },
    orderListItemInfoRight: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    orderListItemInfoTitle: {},
    orderListItemInfoTitleValue: {
        color: "#0071B2",
        marginLeft: 5
    },
    showMoreOrder: {
        width: '100%',
        height: 24,
        backgroundColor: '#0078D2',
        color: 'white',
        borderRadius: 4,
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    }
})

const order_styles = StyleSheet.create({
    orderWrapper: {
        backgroundColor: 'white',
        borderRadius: 5,
        width: '100%',
        height: 350,
        position: 'relative',
        top: -20,
        padding: 20,
        marginBottom: 0
    },
    orderDesc: {
        color: '#00203399',
        fontSize: 12,
        marginBottom: 20
    },
    orderTypeWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 10
    },
    orderTypeBlue: {
        width: 12,
        height: 12,
        borderRadius: 30,
        backgroundColor: '#56B9F2',
        marginRight: 8
    },
    orderTypeGreen: {
        width: 12,
        height: 12,
        borderRadius: 30,
        backgroundColor: '#20B55F',
        marginRight: 8
    },
    orderTypeItem: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginRight: 13
    },
    orderButtons: {
        maxWidth: 220,
        // width:'100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderButtonsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
    },
    orderButtonsTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    orderButton: {

        // flexShrink: 1,
        height: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 4,
        paddingHorizontal: 11,
        // width:69
    },
    orderButtonActive: {
        backgroundColor: "#0078D2",
    },
    orderButtonTextActive: {
        color: 'white',
    },
})

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
        marginBottom: 5,

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
    container: {},
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
        paddingHorizontal: 10,

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
