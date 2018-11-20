/*页面路由配置*/
import {StackNavigator} from 'react-navigation';
import React from 'react';
import Home from '../creation/home';
import ItemInfo from '../creation/itemInfo';


export default Homes = StackNavigator({
    Home: {
        screen: Home,
        navigationOptions: {
            //左侧标题
            headerTitle: '列表页面',
            //顶部标题栏的样式
            headerStyle: {backgroundColor:'#4398ff'},
            //顶部标题栏文字的样式
            headerTitleStyle:{flex: 1,textAlign:'center',fontSize:18,color:'white'}
        }
    },
    ItemInfo: {
        screen: ItemInfo,
        navigationOptions: {
            //左侧标题
            headerTitle: '详情页面',
            //顶部标题栏的样式
            headerStyle: {backgroundColor:'#4398ff'},
            //顶部标题栏文字的样式
            headerTitleStyle:{flex: 1,textAlign:'center',fontSize:18,color:'white'}
        }
    },
});