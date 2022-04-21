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

import PureChart from 'react-native-pure-chart';

const {width, height} = Dimensions.get('window');
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AuthContext} from "../AuthContext/context";
import axios from 'axios';

import WebView from "react-native-webview";

import chartHtml from './chartHtml';

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            order_today: false,
            order_week: false,
            order_month: true,
            chart_data: [],
            chart_date_filter: 1,
            chart_labels: [],
            shop_id: null,
            loading: false
        };


    }

    componentDidUpdate(prevProps) {


        if (this.props.shop_id !== prevProps.shop_id) {
            this.setState({shop_id: this.props.shop_id})

            this.setChartInfo();

        }

        if (this.props.refresh === true && this.props.refresh !== prevProps.refresh) {

            this.setChartInfo();

        }
    }


    setChartInfo = async () => {

        try {
            let userToken = await AsyncStorage.getItem('userToken');
            let AuthStr = 'Bearer ' + userToken;

            let shop_id = this.state.shop_id
            let chart_date_filter = this.state.chart_date_filter;

            this.setState({loading: true})


            axios.get('https://lk.e-zh.ru/api/dashboard/chart?date=1+month&article=null&size=null&shop_id=' + shop_id, {headers: {'Authorization': AuthStr}})

                .then(response => {
                    this.setState({loading: false})

                    if (response.status === 200) {

                        let orders = response.data.orders;
                        let sales = response.data.sales;

                        let full_chart_data = [];

                        var chart_orders_date_group = {};
                        var chart_sales_date_group = {};

                        if (orders.length > 0) {

                            for (let i = 0; i < orders.length; i++) {
                                var order_price = (orders[i].price * (100 - orders[i].discount) / 100).toFixed(2);

                                if (orders[i].date in chart_orders_date_group) {
                                    chart_orders_date_group[orders[i].date] = chart_orders_date_group[orders[i].date] + parseFloat(order_price);
                                } else {
                                    chart_orders_date_group[orders[i].date] = parseFloat(order_price);
                                }
                            }
                        }

                        if (sales.length > 0) {

                            for (let j = 0; j < sales.length; j++) {

                                if (sales[j].date in chart_sales_date_group) {
                                    chart_sales_date_group[sales[j].date] = chart_sales_date_group[sales[j].date] + parseFloat(sales[j].forPay.toFixed(2));
                                } else {
                                    chart_sales_date_group[sales[j].date] = parseFloat(sales[j].forPay.toFixed(2));
                                }

                            }

                        }


                        // Если orders и sales имкют разную длину чарт вызывает ошибку (ниже приводим к одинаковой длине с нулевыми значениями для отсутствующих элементоа)

                        if (orders.length > 0 || sales.length > 0) {

                            for (let group_key in chart_orders_date_group) {
                                if (chart_sales_date_group[group_key] === undefined) {
                                    chart_sales_date_group[group_key] = 0;
                                }
                            }


                            for (let group_key in chart_sales_date_group) {

                                if (chart_orders_date_group[group_key] === undefined) {
                                    chart_orders_date_group[group_key] = 0;
                                }
                            }


                            if (orders.length > 0) {

                                var chart_data_orders = [];

                                for (let key in chart_orders_date_group) {

                                    let date_arr = key.split('-')
                                    var months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Ноябрь', 'Декабрь',];
                                    let month_name = date_arr[2] + ' ' + months[date_arr[1] - 1].substring(0, 3);

                                    chart_data_orders.push({
                                        x: month_name,
                                        y: chart_orders_date_group[key],
                                        sort_date_name: months[date_arr[1] - 1].substring(0, 3),
                                        sort_date: key
                                    })
                                }
                                chart_data_orders.sort((a, b) => (a.sort_date < b.sort_date) ? 1 : -1)

                                full_chart_data.push({
                                    seriesName: 'orders',
                                    data: chart_data_orders,
                                })
                            }

                            if (sales.length > 0) {

                                var chart_data_sales = [];

                                for (let key2 in chart_sales_date_group) {

                                    let date_arr = key2.split('-')
                                    var months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Ноябрь', 'Декабрь',];
                                    let month_name = date_arr[2] + ' ' + months[date_arr[1] - 1].substring(0, 3);

                                    chart_data_sales.push({
                                        x: month_name,
                                        y: chart_sales_date_group[key2],
                                        sort_date_name: months[date_arr[1] - 1].substring(0, 3),
                                        sort_date: key2
                                    })
                                }
                                chart_data_sales.sort((a, b) => (a.sort_date < b.sort_date) ? 1 : -1)

                                full_chart_data.push({
                                    seriesName: 'sales',
                                    data: chart_data_sales,
                                })

                            }
                        } else {
                            // если график пустой

                            let chart_data_default_empty = [];

                            if (this.state.chart_date_filter == 1) {
                                var chart_default_group = this.getDefaultDays(1);
                            } else if (this.state.chart_date_filter == 7) {
                                var chart_default_group = this.getDefaultDays(8);
                            } else {
                                var chart_default_group = this.getDefaultDays(30);
                            }

                            for (let j = 0; j < chart_default_group.length; j++) {

                                let date_arr = chart_default_group[j].split('-')
                                let months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Ноябрь', 'Декабрь',];
                                let month_name = date_arr[2] + ' ' + months[date_arr[1] - 1].substring(0, 3);

                                chart_data_default_empty.push({
                                    x: month_name,
                                    y: 0,
                                    sort_date_name: months[date_arr[1] - 1].substring(0, 3),
                                    sort_date: chart_default_group[j]
                                })
                            }

                            chart_data_default_empty.sort((a, b) => (a.sort_date < b.sort_date) ? 1 : -1)

                            full_chart_data.push({
                                seriesName: 'sales',
                                data: chart_data_default_empty,
                            }, {
                                seriesName: 'orders',
                                data: chart_data_default_empty,
                            })


                        }


                        this.setState({
                            chart_data: full_chart_data,
                        });


                        let labels = [];
                        let chart_data_orders_for_chart = [];
                        let chart_data_sales_for_chart = [];

                        if (typeof chart_data_orders !== 'undefined' && chart_data_orders.length > 0) {
                            for (let i = 0; i < chart_data_orders.length; i++) {
                                labels.push(chart_data_orders[i].x)
                                chart_data_orders_for_chart.push(chart_data_orders[i].y)
                            }
                        }

                        if (typeof chart_data_sales !== 'undefined' && chart_data_sales.length > 0) {
                            for (let j = 0; j < chart_data_sales.length; j++) {
                                chart_data_sales_for_chart.push(chart_data_sales[j].y)
                            }
                        }

                        this.webview.postMessage(JSON.stringify({
                            'labels': labels.reverse(),
                            'chart_data_orders_for_chart': chart_data_orders_for_chart.reverse(),
                            'chart_data_sales_for_chart': chart_data_sales_for_chart.reverse(),
                        }))

                    }

                });

        } catch (e) {
            // read error
        }

    }



    handleMessage = (evt) => {
        const message = evt.nativeEvent.data
    }

    getWeek = (i) => {
        var now = new Date();
        var n = now.getDay();
        var start = new Date();
        if (i == 0) {
            start.setDate(now.getDate() - n); // Получить первый день, второй день, третий день недели ...
        } else {
            start.setDate(now.getDate() - n - i); // Получить первый день, второй день, третий день недели ...
        }
        return start;
    }

    // Получить семь дней в течение одной недели с текущей даты
    getDefaultDays = (j) => {
        var days = new Array();
        for (var i = 0; i < j; i++) {
            let day = this.getWeek(i);
            let day_ = day.getDate();
            day_ = day_ < 10 ? '0' + day_ : day_
            let full = day.getFullYear() + '-' + day.getMonth() + 1 + '-' + day_
            days[i] = full;
        }

        return days;
    }


    componentDidMount() {
        this.setChartInfo().then(r => console.log("ok"));
    }

    static contextType = AuthContext


    openOrderTab = (order_today, order_week, order_month) => {

        this.setState({
            order_today: order_today,
            order_week: order_week,
            order_month: order_month,
        });

        if (order_today === true) {
            this.setState({
                chart_date_filter: '1'
            })
        } else if (order_week === true) {
            this.setState({
                chart_date_filter: '7'
            })
        } else if (order_month === true) {
            this.setState({
                chart_date_filter: '1+month'
            })
        }

        this.setChartInfo();

    };

    setModalVisible(visible) {
        this.setState(state => {
            return this.state.ModalVisible = visible
        });
    }


    render() {
        const images = [
            'https://placeimg.com/640/640/nature',
            'https://placeimg.com/640/640/people',
        ];

        return (
            <View style={order_styles.orderWrapper}>

                <View style={order_styles.orderButtonsWrapper}>

                    <Text style={order_styles.orderButtonsTitle}>Заказы</Text>

                    <View style={order_styles.orderButtons}>

                        {/*<TouchableOpacity style={this.state.order_today === true ? { ...order_styles.orderButton, ...order_styles.orderButtonActive} : { ...order_styles.orderButton}} onPress={() => {this.openOrderTab(true, false, false);}}>*/}
                        {/*    <Text style={this.state.order_today === true ? { fontSize: 11 ,color:'white'} : {fontSize: 11 , color:'black'} }>Сегодня</Text>*/}
                        {/*</TouchableOpacity>*/}

                        {/*<TouchableOpacity style={ this.state.order_week === true ? { ...order_styles.orderButton, ...order_styles.orderButtonActive} : { ...order_styles.orderButton} } onPress={() => {this.openOrderTab(false, true, false);}}>*/}
                        {/*    <Text style={ this.state.order_week === true ? { fontSize: 11 ,color:'white'} : {fontSize: 11 , color:'black'}}>Неделя</Text>*/}
                        {/*</TouchableOpacity>*/}

                        <TouchableOpacity
                            style={this.state.order_month === true ? {...order_styles.orderButton, ...order_styles.orderButtonActive} : {...order_styles.orderButton}}
                            onPress={() => {
                                this.openOrderTab(false, false, true);
                            }}>
                            <Text style={this.state.order_month === true ? {fontSize: 11, color: 'white'} : {
                                fontSize: 11,
                                color: 'black'
                            }}>Месяц</Text>
                        </TouchableOpacity>

                    </View>

                </View>

                <Text style={order_styles.orderDesc}>
                    Сумма всех заказов в штуках и рублях. Влючая отмененные заказы. Учитывая все скидки и промокоды.
                </Text>
                <View>
                    <Text style={{textAlign: 'center', marginBottom: 10}}>
                        Данные за месяц
                    </Text>
                </View>
                <View style={order_styles.orderTypeWrapper}>
                    {this.state.loading === true ?
                        <View style={{
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'white',
                        }}>
                            <ActivityIndicator size="large" color="0078D2"/>
                        </View>
                        : null}

                    <View style={order_styles.orderTypeItem}>
                        <View style={order_styles.orderTypeBlue}></View>
                        <Text style={order_styles.orderTypeText}>Заказы</Text>
                    </View>

                    <View style={order_styles.orderTypeItem}>
                        <View style={order_styles.orderTypeGreen}></View>
                        <Text style={order_styles.orderTypeText}>Прибыль</Text>
                    </View>


                </View>

                <View>

                    <WebView
                        source={{html: chartHtml}}
                        // source={chartHtml}
                        style={{width: '100%', height: 300}}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowFileAccess={true}
                        originWhitelist={['*']}
                        ref={w => this.webview = w}
                        onMessage={this.handleMessage}
                    />

                </View>

            </View>
        );
    }
}

const order_styles = StyleSheet.create({
    orderWrapper: {
        backgroundColor: 'white',
        borderRadius: 5,
        width: '100%',
        // height:450,
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

    },
    orderTypeBlue: {
        width: 12,
        height: 12,
        borderRadius: 30,
        backgroundColor: '#56B9F2',
        marginRight: 8,

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
        marginRight: 13,
        borderRadius: 30,
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

