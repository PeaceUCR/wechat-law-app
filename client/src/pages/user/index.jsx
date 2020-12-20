import Taro, { Component, setStorageSync, getStorageSync} from '@tarojs/taro'
import { View } from '@tarojs/components'
import {AtSwitch} from "taro-ui";
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

  handleChange = value => {
  this.setState({ isReadMode: value })
  setStorageSync('setting', { isReadMode: value })
}

  render () {
    const {load, isReadMode} = this.state;
    return (
      <View className='user-page'>
        <View>
          <AtSwitch title='护眼模式' checked={isReadMode} onChange={this.handleChange} />
        </View>
        <MyCollection load={load} />
      </View>
    )
  }
}
