import React, {Component, PureComponent} from 'react';
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
    Pressable,
    FlatList,
    ActivityIndicator, RefreshControl, Platform
} from 'react-native';

import _ from 'lodash'
import DropDownPicker from "react-native-custom-dropdown";

import * as Linking from "expo-linking";

const screenHeight = Dimensions.get('window').height;
const {width, height} = Dimensions.get('window');
import Svg, {Path, Defs, G, ClipPath, Circle} from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AuthContext} from "../../AuthContext/context";

import HeaderComponent from '../includes/header';

import axios from 'axios';
import ViewNativeComponent from "react-native/Libraries/Components/View/ViewNativeComponent";
import moment from "moment";
import ConnectShopMessage from "../includes/connectShopMessage";


export default class App extends React.PureComponent {
    constructor(props) {

        super(props);
        this.state = {
            user_name: null,
            user_email: null,

            analyticItemSmallModalVisible: null,

            today_sort: false,
            a_week_sort: false,
            a_month_sort: true,
            all_the_time: false,


            articleList: {},

            products: [],
            filteredProducts: [],


            loading: true,
            refreshing: false,

            randomNumber: null,

            shop_list: [],
            shop_id: null,

            url_date: '1+month',
            url_page: 1,
            per_page: 20,

            back_flag: false,
            next_flag: false,
            last_page: null,

            stockSort: false,
            periodSort: false,
            recommendSort: false,

            descendingSort: false,
            growthSort: false,


            firstLabel: null,
            secondLabel: null,


            //  typeSort: 'Остаткам',
            //  upAndDownSort: 'Убыванию',

            typeSortValue: 'StockCount',
            upAndDownSortValue: 'desc',

            firstDropDown: [
                {label: 'Остаткам', value: 'StockCount'},
                {label: 'Заказам', value: 'PeriodOrders'},
                {label: 'Рекомендациям', value: 'PredictStock'},
            ],
            secondDropDown: [
                {label: 'Убыванию', value: 'desc'},
                {label: 'Возрастанию', value: 'asc'},
            ],
        };
    }

    leftDropdownChange = async (item) => {
        await this.setState({
            //  typeSort: item.label,
            typeSortValue: item.value,
        })
        //  console.log(this.state.typeSortValue)
        await this.setProductAnalyticList()
    }

    rightDropdownChange = async (item) => {
        await this.setState({
            //   upAndDownSort: item.label,
            upAndDownSortValue: item.value
        })
        //  console.log(this.state.upAndDownSortValue)
        await this.setProductAnalyticList()
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
            console.log('error' + e)

        }
    }

    setAuthUserInfo = async () => {
        try {
            let userToken = await AsyncStorage.getItem('userToken');
            let AuthStr = 'Bearer ' + userToken;
            axios.get('https://lk.e-zh.ru/api/user',
                {headers: {'Authorization': AuthStr}})
                .then(response => {
                    if (response.status === 200) {
                        this.setState({
                            user_email: response.data.email,
                            user_name: response.data.name,
                        });
                    }
                });
        } catch (e) {
            console.log('error' + e)

        }
    }


    setProductAnalyticList = async () => {

        try {
            let userToken = await AsyncStorage.getItem('userToken');
            let AuthStr = 'Bearer ' + userToken;

            this.setState({loading: true})
            let {
                url_date,
                shop_id,
                url_page,
                last_page,
                typeSort,
                upAndDownSort,
                products,
                typeSortValue,
                upAndDownSortValue
            } = this.state


            // console.log('https://lk.e-zh.ru/api/goods/?size=null&article=null&date=' + url_date + '&per_page=20' + '&page=' + url_page,)


            axios.get('https://lk.e-zh.ru/api/goods/?size=null&article=null&date=' + url_date + '&shop_id=' + shop_id + '&per_page=20' + '&page=' + url_page + `&order=${typeSortValue}` + `&order_direction=${upAndDownSortValue}`, {

                headers: {'Authorization': AuthStr},
                "content-type": "application/json",
            }).then(
                (response) => {
                    let last_page = response.data.last_page

                    this.setState({
                        last_page: last_page
                    })

                    this.setState({loading: false})
                    let products = response.data.data;

                    if (!shop_id) {
                        this.setState({
                            filteredProducts: products,
                            products: products,
                        })
                        this.sortedByFilters()
                    } else {
                        this.setState({
                            filteredProducts: products.filter(el => el.shop.id == shop_id),
                            products: products
                        })
                        this.sortedByFilters()
                    }
                },


                (err) => {
                    //   console.log('err.response', err.response)
                },
            );
            //    this.sortedByFilters()

        } catch (e) {
            console.log('error' + e)
        }
    }

    handleTimeOut = () => {
        let {filteredProducts, products} = this.state

        setTimeout(() => {
            this.setState({
                loading: false
            })
        }, 1000)
    }

    sortedByFilters = async () => {
        const {typeSort, upAndDownSort, products} = this.state;

        if (typeSort === 'Остаткам' && upAndDownSort === 'Убыванию') {
            this.setState({
                loading: true,
                filteredProducts: products.sort((a, b) => b.StockCount - a.StockCount)
            })
            this.handleTimeOut()
        } else if (typeSort === 'Остаткам' && upAndDownSort === 'Возрастанию') {
            this.setState({
                loading: true,
                filteredProducts: products.sort((a, b) => a.StockCount - b.StockCount)
            })
            this.handleTimeOut()
        } else if (typeSort === 'Заказам' && upAndDownSort === 'Убыванию') {
            this.setState({
                loading: true,
                filteredProducts: products.sort((a, b) => b.PeriodOrders - a.PeriodOrders),
            })
            this.handleTimeOut()
        } else if (typeSort === 'Заказам' && upAndDownSort === 'Возрастанию') {
            this.setState({
                loading: true,
                filteredProducts: products.sort((a, b) => a.PeriodOrders - b.PeriodOrders)
            })
            this.handleTimeOut()
        } else if (typeSort === 'Рекомендациям' && upAndDownSort === 'Убыванию') {
            this.setState({
                loading: true,
                filteredProducts: products.sort((a, b) => b.PredictStock - a.PredictStock)
            })
            this.handleTimeOut()
        } else if (typeSort === 'Рекомендациям' && upAndDownSort === 'Возрастанию') {
            this.setState({
                loading: true,
                filteredProducts: products.sort((a, b) => a.PredictStock - b.PredictStock)
            })
            this.handleTimeOut()
        }

    }


    _onRefresh = () => {
        let randomNumber = Math.floor(Math.random() * 100) + 1;

        this.setState({refreshing: true});

        this.setState({randomNumber: randomNumber});
        let _this = this;
        setTimeout(function () {
            _this.setState({refreshing: false});
        }, 1000)
        this.setProductAnalyticList()
    }

    componentDidMount() {
        this.setShopList().then(r => console.log());
        this.setProductAnalyticList().then(r => console.log());
    }

    getOrdersList = () => {
        return this.state.filteredProducts;
    }


// componentDidMount() {
//     this.setAuthUserInfo();
// }

    static
    contextType = AuthContext

    signOut = () => {
        this.context.signOut();
        AsyncStorage.removeItem('userToken');
    }

    setAnalyticItemSmallModalVisible(id) {
        this.setState({
            analyticItemSmallModalVisible: id,
        });
    }

// let state_name = 'analyticItemSmallModalVisible'+key;
// this.setState(state => {
//     return this.state[state_name] = visible
// });


    handleCloseAnalyticItemSmall = () => {
        let {analyticItemSmallModalVisible} = this.state;

        if (analyticItemSmallModalVisible !== null) {
            this.setState({
                analyticItemSmallModalVisible: null,
            })
        }
    }
    openTabPanel1 = (today_sort, a_week_sort, a_month_sort, all_the_time,) => {

        this.setState({
            today_sort: today_sort,
            a_week_sort: a_week_sort,
            a_month_sort: a_month_sort,
            all_the_time: all_the_time,

            loading: true
        });
        this.setProductAnalyticList().then(r => console.log("OK"))

        if (today_sort === true) {
            this.setState({
                url_date: 1
            })
            this.setProductAnalyticList().then(r => console.log())

            console.log('today_sort == open')
        } else if (a_week_sort === true) {
            this.setProductAnalyticList().then(r => console.log())

            this.setState({
                url_date: 7
            })
            console.log('a_week_sort == open')
        } else if (a_month_sort === true) {

            this.setState({
                url_date: '1+month'
            })
            this.setProductAnalyticList().then(r => console.log())

            console.log('a_month_sort == open')

        } else if (all_the_time === true) {
            this.setProductAnalyticList().then(r => console.log())
            this.setState({
                url_date: 'all'
            })

        }
    };
    handleProducts = (article) => {
        let {analyticItemSmallModalVisible} = this.state;

        if (analyticItemSmallModalVisible !== null) {
            this.setState({
                analyticItemSmallModalVisible: null,
            })
        }

        this.props.navigation.navigate('ProductList', {
            params: article,
            url_date: this.state.url_date,
            navigation: JSON.stringify(this.props.navigation)
        })
    }


    changeShop = (item) => {
        const {products} = this.state
        if (!item.value) {
            this.setState({
                filteredProducts: products,
                shop_id: item.value,
            })
            this.setProductAnalyticList()
            //      this.sortedByFilters()
        } else {
            this.setState({
                filteredProducts: products.filter(el => el.shop.id == item.value),
                shop_id: item.value,
                url_page: 1,
                next_flag: false
            })
            this.setProductAnalyticList()
            //     this.sortedByFilters()
        }
        this.setState({
            shop_id: item.value,
            url_page: 1
        })

        this.setProductAnalyticList()
        //   this.sortedByFilters()

    }


    // rendering
    componentDidUpdate = () => {

    }

    onCardsRendering = ({item}) => {

        return (

            <View style={analyticStyle.analyticItemWrapper}>
                <View style={analyticStyle.analyticItemTop}>

                    <View style={analyticStyle.analyticItemTopLeft}>
                        <Image style={{width: '100%', height: '100%'}}
                               source={{uri: item.good_image}}/>
                    </View>

                    <Pressable style={analyticStyle.analyticItemTopRight} onPress={() => this.handleProducts(item)}>

                        <View style={{}}>
                            <Text style={analyticStyle.analyticItemTopRightTitle}>
                                {item.brand}
                            </Text>
                        </View>
                        <Text style={analyticStyle.analyticItemTopRightDesc}>
                            {item.GoodsName}
                        </Text>

                        <View style={analyticStyle.analyticItemTopRightInfoWrapper}>

                            {item.type == "FBO"
                                ?
                                <Svg style={{marginRight: 5}} width={12} height={12} viewBox="0 0 12 12"
                                     fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <Circle cx={6} cy={6} r={6} fill="#C511A8"/>
                                    <Path
                                        d="M10.443 3.5L8.777 9.802H7.204L6.158 5.759a3.372 3.372 0 01-.1-.708H6.04a4.298 4.298 0 01-.115.708L4.853 9.802h-1.64L1.558 3.5h1.551l.888 4.197c.038.178.066.419.084.72h.026c.012-.225.054-.471.127-.738L5.376 3.5h1.52L7.93 7.732c.038.155.072.38.101.677h.018c.012-.232.042-.466.092-.703L9.01 3.5h1.433z"
                                        fill="#fff"/>
                                </Svg>
                                :
                                <Svg style={{marginRight: 5}} width={12} height={12} viewBox="0 0 12 12"
                                     fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <Circle cx={6} cy={6} r={6} fill="#005CFE"/>
                                    <Path
                                        d="M5.963 9.5c-1.17 0-2.122-.315-2.858-.944C2.368 7.923 2 7.101 2 6.087c0-1.07.374-1.935 1.122-2.596.748-.66 1.738-.991 2.972-.991 1.165 0 2.107.316 2.824.949C9.64 4.08 10 4.915 10 5.95c0 1.064-.374 1.922-1.122 2.573-.744.651-1.715.977-2.915.977zm.08-5.688c-.646 0-1.158.202-1.538.604-.38.4-.57.93-.57 1.591 0 .67.19 1.2.57 1.59.38.391.877.586 1.492.586.634 0 1.137-.189 1.51-.566.371-.381.557-.908.557-1.582 0-.701-.18-1.247-.54-1.637-.361-.39-.855-.586-1.481-.586z"
                                        fill="#fff"/>
                                </Svg>}

                            {item.type == "FBO" ? <TouchableOpacity style={{
                                width: 23,
                                height: 12,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: '#C511A8',
                                borderRadius: 50,
                                marginRight: 5
                            }}>
                                <Text style={{
                                    color: '#C511A8',
                                    fontSize: 8,
                                    lineHeight: 10,
                                    fontWeight: '600'
                                }}>FBO</Text>
                            </TouchableOpacity> : <TouchableOpacity style={{
                                width: 23,
                                height: 12,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: '#005CFE',
                                borderRadius: 50,
                                marginRight: 5
                            }}>
                                <Text style={{
                                    color: '#005CFE',
                                    fontSize: 8,
                                    lineHeight: 10,
                                    fontWeight: '600'
                                }}>FBS</Text>
                            </TouchableOpacity>}

                            <View style={analyticStyle.analyticItemTopRightInfoArticleWrapper}>
                                <Text
                                    style={analyticStyle.analyticItemTopRightInfoArticle}>Артикул:</Text><Text
                                style={analyticStyle.analyticItemTopRightInfoArticle}> {item.article} {item.ShopName}</Text>

                                <TouchableOpacity style={{marginLeft: 9}} onPress={() => {
                                    item.type == 'ozon_FBO' ? Linking.openURL('https://www.ozon.ru/product/' + item.MissedNmid + '/') : Linking.openURL('https://www.wildberries.ru/catalog/' + item.MissedNmid + '/detail.aspx?targetUrl=ST')
                                }}>
                                    <Svg width={13} height={13} viewBox="0 0 11 10" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <Path
                                            d="M3.987 6.715l5.016-5.008V5h1V0H5v1h3.296L3.28 6.008l.707.707z"
                                            fill="#00395C" fillOpacity={0.8}/>
                                        <Path d="M4 2v1H1v6h6V6h1v4H0V2h4z" fill="#00395C"
                                              fillOpacity={0.8}/>
                                    </Svg>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </Pressable>

                    {/*<TouchableOpacity style={{*/}
                    {/*    position: 'absolute',*/}
                    {/*    right: 0,*/}
                    {/*    top: -4,*/}
                    {/*    paddingRight: 8,*/}
                    {/*    width: 30,*/}
                    {/*    height: 30,*/}
                    {/*    justifyContent: 'center',*/}
                    {/*    alignItems: 'flex-end'*/}
                    {/*}} onPress={() => {*/}
                    {/*    this.setAnalyticItemSmallModalVisible(article.id)*/}
                    {/*}}>*/}
                    {/*    <Svg width={6} height={18} viewBox="0 0 4 14" fill="none"*/}
                    {/*         xmlns="http://www.w3.org/2000/svg">*/}
                    {/*        <Path*/}
                    {/*            d="M2 3.5c.83 0 1.5-.67 1.5-1.5S2.83.5 2 .5.5 1.17.5 2 1.17 3.5 2 3.5zm0 2C1.17 5.5.5 6.17.5 7S1.17 8.5 2 8.5 3.5 7.83 3.5 7 2.83 5.5 2 5.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"*/}
                    {/*            fill="#00395C" fillOpacity={0.8}/>*/}
                    {/*    </Svg>*/}
                    {/*</TouchableOpacity>*/}

                    {/*Small modal Скрыто*/}
                    {/*<View*/}
                    {/*    style={this.state.analyticItemSmallModalVisible === article.id ? [analyticStyle.analyticItemSmallModal, analyticStyle.shadowProp] : {display: 'none'}}>*/}

                    {/*<TouchableOpacity style={analyticStyle.analyticItemSmallModalItem}>*/}
                    {/*    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"*/}
                    {/*         xmlns="http://www.w3.org/2000/svg">*/}
                    {/*        <Path*/}
                    {/*            d="M12 22.001c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5h-.5a1.5 1.5 0 100 3h13a1.5 1.5 0 000-3H18z"*/}
                    {/*            fill="#97B2C4"/>*/}
                    {/*    </Svg>*/}
                    {/*    <Text style={analyticStyle.analyticItemSmallModalItemText}>Уведомлять</Text>*/}
                    {/*</TouchableOpacity>*/}


                    {/*<TouchableOpacity style={analyticStyle.analyticItemSmallModalItem}>*/}
                    {/*    <Svg width={24} height={25} viewBox="0 0 24 25" fill="none"*/}
                    {/*         xmlns="http://www.w3.org/2000/svg">*/}
                    {/*        <Path fillRule="evenodd" clipRule="evenodd"*/}
                    {/*              d="M3.487 18.586L4.9 20.001 20.457 4.444 19.043 3.03l-2.415 2.415A11.759 11.759 0 0012 4.502c-5 0-9.27 3.11-11 7.5a11.887 11.887 0 003.926 5.145l-1.44 1.44zm4.147-4.147l1.511-1.511A3.008 3.008 0 019 12.002c0-1.66 1.34-3 3-3 .323 0 .635.05.926.145l1.511-1.511a5.002 5.002 0 00-6.803 6.803z"*/}
                    {/*              fill="#97B2C4"/>*/}
                    {/*        <Path*/}
                    {/*            d="M12 19.502c-1.147 0-2.255-.164-3.303-.469l2.162-2.162a5.002 5.002 0 006.01-6.01l3.184-3.184A11.877 11.877 0 0123 12.002c-1.73 4.39-6 7.5-11 7.5z"*/}
                    {/*            fill="#97B2C4"/>*/}
                    {/*    </Svg>*/}
                    {/*    <Text style={analyticStyle.analyticItemSmallModalItemText}>Скрыть</Text>*/}
                    {/*</TouchableOpacity>*/}

                    {/*</View>*/}
                </View>

                <View style={analyticStyle.analyticItemBottom}>
                    {/*ОБОРАЧИВАЕМОСТ*/}
                    <View style={[analyticStyle.analyticItemBottomProgressItem, {
                        borderWidth: 1,
                        borderColor: 'rgba(94,164,224,0.35)',
                        borderRadius: 5
                    }]}>

                        <Text
                            style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#0078D2'}]}>Оборачиваемость</Text>
                        <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
                            <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
                                {item.StockInDays === 0 || item.StockInDays === '-' ? <Text style={{
                                    color: '#0078D2',
                                    fontSize: 14,
                                    fontWeight: 'bold'
                                }}>нет данных</Text> : <Text style={{
                                    color: '#0078D2',
                                    fontSize: 14,
                                    fontWeight: 'bold'
                                }}>{item.StockInDays} дней</Text>}

                            </View>

                            {/*<View style={[analyticStyle.progressBarWrapper, {*/}
                            {/*    borderWidth: 1, borderColor: 'rgba(116,180,227,0.34)'*/}
                            {/*}]}>*/}
                            {/*    <View style={[analyticStyle.progressBarPercent, {*/}
                            {/*        backgroundColor: '#0092FF',*/}
                            {/*        width: '35%'*/}
                            {/*    }]}>*/}

                            {/*    </View>*/}
                            {/*</View>*/}
                        </View>
                    </View>

                    {/*Остатки на складах*/}
                    <View style={[analyticStyle.analyticItemBottomProgressItem, {
                        borderWidth: 1,
                        borderColor: 'rgba(94,164,224,0.35)',
                        borderRadius: 5
                    }]}>
                        <Text
                            style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#FFA10A'}]}>Остатки
                            на складах</Text>
                        <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
                            <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
                                <Text style={{
                                    color: '#FFA10A',
                                    fontSize: 14,
                                    fontWeight: 'bold'
                                }}>{item.StockCount}</Text>
                                <Text
                                    style={{
                                        color: '#FFA10A',
                                        fontSize: 14,
                                        fontWeight: 'bold'
                                    }}> шт</Text>
                            </View>

                            {/*<View style={[analyticStyle.progressBarWrapper, {*/}
                            {/*    borderWidth: 1,*/}
                            {/*    borderColor: 'rgba(255,161,10,0.37)'*/}
                            {/*}]}>*/}
                            {/*    <View style={[analyticStyle.progressBarPercent, {*/}
                            {/*        backgroundColor: '#FFA10A',*/}
                            {/*        width: '25%'*/}
                            {/*    }]}>*/}

                            {/*    </View>*/}
                            {/*</View>*/}
                        </View>
                    </View>

                    <View style={[analyticStyle.analyticItemBottomProgressItem, {
                        borderWidth: 1,
                        borderColor: 'rgba(94,164,224,0.35)',
                        borderRadius: 5
                    }]}>

                        <Text
                            style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#0078D2'}]}>Заказы</Text>
                        <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
                            <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
                                <Text style={{
                                    color: '#0078D2',
                                    fontSize: 14,
                                    fontWeight: 'bold'
                                }}>{item.PeriodOrders} шт</Text>
                            </View>

                            {/*<View style={[analyticStyle.progressBarWrapper, {*/}
                            {/*    borderWidth: 1, borderColor: 'rgba(116,180,227,0.34)'*/}
                            {/*}]}>*/}
                            {/*    <View style={[analyticStyle.progressBarPercent, {*/}
                            {/*        backgroundColor: '#0092FF',*/}
                            {/*        width: '35%'*/}
                            {/*    }]}>*/}

                            {/*    </View>*/}
                            {/*</View>*/}
                        </View>
                    </View>

                    {/*Рекомендуем поставить*/}
                    <View style={[analyticStyle.analyticItemBottomProgressItem, {
                        borderWidth: 1,
                        borderColor: 'rgba(94,164,224,0.35)',
                        borderRadius: 5
                    }]}>
                        <Text
                            style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#22C38E'}]}>
                            Рекомендуем поставить
                        </Text>
                        <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
                            <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
                                <Text style={{
                                    color: '#22C38E',
                                    fontSize: 14,
                                    fontWeight: 'bold'
                                }}>{item.PredictStock}</Text>
                                <Text
                                    style={{
                                        color: '#22C38E',
                                        fontSize: 14,
                                        fontWeight: 'bold'
                                    }}> шт</Text>
                            </View>

                            {/*<TouchableOpacity style={analyticStyle.addToCart}>*/}
                            {/*<Text style={analyticStyle.addToCartText}>Добавить</Text>*/}
                            {/*<Svg width={11} height={11} viewBox="0 0 11 11" fill="none"*/}
                            {/*     xmlns="http://www.w3.org/2000/svg">*/}
                            {/*    <Path*/}
                            {/*        d="M3.1 6.8h5.4c.33 0 .6.27.6.6 0 .33-.27.6-.6.6h-6c-.33 0-.6-.27-.6-.6v-6H.7C.37 1.4.1 1.13.1.8.1.47.37.2.7.2h1.8c.33 0 .6.27.6.6V2h7.8L8.5 6.2H3.1v.6zm-.3 1.8a.899.899 0 110 1.8.899.899 0 110-1.8zm5.4 0a.899.899 0 110 1.8.899.899 0 110-1.8z"*/}
                            {/*        fill="#fff"/>*/}
                            {/*</Svg>*/}
                            {/*</TouchableOpacity>*/}
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    handleNextPage = () => {
        let {url_page} = this.state;
        this.setState({
            url_page: url_page + 1,
        })
        this.setProductAnalyticList()
    }

    handleBackPage = () => {
        let {url_page, back_flag} = this.state;

        if (url_page === 1) {
            this.setState({
                back_flag: false,
                url_page: 1,
            })
        } else if (url_page >= 2) {
            this.setState({
                url_page: this.state.url_page - 1,
                next_flag: false
            })
        } else if (back_flag === true) {
            this.setState({
                url_page: this.state.url_page - 2,
                next_flag: false

            })
        }
        this.setProductAnalyticList().then(r => console.log())
    }

    onEndReached = () => {
        this.listRef.getScrollResponder().scrollTo(0)
    }

    render() {
        return (
            <View style={styles.container}>
                <HeaderComponent
                    navigation={this.props.navigation}
                />
                <Text style={styles.mainBodyTitle}>Товарная аналитика</Text>

                <View style={analyticStyle.analyticActionsWrapper}>

                    <View horizontal={true} style={analyticStyle.analyticActionsBody}>
                        <SafeAreaView horizontal={true}>

                            <View style={styles.timeButtons}>

                                <TouchableOpacity
                                    style={this.state.today_sort === true ? {...styles.timeButton, ...styles.timeButtonActive} : {...styles.timeButton}}
                                    onPress={() => {
                                        this.openTabPanel1(true, false, false, false, false);
                                    }}>
                                    <Text style={this.state.today_sort === true ? {
                                        color: 'white',
                                        fontSize: 12
                                    } : {color: 'black', fontSize: 12}}>Сегодня</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={this.state.a_week_sort === true ? {...styles.timeButton, ...styles.timeButtonActive} : {...styles.timeButton}}
                                    onPress={() => {
                                        this.openTabPanel1(false, true, false, false, false, false, false);
                                    }}>
                                    <Text style={this.state.a_week_sort === true ? {
                                        color: 'white',
                                        fontSize: 12
                                    } : {color: 'black', fontSize: 12}}>Неделя</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={this.state.a_month_sort === true ? {...styles.timeButton, ...styles.timeButtonActive} : {...styles.timeButton}}
                                    onPress={() => {
                                        this.openTabPanel1(false, false, true, false, false, false, false);
                                    }}>

                                    <Text style={this.state.a_month_sort === true ? {
                                        color: 'white',
                                        fontSize: 12
                                    } : {color: 'black', fontSize: 12}}>Месяц</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={this.state.all_the_time === true ? {...styles.timeButton, ...styles.timeButtonActive} : {...styles.timeButton}}
                                    onPress={() => {
                                        this.openTabPanel1(false, false, false, true, false, false, false,);
                                    }}>
                                    <Text style={this.state.all_the_time === true ? {
                                        color: 'white',
                                        fontSize: 12
                                    } : {color: 'black', fontSize: 12}}>Всё время</Text>
                                </TouchableOpacity>


                            </View>
                        </SafeAreaView>
                    </View>
                </View>
                <View style={[{width: '90%', marginBottom: 20}, (Platform.OS === 'ios') ? {zIndex: 222} : {}]}>

                    <DropDownPicker
                        items={this.state.shop_list}

                        containerStyle={{height: 45}}
                        style={{
                            backgroundColor: '#fff',
                            width: '100%',
                            zIndex: 1
                        }}
                        placeholder='Магазины'
                        labelStyle={{
                            color: '#4C4C66',
                            width: '100%',
                            fontSize: 12
                        }}
                        itemStyle={{
                            justifyContent: 'flex-start',
                            height: 35
                        }}
                        dropDownStyle={{backgroundColor: '#fff'}}
                        onChangeItem={item => this.changeShop(item)}

                    />

                </View>
                <Text style={{alignSelf: 'flex-start', marginLeft: 25, marginBottom: 5}}>Сортировать по:</Text>

                <View style={[{
                    width: '90%',
                    marginBottom: 20,
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }, (Platform.OS === 'ios') ? {zIndex: 30} : {}]}>
                    <View style={{width: '45%'}}>
                        <DropDownPicker
                            items={this.state.firstDropDown}
                            containerStyle={{height: 45,}}
                            style={{
                                backgroundColor: '#fff',
                                width: '100%',
                            }}
                            labelStyle={{
                                color: '#4C4C66',
                                width: '100%',
                                fontSize: 12
                            }}
                            defaultValue={this.state.typeSortValue}
                            itemStyle={{
                                justifyContent: 'flex-start',
                                height: 35,
                            }}
                            dropDownStyle={{backgroundColor: '#fff',}}
                            onChangeItem={item => this.leftDropdownChange(item)}

                        />
                    </View>
                    <View style={{width: '45%'}}>
                        <DropDownPicker
                            items={this.state.secondDropDown}

                            containerStyle={{height: 45,}}
                            style={{
                                backgroundColor: '#fff',
                                width: '100%',
                            }}
                            defaultValue={this.state.upAndDownSortValue}
                            labelStyle={{
                                color: '#4C4C66',
                                width: '100%',
                                fontSize: 12
                            }}
                            itemStyle={{
                                justifyContent: 'flex-start',
                                height: 35,
                            }}
                            dropDownStyle={{backgroundColor: '#fff'}}
                            onChangeItem={item => this.rightDropdownChange(item)}
                        />
                    </View>
                </View>

                {this.state.loading === true &&

                    <View style={{
                        width: '100%',
                        height: '50%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 120
                    }}>
                        <ActivityIndicator size="large" color="0078D2"/>
                    </View>

                }

                <SafeAreaView style={styles.mainBodyWrapper}>
                    <View>
                        <FlatList
                            refreshing={true}
                            data={this.state.filteredProducts}
                            renderItem={this.onCardsRendering}
                            scrollEnabled={true}
                            vertical={true}
                            extraData={this.state}
                        />
                    </View>
                </SafeAreaView>
                <View style={{flexDirection: 'row', padding: 5, textAlign: 'center'}}>
                    {this.state.url_page === 1 ?
                        <TouchableOpacity
                            style={[analyticStyle.changePageStyle, {borderColor: '#99bfde'}]}
                            disabled={true}
                        >
                            <Text
                                style={{fontSize: 12, color: '#99bfde',}}>Предыдущая
                                страница
                            </Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity
                            onPress={this.handleBackPage}
                            style={analyticStyle.changePageStyle}>
                            <Text
                                style={{fontSize: 12, color: '#0078D2',}}>Предыдущая
                                страница
                            </Text>
                        </TouchableOpacity>}


                    {this.state.url_page === this.state.last_page ?
                        <TouchableOpacity
                            disabled={true}
                            style={[analyticStyle.changePageStyle, {borderColor: '#99bfde'}]}>
                            <Text style={{fontSize: 12, color: '#0078D2',}}>
                                Следующая страница
                            </Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity
                            onPress={this.handleNextPage}
                            style={analyticStyle.changePageStyle}>
                            <Text style={{fontSize: 12, color: '#0078D2',}}>
                                Следующая страница
                            </Text>
                        </TouchableOpacity>}
                </View>
            </View>


        );
    }
}


const analyticStyle = StyleSheet.create({

    analyticActionsWrapper: {
        width: '100%',
        paddingHorizontal: 24,
        backgroundColor: "#fafafa",
        borderRadius: 4,
        paddingBottom: 20
    },
    changePageStyle: {
        padding: 5,
        margin: 5,
        borderWidth: 2,
        borderColor: '#0078D2',
        borderRadius: 5,

    },
    analyticActionsBody: {
        width: '100%',
        height: 40,
        borderRadius: 4,
    },


    analyticItemWrapper: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10
    },

    analyticItemTop: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 10
    },
    analyticItemSmallModal: {
        width: 168,
        backgroundColor: 'white',
        position: 'absolute',
        right: 9,
        top: 3,
        borderRadius: 6,
    },
    analyticItemSmallModalItem: {
        width: '100%',
        height: 56,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 15,
    },
    analyticItemSmallModalItemText: {
        fontSize: 14,
        marginLeft: 15,
        color: '#002033'
    },
    shadowProp: {
        elevation: 10,
        shadowColor: 'black',
    },
    analyticItemTopLeft: {
        width: 60,
        height: 50,
        marginRight: 10,
        borderRadius: 3,
        overflow: 'hidden'
    },
    analyticItemTopRight: {
        flex: 1,
        marginRight: 30,
        minHeight: 50,
        position: 'relative',
        top: -5,

    },
    analyticItemTopRightTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#002033',
        textDecorationLine: 'underline',
        textDecorationColor: 'black',
        textDecorationStyle: 'solid',


    },
    analyticItemTopRightDesc: {
        fontSize: 11,
        fontWeight: 'normal',
        color: '#002033',
        marginBottom: 8,

    },
    analyticItemTopRightInfoWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    analyticItemTopRightInfoArticleWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    analyticItemTopRightInfoArticle: {
        color: '#00395ccc',
        fontSize: 11,
    },
    analyticItemBottom: {},
    analyticItemBottomProgressItem: {
        width: '100%',
        // height:30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingLeft: 12,
        paddingRight: 3,
        marginBottom: 6
    },
    analyticItemBottomProgressItemTitle: {
        fontSize: 10
    },
    analyticItemBottomProgressBarWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginRight: 10
    },
    analyticItemBottomProgressBarWrapper1: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    progressBarWrapper: {
        width: 100,
        height: 6,
        borderRadius: 50
    },
    progressBarPercent: {
        height: 4,
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius: 50
    },
    addToCart: {
        // backgroundColor: '#25C685',
        backgroundColor: 'white',
        width: 100,
        borderRadius: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 24,

    },
    addToCartText: {
        fontSize: 12,
        color: 'white',
        marginRight: 8
    }
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
        justifyContent: 'flex-start',
        width: width,
        alignItems: 'center',
    },
    ImageBackgroundWrapper: {
        width: width - 48,
        height: 220,
        borderRadius: 7,
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
        backgroundColor: 'white',
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
        paddingBottom: 20,
        flex: 1
    },
    mainBodyTitle: {
        color: '#002033',
        fontSize: 30,
        fontWeight: 'bold',
        paddingBottom: 30,
        paddingLeft: 23,
        paddingTop: 13,
        textAlign: 'left',
        width: '100%',
        backgroundColor: "#fafafa",
    },
    timeButtons: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        height: '85%',

    },
    timeButton: {
        flexShrink: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 4,
        paddingHorizontal: 13,
        paddingVertical: 7
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

// onStatisticCardsRendering = ({article}) => {
//     return (
//         <View style={analyticStyle.analyticItemWrapper}>
//             <View style={analyticStyle.analyticItemTop}>
//
//                 <View style={analyticStyle.analyticItemTopLeft}>
//                     <Image style={{width: '100%', height: '100%'}}
//                            source={{uri: article.good_image}}/>
//                 </View>
//
//                 <Pressable style={analyticStyle.analyticItemTopRight}
//                            onPress={() => this.handleProducts(article)}>
//                     <View style={{}}>
//                         <Text style={analyticStyle.analyticItemTopRightTitle}>
//                             {article.brand}
//
//                         </Text>
//                     </View>
//                     <Text style={analyticStyle.analyticItemTopRightDesc}>
//                         {article.GoodsName}
//                     </Text>
//
//                     <View style={analyticStyle.analyticItemTopRightInfoWrapper}>
//
//                         {article.type == "FBO"
//                             ?
//                             <Svg style={{marginRight: 5}} width={12} height={12} viewBox="0 0 12 12"
//                                  fill="none"
//                                  xmlns="http://www.w3.org/2000/svg">
//                                 <Circle cx={6} cy={6} r={6} fill="#C511A8"/>
//                                 <Path
//                                     d="M10.443 3.5L8.777 9.802H7.204L6.158 5.759a3.372 3.372 0 01-.1-.708H6.04a4.298 4.298 0 01-.115.708L4.853 9.802h-1.64L1.558 3.5h1.551l.888 4.197c.038.178.066.419.084.72h.026c.012-.225.054-.471.127-.738L5.376 3.5h1.52L7.93 7.732c.038.155.072.38.101.677h.018c.012-.232.042-.466.092-.703L9.01 3.5h1.433z"
//                                     fill="#fff"/>
//                             </Svg>
//                             :
//                             <Svg style={{marginRight: 5}} width={12} height={12} viewBox="0 0 12 12"
//                                  fill="none"
//                                  xmlns="http://www.w3.org/2000/svg">
//                                 <Circle cx={6} cy={6} r={6} fill="#005CFE"/>
//                                 <Path
//                                     d="M5.963 9.5c-1.17 0-2.122-.315-2.858-.944C2.368 7.923 2 7.101 2 6.087c0-1.07.374-1.935 1.122-2.596.748-.66 1.738-.991 2.972-.991 1.165 0 2.107.316 2.824.949C9.64 4.08 10 4.915 10 5.95c0 1.064-.374 1.922-1.122 2.573-.744.651-1.715.977-2.915.977zm.08-5.688c-.646 0-1.158.202-1.538.604-.38.4-.57.93-.57 1.591 0 .67.19 1.2.57 1.59.38.391.877.586 1.492.586.634 0 1.137-.189 1.51-.566.371-.381.557-.908.557-1.582 0-.701-.18-1.247-.54-1.637-.361-.39-.855-.586-1.481-.586z"
//                                     fill="#fff"/>
//                             </Svg>}
//
//                         {article.type == "FBO" ? <TouchableOpacity style={{
//                             width: 23,
//                             height: 12,
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                             borderWidth: 1,
//                             borderColor: '#C511A8',
//                             borderRadius: 50,
//                             marginRight: 5
//                         }}>
//                             <Text style={{
//                                 color: '#C511A8',
//                                 fontSize: 8,
//                                 lineHeight: 10,
//                                 fontWeight: '600'
//                             }}>FBO</Text>
//                         </TouchableOpacity> : <TouchableOpacity style={{
//                             width: 23,
//                             height: 12,
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                             borderWidth: 1,
//                             borderColor: '#005CFE',
//                             borderRadius: 50,
//                             marginRight: 5
//                         }}>
//                             <Text style={{
//                                 color: '#005CFE',
//                                 fontSize: 8,
//                                 lineHeight: 10,
//                                 fontWeight: '600'
//                             }}>FBS</Text>
//                         </TouchableOpacity>}
//
//                         <View style={analyticStyle.analyticItemTopRightInfoArticleWrapper}>
//                             <Text
//                                 style={analyticStyle.analyticItemTopRightInfoArticle}>Артикул:</Text><Text
//                             style={analyticStyle.analyticItemTopRightInfoArticle}> {article.article} {article.ShopName}</Text>
//
//                             <TouchableOpacity style={{marginLeft: 9}}>
//                                 <Svg width={11} height={10} viewBox="0 0 11 10" fill="none"
//                                      xmlns="http://www.w3.org/2000/svg">
//                                     <Path
//                                         d="M3.987 6.715l5.016-5.008V5h1V0H5v1h3.296L3.28 6.008l.707.707z"
//                                         fill="#00395C" fillOpacity={0.8}/>
//                                     <Path d="M4 2v1H1v6h6V6h1v4H0V2h4z" fill="#00395C"
//                                           fillOpacity={0.8}/>
//                                 </Svg>
//                             </TouchableOpacity>
//
//                         </View>
//                     </View>
//                 </Pressable>
//
//                 {/*<TouchableOpacity style={{*/}
//                 {/*    position: 'absolute',*/}
//                 {/*    right: 0,*/}
//                 {/*    top: -4,*/}
//                 {/*    paddingRight: 8,*/}
//                 {/*    width: 30,*/}
//                 {/*    height: 30,*/}
//                 {/*    justifyContent: 'center',*/}
//                 {/*    alignItems: 'flex-end'*/}
//                 {/*}} onPress={() => {*/}
//                 {/*    this.setAnalyticItemSmallModalVisible(article.id)*/}
//                 {/*}}>*/}
//                 {/*    <Svg width={6} height={18} viewBox="0 0 4 14" fill="none"*/}
//                 {/*         xmlns="http://www.w3.org/2000/svg">*/}
//                 {/*        <Path*/}
//                 {/*            d="M2 3.5c.83 0 1.5-.67 1.5-1.5S2.83.5 2 .5.5 1.17.5 2 1.17 3.5 2 3.5zm0 2C1.17 5.5.5 6.17.5 7S1.17 8.5 2 8.5 3.5 7.83 3.5 7 2.83 5.5 2 5.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"*/}
//                 {/*            fill="#00395C" fillOpacity={0.8}/>*/}
//                 {/*    </Svg>*/}
//                 {/*</TouchableOpacity>*/}
//
//                 {/*Small modal Скрыто*/}
//                 {/*<View*/}
//                 {/*    style={this.state.analyticItemSmallModalVisible === article.id ? [analyticStyle.analyticItemSmallModal, analyticStyle.shadowProp] : {display: 'none'}}>*/}
//
//                 {/*<TouchableOpacity style={analyticStyle.analyticItemSmallModalItem}>*/}
//                 {/*    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"*/}
//                 {/*         xmlns="http://www.w3.org/2000/svg">*/}
//                 {/*        <Path*/}
//                 {/*            d="M12 22.001c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5h-.5a1.5 1.5 0 100 3h13a1.5 1.5 0 000-3H18z"*/}
//                 {/*            fill="#97B2C4"/>*/}
//                 {/*    </Svg>*/}
//                 {/*    <Text style={analyticStyle.analyticItemSmallModalItemText}>Уведомлять</Text>*/}
//                 {/*</TouchableOpacity>*/}
//
//
//                 {/*<TouchableOpacity style={analyticStyle.analyticItemSmallModalItem}>*/}
//                 {/*    <Svg width={24} height={25} viewBox="0 0 24 25" fill="none"*/}
//                 {/*         xmlns="http://www.w3.org/2000/svg">*/}
//                 {/*        <Path fillRule="evenodd" clipRule="evenodd"*/}
//                 {/*              d="M3.487 18.586L4.9 20.001 20.457 4.444 19.043 3.03l-2.415 2.415A11.759 11.759 0 0012 4.502c-5 0-9.27 3.11-11 7.5a11.887 11.887 0 003.926 5.145l-1.44 1.44zm4.147-4.147l1.511-1.511A3.008 3.008 0 019 12.002c0-1.66 1.34-3 3-3 .323 0 .635.05.926.145l1.511-1.511a5.002 5.002 0 00-6.803 6.803z"*/}
//                 {/*              fill="#97B2C4"/>*/}
//                 {/*        <Path*/}
//                 {/*            d="M12 19.502c-1.147 0-2.255-.164-3.303-.469l2.162-2.162a5.002 5.002 0 006.01-6.01l3.184-3.184A11.877 11.877 0 0123 12.002c-1.73 4.39-6 7.5-11 7.5z"*/}
//                 {/*            fill="#97B2C4"/>*/}
//                 {/*    </Svg>*/}
//                 {/*    <Text style={analyticStyle.analyticItemSmallModalItemText}>Скрыть</Text>*/}
//                 {/*</TouchableOpacity>*/}
//
//                 {/*</View>*/}
//             </View>
//
//
//             <View style={analyticStyle.analyticItemBottom}>
//                 {/*ОБОРАЧИВАЕМОСТ*/}
//                 <View style={[analyticStyle.analyticItemBottomProgressItem, {
//                     borderWidth: 1,
//                     borderColor: 'rgba(94,164,224,0.35)',
//                     borderRadius: 5
//                 }]}>
//
//                     <Text
//                         style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#0078D2'}]}>Оборачиваемость</Text>
//                     <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
//                         <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
//                             {article.StockInDays === 0 || article.StockInDays === '-' ? <Text style={{
//                                 color: '#0078D2',
//                                 fontSize: 14,
//                                 fontWeight: 'bold'
//                             }}>нет данных</Text> : <Text style={{
//                                 color: '#0078D2',
//                                 fontSize: 14,
//                                 fontWeight: 'bold'
//                             }}>{article.StockInDays} дней</Text>}
//
//                         </View>
//
//                         {/*<View style={[analyticStyle.progressBarWrapper, {*/}
//                         {/*    borderWidth: 1, borderColor: 'rgba(116,180,227,0.34)'*/}
//                         {/*}]}>*/}
//                         {/*    <View style={[analyticStyle.progressBarPercent, {*/}
//                         {/*        backgroundColor: '#0092FF',*/}
//                         {/*        width: '35%'*/}
//                         {/*    }]}>*/}
//
//                         {/*    </View>*/}
//                         {/*</View>*/}
//                     </View>
//                 </View>
//
//                 {/*Остатки на складах*/}
//                 <View style={[analyticStyle.analyticItemBottomProgressItem, {
//                     borderWidth: 1,
//                     borderColor: 'rgba(94,164,224,0.35)',
//                     borderRadius: 5
//                 }]}>
//
//                     <Text
//                         style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#FFA10A'}]}>Остатки
//                         на складах</Text>
//                     <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
//                         <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
//                             <Text style={{
//                                 color: '#FFA10A',
//                                 fontSize: 14,
//                                 fontWeight: 'bold'
//                             }}>{article.StockCount}</Text>
//                             <Text
//                                 style={{
//                                     color: '#FFA10A',
//                                     fontSize: 14,
//                                     fontWeight: 'bold'
//                                 }}> шт</Text>
//                         </View>
//
//                         {/*<View style={[analyticStyle.progressBarWrapper, {*/}
//                         {/*    borderWidth: 1,*/}
//                         {/*    borderColor: 'rgba(255,161,10,0.37)'*/}
//                         {/*}]}>*/}
//                         {/*    <View style={[analyticStyle.progressBarPercent, {*/}
//                         {/*        backgroundColor: '#FFA10A',*/}
//                         {/*        width: '25%'*/}
//                         {/*    }]}>*/}
//
//                         {/*    </View>*/}
//                         {/*</View>*/}
//                     </View>
//                 </View>
//
//                 <View style={[analyticStyle.analyticItemBottomProgressItem, {
//                     borderWidth: 1,
//                     borderColor: 'rgba(94,164,224,0.35)',
//                     borderRadius: 5
//                 }]}>
//
//                     <Text
//                         style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#0078D2'}]}>Заказы</Text>
//                     <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
//                         <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
//                             <Text style={{
//                                 color: '#0078D2',
//                                 fontSize: 14,
//                                 fontWeight: 'bold'
//                             }}>{article.PeriodOrders} шт</Text>
//                         </View>
//
//                         {/*<View style={[analyticStyle.progressBarWrapper, {*/}
//                         {/*    borderWidth: 1, borderColor: 'rgba(116,180,227,0.34)'*/}
//                         {/*}]}>*/}
//                         {/*    <View style={[analyticStyle.progressBarPercent, {*/}
//                         {/*        backgroundColor: '#0092FF',*/}
//                         {/*        width: '35%'*/}
//                         {/*    }]}>*/}
//
//                         {/*    </View>*/}
//                         {/*</View>*/}
//                     </View>
//                 </View>
//
//                 {/*Рекомендуем поставить*/}
//                 <View style={[analyticStyle.analyticItemBottomProgressItem, {
//                     borderWidth: 1,
//                     borderColor: 'rgba(94,164,224,0.35)',
//                     borderRadius: 5
//                 }]}>
//                     <Text
//                         style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#22C38E'}]}>Рекомендуем
//                         поставить</Text>
//                     <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
//                         <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
//                             <Text style={{
//                                 color: '#22C38E',
//                                 fontSize: 14,
//                                 fontWeight: 'bold'
//                             }}>{article.PredictStock}</Text>
//                             <Text
//                                 style={{
//                                     color: '#22C38E',
//                                     fontSize: 14,
//                                     fontWeight: 'bold'
//                                 }}> шт</Text>
//                         </View>
//
//                         {/*<TouchableOpacity style={analyticStyle.addToCart}>*/}
//                         {/*<Text style={analyticStyle.addToCartText}>Добавить</Text>*/}
//                         {/*<Svg width={11} height={11} viewBox="0 0 11 11" fill="none"*/}
//                         {/*     xmlns="http://www.w3.org/2000/svg">*/}
//                         {/*    <Path*/}
//                         {/*        d="M3.1 6.8h5.4c.33 0 .6.27.6.6 0 .33-.27.6-.6.6h-6c-.33 0-.6-.27-.6-.6v-6H.7C.37 1.4.1 1.13.1.8.1.47.37.2.7.2h1.8c.33 0 .6.27.6.6V2h7.8L8.5 6.2H3.1v.6zm-.3 1.8a.899.899 0 110 1.8.899.899 0 110-1.8zm5.4 0a.899.899 0 110 1.8.899.899 0 110-1.8z"*/}
//                         {/*        fill="#fff"/>*/}
//                         {/*</Svg>*/}
//                         {/*</TouchableOpacity>*/}
//                     </View>
//                 </View>
//             </View>
//         </View>
//     )
// }

// <View style={analyticStyle.analyticItemWrapper}>
//
//     <View style={analyticStyle.analyticItemTop}>
//
//         <View style={analyticStyle.analyticItemTopLeft}>
//             <Image style={{width: '100%', height: '100%'}}
//                    source={require('../../../assets/img/analyticsTest2.png')}/>
//         </View>
//
//         <View style={analyticStyle.analyticItemTopRight}>
//             <Text style={analyticStyle.analyticItemTopRightTitle} onPress={this.handleProducts}>
//                 LocalCocon
//             </Text>
//
//             <Text style={analyticStyle.analyticItemTopRightDesc}>
//                 Браслет на руку "АРТЕМИДА". Ювелирная бижутерия в подарок.
//             </Text>
//
//             <View style={analyticStyle.analyticItemTopRightInfoWrapper}>
//
//                 <Svg style={{marginRight: 5}} width={12} height={12} viewBox="0 0 12 12" fill="none"
//                      xmlns="http://www.w3.org/2000/svg">
//                     <Circle cx={6} cy={6} r={6} fill="#005CFE"/>
//                     <Path
//                         d="M5.963 9.5c-1.17 0-2.122-.315-2.858-.944C2.368 7.923 2 7.101 2 6.087c0-1.07.374-1.935 1.122-2.596.748-.66 1.738-.991 2.972-.991 1.165 0 2.107.316 2.824.949C9.64 4.08 10 4.915 10 5.95c0 1.064-.374 1.922-1.122 2.573-.744.651-1.715.977-2.915.977zm.08-5.688c-.646 0-1.158.202-1.538.604-.38.4-.57.93-.57 1.591 0 .67.19 1.2.57 1.59.38.391.877.586 1.492.586.634 0 1.137-.189 1.51-.566.371-.381.557-.908.557-1.582 0-.701-.18-1.247-.54-1.637-.361-.39-.855-.586-1.481-.586z"
//                         fill="#fff"/>
//                 </Svg>
//
//                 <TouchableOpacity style={{
//                     width: 23,
//                     height: 12,
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     borderWidth: 1,
//                     borderColor: '#005CFE',
//                     borderRadius: 50,
//                     marginRight: 5
//                 }}>
//                     <Text style={{
//                         color: '#005CFE',
//                         fontSize: 8,
//                         lineHeight: 10,
//                         fontWeight: '600'
//                     }}>FBS</Text>
//                 </TouchableOpacity>
//
//                 <View style={analyticStyle.analyticItemTopRightInfoArticleWrapper}>
//
//                     <Text style={analyticStyle.analyticItemTopRightInfoArticle}>Артикул:</Text><Text
//                     style={analyticStyle.analyticItemTopRightInfoArticle}> 36821053</Text>
//                     <TouchableOpacity style={{marginLeft: 9}}>
//                         <Svg width={11} height={10} viewBox="0 0 11 10" fill="none"
//                              xmlns="http://www.w3.org/2000/svg">
//                             <Path d="M3.987 6.715l5.016-5.008V5h1V0H5v1h3.296L3.28 6.008l.707.707z"
//                                   fill="#00395C" fillOpacity={0.8}/>
//                             <Path d="M4 2v1H1v6h6V6h1v4H0V2h4z" fill="#00395C" fillOpacity={0.8}/>
//                         </Svg>
//                     </TouchableOpacity>
//
//                 </View>
//             </View>
//         </View>
//
//         <TouchableOpacity style={{
//             position: 'absolute',
//             right: 0,
//             top: -4,
//             paddingRight: 8,
//             width: 30,
//             height: 30,
//             justifyContent: 'center',
//             alignItems: 'flex-end'
//         }} onPress={() => {
//             this.setAnalyticItemSmallModalVisible(!this.state.analyticItemSmallModalVisible2, 2);
//         }}>
//             <Svg width={6} height={18} viewBox="0 0 4 14" fill="none"
//                  xmlns="http://www.w3.org/2000/svg">
//                 <Path
//                     d="M2 3.5c.83 0 1.5-.67 1.5-1.5S2.83.5 2 .5.5 1.17.5 2 1.17 3.5 2 3.5zm0 2C1.17 5.5.5 6.17.5 7S1.17 8.5 2 8.5 3.5 7.83 3.5 7 2.83 5.5 2 5.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"
//                     fill="#00395C" fillOpacity={0.8}/>
//             </Svg>
//         </TouchableOpacity>
//
//         {/*Small modal*/}
//         <View
//             style={this.state.analyticItemSmallModalVisible2 === true ? [analyticStyle.analyticItemSmallModal, analyticStyle.shadowProp] : {display: 'none'}}>
//
//             <TouchableOpacity style={analyticStyle.analyticItemSmallModalItem}>
//                 <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"
//                      xmlns="http://www.w3.org/2000/svg">
//                     <Path
//                         d="M12 22.001c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5h-.5a1.5 1.5 0 100 3h13a1.5 1.5 0 000-3H18z"
//                         fill="#97B2C4"/>
//                 </Svg>
//                 <Text style={analyticStyle.analyticItemSmallModalItemText}>Уведомлять</Text>
//             </TouchableOpacity>
//
//             <TouchableOpacity style={analyticStyle.analyticItemSmallModalItem}>
//                 <Svg width={24} height={25} viewBox="0 0 24 25" fill="none"
//                      xmlns="http://www.w3.org/2000/svg">
//                     <Path fillRule="evenodd" clipRule="evenodd"
//                           d="M3.487 18.586L4.9 20.001 20.457 4.444 19.043 3.03l-2.415 2.415A11.759 11.759 0 0012 4.502c-5 0-9.27 3.11-11 7.5a11.887 11.887 0 003.926 5.145l-1.44 1.44zm4.147-4.147l1.511-1.511A3.008 3.008 0 019 12.002c0-1.66 1.34-3 3-3 .323 0 .635.05.926.145l1.511-1.511a5.002 5.002 0 00-6.803 6.803z"
//                           fill="#97B2C4"/>
//                     <Path
//                         d="M12 19.502c-1.147 0-2.255-.164-3.303-.469l2.162-2.162a5.002 5.002 0 006.01-6.01l3.184-3.184A11.877 11.877 0 0123 12.002c-1.73 4.39-6 7.5-11 7.5z"
//                         fill="#97B2C4"/>
//                 </Svg>
//                 <Text style={analyticStyle.analyticItemSmallModalItemText}>Скрыть</Text>
//             </TouchableOpacity>
//
//
//         </View>
//
//     </View>
//
//     <View style={analyticStyle.analyticItemBottom}>
//
//         {/*ОБОРАЧИВАЕМОСТ*/}
//         <View style={[analyticStyle.analyticItemBottomProgressItem, {
//             borderWidth: 1,
//             borderColor: '#EBF6FF'
//         }]}>
//
//             <Text
//                 style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#0078D2'}]}>ОБОРАЧИВАЕМОСТ</Text>
//             <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
//                 <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
//                     <Text style={{color: '#0078D2', fontSize: 14, fontWeight: 'bold'}}>9</Text>
//                     <Text style={{color: '#0078D2', fontSize: 10, fontWeight: 'bold'}}> дней</Text>
//                 </View>
//
//                 <View style={[analyticStyle.progressBarWrapper, {
//                     borderWidth: 1,
//                     borderColor: '#EBF6FF'
//                 }]}>
//                     <View style={[analyticStyle.progressBarPercent, {
//                         backgroundColor: '#0092FF',
//                         width: '35%'
//                     }]}>
//
//                     </View>
//                 </View>
//             </View>
//         </View>
//
//         {/*Остатки на складах*/}
//         <View style={[analyticStyle.analyticItemBottomProgressItem, {
//             borderWidth: 1,
//             borderColor: '#FFA10A'
//         }]}>
//
//             <Text style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#FFA10A'}]}>Остатки
//                 на складах</Text>
//             <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
//                 <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
//                     <Text style={{color: '#FFA10A', fontSize: 14, fontWeight: 'bold'}}>37</Text>
//                     <Text style={{color: '#FFA10A', fontSize: 10, fontWeight: 'bold'}}> шт</Text>
//                 </View>
//
//                 <View style={[analyticStyle.progressBarWrapper, {
//                     borderWidth: 1,
//                     borderColor: '#FFA10A'
//                 }]}>
//                     <View style={[analyticStyle.progressBarPercent, {
//                         backgroundColor: '#FFA10A',
//                         width: '25%'
//                     }]}>
//
//                     </View>
//                 </View>
//             </View>
//         </View>
//
//
//         {/*Рекомендуем поставить*/}
//         <View style={[analyticStyle.analyticItemBottomProgressItem, {
//             borderWidth: 1,
//             borderColor: '#22C38E'
//         }]}>
//
//             <Text style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#22C38E'}]}>Рекомендуем
//                 поставить</Text>
//             <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
//                 <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
//                     <Text style={{color: '#22C38E', fontSize: 14, fontWeight: 'bold'}}>45</Text>
//                     <Text style={{color: '#22C38E', fontSize: 10, fontWeight: 'bold'}}> шт</Text>
//                 </View>
//
//                 <TouchableOpacity style={analyticStyle.addToCart}>
//                     <Text style={analyticStyle.addToCartText}>Добавить</Text>
//                     <Svg width={11} height={11} viewBox="0 0 11 11" fill="none"
//                          xmlns="http://www.w3.org/2000/svg">
//                         <Path
//                             d="M3.1 6.8h5.4c.33 0 .6.27.6.6 0 .33-.27.6-.6.6h-6c-.33 0-.6-.27-.6-.6v-6H.7C.37 1.4.1 1.13.1.8.1.47.37.2.7.2h1.8c.33 0 .6.27.6.6V2h7.8L8.5 6.2H3.1v.6zm-.3 1.8a.899.899 0 110 1.8.899.899 0 110-1.8zm5.4 0a.899.899 0 110 1.8.899.899 0 110-1.8z"
//                             fill="#fff"/>
//                     </Svg>
//                 </TouchableOpacity>
//             </View>
//         </View>
//
//
//     </View>
//
// </View>
//
// {/*item */}
// <View style={analyticStyle.analyticItemWrapper}>
//
//     <View style={analyticStyle.analyticItemTop}>
//
//
//         <View style={analyticStyle.analyticItemTopLeft}>
//             <Image style={{width: '100%', height: '100%'}}
//                    source={require('../../../assets/img/analyticsTest.png')}/>
//         </View>
//
//         <View style={analyticStyle.analyticItemTopRight}>
//             <Text style={analyticStyle.analyticItemTopRightTitle} onPress={this.handleProducts}>
//                 LocalCocon
//             </Text>
//
//             <Text style={analyticStyle.analyticItemTopRightDesc}>
//                 Браслет на руку "АРТЕМИДА". Ювелирная бижутерия в подарок.
//             </Text>
//
//             <View style={analyticStyle.analyticItemTopRightInfoWrapper}>
//
//                 <Svg style={{marginRight: 5}} width={12} height={12} viewBox="0 0 12 12" fill="none"
//                      xmlns="http://www.w3.org/2000/svg">
//                     <Circle cx={6} cy={6} r={6} fill="#C511A8"/>
//                     <Path
//                         d="M10.443 3.5L8.777 9.802H7.204L6.158 5.759a3.372 3.372 0 01-.1-.708H6.04a4.298 4.298 0 01-.115.708L4.853 9.802h-1.64L1.558 3.5h1.551l.888 4.197c.038.178.066.419.084.72h.026c.012-.225.054-.471.127-.738L5.376 3.5h1.52L7.93 7.732c.038.155.072.38.101.677h.018c.012-.232.042-.466.092-.703L9.01 3.5h1.433z"
//                         fill="#fff"/>
//                 </Svg>
//
//                 <TouchableOpacity style={{
//                     width: 23,
//                     height: 12,
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     borderWidth: 1,
//                     borderColor: '#C511A8',
//                     borderRadius: 50,
//                     marginRight: 5
//                 }}>
//                     <Text style={{
//                         color: '#C511A8',
//                         fontSize: 8,
//                         lineHeight: 10,
//                         fontWeight: '600'
//                     }}>FBO</Text>
//                 </TouchableOpacity>
//
//                 <View style={analyticStyle.analyticItemTopRightInfoArticleWrapper}>
//
//                     <Text style={analyticStyle.analyticItemTopRightInfoArticle}>Артикул:</Text><Text
//                     style={analyticStyle.analyticItemTopRightInfoArticle}> 36821053</Text>
//                     <TouchableOpacity style={{marginLeft: 9}}>
//                         <Svg width={11} height={10} viewBox="0 0 11 10" fill="none"
//                              xmlns="http://www.w3.org/2000/svg">
//                             <Path d="M3.987 6.715l5.016-5.008V5h1V0H5v1h3.296L3.28 6.008l.707.707z"
//                                   fill="#00395C" fillOpacity={0.8}/>
//                             <Path d="M4 2v1H1v6h6V6h1v4H0V2h4z" fill="#00395C" fillOpacity={0.8}/>
//                         </Svg>
//                     </TouchableOpacity>
//
//                 </View>
//             </View>
//         </View>
//
//         <TouchableOpacity style={{
//             position: 'absolute',
//             right: 0,
//             top: -4,
//             paddingRight: 8,
//             width: 30,
//             height: 30,
//             justifyContent: 'center',
//             alignItems: 'flex-end'
//         }} onPress={() => {
//             this.setAnalyticItemSmallModalVisible(!this.state.analyticItemSmallModalVisible3, 3);
//         }}>
//             <Svg width={6} height={18} viewBox="0 0 4 14" fill="none"
//                  xmlns="http://www.w3.org/2000/svg">
//                 <Path
//                     d="M2 3.5c.83 0 1.5-.67 1.5-1.5S2.83.5 2 .5.5 1.17.5 2 1.17 3.5 2 3.5zm0 2C1.17 5.5.5 6.17.5 7S1.17 8.5 2 8.5 3.5 7.83 3.5 7 2.83 5.5 2 5.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"
//                     fill="#00395C" fillOpacity={0.8}/>
//             </Svg>
//         </TouchableOpacity>
//
//         {/*Small modal*/}
//         <View
//             style={this.state.analyticItemSmallModalVisible3 === true ? [analyticStyle.analyticItemSmallModal, analyticStyle.shadowProp] : {display: 'none'}}>
//             <TouchableOpacity style={analyticStyle.analyticItemSmallModalItem}>
//                 <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"
//                      xmlns="http://www.w3.org/2000/svg">
//                     <Path
//                         d="M12 22.001c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5h-.5a1.5 1.5 0 100 3h13a1.5 1.5 0 000-3H18z"
//                         fill="#97B2C4"/>
//                 </Svg>
//                 <Text style={analyticStyle.analyticItemSmallModalItemText}>Уведомлять</Text>
//             </TouchableOpacity>
//
//             <TouchableOpacity style={analyticStyle.analyticItemSmallModalItem}>
//                 <Svg width={24} height={25} viewBox="0 0 24 25" fill="none"
//                      xmlns="http://www.w3.org/2000/svg">
//                     <Path fillRule="evenodd" clipRule="evenodd"
//                           d="M3.487 18.586L4.9 20.001 20.457 4.444 19.043 3.03l-2.415 2.415A11.759 11.759 0 0012 4.502c-5 0-9.27 3.11-11 7.5a11.887 11.887 0 003.926 5.145l-1.44 1.44zm4.147-4.147l1.511-1.511A3.008 3.008 0 019 12.002c0-1.66 1.34-3 3-3 .323 0 .635.05.926.145l1.511-1.511a5.002 5.002 0 00-6.803 6.803z"
//                           fill="#97B2C4"/>
//                     <Path
//                         d="M12 19.502c-1.147 0-2.255-.164-3.303-.469l2.162-2.162a5.002 5.002 0 006.01-6.01l3.184-3.184A11.877 11.877 0 0123 12.002c-1.73 4.39-6 7.5-11 7.5z"
//                         fill="#97B2C4"/>
//                 </Svg>
//                 <Text style={analyticStyle.analyticItemSmallModalItemText}>Скрыть</Text>
//             </TouchableOpacity>
//         </View>
//
//     </View>
//
//     <View style={analyticStyle.analyticItemBottom}>
//
//         {/*ОБОРАЧИВАЕМОСТ*/}
//         <View style={[analyticStyle.analyticItemBottomProgressItem, {
//             borderWidth: 1,
//             borderColor: '#EBF6FF'
//         }]}>
//
//             <Text
//                 style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#0078D2'}]}>ОБОРАЧИВАЕМОСТ</Text>
//             <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
//                 <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
//                     <Text style={{color: '#0078D2', fontSize: 14, fontWeight: 'bold'}}>9</Text>
//                     <Text style={{color: '#0078D2', fontSize: 10, fontWeight: 'bold'}}> дней</Text>
//                 </View>
//
//                 <View style={[analyticStyle.progressBarWrapper, {
//                     borderWidth: 1,
//                     borderColor: '#EBF6FF'
//                 }]}>
//                     <View style={[analyticStyle.progressBarPercent, {
//                         backgroundColor: '#0092FF',
//                         width: '35%'
//                     }]}>
//
//                     </View>
//                 </View>
//             </View>
//         </View>
//
//         {/*Остатки на складах*/}
//         <View style={[analyticStyle.analyticItemBottomProgressItem, {
//             borderWidth: 1,
//             borderColor: '#FFA10A'
//         }]}>
//
//             <Text style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#FFA10A'}]}>Остатки
//                 на складах</Text>
//             <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
//                 <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
//                     <Text style={{color: '#FFA10A', fontSize: 14, fontWeight: 'bold'}}>37</Text>
//                     <Text style={{color: '#FFA10A', fontSize: 10, fontWeight: 'bold'}}> шт</Text>
//                 </View>
//
//                 <View style={[analyticStyle.progressBarWrapper, {
//                     borderWidth: 1,
//                     borderColor: '#FFA10A'
//                 }]}>
//                     <View style={[analyticStyle.progressBarPercent, {
//                         backgroundColor: '#FFA10A',
//                         width: '25%'
//                     }]}>
//
//                     </View>
//                 </View>
//             </View>
//         </View>
//
//
//         {/*Рекомендуем поставить*/}
//         <View style={[analyticStyle.analyticItemBottomProgressItem, {
//             borderWidth: 1,
//             borderColor: '#22C38E'
//         }]}>
//
//             <Text style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#22C38E'}]}>Рекомендуем
//                 поставить</Text>
//             <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>
//                 <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>
//                     <Text style={{color: '#22C38E', fontSize: 14, fontWeight: 'bold'}}>45</Text>
//                     <Text style={{color: '#22C38E', fontSize: 10, fontWeight: 'bold'}}> шт</Text>
//                 </View>
//
//                 <TouchableOpacity style={analyticStyle.addToCart}>
//                     <Text style={analyticStyle.addToCartText}>Добавить</Text>
//                     <Svg width={11} height={11} viewBox="0 0 11 11" fill="none"
//                          xmlns="http://www.w3.org/2000/svg">
//                         <Path
//                             d="M3.1 6.8h5.4c.33 0 .6.27.6.6 0 .33-.27.6-.6.6h-6c-.33 0-.6-.27-.6-.6v-6H.7C.37 1.4.1 1.13.1.8.1.47.37.2.7.2h1.8c.33 0 .6.27.6.6V2h7.8L8.5 6.2H3.1v.6zm-.3 1.8a.899.899 0 110 1.8.899.899 0 110-1.8zm5.4 0a.899.899 0 110 1.8.899.899 0 110-1.8z"
//                             fill="#fff"/>
//                     </Svg>
//                 </TouchableOpacity>
//             </View>
//         </View>
//
//
//     </View>
//
// </View>

// shopListConvert = (shopList) => {
//     const list = [];
//
//     return shopList.map((item, index) => ({
//         label: item.ShopName,
//         value: index
//     })).filter(item => {
//         if (list.includes(item.label)){
//             return false
//         }else{
//             list.push(item.label)
//             return true
//         }
//     })
//
// }

// {/*item */
// }
//
// {/*{this.getOrdersList().map((article, index) => (  <View style={analyticStyle.analyticItemWrapper}>*/
// }
// {/*    <View style={analyticStyle.analyticItemTop}>*/
// }
//
// {/*        <View style={analyticStyle.analyticItemTopLeft}>*/
// }
// {/*            <Image style={{width: '100%', height: '100%'}}*/
// }
// {/*                   source={{uri: article.good_image}}/>*/
// }
// {/*        </View>*/
// }
//
// {/*        <Pressable style={analyticStyle.analyticItemTopRight}*/
// }
// {/*                   onPress={() => this.handleProducts(article)}>*/
// }
// {/*            <View style={{}}>*/
// }
// {/*                <Text style={analyticStyle.analyticItemTopRightTitle}>*/
// }
// {/*                    {article.brand}*/
// }
//
// {/*                </Text>*/
// }
// {/*            </View>*/
// }
// {/*            <Text style={analyticStyle.analyticItemTopRightDesc}>*/
// }
// {/*                {article.GoodsName}*/
// }
// {/*            </Text>*/
// }
//
// {/*            <View style={analyticStyle.analyticItemTopRightInfoWrapper}>*/
// }
//
// {/*                {article.type == "FBO"*/
// }
// {/*                    ?*/
// }
// {/*                    <Svg style={{marginRight: 5}} width={12} height={12} viewBox="0 0 12 12"*/
// }
// {/*                         fill="none"*/
// }
// {/*                         xmlns="http://www.w3.org/2000/svg">*/
// }
// {/*                        <Circle cx={6} cy={6} r={6} fill="#C511A8"/>*/
// }
// {/*                        <Path*/
// }
// {/*                            d="M10.443 3.5L8.777 9.802H7.204L6.158 5.759a3.372 3.372 0 01-.1-.708H6.04a4.298 4.298 0 01-.115.708L4.853 9.802h-1.64L1.558 3.5h1.551l.888 4.197c.038.178.066.419.084.72h.026c.012-.225.054-.471.127-.738L5.376 3.5h1.52L7.93 7.732c.038.155.072.38.101.677h.018c.012-.232.042-.466.092-.703L9.01 3.5h1.433z"*/
// }
// {/*                            fill="#fff"/>*/
// }
// {/*                    </Svg>*/
// }
// {/*                    :*/
// }
// {/*                    <Svg style={{marginRight: 5}} width={12} height={12} viewBox="0 0 12 12"*/
// }
// {/*                         fill="none"*/
// }
// {/*                         xmlns="http://www.w3.org/2000/svg">*/
// }
// {/*                        <Circle cx={6} cy={6} r={6} fill="#005CFE"/>*/
// }
// {/*                        <Path*/
// }
// {/*                            d="M5.963 9.5c-1.17 0-2.122-.315-2.858-.944C2.368 7.923 2 7.101 2 6.087c0-1.07.374-1.935 1.122-2.596.748-.66 1.738-.991 2.972-.991 1.165 0 2.107.316 2.824.949C9.64 4.08 10 4.915 10 5.95c0 1.064-.374 1.922-1.122 2.573-.744.651-1.715.977-2.915.977zm.08-5.688c-.646 0-1.158.202-1.538.604-.38.4-.57.93-.57 1.591 0 .67.19 1.2.57 1.59.38.391.877.586 1.492.586.634 0 1.137-.189 1.51-.566.371-.381.557-.908.557-1.582 0-.701-.18-1.247-.54-1.637-.361-.39-.855-.586-1.481-.586z"*/
// }
// {/*                            fill="#fff"/>*/
// }
// {/*                    </Svg>}*/
// }
//
// {/*                {article.type == "FBO" ? <TouchableOpacity style={{*/
// }
// {/*                    width: 23,*/
// }
// {/*                    height: 12,*/
// }
// {/*                    justifyContent: 'center',*/
// }
// {/*                    alignItems: 'center',*/
// }
// {/*                    borderWidth: 1,*/
// }
// {/*                    borderColor: '#C511A8',*/
// }
// {/*                    borderRadius: 50,*/
// }
// {/*                    marginRight: 5*/
// }
// {/*                }}>*/
// }
// {/*                    <Text style={{*/
// }
// {/*                        color: '#C511A8',*/
// }
// {/*                        fontSize: 8,*/
// }
// {/*                        lineHeight: 10,*/
// }
// {/*                        fontWeight: '600'*/
// }
// {/*                    }}>FBO</Text>*/
// }
// {/*                </TouchableOpacity> : <TouchableOpacity style={{*/
// }
// {/*                    width: 23,*/
// }
// {/*                    height: 12,*/
// }
// {/*                    justifyContent: 'center',*/
// }
// {/*                    alignItems: 'center',*/
// }
// {/*                    borderWidth: 1,*/
// }
// {/*                    borderColor: '#005CFE',*/
// }
// {/*                    borderRadius: 50,*/
// }
// {/*                    marginRight: 5*/
// }
// {/*                }}>*/
// }
// {/*                    <Text style={{*/
// }
// {/*                        color: '#005CFE',*/
// }
// {/*                        fontSize: 8,*/
// }
// {/*                        lineHeight: 10,*/
// }
// {/*                        fontWeight: '600'*/
// }
// {/*                    }}>FBS</Text>*/
// }
// {/*                </TouchableOpacity>}*/
// }
//
// {/*                <View style={analyticStyle.analyticItemTopRightInfoArticleWrapper}>*/
// }
// {/*                    <Text*/
// }
// {/*                        style={analyticStyle.analyticItemTopRightInfoArticle}>Артикул:</Text><Text*/
// }
// {/*                    style={analyticStyle.analyticItemTopRightInfoArticle}> {article.article} {article.ShopName}</Text>*/
// }
//
// {/*                    <TouchableOpacity style={{marginLeft: 9}}>*/
// }
// {/*                        <Svg width={11} height={10} viewBox="0 0 11 10" fill="none"*/
// }
// {/*                             xmlns="http://www.w3.org/2000/svg">*/
// }
// {/*                            <Path*/
// }
// {/*                                d="M3.987 6.715l5.016-5.008V5h1V0H5v1h3.296L3.28 6.008l.707.707z"*/
// }
// {/*                                fill="#00395C" fillOpacity={0.8}/>*/
// }
// {/*                            <Path d="M4 2v1H1v6h6V6h1v4H0V2h4z" fill="#00395C"*/
// }
// {/*                                  fillOpacity={0.8}/>*/
// }
// {/*                        </Svg>*/
// }
// {/*                    </TouchableOpacity>*/
// }
//
// {/*                </View>*/
// }
// {/*            </View>*/
// }
// {/*        </Pressable>*/
// }
//
// {/*        /!*<TouchableOpacity style={{*!/*/
// }
// {/*        /!*    position: 'absolute',*!/*/
// }
// {/*        /!*    right: 0,*!/*/
// }
// {/*        /!*    top: -4,*!/*/
// }
// {/*        /!*    paddingRight: 8,*!/*/
// }
// {/*        /!*    width: 30,*!/*/
// }
// {/*        /!*    height: 30,*!/*/
// }
// {/*        /!*    justifyContent: 'center',*!/*/
// }
// {/*        /!*    alignItems: 'flex-end'*!/*/
// }
// {/*        /!*}} onPress={() => {*!/*/
// }
// {/*        /!*    this.setAnalyticItemSmallModalVisible(article.id)*!/*/
// }
// {/*        /!*}}>*!/*/
// }
// {/*        /!*    <Svg width={6} height={18} viewBox="0 0 4 14" fill="none"*!/*/
// }
// {/*        /!*         xmlns="http://www.w3.org/2000/svg">*!/*/
// }
// {/*        /!*        <Path*!/*/
// }
// {/*        /!*            d="M2 3.5c.83 0 1.5-.67 1.5-1.5S2.83.5 2 .5.5 1.17.5 2 1.17 3.5 2 3.5zm0 2C1.17 5.5.5 6.17.5 7S1.17 8.5 2 8.5 3.5 7.83 3.5 7 2.83 5.5 2 5.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"*!/*/
// }
// {/*        /!*            fill="#00395C" fillOpacity={0.8}/>*!/*/
// }
// {/*        /!*    </Svg>*!/*/
// }
// {/*        /!*</TouchableOpacity>*!/*/
// }
//
// {/*        /!*Small modal Скрыто*!/*/
// }
// {/*        /!*<View*!/*/
// }
// {/*        /!*    style={this.state.analyticItemSmallModalVisible === article.id ? [analyticStyle.analyticItemSmallModal, analyticStyle.shadowProp] : {display: 'none'}}>*!/*/
// }
//
// {/*        /!*<TouchableOpacity style={analyticStyle.analyticItemSmallModalItem}>*!/*/
// }
// {/*        /!*    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"*!/*/
// }
// {/*        /!*         xmlns="http://www.w3.org/2000/svg">*!/*/
// }
// {/*        /!*        <Path*!/*/
// }
// {/*        /!*            d="M12 22.001c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5h-.5a1.5 1.5 0 100 3h13a1.5 1.5 0 000-3H18z"*!/*/
// }
// {/*        /!*            fill="#97B2C4"/>*!/*/
// }
// {/*        /!*    </Svg>*!/*/
// }
// {/*        /!*    <Text style={analyticStyle.analyticItemSmallModalItemText}>Уведомлять</Text>*!/*/
// }
// {/*        /!*</TouchableOpacity>*!/*/
// }
//
//
// {/*        /!*<TouchableOpacity style={analyticStyle.analyticItemSmallModalItem}>*!/*/
// }
// {/*        /!*    <Svg width={24} height={25} viewBox="0 0 24 25" fill="none"*!/*/
// }
// {/*        /!*         xmlns="http://www.w3.org/2000/svg">*!/*/
// }
// {/*        /!*        <Path fillRule="evenodd" clipRule="evenodd"*!/*/
// }
// {/*        /!*              d="M3.487 18.586L4.9 20.001 20.457 4.444 19.043 3.03l-2.415 2.415A11.759 11.759 0 0012 4.502c-5 0-9.27 3.11-11 7.5a11.887 11.887 0 003.926 5.145l-1.44 1.44zm4.147-4.147l1.511-1.511A3.008 3.008 0 019 12.002c0-1.66 1.34-3 3-3 .323 0 .635.05.926.145l1.511-1.511a5.002 5.002 0 00-6.803 6.803z"*!/*/
// }
// {/*        /!*              fill="#97B2C4"/>*!/*/
// }
// {/*        /!*        <Path*!/*/
// }
// {/*        /!*            d="M12 19.502c-1.147 0-2.255-.164-3.303-.469l2.162-2.162a5.002 5.002 0 006.01-6.01l3.184-3.184A11.877 11.877 0 0123 12.002c-1.73 4.39-6 7.5-11 7.5z"*!/*/
// }
// {/*        /!*            fill="#97B2C4"/>*!/*/
// }
// {/*        /!*    </Svg>*!/*/
// }
// {/*        /!*    <Text style={analyticStyle.analyticItemSmallModalItemText}>Скрыть</Text>*!/*/
// }
// {/*        /!*</TouchableOpacity>*!/*/
// }
//
// {/*        /!*</View>*!/*/
// }
// {/*    </View>*/
// }
//
//
// {/*    <View style={analyticStyle.analyticItemBottom}>*/
// }
// {/*        /!*ОБОРАЧИВАЕМОСТ*!/*/
// }
// {/*        <View style={[analyticStyle.analyticItemBottomProgressItem, {*/
// }
// {/*            borderWidth: 1,*/
// }
// {/*            borderColor: 'rgba(94,164,224,0.35)',*/
// }
// {/*            borderRadius: 5*/
// }
// {/*        }]}>*/
// }
//
// {/*            <Text*/
// }
// {/*                style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#0078D2'}]}>Оборачиваемость</Text>*/
// }
// {/*            <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>*/
// }
// {/*                <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>*/
// }
// {/*                    {article.StockInDays === 0 || article.StockInDays === '-' ? <Text style={{*/
// }
// {/*                        color: '#0078D2',*/
// }
// {/*                        fontSize: 14,*/
// }
// {/*                        fontWeight: 'bold'*/
// }
// {/*                    }}>нет данных</Text> : <Text style={{*/
// }
// {/*                        color: '#0078D2',*/
// }
// {/*                        fontSize: 14,*/
// }
// {/*                        fontWeight: 'bold'*/
// }
// {/*                    }}>{article.StockInDays} дней</Text>}*/
// }
//
// {/*                </View>*/
// }
//
// {/*                /!*<View style={[analyticStyle.progressBarWrapper, {*!/*/
// }
// {/*                /!*    borderWidth: 1, borderColor: 'rgba(116,180,227,0.34)'*!/*/
// }
// {/*                /!*}]}>*!/*/
// }
// {/*                /!*    <View style={[analyticStyle.progressBarPercent, {*!/*/
// }
// {/*                /!*        backgroundColor: '#0092FF',*!/*/
// }
// {/*                /!*        width: '35%'*!/*/
// }
// {/*                /!*    }]}>*!/*/
// }
//
// {/*                /!*    </View>*!/*/
// }
// {/*                /!*</View>*!/*/
// }
// {/*            </View>*/
// }
// {/*        </View>*/
// }
//
// {/*        /!*Остатки на складах*!/*/
// }
// {/*        <View style={[analyticStyle.analyticItemBottomProgressItem, {*/
// }
// {/*            borderWidth: 1,*/
// }
// {/*            borderColor: 'rgba(94,164,224,0.35)',*/
// }
// {/*            borderRadius: 5*/
// }
// {/*        }]}>*/
// }
//
// {/*            <Text*/
// }
// {/*                style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#FFA10A'}]}>Остатки*/
// }
// {/*                на складах</Text>*/
// }
// {/*            <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>*/
// }
// {/*                <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>*/
// }
// {/*                    <Text style={{*/
// }
// {/*                        color: '#FFA10A',*/
// }
// {/*                        fontSize: 14,*/
// }
// {/*                        fontWeight: 'bold'*/
// }
// {/*                    }}>{article.StockCount}</Text>*/
// }
// {/*                    <Text*/
// }
// {/*                        style={{*/
// }
// {/*                            color: '#FFA10A',*/
// }
// {/*                            fontSize: 14,*/
// }
// {/*                            fontWeight: 'bold'*/
// }
// {/*                        }}> шт</Text>*/
// }
// {/*                </View>*/
// }
//
// {/*                /!*<View style={[analyticStyle.progressBarWrapper, {*!/*/
// }
// {/*                /!*    borderWidth: 1,*!/*/
// }
// {/*                /!*    borderColor: 'rgba(255,161,10,0.37)'*!/*/
// }
// {/*                /!*}]}>*!/*/
// }
// {/*                /!*    <View style={[analyticStyle.progressBarPercent, {*!/*/
// }
// {/*                /!*        backgroundColor: '#FFA10A',*!/*/
// }
// {/*                /!*        width: '25%'*!/*/
// }
// {/*                /!*    }]}>*!/*/
// }
//
// {/*                /!*    </View>*!/*/
// }
// {/*                /!*</View>*!/*/
// }
// {/*            </View>*/
// }
// {/*        </View>*/
// }
//
// {/*        <View style={[analyticStyle.analyticItemBottomProgressItem, {*/
// }
// {/*            borderWidth: 1,*/
// }
// {/*            borderColor: 'rgba(94,164,224,0.35)',*/
// }
// {/*            borderRadius: 5*/
// }
// {/*        }]}>*/
// }
//
// {/*            <Text*/
// }
// {/*                style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#0078D2'}]}>Заказы</Text>*/
// }
// {/*            <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>*/
// }
// {/*                <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>*/
// }
// {/*                    <Text style={{*/
// }
// {/*                        color: '#0078D2',*/
// }
// {/*                        fontSize: 14,*/
// }
// {/*                        fontWeight: 'bold'*/
// }
// {/*                    }}>{article.PeriodOrders} шт</Text>*/
// }
// {/*                </View>*/
// }
//
// {/*                /!*<View style={[analyticStyle.progressBarWrapper, {*!/*/
// }
// {/*                /!*    borderWidth: 1, borderColor: 'rgba(116,180,227,0.34)'*!/*/
// }
// {/*                /!*}]}>*!/*/
// }
// {/*                /!*    <View style={[analyticStyle.progressBarPercent, {*!/*/
// }
// {/*                /!*        backgroundColor: '#0092FF',*!/*/
// }
// {/*                /!*        width: '35%'*!/*/
// }
// {/*                /!*    }]}>*!/*/
// }
//
// {/*                /!*    </View>*!/*/
// }
// {/*                /!*</View>*!/*/
// }
// {/*            </View>*/
// }
// {/*        </View>*/
// }
//
// {/*        /!*Рекомендуем поставить*!/*/
// }
// {/*        <View style={[analyticStyle.analyticItemBottomProgressItem, {*/
// }
// {/*            borderWidth: 1,*/
// }
// {/*            borderColor: 'rgba(94,164,224,0.35)',*/
// }
// {/*            borderRadius: 5*/
// }
// {/*        }]}>*/
// }
// {/*            <Text*/
// }
// {/*                style={[analyticStyle.analyticItemBottomProgressItemTitle, {color: '#22C38E'}]}>Рекомендуем*/
// }
// {/*                поставить</Text>*/
// }
// {/*            <View style={analyticStyle.analyticItemBottomProgressBarWrapper1}>*/
// }
// {/*                <View style={analyticStyle.analyticItemBottomProgressBarWrapper}>*/
// }
// {/*                    <Text style={{*/
// }
// {/*                        color: '#22C38E',*/
// }
// {/*                        fontSize: 14,*/
// }
// {/*                        fontWeight: 'bold'*/
// }
// {/*                    }}>{article.PredictStock}</Text>*/
// }
// {/*                    <Text*/
// }
// {/*                        style={{*/
// }
// {/*                            color: '#22C38E',*/
// }
// {/*                            fontSize: 14,*/
// }
// {/*                            fontWeight: 'bold'*/
// }
// {/*                        }}> шт</Text>*/
// }
// {/*                </View>*/
// }
//
// {/*                /!*<TouchableOpacity style={analyticStyle.addToCart}>*!/*/
// }
// {/*                /!*<Text style={analyticStyle.addToCartText}>Добавить</Text>*!/*/
// }
// {/*                /!*<Svg width={11} height={11} viewBox="0 0 11 11" fill="none"*!/*/
// }
// {/*                /!*     xmlns="http://www.w3.org/2000/svg">*!/*/
// }
// {/*                /!*    <Path*!/*/
// }
// {/*                /!*        d="M3.1 6.8h5.4c.33 0 .6.27.6.6 0 .33-.27.6-.6.6h-6c-.33 0-.6-.27-.6-.6v-6H.7C.37 1.4.1 1.13.1.8.1.47.37.2.7.2h1.8c.33 0 .6.27.6.6V2h7.8L8.5 6.2H3.1v.6zm-.3 1.8a.899.899 0 110 1.8.899.899 0 110-1.8zm5.4 0a.899.899 0 110 1.8.899.899 0 110-1.8z"*!/*/
// }
// {/*                /!*        fill="#fff"/>*!/*/
// }
// {/*                /!*</Svg>*!/*/
// }
// {/*                /!*</TouchableOpacity>*!/*/
// }
// {/*            </View>*/
// }
// {/*        </View>*/
// }
// {/*    </View>*/
// }
// {/*</View>))}*/
// }
//
// {/*<View style={{height: 20, width: '100%'}}></View>*/
// }

