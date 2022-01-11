import Taro, { Component, setStorageSync, getStorageSync} from '@tarojs/taro'
import { View } from '@tarojs/components'
import {AtSwitch,AtNoticebar,AtActivityIndicator, AtIcon, AtAvatar, AtDivider} from "taro-ui";
import MyCollection from '../../components/myCollection'
import './index.scss'
import {tmpId} from '../../util/util'
import {ImageRecoginzer} from "../../components/imageRecoginzer/index.weapp";
import {db} from "../../util/db";
import {setLocation, getProvince, getCity, getUserAvatar, getUserNickname} from '../../util/login'

export default class User extends Component {

  state = {
    isReadMode: false,
    collection: [],
    isLoading: false,
    showImageRecognize: false,
    token: '',
    enableAds: false,
    province: undefined,
    city: undefined,
    score: undefined
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
    const that = this;
    that.setState({
      province: getProvince(),
      city: getCity()
    })
    db.collection('configuration').where({}).get({
      success: (res) => {
        that.setState({
          enableAds: res.data[0].enableAds
        })
      }
    });

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

    Taro.cloud.callFunction({
      name: 'login',
      complete: r => {
        console.log(r.result.data[0])
        const {score} = r.result.data[0]
        that.setState({
          score
        })
        setStorageSync('user', r.result.data[0]);
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
        console.log(r)
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
        const {token, data} = r.result;
        Taro.showToast({
          title: `每天3次机会,剩余${3 - data.length}`,
          icon: 'none',
          duration: 2000
        })
        if (data.length < 3) {
          this.setState({ showImageRecognize: true, token })
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
    const {isLoading, isReadMode, collection, showImageRecognize, token, enableAds, province, city, score} = this.state;
    return (
      <View className={`user-page page ${isReadMode ? 'read-mode' : ''}`}>
        <AtNoticebar marquee speed={60}>
          收藏功能已升级，数据已存放于云端，再也不怕丢失啦！
        </AtNoticebar>
        {/*{enableAds &&*/}
        {/*<Swiper className='video-container'>*/}
        {/*  <SwiperItem >*/}
        {/*    /!*<ad unit-id='adunit-6a2aa2a251227bf0' ad-type='video' ad-theme='white'></ad>*!/*/}
        {/*    <ad unit-id='adunit-3262d14cdd5955c8' ad-intervals='30'></ad>*/}
        {/*  </SwiperItem>*/}
        {/*</Swiper>}*/}
        <View className='main'>
          <AtAvatar circle image={getUserAvatar()}></AtAvatar>
          <View>{getUserNickname()}</View>
          <View className='icon-line' onClick={() => {
            Taro.showToast({
              title: '每天使用/分享可获得积分!',
              icon: 'none',
              duration: 2000
            });
          }}>我的积分: {score ? score : '暂无'}</View>
          <View>
            <View className='icon-line' onClick={() => {
              Taro.showLoading({
                title: '获取地理位置中...',
              });
              const that = this
              Taro.getLocation({
                success(res) {
                  console.log(res)
                  const {latitude, longitude} = res
                  Taro.request({
                    url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=4POBZ-YEXYD-NPQ4R-PNZJ4-3XEE5-FFBXF`,
                    method: 'get',
                    success: function (r) {
                      console.log(r)
                      const {data} = r
                      const {result} = data
                      const {address_component} = result
                      console.log(address_component)
                      const {province, city} = address_component
                      that.setState({province, city})
                      setLocation({province, city})
                      Taro.cloud.callFunction({
                        name: 'record',
                        data: {
                          location: {province, city}
                        }
                      })
                      Taro.hideLoading()
                    }
                  })

                },
                fail() {
                  Taro.hideLoading()
                  Taro.showToast({
                    title: '获取位置失败，请在右上角设置中开启位置后重试!',
                    icon: 'none',
                    duration: 4000
                  });
                }
              })
            }}>
              <AtIcon value='map-pin' size='24' color='#b35900'></AtIcon>
              <View>{province && city ? `${province}-${city}` : '点我添加位置信息'}</View>
            </View>
          </View>
        </View>
        <View>
          <AtSwitch title='护眼模式' checked={isReadMode} onChange={this.handleChange} />
        </View>
        {/*<View>*/}
        {/*  <AtButton type='secondary' onClick={this.handleSubscribe}>点击订阅消息</AtButton>*/}
        {/*</View>*/}
        <MyCollection collection={collection} />
        {
          showImageRecognize && <ImageRecoginzer token={token} open={this.open} close={this.close} />
        }
        {
          isLoading && <AtActivityIndicator mode='center' color='black' content='数据加载中...' size={62}></AtActivityIndicator>
        }
      </View>
    )
  }
}
