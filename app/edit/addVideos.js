/*录制视频*/
import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

class Videos extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    录制视频
                </Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
});

export default Videos;