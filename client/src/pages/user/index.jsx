import Taro, { Component, setStorageSync, getStorageSync} from '@tarojs/taro'
import { View } from '@tarojs/components'
import {AtSwitch,AtNoticebar,AtActivityIndicator} from "taro-ui";
import MyCollection from '../../components/myCollection'
import './index.scss'
import {tmpId} from '../../util/util'
import {ImageRecoginzer} from "../../components/imageRecoginzer/index.weapp";
import {getUserNickname} from "../../util/login";

export default class User extends Component {

  state = {
    isReadMode: false,
    collection: [],
    isLoading: false,
    showImageRecognize: false
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

    Taro.getSetting({
      withSubscriptions: true,
      success: (res) => {
        console.log(res)
      }
    })
  }

  componentDidMount () {
  }

  componentWillUnmount () { }

  componentDidShow () {
    console.log('did show')
    const that =this;
    that.setState({isLoading: true})
    Taro.cloud.callFunction({
      name: 'getCollections',
      complete: (r) => {
        // console.log(r)
        that.setState({collection: r.result.data, isLoading: false})
        // if (r && r.result && r.result.data && r.result.data.length > 0) {
        //   that.setState({isCollected: true})
        // }
      },
      fail: (e) => {
        Taro.showToast({
          title: `获取收藏数据失败:${JSON.stringify(e)}`,
          icon: 'none',
          duration: 1000
        })
      }
    })
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

  handleSubscribe = () => {
    Taro.requestSubscribeMessage({
      tmplIds: [tmpId],
      success: function (res) {
        console.log(res)
        if (res[tmpId] === 'accept') {
          Taro.cloud.callFunction({
            name: 'subscribe'
          })

          Taro.showToast({
            title: '订阅成功',
            icon: 'none',
            duration: 2000
          });
        }
      }
    })
  }

  open = () => {
    Taro.cloud.callFunction({
      name: 'countTodayUsage',
      complete: r => {
        const data = r.result.data;
        Taro.showToast({
          title: `每天3次机会,剩余${3 - data.length}`,
          icon: 'none',
          duration: 2000
        })
        if (data.length < 3) {
          this.setState({ showImageRecognize: true })
        }
      }
    })

    // if (getUserNickname() === 'echo' || getUserNickname() === 'peace') {
    //   this.setState({ showImageRecognize: true })
    // } else {
    //   Taro.showToast({
    //     title: '开发中，敬请期待',
    //     icon: 'none',
    //     duration: 2000
    //   })
    // }

  }

  close = () => {
    this.setState({ showImageRecognize: false })
  }

  render () {
    const {isLoading, isReadMode, collection, showImageRecognize} = this.state;
    return (
      <View className={`user-page ${isReadMode ? 'read-mode' : ''}`}>
        <AtNoticebar marquee speed={60}>
          收藏功能已升级，数据已存放于云端，再也不怕丢失啦！
        </AtNoticebar>
        <View>
          <AtSwitch title='护眼模式' checked={isReadMode} onChange={this.handleChange} />
        </View>
        <View>
          <AtSwitch title='AI图片识别[体验版]' checked={showImageRecognize} onChange={this.open} />
        </View>
        {/*<View>*/}
        {/*  <AtButton type='secondary' onClick={this.handleSubscribe}>点击订阅消息</AtButton>*/}
        {/*</View>*/}
        <MyCollection collection={collection} />
        {
          showImageRecognize && <ImageRecoginzer open={this.open} close={this.close} />
        }
        {
          isLoading && <AtActivityIndicator mode='center' color='black' content='数据加载中...' size={62}></AtActivityIndicator>
        }
      </View>
    )
  }
}
