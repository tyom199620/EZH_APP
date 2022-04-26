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
    ActivityIndicator, ScrollView, Pressable
} from 'react-native';
// import { TextInput } from 'react-native-paper';
import {LinearGradient} from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, {Path} from "react-native-svg";


// const { signIn } = React.useContext(AuthContext);
import moment from 'moment';
import 'moment/locale/ru';


export default class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            orders: [],
            fscroll: props.fscroll,
            loading: false,
            user_buy_tareef: false,
            tariffInfo: [],
            buttunActive: false,
            isDemo: this.props.isDemo
        };
    }


    setOrdersList = async () => {
        try {
            let userToken = await AsyncStorage.getItem('userToken');
            let AuthStr = 'Bearer ' + userToken;

            this.setState({loading: true})

            axios.get('https://lk.e-zh.ru/api/orders?date=' + this.props.sortData + '&shop_id=' + this.props.shop_id, {
                headers: {'Authorization': AuthStr},
                "content-type": "application/json",
            }).then(
                (response) => {
                    this.setState({loading: false})
                    let orders = response.data.data;


                    for (let i = 0; i < orders.length; i++) {
                        var order_price = (orders[i].totalPrice * (100 - orders[i].discountPercent) / 100).toFixed(2);
                        orders[i].totalPrice = order_price
                    }
                    orders.sort(function (x, y) {
                        return x.timestamp - y.timestamp;
                    })

                    this.setState({
                        orders: response.data.data
                    })
                },
                (err) => {
                    //   console.log('err.response', err.response)
                },
            );
        } catch (e) {
            console.log('error' + e)

        }
    }

    setTariffInfo = async () => {
        let userToken = await AsyncStorage.getItem('userToken');
        let AuthStr = 'Bearer ' + userToken;
        try {
            this.setState({loading: true})

            fetch(`https://lk.e-zh.ru/api/user/is_demo`, {
                method: 'POST',
                headers: {'Authorization': AuthStr}
            }).then((response) => {
                return response.json()
            })
                .then((response) => {
                    this.setState({
                        isDemo: response,
                        loading: false
                    })
              //      console.log(response, 'asd')
                })
        } catch (e) {
            console.log('error' + e)
        }
    }


    getOrdersList = () => {
        return this.state.orders;
    }

    handleProducts = (article) => {
        this.props.navigationProps.navigate('ProductList', {
            params: article,
            url_date: this.props.sortData //important
        })
    }

    orderedDate = (date) => {
        moment().locale('ru');
        return moment(date).fromNow()
    }

    componentDidMount() {
        this.setTariffInfo()
        this.setOrdersList();
    }

    componentDidUpdate(prevProps) {

        if (this.props.refresh === true && this.props.refresh !== prevProps.refresh) {
            this.setOrdersList();
        }
        if (this.props.sortData !== prevProps.sortData) {
            this.setOrdersList();
        }
        if (this.props.shop_id !== prevProps.shop_id) {
            this.setOrdersList();
        }

    }

    render() {
        return (
            <View>
                <View style={order_list_styles.orderListWrapper}>

                    <Text style={order_list_styles.ordersListButtonsTitle}>Последние заказы</Text>

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

                    <ScrollView style={{height: 200, position: 'relative', zIndex: 555}}
                                nestedScrollEnabled={true}
                        // onTouchStart={(ev) => {
                        //      console.log('onTouchStart');
                        //     this.props.fscroll.setNativeProps({scrollEnabled: false})
                        // }}
                        // // onTouchMove={(ev) => {
                        // //      console.log('onTouchMove');
                        // //     this.props.fscroll.setNativeProps({scrollEnabled: false})
                        // // }}
                        // onTouchEnd={(ev) => {
                        //      console.log('onTouchEnd');
                        //     this.props.fscroll.setNativeProps({scrollEnabled: true})
                        // }}
                        // onMomentumScrollStart={(e) => {
                        //      console.log('onMomentumScrollStart')
                        //     this.props.fscroll.setNativeProps({scrollEnabled: false})
                        //
                        // }}
                        // onMomentumScrollEnd={(e) => {
                        //       console.log('onMomentumScrollEnd')
                        //     this.props.fscroll.setNativeProps({scrollEnabled: true})
                        //
                        // }}
                        // onScrollEndDrag={(e) => {
                        //      console.log('onScrollEndDrag');
                        //     this.props.fscroll.setNativeProps({scrollEnabled: true})
                        // }}
                    >

                        {this.getOrdersList().map((article, index) => (

                            <TouchableOpacity
                                key={article.id}
                                style={order_list_styles.orderListItemWrapper}
                                onPress={() => this.handleProducts(article)}
                                disabled={this.props.isDemo}
                            >

                                <View style={order_list_styles.orderListItemRight}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start',
                                            width: '100%',
                                            marginBottom: 5

                                        }}>
                                        <View
                                            style={order_list_styles.orderListItemLeft}>
                                            <Image style={order_list_styles.orderListItemLeftImg}
                                                   source={{uri: article.good_image}}/>
                                        </View>

                                        <View style={{flex: 1}}>
                                            <View>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'flex-start',
                                                    width: '100%',
                                                    marginBottom: 5
                                                }}>
                                                    {article.type == 'FBO' || article.type == 'FBS' ? (

                                                            <View style={order_list_styles.wildberiesWrapper}>
                                                                <Text style={order_list_styles.wildberies}>w</Text>
                                                            </View>

                                                        )
                                                        :
                                                        <View style={order_list_styles.ozonWrapper}>
                                                            <Text style={order_list_styles.ozon}>o</Text>
                                                        </View>
                                                    }

                                                    {article.type == 'FBO' || article.type == 'FBS' ? (
                                                        <View style={order_list_styles.wildberiesFBSWrapper}>
                                                            <Text
                                                                style={order_list_styles.wildberiesFBS}>{article.type}</Text>
                                                        </View>
                                                    ) : null}

                                                    {article.type == 'ozon_FBO' ? (
                                                        <View style={order_list_styles.ozonFBSWrapper}>
                                                            <Text style={order_list_styles.ozonFBS}>FBO</Text>
                                                        </View>
                                                    ) : null}

                                                    {article.type == 'ozon_FBS' ? (
                                                        <View style={order_list_styles.ozonFBSWrapper}>
                                                            <Text style={order_list_styles.ozonFBS}>FBS</Text>
                                                        </View>
                                                    ) : null}


                                                </View>

                                                <Text
                                                    style={order_list_styles.orderListItemTittle}>{article.GoodsName}</Text>

                                            </View>
                                        </View>
                                    </View>

                                    <View style={order_list_styles.orderListItemInfoMainWrapper}>
                                        <View style={order_list_styles.orderListItemInfoWrapper}>

                                            <View style={order_list_styles.orderListItemInfoLeft}>
                                                <Text style={order_list_styles.orderListItemInfoTitle}>Артикул:</Text>
                                                <Text
                                                    style={order_list_styles.orderListItemInfoTitleValue}>{article.article}</Text>
                                            </View>

                                            <View style={order_list_styles.orderListItemInfoLeft}>
                                                <Text style={order_list_styles.orderListItemInfoTitle}>Магазин:</Text>
                                                <Text
                                                    style={order_list_styles.orderListItemInfoTitleValue}>{article.ShopName}</Text>
                                            </View>

                                        </View>

                                        <View style={order_list_styles.orderListItemInfoWrapper}>

                                            <View style={order_list_styles.orderListItemInfoRight}>
                                                <Text style={order_list_styles.orderListItemInfoTitle}>Цена: </Text>
                                                <Text
                                                    style={order_list_styles.orderListItemInfoTitleValue}>{article.totalPrice} ₽</Text>
                                            </View>

                                            <View style={order_list_styles.orderListItemInfoRight}>
                                                <Text style={order_list_styles.orderListItemInfoTitle}>Заказано: </Text>
                                                <Text
                                                    style={order_list_styles.orderListItemInfoTitleValue}>{this.orderedDate(article.lastChangeDate)} </Text>
                                            </View>

                                        </View>
                                    </View>
                                </View>

                            </TouchableOpacity>


                        ))}
                    </ScrollView>

                    {/*<TouchableOpacity >*/}
                    {/*   <View style={order_list_styles.showMoreOrder}>*/}
                    {/*       <Text style={order_list_styles.showMoreOrderText}>*/}
                    {/*           Посмотреть все*/}
                    {/*           <View>*/}
                    {/*               <Svg style={{marginLeft:7}} width={12}  height={12}  viewBox="0 0 12 12"  fill="none"  xmlns="http://www.w3.org/2000/svg">*/}
                    {/*                   <Path d="M8.293 7H1V6h7.293L5.646 3.354l.708-.708L10.207 6.5l-3.853 3.854-.708-.708L8.293 7z" fill="#fff" />*/}
                    {/*               </Svg>*/}
                    {/*           </View>*/}

                    {/*       </Text>*/}
                    {/*   </View>*/}
                    {/*</TouchableOpacity>*/}

                </View>


            </View>
        );
    }
}
const order_list_styles = StyleSheet.create({

    wildberies: {
        color: 'white',
        fontWeight: 'bold',
        lineHeight: 15,
    },
    ozon: {
        color: 'white',
        fontWeight: 'bold',
        lineHeight: 15,
    },
    wildberiesWrapper: {
        backgroundColor: "#C511A8",
        width: 25,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginRight: 4
    },
    ozonWrapper: {
        backgroundColor: "#005CFE",
        width: 25,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginRight: 4
    },
    wildberiesFBSWrapper: {
        borderColor: '#C511A8',
        borderWidth: 1,
        width: 40,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    wildberiesFBS: {
        color: '#C511A8',
        fontWeight: 'bold',
        lineHeight: 17,
    },
    ozonFBSWrapper: {
        borderColor: '#005CFE',
        borderWidth: 1,
        width: 40,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    ozonFBS: {
        color: '#005CFE',
        fontWeight: 'bold',
        lineHeight: 17,
    },
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
        // height: 120,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#0020330d',
        marginBottom: 15,
        paddingBottom: 15,
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
    orderListItemRight: {
        width: '100%',
    },
    orderListItemTittle: {
        fontSize: 12,
        color: "#002033",
        fontWeight: 'normal',
        marginBottom: 8
    },

    orderListItemInfoMainWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%'
    },
    orderListItemInfoWrapper: {
        width: '50%'
    },
    orderListItemInfoLeft: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginRight: 13,
        // flex:1
    },
    orderListItemInfoRight: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        // flex:1

    },
    orderListItemInfoTitle: {
        fontSize: 11
    },
    orderListItemInfoTitleValue: {
        color: "#0071B2",
        marginLeft: 5,
        fontSize: 10
    },
    showMoreOrder: {
        width: '100%',
        height: 29,
        backgroundColor: '#0078D2',
        borderRadius: 4,
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    },
    showMoreOrderText: {
        color: 'white',
    }
})
