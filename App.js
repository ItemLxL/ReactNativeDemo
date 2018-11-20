/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, Dimensions} from 'react-native';
import Homes from './app/route/AppRegistry';
import TabNavigator from 'react-native-tab-navigator';
import Icon from 'react-native-vector-icons/FontAwesome';
import Me from './app/account/me';
import Login from './app/account/login';
import Home from './app/creation/home';
import Videos from './app/edit/addVideos';

const deviceW = Dimensions.get('window').width;

const basePx = 375;

function px2dp(px) {
    return px * deviceW / basePx
}

export default class App extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 'home'
        }
    }

    render() {
        return (
            <TabNavigator>
                <TabNavigator.Item
                    selected={this.state.selectedTab === 'home'}
                    title="Home"
                    selectedTitleStyle={{color: "#3496f0"}}
                    renderIcon={() => <Icon name="home" size={px2dp(22)} color="#666"/>}
                    renderSelectedIcon={() => <Icon name="home" size={px2dp(22)} color="#3496f0"/>}
                    onPress={() => this.setState({selectedTab: 'home'})}>
                    <Homes/>
                </TabNavigator.Item>
                <TabNavigator.Item
                    selected={this.state.selectedTab === 'videos'}
                    title="Add"
                    selectedTitleStyle={{color: "#3496f0"}}
                    renderIcon={() => <Icon name="plus" size={px2dp(22)} color="#666"/>}
                    renderSelectedIcon={() => <Icon name="plus" size={px2dp(22)} color="#3496f0"/>}
                    onPress={() => this.setState({selectedTab: 'videos'})}>
                    <Videos/>
                </TabNavigator.Item>
                <TabNavigator.Item
                    selected={this.state.selectedTab === 'me'}
                    title="Me"
                    selectedTitleStyle={{color: "#3496f0"}}
                    renderIcon={() => <Icon name="user" size={px2dp(22)} color="#666"/>}
                    renderSelectedIcon={() => <Icon name="user" size={px2dp(22)} color="#3496f0"/>}
                    onPress={() => this.setState({selectedTab: 'me'})}>
                    <Login/>
                </TabNavigator.Item>
            </TabNavigator>
        );
    }
}

const styles = StyleSheet.create({});