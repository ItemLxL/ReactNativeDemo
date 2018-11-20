/*列表详情页*/
import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Image,
    FlatList,
    TextInput,
    Modal,
    ToastAndroid
} from 'react-native';
import Video from 'react-native-video';
import RnButton from 'react-native-button';
import Icon from 'react-native-vector-icons/FontAwesome';
import request from '../common/request';
import config from '../common/config';

const deviceW = Dimensions.get('window').width;//获取当前屏幕可视宽度

/*缓存列表所有数据*/
var cachedResults = {
    nextPage: 1,
    items: [],
    total: 0
};

class ItemInfo extends Component {
    /*_keyExtractor用来设置列表的key值，不设置会有警告提示*/
    _keyExtractor = (item, index) => item.id;

    constructor(props) {
        super(props);
        this.state = {
            data: this.props.navigation.state.params.key,
            rate: 1,
            muted: true,
            resizeMode: 'contain',
            repeat: false,
            videoLoaded: false,
            playing: false,
            videoProgress: 0.01,
            videoTotal: 0,
            currentTime: 0,
            paused: false,
            videoOk: true,
            dataSource: [],
            isLoadingTail: false,
            animationType: 'none',
            modalVisible: false,
            isSending: false,
            content: ''
        };
        this._fetchData = this._fetchData.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this._setModalVisible = this._setModalVisible.bind(this);
    }

    /*播放video所调用的方法*/
    onLoadStart() {
        console.log('Start');
    }

    onLoad() {
        console.log('load');
    }

    onProgress(data) {
        if (!this.state.videoLoaded) {
            this.setState({
                videoLoaded: true
            });
        }
        var duration = data.playableDuration;
        var currentTime = data.currentTime;
        var percent = Number((currentTime / duration).toFixed(2));
        var newState = {
            videoTotal: duration,
            currentTime: Number(data.currentTime.toFixed(2)),
            videoProgress: percent
        };
        if (!this.state.videoLoaded) {
            newState.videoLoaded = true;
        }
        if (!this.state.playing) {
            newState.playing = true;
        }
        this.setState(newState);
    }

    onEnd() {
        this.setState({
            videoProgress: 1,
            playing: false,
        });
        console.log('End');
    }

    onError(e) {
        this.setState({
            videoOk: false,
        });
        console.log('Error' + e);
    }

    /*播放按钮*/
    rePlay() {
        this.refs.videoPlayer.seek(0);
    }

    /*暂停*/
    _pause() {
        if (!this.state.paused) {
            this.setState({
                paused: true
            });
        }
    }

    _resume() {
        if (this.state.paused) {
            this.setState({
                paused: false
            });
        }
    }

    componentDidMount() {
        this._fetchData(1);
    }

    /*获取列表数据*/
    _fetchData(page) {
        var that = this;
        var url = config.api.base + config.api.comment;
        this.setState({
            isLoadingTail: true
        });

        request.get(url, {id: 123, accessToken: '123', page: page}).then((data) => {
            if (data.success) {
                var items = cachedResults.items.slice();
                items = items.concat(data.data);
                cachedResults.nextPage += 1;
                cachedResults.items = items;
                cachedResults.total = data.total;
                setTimeout(function () {
                    that.setState({
                        isLoadingTail: false,
                        dataSource: cachedResults.items,
                    });
                }, 20);
            }
        }).catch((error) => {
            this.setState({
                isLoadingTail: false,
            });
            console.warn(error);
        });
    }

    renderItem({item, index}) {
        return (
            <View key={index} style={styles.replyBox}>
                <Image style={styles.replyAvatar} source={{uri: item.replyBy.avatar}}/>
                <View style={styles.reply}>
                    <Text style={styles.replyNickname}>{item.replyBy.nickname}</Text>
                    <Text style={styles.replyContent}>{item.content}</Text>
                </View>
            </View>
        )
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
            this._fetchData(page);
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

    /*Input获取焦点*/
    _focus() {
        this._setModalVisible(true);
    }

    _blur() {

    }

    _closeModal() {
        this._setModalVisible(false);
    }

    _setModalVisible(isVisible) {
        this.setState({
            modalVisible: isVisible
        })
    }


    /*头部作者信息*/
    _renderHeader() {
        return (
            <View style={styles.listHeader}>
                <View style={styles.infoBox}>
                    <Image style={styles.avatar} source={{uri: this.state.data.author.avatar}}/>
                    <View style={styles.descBox}>
                        <Text style={styles.nickname}>{this.state.data.author.nickname}</Text>
                        <Text style={styles.title}>{this.state.data.title}</Text>
                    </View>
                    <Icon size={40} name="drupal" style={styles.userLabel}/>
                </View>
                {/*评论框*/}
                <View style={styles.commentBox}>
                    <View style={styles.comment}>
                        <Text>输入评论信息</Text>
                        <TextInput placeholder="编写评论" style={styles.content} multiline={true}
                                   onFocus={this._focus.bind(this)}/>
                    </View>
                </View>
                <View style={styles.commentArea}>
                    <Text style={styles.commentTitle}>精彩评论</Text>
                </View>
            </View>
        )
    }

    /*提交*/
    _submit() {
        var that = this;
        if (!this.state.content) {
            return ToastAndroid.show("评论不能为空", ToastAndroid.SHORT);
        }
        if (this.state.isSending) {
            return ToastAndroid.show("正在评论中", ToastAndroid.SHORT);
        }

        this.setState({
            isSending: true
        }, function () {
            var body = {
                accessToken: 'abc',
                creation: '123',
                content: this.state.content
            };
            var url = config.api.base + config.api.sendComment;
            request.post(url, body).then((data) => {
                if (data && data.success) {
                    var items = cachedResults.items.slice();
                    var content = that.state.content;

                    items = [{
                        content: content,
                        replyBy: {
                            avatar: 'http://thirdqq.qlogo.cn/qqapp/101256433/1D062C4F7DF8D4DC764F490EC2815DD1/100',
                            nickname: '用户111'
                        }
                    }].concat(items);

                    cachedResults.items = items;
                    cachedResults.total = cachedResults.total + 1;

                    that.setState({
                        content: '',
                        isSending: false,
                        dataSource: cachedResults.items,
                    });
                    that._setModalVisible(false);
                }
            }).catch((error) => {
                console.warn(error);
                that.setState({
                    isSending: false,
                });
                that._setModalVisible(false);
                ToastAndroid.show("评论失败", ToastAndroid.SHORT);
            });
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.videoBox}>
                    <Video ref='videoPlayer' source={{uri: this.state.data.video}} style={styles.video}
                           volume={2}
                           paused={this.state.paused} rate={this.state.rate} muted={this.state.muted}
                           resizeMode={this.state.resizeMode} repeat={this.state.repeat}
                           onLoadStart={this.onLoadStart.bind(this)}
                           onLoad={this.onLoad.bind(this)} onProgress={this.onProgress.bind(this)}
                           onEnd={this.onEnd.bind(this)}
                           onError={this.onError.bind(this)}/>
                    {!this.state.videoOk && <Text style={styles.failText}>视频是出错了！</Text>}
                    {!this.state.videoLoaded && <ActivityIndicator color='#f02b2b' style={styles.loading}/>}
                    {this.state.videoLoaded && !this.state.playing ?
                        <Icon name='play-circle' size={60} style={styles.playIcon}
                              onPress={this.rePlay.bind(this)}/> : null}
                    {this.state.videoLoaded && this.state.playing ?
                        <TouchableOpacity style={styles.pauseBtn} onPress={this._pause.bind(this)}>{this.state.paused ?
                            <Icon onPress={this._resume.bind(this)} name='play-circle' size={60}
                                  style={styles.resumeIcon}/> :
                            <Text></Text>}</TouchableOpacity> : null}
                    <View style={styles.progressBox}>
                        <View style={[styles.progressBar, {width: deviceW * this.state.videoProgress}]}></View>
                    </View>
                </View>
                <FlatList
                    data={this.state.dataSource}
                    renderItem={this.renderItem}
                    keyExtractor={this._keyExtractor}
                    onEndReached={this._fetchMoreData.bind(this)}
                    onEndReachedThreshold={1}
                    ListHeaderComponent={this._renderHeader.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                />

                <Modal animationType={'fade'} visible={this.state.modalVisible} onRequestClose={() => {
                    this._setModalVisible(false)
                }}>
                    <View style={styles.modalContainer}>
                        <Icon onPress={this._closeModal.bind(this)} name='times' size={60}
                              style={styles.closeIcon}/>
                        <View style={styles.commentBox}>
                            <View style={styles.comment}>
                                <Text>输入评论信息</Text>
                                <TextInput placeholder="编写评论" style={styles.content} multiline={true}
                                           onBlur={this._blur.bind(this)} defaultValue={this.state.content}
                                           onChangeText={(text) => {
                                               this.setState({
                                                   content: text
                                               })
                                           }}/>
                            </View>
                        </View>
                        <RnButton style={styles.submitBtn} onPress={this._submit.bind(this)}>评论</RnButton>
                    </View>
                </Modal>
            </View>
        )
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    modalContainer: {
        flex: 1,
        paddingTop: 45,
        backgroundColor: '#fff'
    },
    closeIcon: {
        alignSelf: 'center',
        fontSize: 30,
        color: '#f02b2b'
    },

    submitBtn: {
        width: deviceW - 20,
        paddingTop: 16,
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ee753c',
        borderRadius: 4,
        fontSize: 18,
        color: '#ee753c',
        alignSelf: 'center'
    },

    videoBox: {
        width: deviceW,
        height: deviceW * 0.56,
        backgroundColor: 'transparent',
    },
    video: {
        width: deviceW,
        height: deviceW * 0.56,
        backgroundColor: '#000',

    },

    loading: {
        position: 'absolute',
        left: 0,
        top: 80,
        width: deviceW,
        alignSelf: 'center',
        backgroundColor: 'transparent'
    },
    progressBox: {
        width: deviceW,
        height: 2,
        backgroundColor: '#ccc'
    },
    progressBar: {
        width: 1,
        height: 2,
        backgroundColor: '#ff6600'
    },
    playIcon: {
        position: 'absolute',
        flexDirection: 'row',
        top: (deviceW * 0.56) / 2 - 30,
        left: deviceW / 2 - 30,
        width: 60,
        height: 60,
        textAlign: 'center',
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 60,
        color: '#ed7b66',
    },

    pauseBtn: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: deviceW,
        height: deviceW * 0.56,
    },
    resumeIcon: {
        position: 'absolute',
        flexDirection: 'row',
        bottom: (deviceW * 0.56) / 2 - 30,
        right: deviceW / 2 - 30,
        width: 60,
        height: 60,
        textAlign: 'center',
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 60,
        alignSelf: 'center',
        color: '#ed7b66',
    },
    failText: {
        position: 'absolute',
        left: 0,
        top: 140,
        width: deviceW,
        alignSelf: 'center',
        color: '#fff',
        fontSize: 18,
        textAlign: 'center'
    },
    infoBox: {
        width: deviceW,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 2,
        padding: 10,
        backgroundColor: "#ffffff",
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginLeft: 10,
        marginRight: 10,
    },
    descBox: {
        flex: 1,
    },
    nickname: {
        fontSize: 18,
    },
    title: {
        marginTop: 8,
        fontSize: 16,
        color: '#666'
    },
    userLabel: {
        color: '#f02b2b',
        position: 'absolute',
        right: 20,
        top: 10
    },
    replyBox: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
        width: deviceW
    },
    replyAvatar: {
        width: 40,
        height: 40,
        marginRight: 10,
        marginLeft: 10,
        borderRadius: 20
    },
    replyNickname: {
        color: '#666'
    },
    replyContent: {
        marginTop: 4,
        color: '#666'
    },
    reply: {
        flex: 1
    },
    loadingMore: {
        marginVertical: 20
    },
    loadingText: {
        color: '#777',
        textAlign: 'center'
    },
    listHeader: {
        marginTop: 10,
        width: deviceW
    },
    commentBox: {
        marginTop: 10,
        marginBottom: 10,
        padding: 8,
        width: deviceW
    },
    content: {
        paddingLeft: 2,
        color: '#333',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        fontSize: 14,
        height: 80
    },
    commentArea: {
        width: deviceW,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 6,
        paddingRight: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    }
});

export default ItemInfo;