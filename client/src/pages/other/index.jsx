import Taro, { Component } from '@tarojs/taro'
import {View, Image, Text, WebView} from '@tarojs/components'
import {AtDivider} from "taro-ui";
import './index.scss'
import {db} from "../../util/db";


export default class Other extends Component {

  state = {
    text: '本小程序数据信息均来源于最高检、最高法、公安部、司法部、人大等权威发布。\n先加微信联系人"pinghe_2016",他会拉你进群获取更多帮助和最新更新😊',
    joinGroupUrl: ''
  }

  config = {
    navigationBarTitleText: ''
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
    };
  }

  componentWillMount () {
  }

  componentDidMount () {
    const that = this;
    that.setState({isLoading: true});
    db.collection('configuration').where({}).get({
      success: (res) => {

        that.setState({
          text: res.data[0].comment,
          joinGroupUrl: res.data[0].joinGroupUrl
        });
      }
    });
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  copyToClipboard = () => {
    Taro.setClipboardData({
      data: "https://mp.weixin.qq.com/s/iuNxbg2vL_mxld_QI7lNpQ",
      success: function () {
        Taro.showToast({
          title: '链接已复制到剪贴板',
          icon: 'none',
          duration: 2000
        })
      }
    });
  }

  render () {
    const {text, gifUrl, joinGroupUrl} = this.state;
    return (
      <View className='other-page'>
        <View>
          <AtDivider content='关于' />
          <View className='text-container'>
            <Text>{text}</Text>
          </View>
          <View className='poster-container'>
            <Image
              className='poster'
              src={joinGroupUrl}
              mode='widthFix'
              onClick={() => {
                Taro.previewImage({
                  current: joinGroupUrl,
                  urls: [joinGroupUrl]
                })
              }}
            />
          </View>
        </View>
        <View onClick={this.copyToClipboard}>
          <View className='copy-label'>帮助演示视频链接点我复制</View>
          <View className='copy-link'>https://mp.weixin.qq.com/s/iuNxbg2vL_mxld_QI7lNpQ</View>
        </View>
        <AtDivider content='持续开发中，更多功能敬请期待' />
      </View>
    )
  }
}
