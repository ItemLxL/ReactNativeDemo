/*列表主页*/
import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    ImageBackground,
    TouchableHighlight,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    ToastAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import request from '../common/request';
import config from '../common/config';
import ItemInfo from "./itemInfo";

const deviceW = Dimensions.get('window').width;//获取当前屏幕可视宽度

/*缓存列表所有数据*/
var cachedResults = {
    nextPage: 1,
    items: [],
    total: 0
};

/*列表子组件*/
class OnesItem extends Component {
    constructor(props) {
        super(props);
        let item = this.props.item;
        let itemIndex = this.props.index;
        this.state = {
            up: item.voted,
            item: item,
            itemIndex: itemIndex
        };
        this._up = this._up.bind(this);
    }

    /*子组件接收到更新的props同步更新状态*/
    componentWillReceiveProps(nextProps) {
        this.setState({
            up: nextProps.item.voted,
            item: nextProps.item,
            itemIndex: nextProps.itemIndex
        });
    }

    /*点赞*/
    _up() {
        let up = !this.state.up;
        let item = this.state.item;
        let url = config.api.base + config.api.up;

        let body = {
            id: item._id,
            up: up ? 'yes' : 'no',
            accessToken: 'abcde'
        };

        request.post(url, body).then((data) => {
            if (data && data.success) {
                this.setState({
                    up: up
                })
            } else {
                ToastAndroid.show("点赞失败", ToastAndroid.SHORT);
            }
        }).catch((err) => {
            console.log(err);
            ToastAndroid.show("点赞失败", ToastAndroid.SHORT);
        });
    }

    render() {
        let item = this.state.item;
        let itemIndex = this.state.itemIndex;
        /*子组件获取传递过来的this.props.onSelect，然后通过onPress执行里面的方法，跳转到详情页面*/
        return (
            <TouchableHighlight onPress={this.props.onSelect}>
                <View style={styles.item} key={itemIndex}>
                    <Text style={styles.title}>{item.title}</Text>
                    <ImageBackground source={{uri: item.thumb}} style={styles.thumb}>
                        <Icon name='play-circle' size={46} style={styles.play}></Icon>
                    </ImageBackground>
                    <View style={styles.itemFooter}>
                        <View style={styles.handleBox}>
                            <Icon name='heart' size={28}
                                  style={[styles.up, this.state.up ? null : styles.down]} onPress={this._up}></Icon>
                            <Text style={styles.handleText} onPress={this._up}>喜欢</Text>
                        </View>
                        <View style={styles.handleBox}>
                            <Icon name='edit' size={28} style={styles.commentIcon}></Icon>
                            <Text style={styles.handleText}>评论</Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        )
    }
}

class Home extends Component {
    /*_keyExtractor用来设置列表的key值，不设置会有警告提示*/
    _keyExtractor = (item, index) => item.id;

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loaded: false,
            isLoadingTail: false,
            isRefreshing: false,
        };
        this.fetchData = this.fetchData.bind(this);
        this.renderItem = this.renderItem.bind(this);
    }

    //componentDidMount相当于Vue的mounted
    componentDidMount() {
        this.fetchData(1);
    }

    /*获取列表数据*/
    fetchData(page) {
        var that = this;
        if (page !== 0) {
            this.setState({
                isLoadingTail: true
            });
        } else {
            this.setState({
                isRefreshing: true
            });
        }
        request.get(config.api.base + config.api.creations, {
            page: page
        }).then((data) => {
            console.log(data.data);
            if (data.success) {
                var items = cachedResults.items.slice();
                if (page !== 0) {
                    items = items.concat(data.data);
                    cachedResults.nextPage += 1;
                } else {
                    items = data.data;
                }
                cachedResults.items = items;
                console.log(cachedResults.items);
                cachedResults.total = data.total;

                setTimeout(function () {
                    if (page !== 0) {
                        that.setState({
                            isLoadingTail: false,
                            data: cachedResults.items,
                        });
                    } else {
                        that.setState({
                            isRefreshing: false,
                            data: cachedResults.items,
                        })
                    }
                }, 10);
            }
        }).catch((error) => {
            if (page !== 0) {
                this.setState({
                    isLoadingTail: false,
                });
            } else {
                this.setState({
                    isRefreshing: false,
                });
            }
            console.warn(error);
        });
    }

    renderItem({item, index}) {
        //{item}是一种解构写法，item是FlatList中固定的参数名
        return <OnesItem item={item} index={index} key={item._id} onSelect={() => this.loadPage(item)}/>
    }

    hasMores() {
        return cachedResults.items.length !== cachedResults.total;
    }

    /*上拉加载*/
    _fetchMoreData() {
        if (!this.hasMores() || this.state.isLoadingTail) {
            return false;
        } else {
            var page = cachedResults.nextPage;
            this.fetchData(page);
        }
    }

    /*底部加载loading*/
    _renderFooter() {
        if (!this.hasMores() && cachedResults.total !== 0) {
            return (
                <View style={styles.loadingMore}>
                    <Text style={styles.loadingText}>没有更多了</Text>
                </View>
            )
        }
        if (!this.state.isLoadingTail) {
            return <View style={styles.loadingMore}/>
        }

        return <ActivityIndicator style={styles.loadingMore}/>
    }

    /*下拉刷新*/
    _onRefresh() {
        this.fetchData(0);
    }

    /*跳转列表详情页*/
    loadPage(info) {
        this.props.navigation.navigate('ItemInfo', {key: info})
    }

    render() {
        return (
            <View style={styles.container}>
                {/*<View style={styles.header}>
                    <Text style={styles.headerTitle}>
                        列表页面
                    </Text>
                </View>*/}
                <FlatList
                    data={this.state.data}
                    renderItem={this.renderItem}
                    keyExtractor={this._keyExtractor}
                    onEndReached={this._fetchMoreData.bind(this)}
                    onEndReachedThreshold={1}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this._onRefresh.bind(this)}
                            tintColor='#ff6600'
                            title='加载中...'
                        />
                    }
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    header: {
        paddingTop: 25,
        paddingBottom: 12,
        backgroundColor: '#ee735c'
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600'
    },
    item: {
        width: deviceW,
        marginBottom: 10,
        backgroundColor: '#fff'
    },
    thumb: {
        width: deviceW,
        height: deviceW * 0.5,
        resizeMode: 'cover'
    },
    title: {
        padding: 10,
        fontSize: 18,
        color: '#333'
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#eee'
    },
    handleBox: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    play: {
        position: 'absolute',
        flexDirection: 'row',
        bottom: 14,
        right: 14,
        width: 46,
        height: 46,
        textAlign: 'center',
        lineHeight: 46,
        backgroundColor: 'transparent',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 46,
        borderColor: '#fff',
        color: '#ed7b66',
        opacity: 0.5,
    },
    handleText: {
        paddingLeft: 12,
        fontSize: 18,
        color: '#333',
    },
    up: {
        fontSize: 22,
        color: '#ed7b66'
    },
    down: {
        fontSize: 22,
        color: '#333'
    },
    commentIcon: {
        fontSize: 22,
        color: '#333'
    },
    loadingMore: {
        marginVertical: 20
    },
    loadingText: {
        color: '#777',
        textAlign: 'center'
    },
});

export default Home;