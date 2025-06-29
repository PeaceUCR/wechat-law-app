import Taro, { Component } from '@tarojs/taro'
import {View, Image, Video, Text} from '@tarojs/components'
import {AtAvatar,AtButton, AtBadge, AtIcon, AtMessage} from 'taro-ui'
import SentUsers from '../../components/sentUsers'
import {audio} from '../../util/audio';
import './index.scss'
import {saveUser} from "../../util/userCollection";

const FAIL_AUTH_DENY = 'getUserInfo:fail auth deny';
const parseNum = (num) => {
  return num > 9 ? `${num}` : `0${num}`
}
export default class Other extends Component {

  state = {
    millis: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    record: '',
    loaded: false,
    countVisit: 0,
    countSend: 0,
    sends: []
  }

  config = {
    navigationBarTitleText: '',
    navigationStyle: 'custom'
  }

  onShareAppMessage() {
    return {
      path: 'pages/cake/index'
    };
  }

  componentWillMount () {
  }

  count = () => {
    const millis = Date.parse('2025-03-14T00:00:00+08:00') - Date.now()
    const ms = millis % 1000
    const s = (millis - ms) / 1000
    const second = s % 60
    const mins = (s - second) / 60
    const minute = mins % 60
    const hrs = (mins - minute) / 60
    const hour = hrs % 24
    const day = (hrs - hour) / 24
    this.setState({
      millis,
      second,
      minute,
      hour,
      day
    })

  }

  componentDidMount () {
    const that = this;
    this.timerID = setInterval(() => {
      this.count()
    }, 1000)
    Taro.cloud.callFunction({
      name: 'addCongrat',
      data: {
        type: 'visit'
      },
      complete: r => {
      }
    })

    Taro.cloud.callFunction({
      name: 'getCongrat',
      complete: r => {
        if (r && r.result && r.result.data && r.result.data.length > 0) {
          that.setState({
            record: new Date(r.result.data[0].time).toLocaleString('zh-CN')
          })
        }

        that.setState({
          loaded: true
        })
      }
    })

    Taro.cloud.callFunction({
      name: 'getCongrats',
      complete: r => {
        console.log(r)
        const {countVisit, countSend, sends} = r.result
        that.setState({
          countVisit: countVisit.total,
          countSend: countSend.total,
          sends: sends.data
        })
      }
    })
  }


  componentWillUnmount () {
    clearInterval(this.timerID)
  }

  componentDidShow () {
    audio.play()
  }

  componentDidHide () {
    audio.stop()
  }

  handleCongrats = () => {
    Taro.showToast({
      title: `谢谢🙏`,
      icon: 'none',
      duration: 3000
    })
  }
  handleLoginSuccess = (res) => {
    const that = this;
    Taro.showLoading();
    Taro.cloud.callFunction({
      name: 'addCongrat',
      data: {
        type: 'send',
        nickName: res.detail.userInfo.nickName,
        avatarUrl: res.detail.userInfo.avatarUrl
      },
      complete: r => {
        // Taro.atMessage({
        //   'message': `${res.detail.userInfo.nickName},谢谢你的祝福!`,
        //   'type': 'success',
        // })
        Taro.showToast({
          title: `${res.detail.userInfo.nickName},谢谢你的祝福!`,
          icon: 'none',
          duration: 3000
        });

        Taro.cloud.callFunction({
          name: 'getCongrats',
          complete: r => {
            console.log(r)
            const {countVisit, countSend, sends} = r.result
            that.setState({
              countVisit: countVisit.total,
              countSend: countSend.total,
              sends: sends.data
            })
            Taro.hideLoading();
            that.setState({
              record: new Date().toLocaleString('zh-CN')
            })
          }
        })

      }
    })
  }

  handleLogin = () => {
    const that = this;
    wx.getUserProfile({
      desc: '用于登录', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      fail: () => {
        Taro.showToast({
          title: '授权失败',
          icon: 'none',
          duration: 1000
        });
      },
      success: (res) => {
        that.handleLoginSuccess(res);
      }
    })
  }

  render () {
    const { millis, second, minute, hour, day, record, loaded,
      countVisit,
      countSend,
      sends} = this.state;
    return (
      <View className='other-page'>
        <View className='center'>
          <AtAvatar size='large' circle image='https://mmbiz.qpic.cn/mmbiz_png/6fKEyhdZU93gU3PaEaEDML0Oibia9Rmq6RJ3BwkM0ia1hfTXHfTkxmHDdMJWMhmiczH18mF0aia3ibick67LBEvTicmk4Q/640?wx_fmt=png&amp;from=appmsg'></AtAvatar>
        </View>
        {millis > 0 && <View className='center'>
          <View className='text-container'>
            <View>距离<Text className='name'>???</Text>的生日还有:</View>
            <View className='count-down'>
              <View className='number'>{`${parseNum(day)}天`}</View>
              <View className='number'>{`${parseNum(hour)}小时`}</View>
              <View className='number'>{`${parseNum(minute)}分钟`}</View>
              <View className='number'>{`${parseNum(second)}秒`}</View>
            </View>
          </View>
        </View>}
        {millis < 0 && <View className='center'>
          <View className='text-container'>
            <View className='pink'>飘落的樱花🌸 你我无尽的回忆 落下枝头</View>
            <View className='pink'>我要定格美丽而短暂的瞬间</View>
            <View className='pink'>直到永远......</View>
            <View className='pink'>2021314</View>
            <View>🎉亲爱的黄漫琳生日快乐🎉</View>
          </View>
        </View>}
        {loaded && <View>
          {!record && <View className='button-line success-msg'>
            <AtButton
              type='secondary'
              openType='getUserInfo'
              onGetUserInfo={this.handleLogin}>🎂快点我送上生日祝福吧🎂</AtButton>
          </View>}
          {record && <View className='center small success-msg'>{`🎂你已经在${record}送上祝福啦🎂`}</View>}
        </View>}


        <View className='back' onClick={() => {
          Taro.navigateTo({
            url: '/pages/index/index'
          })
        }}
        >
          <AtBadge value='返回'>
            <AtIcon value='arrow-left' size='40' color='#000'></AtIcon>
          </AtBadge>
        </View>
        <View>
          <SentUsers list={sends} />
          <View className='center small gray record'>
            共有{countSend}人发送祝福,共围观{countVisit}人次
          </View>
        </View>
        <View className='snow-container'>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View><View className='snow'></View>
          <View className='snow'></View><View className='snow'></View>
        </View>
        <View>
          <Image src='https://res.cloudinary.com/mini-store-2020/image/upload/v1615567522/sakura_zhtfia.png' className='background-image' mode='widthFix' />
        </View>
        <AtMessage />
      </View>
    )
  }
}
