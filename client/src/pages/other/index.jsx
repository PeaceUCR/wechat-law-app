import Taro, { Component } from '@tarojs/taro'
import {View, WebView} from '@tarojs/components'


export default class Other extends Component {

  config = {
    navigationBarTitleText: '帮助'
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
    };
  }


  render () {
    return (
      <View className='other-page'>
        <WebView src='https://mp.weixin.qq.com/s/S9enE8rfhwdtlr8DZQ7m_A' />
      </View>
    )
  }
}
