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
    Platform,
    TouchableWithoutFeedback
} from 'react-native';

const screenHeight = Dimensions.get('window').height;
const {width, height} = Dimensions.get('window');
import Svg, {Path, Defs, G, ClipPath} from "react-native-svg"
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AuthContext} from "../../AuthContext/context";


import axios from 'axios';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ModalVisible: false,
            user_name: null,
            user_email: null,
            shop_list: [],
            buttonActive: false,
            isDemo: {}
        };

    }

    static contextType = AuthContext

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

    componentDidMount() {
        this.setAuthUserInfo().then(r => console.log());
        this.setShopList().then(r => console.log());
        this.setTariffInfo()
    }

    signOut = () => {
        this.context.signOut();
        AsyncStorage.removeItem('userToken');
    }

    setModalVisible(visible) {
        this.setState(state => {
            return this.state.ModalVisible = visible
        });
    }


    goToProductAnalytics = () => {
        this.setState(state => {
            return this.state.ModalVisible = false
        });
        this.props.navigation.navigate('ProductAnalytics')
    }

    goToDashboard = () => {
        this.setState(state => {
            return this.state.ModalVisible = false
        });
        this.props.navigation.navigate('Dashboard')
    }
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


    render() {

        return (
            <View style={{width: '100%', marginTop: (Platform.OS === 'ios') ? 28 : 0}}>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.ModalVisible}
                    style={{width: '100%', height: "100%", backgroundColor: 'red'}}
                >

                    <View
                        style={{height: '100%', width: '100%', justifyContent: 'space-between', flexDirection: 'row',}}>

                        <View style={{
                            backgroundColor: "white",
                            width: 250,
                            height: '100%',
                            borderRightWidth: 1,
                            borderRightColor: '#00416633',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                        }}>

                            <View style={{marginTop: (Platform.OS === 'ios') ? 19 : 0}}>
                                <TouchableOpacity style={{
                                    paddingBottom: 19,
                                    paddingHorizontal: 23,
                                    paddingVertical: (Platform.OS === 'ios') ? 20 : 11
                                }} onPress={() => {
                                    this.setModalVisible(!this.state.ModalVisible);
                                }}>
                                    <Svg width={37} height={37} viewBox="0 0 24 24" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <Path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="#00395C"
                                              fillOpacity={0.8}/>
                                    </Svg>
                                </TouchableOpacity>
                            </View>

                            <View style={{width: '100%', backgroundColor: '#fafafa', flex: 1}}>

                                <TouchableOpacity
                                    style={{
                                    width: '100%',
                                    backgroundColor: 'white',
                                    paddingHorizontal: 23,
                                    paddingVertical: 12,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#00416633'
                                }} onPress={() => {
                                    this.goToDashboard()
                                }}>
                                    <Text style={{color: "#002033", fontSize: 15, fontWeight: 'bold'}}>Дашборд</Text>
                                </TouchableOpacity>


                                {this.state.shop_list.length === 0 || this.state.isDemo === true ?
                                    <TouchableOpacity disabled={this.state.isDemo} style={{
                                        width: '100%',
                                        backgroundColor: 'white',
                                        paddingHorizontal: 23,
                                        paddingVertical: 12,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#00416633'
                                    }} onPress={() => {
                                        this.goToProductAnalytics()

                                    }}>
                                        <Text style={{color: "#7fb4d0", fontSize: 15, fontWeight: 'bold'}}>Товарная
                                            аналитика</Text>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity style={{
                                        width: '100%',
                                        backgroundColor: 'white',
                                        paddingHorizontal: 23,
                                        paddingVertical: 12,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#00416633'
                                    }} onPress={() => {
                                        this.goToProductAnalytics()
                                    }}>
                                        <Text style={{color: "#002033", fontSize: 15, fontWeight: 'bold'}}>Товарная
                                            аналитика</Text>
                                    </TouchableOpacity>}

                            </View>

                            <View style={styles.headerButtonStyle}>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.signOut()
                                    }}
                                    style={{
                                        width: "100%",
                                        flexDirection: 'row',
                                        justifyContent: 'flex-start',
                                        alignItems: 'center'
                                    }}>
                                    <Svg width={25} height={25} aria-hidden="true" data-prefix="fas"
                                         data-icon="sign-out-alt" xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 512 512" className="svg-inline--fa fa-sign-out-alt fa-w-16 fa-7x">
                                        <Path fill="#0078D2"
                                              d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"/>
                                    </Svg>
                                    <Text style={{fontSize: 15, marginLeft: 20, color: "#002033"}}>Выход</Text>
                                </TouchableOpacity>
                            </View>

                        </View>

                        <TouchableWithoutFeedback onPress={() => {
                            this.setModalVisible(!this.state.ModalVisible)
                        }} style={{width: '100%', height: screenHeight}}>
                            <View style={{height: screenHeight, width}}></View>
                        </TouchableWithoutFeedback>

                    </View>


                </Modal>

                <View style={styles.headerWrapper}>

                    <TouchableOpacity onPress={() => {
                        this.setModalVisible(!this.state.ModalVisible);
                    }}>
                        <Svg style={styles.menuToggle} width={37} height={37} viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <Path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="#00395C" fillOpacity={0.8}/>
                        </Svg>
                    </TouchableOpacity>

                    <View style={styles.headerRight}>

                        <Svg style={{marginRight: 34}} width={56} height={32} viewBox="0 0 56 32" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <Path
                                d="M30.136 27.638c-1.142 0-2.029-.323-2.661-.967-.633-.662-.949-1.688-.949-3.08 0-1.17.209-2.459.625-3.867.416-1.408 1.095-2.62 2.036-3.639.941-1.035 2.137-1.552 3.587-1.552 1.697 0 2.545.814 2.545 2.443 0 .95-.247 1.823-.74 2.62a5.785 5.785 0 01-1.967 1.935 6.019 6.019 0 01-2.615.814c-.03.509-.046.848-.046 1.018 0 .831.13 1.4.393 1.705.262.288.687.432 1.273.432.833 0 1.542-.212 2.128-.636.602-.424 1.258-1.069 1.967-1.934h.787c-1.712 3.139-3.833 4.708-6.363 4.708zm.046-6.515c.571-.033 1.11-.254 1.62-.661a4.374 4.374 0 001.25-1.552 4.27 4.27 0 00.485-1.985c0-.696-.193-1.043-.578-1.043-.556 0-1.103.534-1.643 1.603-.524 1.069-.902 2.281-1.134 3.639zm.88-8.219c-.402 0-.741-.144-1.019-.432-.262-.306-.393-.679-.393-1.12 0-.424.131-.789.393-1.094a1.324 1.324 0 011.018-.458c.386 0 .718.153.995.458.278.305.417.67.417 1.094 0 .441-.139.814-.417 1.12-.277.288-.609.433-.994.433zm4.164 0a1.36 1.36 0 01-1.018-.432c-.262-.306-.393-.679-.393-1.12 0-.424.131-.789.393-1.094a1.324 1.324 0 011.018-.458c.386 0 .718.153.995.458.278.305.417.67.417 1.094 0 .441-.139.814-.417 1.12-.277.288-.609.433-.995.433z"
                                fill="#193647"/>
                            <Path
                                d="M37.836 27.638c-.956 0-1.65-.255-2.082-.764-.448-.526-.671-1.17-.671-1.934 0-.678.13-1.204.393-1.577.262-.373.586-.56.972-.56.34 0 .617.119.833.356-.2.594-.3 1.154-.3 1.68 0 .492.084.856.254 1.094.17.237.362.356.578.356.417 0 .818-.382 1.203-1.145.386-.763.702-1.713.949-2.85s.37-2.205.37-3.206c0-1.781-.47-2.672-1.411-2.672-.432 0-.78.153-1.041.458-.263.305-.51.789-.741 1.45h-1.203c.34-1.238.802-2.18 1.388-2.824.602-.645 1.42-.967 2.453-.967 1.049 0 1.874.365 2.476 1.094.601.73.902 1.714.902 2.952 0 .407-.023.831-.07 1.272h1.389l.972-5.089h3.1l-.971 5.09h1.295c.417-1.544 1.018-2.817 1.805-3.818.787-1 1.766-1.501 2.939-1.501.864 0 1.473.229 1.828.687.37.441.555.992.555 1.654 0 .594-.116 1.052-.347 1.374-.216.322-.494.484-.833.484-.278 0-.548-.102-.81-.306.154-.56.232-1.06.232-1.501 0-.322-.047-.577-.14-.763-.092-.187-.223-.28-.393-.28-.385 0-.779.39-1.18 1.17-.385.764-.702 1.713-.949 2.85-.246 1.12-.37 2.18-.37 3.18 0 .9.155 1.57.463 2.011.309.441.725.662 1.25.662.879 0 1.766-.458 2.66-1.374-.246 1.34-.732 2.222-1.457 2.646a4.74 4.74 0 01-2.36.61c-1.05 0-1.875-.364-2.476-1.093-.602-.73-.903-1.714-.903-2.952 0-.882.062-1.62.185-2.214h-1.318l-1.157 6.107h-3.1l1.18-6.107H42.88c-.324 1.73-.91 3.206-1.758 4.428-.849 1.221-1.944 1.832-3.286 1.832z"
                                fill="#193647"/>
                            <G clipPath="url(#clip0_110_5323)">
                                <Path
                                    d="M22.38 13.28c-1.183.7-2.482 1.031-3.793 1.312-1.056.216-2.135.344-3.19.573-1.556.319-3.11.676-4.653 1.045-1.16.28-2.158.943-3.168 1.606-.371.242-.742.497-1.114.74-.046 0-.243-.04-.243-.04s.035-.14.104-.318c.917-1.707 2.24-2.969 3.771-3.963 4.05-3.135 7.043-2.83 7.39-2.893-.197-.268-.464-.191-.614-.408-.522-.777-1.068-1.554-1.555-2.357a4.666 4.666 0 01-.499-1.198c-.209-.727.035-1.211.743-1.287.673-.077 1.357-.013 2.03.038 1.207.102 2.413.395 3.632.115.452-.102.66-.345 1.113-.447.407.077.662.255.813.396.754.688 1.59 1.121 2.599 1.172.37.013.742.178 1.113.268v.33c.035.077.081.154.116.218.093.076.186.152.29.216-.035.128-.058.28-.127.395-.522 2.842-4.757 4.486-4.757 4.486z"
                                    fill="#FEFAF9"/>
                                <Path opacity={0.3}
                                      d="M12.275 17.102c-3.573-.102-4.861.51-4.861.51.94-.637 2.726-1.682 3.817-1.95 1.462-.357 2.924-.688 4.386-.994.997-.204 2.007-.331 3.005-.548 3.457-.828 5.244-1.937 5.615-2.192.604-.446 2.1-1.988 2.82-3.479.487 1.364-3.18 4.231-3.55 4.473-1.173.74-2.344 1.491-3.203 2.664-.22.306-1.311 4.154-1.59 5.238-.115 2.446.14 2.587.755 4.37a208.522 208.522 0 012.111 4.818c-1.125-.484-5-1.657-5.975-2.447-.673-.548-1.334-1.134-2.181-1.364-.893-.242-1.729-.152-2.437.51-.58.536-1.102 1.147-1.636 1.733-.139.153-.243.357-.36.523-.66.981-1.89 1.172-2.11-.344-.268-2.154-.07-3.046.057-3.836.371-2.281 2.89-5.85 5.337-7.685z"
                                      fill="#D8D8D8"
                                />

                                <Path
                                    d="M26.372 7.608c-.371-.09-.73-.255-1.114-.268-1.01-.05-1.845-.471-2.599-1.172-.15-.14-.371-.178-.568-.255.58-.484.58-.484.603-1.262 1.08 1.3 2.17 2.46 3.933 2.167l-.255.79z"
                                    fill="#FAFAFA"/>
                                <Path
                                    d="M27.555 6.117c-.58.242-1.137.128-1.694.102-.788-.038-1.415-.382-1.972-1.032-.661-.765-1.369-1.504-2.135-2.141C20.142 1.708 18.274.98 16.336.459 15.106.115 13.853.039 12.484 0c1.508 1.045 2.286 2.383 2.262 2.421-1.624-.535-3.237-1.096-4.93-1.185-1.683-.076-3.342.128-4.931.816 1.88.586 3.654 1.338 5.197 2.905-.232 0-2.958.153-4.188.383-1.729.318-3.307 1.032-4.606 2.357-.105.102-.186.242-.267.357 1.102.077 2.17.102 3.214.242A8.022 8.022 0 017.32 9.38c-2.982.892-5.673 2.077-7.31 5.135.882-.23 1.683-.51 2.507-.65.812-.14 1.647-.229 2.575 0-2.239 1.657-3.944 3.607-4.408 6.678.174-.14.255-.216.348-.293 1.88-1.593 3.202-1.822 3.376-1.81-.058.192-.128.395-.174.587-.232.802-.534 1.593-.685 2.421-.197 1.109-.162 2.218.348 3.326.418-1.312.998-2.421 1.95-3.224-.082 2.561-.128 5.085.87 7.392-.952.216-1.915.42-2.878.65a2.037 2.037 0 00-.684.33c-.337.256-.348.498 0 .727.278.179.51.28.905.408 1.09.357 2.239.484 3.364.612 3.411.382 6.823.408 10.234.114 1.531-.127 3.051-.458 4.571-.713.313-.051.627-.204.917-.383.417-.255.406-.535-.012-.777-.371-.204-.789-.319-1.184-.497-.116-.051-.278-.191-.278-.293.023-1.007-.394-1.848-.812-2.69-1.021-2.025-1.45-4.18-1.358-6.473.093-2.192.894-3.976 2.518-5.263.8-.625 1.648-1.173 2.483-1.746 1.056-.714 1.95-1.593 2.518-2.83.267-.56.464-1.159.72-1.732.196-.434.486-.816.637-1.262.244-.701-.186-1.262-.824-1.007zM10.268 28.648c.487-.802.998-1.478 1.729-1.911.452-.268.94-.293 1.392-.077.499.255.986.561 1.45.88.464.318.905.688 1.416 1.096-2.03.012-3.968.012-5.987.012zm14.979-17.255c-.325.268-.813.382-1.242.102-.07-.064.012-.166.035-.23.116-.254.07-.484-.162-.56-.244-.051-.592.522-.79.764-.185.243-.29.549-.023.638.21.127.627-.943 1.265.089-.36.23-.72.459-1.067.688-1.126.701-2.24 1.427-3.075 2.562-.766.892-.998 1.554-1.334 3.07-.627 2.805-.186 5.583 1.102 8.144.162.332.29.689.44 1.032.105.294.244.574.314.867.14.612-.104.93-.661.816-.476-.102-.928-.357-1.392-.535-1.08-.46-2.043-1.148-2.97-1.9-.65-.522-1.277-1.083-2.09-1.312-.858-.23-1.658-.14-2.343.484-.557.51-1.125 1.033-1.566 1.67-1.334 1.924-2.982 1.134-2.483-2.218.209-1.389.569-2.638 1.253-3.797a16.977 16.977 0 012.982-3.696c.302-.28.557-.625.835-.943-3.306-.28-4.826.51-4.861.51.035-.102.87-1.836 3.504-3.913 1.798-1.172 3.759-1.835 5.813-2.204.231-.039.452-.09.765-.153-.174-.243-.325-.447-.464-.65-.476-.714-.963-1.415-1.404-2.154a4.47 4.47 0 01-.452-1.096c-.186-.663.035-1.096.673-1.173.603-.063 1.23-.012 1.845.039 1.09.089 2.17.293 3.283.102 1.056-.179 1.752-.727 1.775-1.428.975 1.186 1.96 2.243 3.55 1.976-.104.318-.209.51-.232.713a.666.666 0 00.105.51c.301.395.893.255.881.28-.29 1.135-.95 2.192-1.81 2.906z"
                                    fill="#193647"/>
                                <Path
                                    d="M12.275 17.102c-1.218 3.53-2.587 6.003-3.26 10.743-.197 1.351-2.054 1.542-1.903-1.554.035-1.402.488-2.587 1.021-3.964 1.265-2.345 2.286-3.224 4.142-5.225zM18.436 28.38c-.916-1.12-1.3-2.433-1.334-3.937-.047-1.58.116-3.11.499-4.626.313-1.173.765-1.797 1.404-2.74.058-.09.07-.102.197-.28-.198.688-.279 1.019-.383 1.758-.128.969-.116 1.045-.174 1.517-.128 1.083-.058 2.561.336 4.09.302 1.186.5 1.555 1.021 2.702.163.383.116.255.36.854.104.293.244.573.313.867.14.611-.093.879-.661.815-.859-.076-1.473-.905-1.578-1.02z"
                                    fill="#FEFAF9"/>
                                <Path
                                    d="M20.35 27.73c.302 1.135-.881.205-1.299-.509-.476-.867-.951-2.128-.998-3.364-.07-1.632.093-2.613.255-3.9a4.694 4.694 0 01.569-1.746c-.453 2.855-.244 5.926 1.044 8.488.163.344.29.688.43 1.032zM10.129 6.525c.348-.038.65-.102.986-.523-2.495-.012-4.687-.7-7.135 1.007a11.092 11.092 0 001.844-.23c1.427-.292 2.112-.037 4.305-.254zM12.356 3.199c.267.05.5.064.824-.179-1.845-.535-3.341-1.503-5.453-.752.464.115.94.192 1.404.217 1.102.077 1.566.408 3.225.714zM16.162 1.223c1.218.905 2.437 1.785 3.956 1.848-.498-.854-3.306-2.115-3.956-1.848zM9.375 7.99c1.856.051 3.237.395 4.85 1.186-1.277-1.288-3.075-1.912-4.85-1.186zM4.896 19.868c-.209.382-.464.739-.325 1.262 1.068-1.402 1.172-1.695.963-2.587-.243.522-.417.942-.638 1.325z"
                                    fill="#FEFAF9"/>
                                <Path
                                    d="M20.49 7.455c0 .42.174 1.032.522.994.209-.013.325-.395.255-.764.383.56.418.917.174 1.3-.232.37-.603.51-.951.382-.418-.166-.662-.523-.673-.994-.012-.485.185-.752.673-.918z"
                                    fill="#193647"/>
                                <Path d="M26.813 7.34c.197-.433.44-.662.963-.484-.035.434-.534.6-.963.485z"
                                      fill="#E4E5E5"/>
                                <Path
                                    d="M14.224 4.69s1.868-.077 3.307.548c0 0-.522-1.72-3.307-.548zM6.996 12.438s2.065-.88 3.724-.599c0 0-.823-1.784-3.724.6zM3.051 17.357s1.311-2.383 3.029-2.905c2.076-.638-.592 1.032-.592 1.032s-1.81.867-2.437 1.873zM3.04 12.731s2.262-1.771 5-2.14c2.31-.307-.893-.867-2.935.241-1.311.714-1.984 1.823-2.065 1.9z"
                                    fill="#FEFAF9"/>
                            </G>
                            <Defs>
                                <ClipPath id="clip0_110_5323">
                                    <Path fill="#fff" d="M0 0H28.4488V32H0z"/>
                                </ClipPath>
                            </Defs>
                        </Svg>

                        {/*<TouchableOpacity style={{position: "relative", top: 5}}>*/}
                        {/*    <Svg width={10} height={13} viewBox="0 0 10 13" fill="none"*/}
                        {/*         xmlns="http://www.w3.org/2000/svg">*/}
                        {/*        <Path*/}
                        {/*            d="M5 0a1 1 0 00-.992 1.124A4.002 4.002 0 001 5v3a1 1 0 000 2h8a1 1 0 100-2V5a4.002 4.002 0 00-3.008-3.876A1 1 0 005 0zM7 11a2 2 0 11-4 0h4z"*/}
                        {/*            fill="#00395C" fillOpacity={0.8}/>*/}
                        {/*    </Svg>*/}
                        {/*</TouchableOpacity>*/}

                        <TouchableOpacity style={styles.userInfo}>
                            <View style={styles.userInfoNameWrapper}>
                                <Text numberOfLines={1} style={styles.userInfoName}>
                                    {this.state.user_name !== null ? this.state.user_name : ''}
                                </Text>

                                {/*<Text style={styles.userInfoDopInfo}></Text>*/}
                            </View>
                        </TouchableOpacity>

                    </View>

                </View>
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
        alignSelf: 'flex-end',


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
        alignItems: 'center',
        position: 'relative',

    },
    userInfoName: {
        fontSize: 16,
        color: "#002033",
        marginTop: 5,
        maxWidth: 110,
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
    blueBackground: {},
    headerButtonStyle:{
        width: "100%",
        height: 60,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 23
    }
});
