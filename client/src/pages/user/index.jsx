import Taro, { Component, setStorageSync, getStorageSync} from '@tarojs/taro'
import { View } from '@tarojs/components'
import {AtSwitch,AtNoticebar} from "taro-ui";
import MyCollection from '../../components/myCollection'
import './index.scss'

export default class User extends Component {

  state = {
    load: false,
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '我的'
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
    };
  }

  componentWillMount () {
    const setting = getStorageSync('setting');
    this.setState({isReadMode: setting && setting.isReadMode})

    if (setting && setting.isReadMode) {
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#F4ECD8'
      })
    }
  }

  componentDidMount () {
  }

  componentWillUnmount () { }

  componentDidShow () {
    console.log('did show')
    const {load} = this.state;
    this.setState({load: !load})
  }

  componentDidHide () { }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('update')
    const {isReadMode} = this.state;
    if (isReadMode) {
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#F4ECD8'
      })
    } else {
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#FFFFFF'
      })
    }
  }


  handleChange = value => {
  this.setState({ isReadMode: value })
  setStorageSync('setting', { isReadMode: value })
}

  render () {
    const {load, isReadMode} = this.state;
    return (
      <View className={`user-page ${isReadMode ? 'read-mode' : ''}`}>
        <AtNoticebar marquee speed={60}>
          个人设置，收藏等数据存放于本地，清理小程序，或微信缓存可能会导致数据被清空，请见谅！
        </AtNoticebar>
        <View>
          <AtSwitch title='护眼模式' checked={isReadMode} onChange={this.handleChange} />
        </View>
        <MyCollection load={load} />
      </View>
    )
  }
}
