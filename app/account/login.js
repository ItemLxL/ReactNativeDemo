/*个人中心*/
import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions, ToastAndroid} from 'react-native';
import request from '../common/request';
import config from '../common/config';

import CountDownText from '../common/CountDownText'

const deviceW = Dimensions.get('window').width;//获取当前屏幕可视宽度

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            phoneNumber: '',
            codeSend: false,
            countingDone: false,
            verifyCode: ''
        }
    }

    /*登录*/
    _submit() {
        var that = this;
        var phoneNumber = this.state.phoneNumber;
        var verifyCode = this.state.verifyCode;
        if (!phoneNumber || !verifyCode) {
            return ToastAndroid.show("手机号或验证码不能为空", ToastAndroid.SHORT);
        } else {
            var body = {
                phoneNumber: phoneNumber,
                verifyCode: verifyCode,
            };
            var verifyUpUrl = config.api.base + config.api.verify;

            request.post(verifyUpUrl, body).then((data) => {
                if (data && data.success) {
                    console.log(data);
                } else {
                    ToastAndroid.show("获取验证码失败，请检查手机号是否正确", ToastAndroid.SHORT);
                }
            }).catch((err) => {
                ToastAndroid.show(err, ToastAndroid.SHORT);
            });
        }
    }

    _showVerifyCode() {
        this.setState({
            codeSend: true
        });
    }

    /*倒计时结束后的操作*/
    _countingDone() {
        this.setState({
            countingDone: true
        });
    }

    /*获取验证码*/
    _sendVerifyCode() {
        var that = this;
        var phoneNumber = this.state.phoneNumber;
        if (!phoneNumber) {
            return ToastAndroid.show("手机号不能为空", ToastAndroid.SHORT);
        } else {
            var body = {
                phoneNumber: phoneNumber
            };
            var signUpUrl = config.api.base + config.api.signUp;

            request.post(signUpUrl, body).then((data) => {
                if (data && data.success) {
                    that._showVerifyCode();
                } else {
                    ToastAndroid.show("获取验证码失败，请检查手机号是否正确", ToastAndroid.SHORT);
                }
            }).catch((err) => {
                ToastAndroid.show(err, ToastAndroid.SHORT);
            });
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.signUpBox}>
                    <Text style={styles.title}>快速登录</Text>
                    <View style={styles.inputFieldBox}>
                        <TextInput placeholder='输入手机号' autoCaptialize={'none'} autoCorrect={false}
                                   keyborderadType={'number-pad'} style={styles.inputField} onChangeText={(text) => {
                            this.setState({
                                phoneNumber: text
                            })
                        }}/>
                    </View>
                    {
                        this.state.codeSend ? <View style={styles.verifyCodeBox}>
                            <TextInput placeholder='输入验证码' autoCaptialize={'none'} autoCorrect={false}
                                       keyborderadType={'number-pad'} style={styles.inputField}
                                       onChangeText={(text) => {
                                           this.setState({
                                               verifyCode: text
                                           })
                                       }}/>
                            {this.state.countingDone ? <TouchableOpacity style={styles.countBtn}
                                                                         onPress={this._sendVerifyCode.bind(this)}><Text>获取验证码</Text></TouchableOpacity> :
                                <CountDownText style={styles.countBtn} countType='seconds' auto={true}
                                               afterEnd={this._countingDone.bind(this)} timeLeft={10} step={-1}
                                               startText='获取验证码'
                                               endText='获取验证码'
                                               intervalText={(sec) => sec + '秒重新获取'}/>}
                        </View> : null
                    }
                    {this.state.codeSend ? <TouchableOpacity style={styles.btn}
                                                             onPress={this._submit.bind(this)}><Text>登录</Text></TouchableOpacity> :
                        <TouchableOpacity style={styles.btn}
                                          onPress={this._sendVerifyCode.bind(this)}><Text>下一步</Text></TouchableOpacity>}
                </View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    signUpBox: {
        marginTop: 30,
    },
    title: {
        marginBottom: 20,
        color: '#333',
        fontSize: 20,
        textAlign: 'center'
    },
    inputFieldBox: {
        height: 40,
    },
    inputField: {
        flex: 1,
        padding: 5,

        color: '#666',
        fontSize: 16,
        backgroundColor: '#fff',
        borderRadius: 4
    },
    btn: {
        padding: 10,
        marginTop: 10,
        backgroundColor: 'transparent',
        borderColor: '#ee735c',
        borderWidth: 1,
        borderRadius: 4,
        color: '#ee735c',
        alignItems: 'center'
    },
    verifyCodeBox: {
        height: 40,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    countBtn: {
        width: 100,
        height: 40,
        marginLeft: 8,
        backgroundColor: 'transparent',
        borderColor: '#ee735c',
        lineHeight: 40,
        textAlign: 'left',
        fontSize: 15,
        borderRadius: 2
    }
});

export default Login;