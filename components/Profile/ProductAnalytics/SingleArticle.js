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
    BackHandler,

    ActivityIndicator, Pressable
} from 'react-native';
import Svg, {Path, Defs, G, ClipPath, Circle} from "react-native-svg"
import SvgUri from 'react-native-svg-uri';

import HeaderComponent from '../includes/header';
import axios from "axios";

import {LinearGradient} from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import moment from "moment";


export default class SingleArticle extends Component {

    constructor(props) {
        super(props);
        this.state = {
            articleList: {},
            display: null,
            modalVisibility: true,
            articleData: [],
            loading: true,

            todayDate: moment().format('DD.MM.YYYY').toString(),
            weekFirstDayDate: moment().subtract(1,'week').format('DD.MM.YYYY'),
            weekLastDayDate: moment().format('DD.MM.YYYY'),
            monthFirstDay: moment().subtract(1,'month').format('DD.MM.YYYY'),
            monthYesterday: moment().subtract(1, 'days').format('DD.MM.YYYY'),

            date_start: {}
        }
    }

    setStartDate = async () => {
        try {
            let userToken = await AsyncStorage.getItem('userToken');
            let AuthStr = 'Bearer ' + userToken;

            axios.get(`https://lk.e-zh.ru/api/dashboard/stats?&date=all`, {
                headers: {'Authorization': AuthStr},
                "content-type": "application/json",
            }).then((response) => {
                let statistic_data = {
                    "date_start": (response.data.date_start),
                }
                console.log(response.data.date_start, 'user_create_date');
                this.setState({
                    date_start: statistic_data
                })
            })
        } catch (e) {
            console.log('error' + e)
        }
    }


    handleGoToBack = () => {
        this.setState({
            loading: true
        })
        this.setArticleDate().then(r => console.log())
        this.props.navigation.navigate("ProductAnalytics")
    }


    componentDidUpdate(prevProps) {

        if (this.props.article.shop_id !== prevProps.article.shop_id || this.props.url_date !== prevProps.url_date) {
            this.setArticleDate();
        }
        if (this.props.article !== prevProps.article) {
            this.setArticleDate()
        }
    }

    setArticleDate = async () => {
        let userToken = await AsyncStorage.getItem('userToken');
        let AuthStr = 'Bearer ' + userToken;

        let url_date = this.props.url_date
        try {

            axios.get(`https://lk.e-zh.ru/api/dashboard/stats?date=${url_date}&search=${this.props.article.article}&shop_id=${this.props.article.shop_id}&size=null`, {

                headers: {'Authorization': AuthStr},
                "content-type": "application/json",
            }).then(
                (response) => {
                    this.setState({
                        articleList: response.data
                    })
                }
            )
        } catch (e) {
            console.log('error' + e)
        }
    }


    setArticleDate2 = async () => {
        try {
            let userToken = await AsyncStorage.getItem('userToken');
            let AuthStr = 'Bearer ' + userToken;

            let shop_id = this.props.article.shop_id;
            let url_date = this.props.url_date;
            let article = this.props.article.article;

            console.log({shop_id, url_date, article})

            axios.get('https://lk.e-zh.ru/api/goods/?article=' + article + '&date=' + url_date + '&shop_id=' + shop_id, {

                headers: {'Authorization': AuthStr},
                "content-type": "application/json",
            }).then((response) => {

                    let article_data = response.data.data[0]

                    this.setState({
                        articleData: article_data
                    })
                    if (article_data.StockInDays === '-') {
                        this.setState({
                            article_data: article_data.StockInDays = 'нет данных'
                        })
                    }
                    this.handleLoading()

                    // console.log(this.state.articleData, "RESPONSE2222222");
                },

                (err) => {
                    // console.log('err.response', err.response.data)
                },
            );

        } catch (e) {
            console.log('error' + e)

        }
    }


    componentDidMount() {
        this.handleLoading()


        this.focusListener = this.props.navigation.addListener("focus", () => {
            this.setState({
                loading: true
            })
            this.setArticleDate2()
        });
        this.setArticleDate().then(r => console.log());
        this.setStartDate()
    }


    componentWillUnmount() {
        this.focusListener();
    }

    handleLoading = () => {
        this.setState({
            loading: true
        })
        setTimeout(() => this.setState({loading: false}), 1500)
    }


    render() {
        return (
            <SafeAreaView style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: StatusBar.currentHeight,
            }}>
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


                <HeaderComponent
                    style={{backgroundColor: 'white'}}
                    navigation={this.props.navigation}
                />
                <ScrollView showsVerticalScrollIndicator={false} style={{width: '100%', marginHorizontal: -5}}>
                    <View style={styles.view}>


                        <Pressable
                            style={{flexDirection: 'row', alignSelf: 'flex-start', marginLeft: 15}}
                            onPress={this.handleGoToBack}>

                            <SvgUri
                                style={{marginRight: 7, marginTop: 5}}
                                width="12"
                                height="12"
                                source={require('../../../assets/img/gotobacksvg.svg')}/>
                            <Text>
                                Назад к списку
                            </Text>
                        </Pressable>
                        <View style={styles.container}>
                            <View style={{}}>
                                <Text style={styles.analyticItemTopRightTitle}>
                                    {this.props.article.brand}
                                </Text>
                            </View>
                            <Text style={{width: "95%", color: '#002033',}}>{this.props.article.GoodsName}</Text>
                            <View style={styles.analyticItemTopRightInfoWrapper}>
                                {this.props.article.type === "FBO"
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

                                {this.props.article.type === "FBO" ? <TouchableOpacity style={{
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
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity style={{
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

                                <View style={[styles.analyticItemTopRightInfoArticleWrapper, {marginBottom: 20}]}>

                                    <Text style={styles.analyticItemTopRightInfoArticle}>Артикул:</Text>

                                    <Text style={styles.analyticItemTopRightInfoArticle} >
                                        {this.props.article.article}
                                    </Text>
                                    <TouchableOpacity style={{marginLeft: 9}} onPress={() => {
                                        this.props.article.type == 'ozon_FBO' ? Linking.openURL('https://www.ozon.ru/product/' + this.props.article.MissedNmid + '/') : Linking.openURL('https://www.wildberries.ru/catalog/' + this.props.article.MissedNmid + '/detail.aspx?targetUrl=ST')
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


                            <View style={styles.analyticItemBottom}>
                                {/*ОБОРАЧИВАЕМОСТЬ*/}
                                <View style={[styles.analyticItemBottomProgressItem, {
                                    borderWidth: 1,
                                    borderColor: 'rgba(94,164,224,0.35)',
                                    borderRadius: 5
                                }]}>

                                    <Text
                                        style={[styles.analyticItemBottomProgressItemTitle, {color: '#0078d2'}]}>Оборачиваемость</Text>
                                    <View style={styles.analyticItemBottomProgressBarWrapper1}>
                                        <View style={styles.analyticItemBottomProgressBarWrapper}>
                                            {this.state.articleData.StockInDays ? <Text style={{
                                                    color: '#0078D2',
                                                    fontSize: 14,
                                                    fontWeight: 'bold',
                                                }}>{this.state.articleData.StockInDays !== 'нет данных' ?
                                                    <Text>{this.state.articleData.StockInDays} дней</Text> :
                                                    <Text>{this.state.articleData.StockInDays}</Text>}</Text>
                                                :
                                                <Text style={{
                                                    color: '#0078D2',
                                                    fontSize: 14,
                                                    fontWeight: 'bold',
                                                }}>{this.props.article.StockInDays} дней</Text>
                                            }

                                        </View>

                                        {/*<View style={[styles.progressBarWrapper, {borderWidth: 1, borderColor: 'rgba(62,134,196,0.2)'}]}>*/}
                                        {/*    <View*/}
                                        {/*        style={[styles.progressBarPercent, {*/}
                                        {/*            backgroundColor: '#0092FF',*/}
                                        {/*            width: '35%'*/}
                                        {/*        }]}>*/}

                                        {/*    </View>*/}
                                        {/*</View>*/}
                                    </View>
                                </View>

                                {/*Остатки на складах*/}
                                <View style={[styles.analyticItemBottomProgressItem, {
                                    borderWidth: 1,
                                    borderColor: 'rgba(94,164,224,0.35)',
                                    borderRadius: 5
                                }]}>

                                    <Text style={[styles.analyticItemBottomProgressItemTitle, {color: '#FFA10A'}]}>Остатки
                                        на складах</Text>
                                    <View style={styles.analyticItemBottomProgressBarWrapper1}>
                                        <View style={styles.analyticItemBottomProgressBarWrapper}>
                                            <Text style={{
                                                color: '#FFA10A',
                                                fontSize: 14,
                                                fontWeight: 'bold'
                                            }}>{this.props.article.StockCount}</Text>
                                            <Text
                                                style={{color: '#FFA10A', fontSize: 14, fontWeight: 'bold'}}> шт</Text>
                                        </View>

                                        {/*<View style={[styles.progressBarWrapper, {borderWidth: 1, borderColor: 'rgba(255,161,10,0.42)'}]}>*/}
                                        {/*    <View*/}
                                        {/*        style={[styles.progressBarPercent, {*/}
                                        {/*            backgroundColor: '#FFA10A',*/}
                                        {/*            width: '25%'*/}
                                        {/*        }]}>*/}

                                        {/*    </View>*/}
                                        {/*</View>*/}
                                    </View>
                                </View>
                                <View style={[styles.analyticItemBottomProgressItem, {
                                    borderWidth: 1,
                                    borderColor: 'rgba(94,164,224,0.35)',
                                    borderRadius: 5
                                }]}>

                                    <Text
                                        style={[styles.analyticItemBottomProgressItemTitle, {color: '#0078d2'}]}>Заказы</Text>
                                    <View style={styles.analyticItemBottomProgressBarWrapper1}>
                                        <View style={styles.analyticItemBottomProgressBarWrapper}>
                                            {this.props.article.PeriodOrders ? <Text style={{
                                                    color: '#0078D2',
                                                    fontSize: 14,
                                                    fontWeight: 'bold'
                                                }}>{this.props.article.PeriodOrders} шт</Text>
                                                :
                                                <Text style={{
                                                    color: '#0078D2',
                                                    fontSize: 14,
                                                    fontWeight: 'bold'
                                                }}>{this.state.articleData.PeriodOrders} шт</Text>
                                            }

                                        </View>

                                        {/*<View style={[styles.progressBarWrapper, {borderWidth: 1, borderColor: 'rgba(62,134,196,0.2)'}]}>*/}
                                        {/*    <View*/}
                                        {/*        style={[styles.progressBarPercent, {*/}
                                        {/*            backgroundColor: '#0092FF',*/}
                                        {/*            width: '35%'*/}
                                        {/*        }]}>*/}

                                        {/*    </View>*/}
                                        {/*</View>*/}
                                    </View>
                                </View>
                                {/*Рекомендуем поставить*/}
                                <View style={[styles.analyticItemBottomProgressItem, {
                                    borderWidth: 1,
                                    borderColor: 'rgba(94,164,224,0.35)',
                                    borderRadius: 5
                                }]}>

                                    <Text style={[styles.analyticItemBottomProgressItemTitle, {color: '#22C38E'}]}>
                                        Рекомендуем поставить</Text>
                                    <View style={styles.analyticItemBottomProgressBarWrapper1}>
                                        <View style={styles.analyticItemBottomProgressBarWrapper}>
                                            <Text style={{
                                                color: '#22C38E',
                                                fontSize: 14,
                                                fontWeight: 'bold'
                                            }}>{this.props.article.PredictStock}</Text>
                                            <Text
                                                style={{color: '#22C38E', fontSize: 14, fontWeight: 'bold'}}> шт</Text>
                                        </View>

                                        {/*<TouchableOpacity style={styles.addToCart}>*/}
                                        {/*    <LinearGradient colors={['#25C685', '#24A5B7']} style={styles.linearGradient}>*/}
                                        {/*        <Text style={styles.addToCartText}>Добавить</Text>*/}
                                        {/*        <Svg width={11} height={11} viewBox="0 0 11 11" fill="none"*/}
                                        {/*             xmlns="http://www.w3.org/2000/svg">*/}
                                        {/*            <Path*/}
                                        {/*                d="M3.1 6.8h5.4c.33 0 .6.27.6.6 0 .33-.27.6-.6.6h-6c-.33 0-.6-.27-.6-.6v-6H.7C.37 1.4.1 1.13.1.8.1.47.37.2.7.2h1.8c.33 0 .6.27.6.6V2h7.8L8.5 6.2H3.1v.6zm-.3 1.8a.899.899 0 110 1.8.899.899 0 110-1.8zm5.4 0a.899.899 0 110 1.8.899.899 0 110-1.8z"*/}
                                        {/*                fill="#fff"/>*/}
                                        {/*        </Svg>*/}
                                        {/*    </LinearGradient>*/}
                                        {/*</TouchableOpacity>*/}
                                    </View>
                                </View>
                            </View>


                            <View style={{width: '100%'}}>
                                <View style={{marginTop: 20,}}>
                                    <View>
                                        <Image
                                            style={{width: '100%', height: 300, borderRadius: 10}}
                                            source={{uri: this.props.article.good_image}}/>
                                    </View>
                                </View>
                            </View>

                        </View>

                        <View style={{flex: 1, textAlign: 'center', alignSelf: 'flex-start', flexDirection: 'row'}}>
                            <View style={{width: '45%'}}>
                                <Text style={{marginBottom: 21, fontWeight: 'bold',}}>Рейтинг:</Text>
                                <Text style={{marginBottom: 21, fontWeight: 'bold',}}>Категория:</Text>
                                {/*<Text style={{fontWeight: 'bold',}}>Предмет:</Text>*/}
                            </View>
                            <View>
                                <View style={{flexDirection: 'row', width: '50%', marginBottom: 12,}}>

                                    <SvgUri
                                        style={{marginRight: 5}}
                                        width="20"
                                        height="20"
                                        source={require('../../../assets/img/points.svg')}/>
                                    <SvgUri
                                        style={{marginBottom: 7, marginRight: 5}}
                                        width="20"
                                        height="20"
                                        source={require('../../../assets/img/points.svg')}/>
                                    <SvgUri
                                        style={{marginBottom: 7, marginRight: 5}}
                                        width="20"
                                        height="20"
                                        source={require('../../../assets/img/points.svg')}/>
                                    <SvgUri
                                        style={{marginBottom: 7, marginRight: 5}}
                                        width="20"
                                        height="20"
                                        source={require('../../../assets/img/points.svg')}/>
                                    <SvgUri
                                        style={{marginBottom: 7, marginRight: 5}}
                                        width="20"
                                        height="20"
                                        source={require('../../../assets/img/points.svg')}/>
                                </View>

                                {this.props.article.subject ? <Text style={{
                                        marginBottom: 12,
                                        borderRadius: 10,
                                        padding: 6,
                                        width: '100%',
                                        backgroundColor: 'rgba(0, 66, 105, 0.07)',
                                        color: '#002033',
                                        fontFamily: 'System'
                                    }}>{this.props.article.subject}</Text>
                                    :
                                    <Text style={{
                                        marginBottom: 12,
                                        borderRadius: 10,
                                        padding: 6,
                                        width: '100%',
                                        backgroundColor: 'rgba(0, 66, 105, 0.07)',
                                        color: '#002033',
                                        fontFamily: 'System'
                                    }}>{this.state.articleData.subject}</Text>}

                                {/*<Text style={{*/}
                                {/*    marginBottom: 7,*/}
                                {/*    borderRadius: 10,*/}
                                {/*    padding: 6,*/}
                                {/*    width: '90%',*/}
                                {/*    backgroundColor: 'rgba(0, 66, 105, 0.07)',*/}
                                {/*    color: '#002033',*/}
                                {/*}}>{this.props.article.subject}</Text>*/}
                            </View>
                        </View>

                        {/*buttons*/}

                        {/*<View style={styles.buttonsView}>*/}
                        {/*    <View style={[styles.productListButton, {backgroundColor: "#0078D2"}]}>*/}
                        {/*        <SvgUri*/}
                        {/*            style={{marginRight: 10, marginTop: 3}}*/}
                        {/*            width="16"*/}
                        {/*            height="16"*/}
                        {/*            source={require('../../../assets/img/btnIcon1.svg')}/>*/}
                        {/*        <Text style={{color: 'white'}}>*/}
                        {/*            Подробнее*/}
                        {/*        </Text>*/}
                        {/*    </View>*/}
                        {/*    <View style={styles.productListButton}>*/}
                        {/*        <SvgUri*/}
                        {/*            style={{marginRight: 10, marginTop: 3}}*/}
                        {/*            width="16"*/}
                        {/*            height="16"*/}
                        {/*            source={require('../../../assets/img/btnIcon2.svg')}/>*/}
                        {/*        <Text style={{color: '#0078D2'}}>*/}
                        {/*            Добавить заметку*/}
                        {/*        </Text>*/}
                        {/*    </View>*/}
                        {/*    <View style={styles.productListButton}>*/}
                        {/*        <SvgUri*/}
                        {/*            style={{marginRight: 10, marginTop: 3}}*/}
                        {/*            width="20"*/}
                        {/*            height="20"*/}
                        {/*            source={require('../../../assets/img/btnIcon3.svg')}/>*/}
                        {/*        <Text style={{color: '#0078D2'}}>*/}
                        {/*            Переместить в архив*/}
                        {/*        </Text>*/}
                        {/*    </View>*/}
                        {/*</View>*/}

                        {/*ДАННЫЕ ЗА ВЕСЬ ПЕРИОД*/}


                        <View style={styles.statistickView}>
                            <View style={{width: '100%', textAlign: 'center', alignItems: 'center',}}>
                                <Text style={[styles.statistickViewTitle, {
                                    borderTopLeftRadius: 5,
                                    borderTopRightRadius: 5,
                                    color: 'white',

                                }]}>
                                    Данные за период
                                    {this.props.url_date == 1 && <Text style={{
                                        fontSize: 12,
                                        color: 'white',
                                        marginLeft: 5
                                    }}> c {this.state.todayDate} по {this.state.todayDate}</Text>}

                                    {this.props.url_date == 7 && <Text style={{
                                        fontSize: 12,
                                        color: 'white',
                                        marginLeft: 5
                                    }}> с {this.state.weekFirstDayDate} по {this.state.weekLastDayDate}</Text>}

                                    {this.props.url_date === '1+month' && <Text style={{
                                        fontSize: 12,
                                        color: 'white',
                                        marginLeft: 5
                                    }}> с {this.state.monthFirstDay} по {this.state.todayDate}</Text>}

                                    {this.props.url_date === 'all' ? <Text style={{
                                        fontSize: 12,
                                        color: 'white',
                                        marginLeft: 5
                                    }}>с {this.state.date_start.date_start} по {this.state.todayDate}</Text> : null}
                                    {this.props.url_date === 'yesterday' ? <Text style={{
                                        fontSize: 12,
                                        color: 'white',
                                        marginLeft: 5
                                    }}>с {this.state.monthYesterday} по {this.state.todayDate}</Text> : null}

                                </Text>

                            </View>
                            <View style={styles.dataView}>
                                <Text style={{width: '55%'}}>Заказы</Text>
                                <Text style={{
                                    fontWeight: 'bold', width: '45%'
                                }}>{parseInt(this.state.articleList.income_orders)} ₽
                                    / {this.props.article.PeriodOrders ?
                                        <Text>{this.props.article.PeriodOrders}</Text> :
                                        <Text>{this.state.articleData.PeriodOrders}</Text>} шт </Text>

                                <View style={{width: '20%', flexDirection: 'row'}}>
                                    {/*<Text style={{width: '20%', marginRight: 5, marginTop: 5}}>*/}
                                    {/*    <Image*/}
                                    {/*        source={require('../../../assets/img/productArrow.png')}*/}
                                    {/*    />*/}
                                    {/*</Text>*/}
                                    {/*<Text style={{width: '70%', color: 'green'}}>*/}
                                    {/*    +100%*/}
                                    {/*</Text>*/}
                                </View>
                            </View>
                            <View style={styles.dataViewWhite}>
                                <Text style={{width: '55%'}}>Продажи</Text>
                                <Text
                                    style={{
                                        fontWeight: 'bold',
                                        width: '45%'
                                    }}>{parseInt(this.state.articleList.profit)} ₽
                                    / {this.state.articleList.sales_count} шт</Text>
                                <View style={{width: '20%', flexDirection: 'row'}}>
                                    {/*<Text style={{width: '20%', marginRight: 5, marginTop: 5}}>*/}
                                    {/*    <Image*/}
                                    {/*        source={require('../../../assets/img/productArrow.png')}*/}
                                    {/*    />*/}
                                    {/*</Text>*/}
                                    {/*<Text style={{width: '70%', color: 'green'}}>*/}
                                    {/*    +100%*/}
                                    {/*</Text>*/}
                                </View>
                            </View>
                            <View style={styles.dataView}>
                                <Text style={{width: '55%'}}>Возвраты</Text>
                                <Text style={{
                                    fontWeight: 'bold',
                                    width: '45%'

                                }}>{parseInt(this.state.articleList.returns_price)} ₽
                                    / {this.state.articleList.returns_count} шт</Text>
                                <Text style={{color: 'green', width: '19%'}}></Text>
                            </View>

                            <View style={styles.dataViewWhite}>
                                <Text style={{width: '55%'}}>Прибыль</Text>
                                <Text style={{
                                    fontWeight: 'bold',
                                    width: '45%'

                                }}>{parseInt(this.state.articleList.income_sales)} ₽</Text>
                                <View style={{width: '20%', flexDirection: 'row'}}>
                                    {/*<Text style={{width: '20%', marginRight: 5, marginTop: 5}}>*/}
                                    {/*    <Image*/}
                                    {/*        source={require('../../../assets/img/productArrow.png')}*/}
                                    {/*    />*/}
                                    {/*</Text>*/}
                                    {/*<Text style={{width: '70%', color: 'green'}}>*/}
                                    {/*    +100%*/}
                                    {/*</Text>*/}
                                </View>
                            </View>
                            <View style={styles.dataView}>
                                <Text style={{width: '55%'}}>Выкуп</Text>

                                <Text style={{fontWeight: 'bold', width: '45%'}}>
                                    {parseInt(this.state.articleList.buyout_price)} ₽
                                    / {this.state.articleList.buyout_count} шт
                                </Text>

                                <View style={{width: '20%', flexDirection: 'row'}}>
                                    {/*<Text style={{width: '20%', marginRight: 5, marginTop: 5}}>*/}
                                    {/*    <Image*/}
                                    {/*        source={require('../../../assets/img/productArrow.png')}*/}
                                    {/*    />*/}
                                    {/*</Text>*/}
                                    {/*<Text style={{width: '70%', color: 'green'}}>*/}
                                    {/*    +100%*/}
                                    {/*</Text>*/}
                                </View>
                            </View>
                            <View style={styles.dataViewWhite}>
                                <Text style={{width: '55%'}}>Логистика</Text>
                                <Text style={{
                                    fontWeight: 'bold',
                                    width: '45%'
                                }}>{parseInt(this.state.articleList.logistic)} ₽</Text>
                                <View style={{width: '20%', flexDirection: 'row'}}>
                                    {/*<Text style={{width: '20%', marginRight: 5, marginTop: 5}}>*/}
                                    {/*    <Image*/}
                                    {/*        source={require('../../../assets/img/productArrow.png')}*/}
                                    {/*    />*/}
                                    {/*</Text>*/}
                                    {/*<Text style={{width: '70%', color: 'green'}}>*/}
                                    {/*    +100%*/}
                                    {/*</Text>*/}
                                </View>
                            </View>
                        </View>

                    </View>
                </ScrollView>
            </SafeAreaView>

        )
    }
}
const styles = StyleSheet.create({
    view: {
        flex: 1,
        marginTop: 40,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 25
    },

    container: {
        width: '100%',
        borderRadius: 4,
        paddingBottom: 20,
        marginTop: 30
    },
    analyticItemTopRightTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#002033',
        textDecorationLine: 'underline',
        textDecorationColor: 'black',
        textDecorationStyle: 'solid'

    },
    analyticItemTopRightInfoArticleWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 20
    },
    analyticItemTopRightInfoArticle: {
        color: '#00395ccc',
        fontSize: 11,
    },
    analyticItemTopRightInfoWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    analyticItemBottomProgressItem: {
        width: '100%',
        // height:30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingLeft: 12,
        paddingRight: 3,
        marginBottom: 6,

    },
    analyticItemBottomProgressItemTitle: {
        fontSize: 14
    },
    analyticItemBottomProgressBarWrapper1: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    analyticItemBottomProgressBarWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginRight: 10
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
    addToCart: {},
    addToCartText: {
        fontSize: 12,
        color: 'white',
        marginRight: 8
    },
    analyticItemBottom: {
        width: '100%'

    },
    buttonsView: {
        alignItems: 'center',
        marginTop: 25,
        width: "100%"
    },
    productListButton: {
        flexDirection: 'row',
        margin: 15,
        borderWidth: 2,
        width: "100%",
        height: 50,
        textAlign: 'center',
        justifyContent: 'center',
        padding: 12,
        borderColor: '#0078D2',
        borderRadius: 5,

    },
    statistickView: {
        width: '100%',
        textAlign: 'center',
        alignItems: 'center',
        marginTop: 25
    },
    statistickViewTitle: {
        color: 'black',
        backgroundColor: '#a1bcd0',
        width: '100%',
        height: 40,
        padding: 10,
    },
    dataView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'rgba(0, 32, 51, 0.05)',
        height: 40,
        padding: 10
    },
    dataViewWhite: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        height: 40,
        padding: 10
    },
    linearGradient: {
        borderRadius: 5,
        width: 100,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 24,
    },
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
        right: 20,
        top: 10
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
})

