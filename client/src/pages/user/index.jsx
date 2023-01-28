import Taro, { Component, setStorageSync, getStorageSync} from '@tarojs/taro'
import { View } from '@tarojs/components'
import {AtSwitch,AtNoticebar,AtActivityIndicator, AtIcon, AtAvatar, AtModal, AtBadge} from "taro-ui";
import MyCollection2 from '../../components/myCollection2'
import './index.scss'
import {tmpId} from '../../util/util'
import {ImageRecoginzer} from "../../components/imageRecoginzer/index.weapp";
import {db} from "../../util/db";
import {
  setLocation,
  getProvince,
  getCity,
  getUserAvatar,
  getUserNickname,
  getCollectionLimit,
  getUserScore,
  getScore, getUserOpenId
} from '../../util/login'
import Loading2 from "../../components/loading2/index.weapp";
import {deleteCollection, getUserCollections, saveUser} from "../../util/userCollection";

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
    score: undefined,
    showUpgradeModal: false
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
    // db.collection('configuration').where({}).get({
    //   success: (res) => {
    //     that.setState({
    //       enableAds: res.data[0].enableAds
    //     })
    //   }
    // });

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

    that.setState({
      score: getScore()
    })
  }

  componentDidMount () {
  }

  componentWillUnmount () { }

  componentDidShow () {
    console.log('did show')
    const that =this;
    that.setState({isLoading: true})
    getUserCollections().then((r) => {
      that.setState({collection: r, isLoading: false});
    })
    that.setState({
      score: getScore()
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

  refreshUserInfo = () => {
    // TODO later
    Taro.showToast({
      title: '功能维护中,敬请期待',
      icon: 'none',
      duration: 2000
    });
    return;

    const that = this;
    wx.getUserProfile({
      desc: '用于更新最新的个人信息',
      fail: () => {
        Taro.showToast({
          title: '授权失败',
          icon: 'none',
          duration: 1000
        });
      },
      success: (res) => {
        console.log(res.userInfo)
        that.setState({
          isLoading: true
        })

        saveUser(getUserOpenId, res.userInfo.nickName, res.userInfo.avatarUrl).then((r) => {
          setStorageSync('user', r);
          that.setState({
            isLoading: false
          })
        });
      }
    })
  }

  upgradeCollection = () => {
    // TODO later
    Taro.showToast({
      title: '功能维护中,敬请期待',
      icon: 'none',
      duration: 2000
    });
    return;

    this.setState({
      isLoading: true,
      showUpgradeModal: false
    })
    const that = this;
    const {score} = this.state
    Taro.cloud.callFunction({
      name: 'login',
      data: {
        score: score - 100,
        collectionLimit: getCollectionLimit() + 10
      },
      complete: r => {
        setStorageSync('user', r.result.data[0]);
        that.setState({
          isLoading: false,
          score: getUserScore()
        })
      }
    })
  }

  removeCollectionAtIndex = (c, index) => {
    console.log(index)
    const that = this
    const {collection} = this.state

    deleteCollection(c.collectionId).then(() => {
      Taro.showToast({
        title: '删除收藏成功',
        icon: 'none',
        duration: 1000
      })

      collection.splice(index, 1)
      that.setState({collection: [...collection]});
    })

  }
  render () {
    const {isLoading, isReadMode, collection, showImageRecognize, token, enableAds, province, city, score, showUpgradeModal} = this.state;
    return (
      <View className={`user-page page ${isReadMode ? 'read-mode' : ''}`}>
        {/*<AtNoticebar marquee speed={60}>*/}
        {/*  收藏功能已升级，数据已存放于云端，再也不怕丢失啦！*/}
        {/*</AtNoticebar>*/}
        {/*{enableAds &&*/}
        {/*<Swiper className='video-container'>*/}
        {/*  <SwiperItem >*/}
        {/*    /!*<ad unit-id='adunit-6a2aa2a251227bf0' ad-type='video' ad-theme='white'></ad>*!/*/}
        {/*    <ad unit-id='adunit-3262d14cdd5955c8' ad-intervals='30'></ad>*/}
        {/*  </SwiperItem>*/}
        {/*</Swiper>}*/}
        <View className='main'>
          <AtBadge className='reload-icon' value='更新' >
            <AtIcon value='reload' size='30' color='green' onClick={this.refreshUserInfo}></AtIcon>
          </AtBadge>
          <AtAvatar circle image={getUserAvatar()}></AtAvatar>
          <View>{getUserNickname()}</View>
          <View className='icon-line' onClick={() => {
            Taro.showToast({
              title: '每天分享可获得积分!',
              icon: 'none',
              duration: 2000
            });
          }}>我的积分: {score ? score : '暂无'}</View>
          <View>
            <View className='icon-line' onClick={() => {

              Taro.showToast({
                title: '功能维护中,敬请期待',
                icon: 'none',
                duration: 2000
              });
              return;

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
          <View>当前收藏上限:{getCollectionLimit()}</View>
          {score >= 100 && <View className='icon-line' onClick={() => this.setState({showUpgradeModal: true})}>升级收藏上限</View>}
        </View>
        <View>
          <AtSwitch title='护眼模式' checked={isReadMode} onChange={this.handleChange} />
        </View>
        {/*<View>*/}
        {/*  <AtButton type='secondary' onClick={this.handleSubscribe}>点击订阅消息</AtButton>*/}
        {/*</View>*/}
        <MyCollection2 collection={collection} removeCollectionAtIndex={this.removeCollectionAtIndex}/>
        {
          showImageRecognize && <ImageRecoginzer token={token} open={this.open} close={this.close} />
        }
        {
          isLoading && <Loading2 />
        }
        {showUpgradeModal && <AtModal
          isOpened
          title='收藏升级'
          cancelText='取消'
          confirmText='确认'
          onClose={() => this.setState({showUpgradeModal: false})}
          onCancel={() => this.setState({showUpgradeModal: false})}
          onConfirm={this.upgradeCollection}
          content='消耗100点积分升级10个收藏上限?'
        />}

      </View>
    )
  }
}
