import Taro, { Component, getStorageSync, setStorageSync } from '@tarojs/taro'
import {View, Image, Text, Swiper, SwiperItem} from '@tarojs/components'
import {AtIcon, AtDivider, AtBadge, AtNoticebar, AtTabs, AtTabsPane, AtCurtain } from "taro-ui";
import throttle from 'lodash/throttle';
import { GridItem } from '../../components/grid/index.weapp'
import { LoginPopup } from '../../components/loginPopup/index.weapp'
import { UserFloatButton } from '../../components/userFloatButton/index.weapp'
import { ImageCropper } from '../../components/imageCropper/index.weapp'
import logo from '../../static/logo.png';
import qrcode from '../../static/qrcode.png';
import {checkIfNewUser, getUserAvatar, getUserNickname, isSuperAdmin} from '../../util/login';
import './index.scss'
import {db} from "../../util/db";
import {tmpId, isTodayString, getTodayDateString} from '../../util/util'

const titles = [
  {title:'全部'},
  {title:'刑法相关'},
  {title:'民法典相关'},
  {title:'行政相关'}
  ]
export default class Index extends Component {

  state = {
    options: {
      '刑法相关': [
        {
          title:'刑法',
          url: '/pages/criminalLaw/index',
          type: '刑法'
          // isHot: true
        },
        {
          title: '刑事诉讼法',
          url: '/pages/litigationLaw/index',
          type: '刑法'
        },
        {
          title: '(最高法)适用刑事诉讼法的解释',
          url: '/pages/litigationExplanation/index',
          type: '刑法'
        },
        {
          title: '(最高检)刑事诉讼规则',
          url: '/pages/litigationRegulation/index',
          type: '刑法'
        },
        {
          title: '公安机关办理刑事案件程序规定',
          url: '/pages/policeRegulation/index',
          type: '刑法'
        },
        {
          title: '监察法',
          url: '/pages/supervisionLaw/index',
          type: '刑法',
          isNew: true
        },
        {
          title: '刑事审判参考',
          url: '/pages/consultant/index',
          type: '刑法'
        }
      ],
      '民法典相关': [
        {
        title: '民法典',
        url: '/pages/civilLaw/index',
        type: '民法典'
        // isHot: true
        },
        {
          title: '民事诉讼法',
          url: '/pages/civilLawRegulation/index',
          type: '民法典'
        },
        {
          title: '民法典相关司法解释',
          url: '/pages/civilLawExplaination/index',
          type: '民法典'
        }
      ],
      '行政相关': [
        {
          title: '中华人民共和国治安管理处罚法',
          url: '/pages/publicOrderAdminPenaltyLaw/index',
          type: '行政',
          isNew: true
          // isHot: true
        },
        {
          title: '公安机关办理行政案件程序规定',
          url: '/pages/policeAdminRegulation/index',
          type: '行政',
          isNew: true
        }
      ],
      '共有': [
        {
          title: '指导案例',
          url: '/pages/examples/index',
          type: '共有',
          isUpdated: true
        },
        {
          title: '最高法公报案例',
          url: '/pages/courtOpen/index',
          type: '共有'
        }
        // {
        //   title: '裁判文书',
        //   url: '',
        //   isUnderConstruction: true
        // }
      ]
    },
    isNewUser: false,
    showFooter: false,
    isReadMode: false,
    isUserLoaded: false,
    showPoster: false,
    current: 0,
    posterUrlForLoading: '',
    posterUrl: '',
    joinGroupUrl: '',
    isPosterLoading: true,
    posterRedirect: '',
    swiperPosters: [
      'https://res.cloudinary.com/mini-store-2020/image/upload/v1623945805/swiper-1_nc67r2.jpg',
      'https://res.cloudinary.com/mini-store-2020/image/upload/v1623945815/swiper-3_uyvciu.png'
    ],
    canClose: false
  }

  config = {
    navigationStyle: 'custom'
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
    db.collection('configuration').where({}).get({
      success: (res) => {
        that.setState({
          posterUrlForLoading: res.data[0].posterUrl,
          posterRedirect: res.data[0].posterRedirect,
          joinGroupUrl: res.data[0].joinGroupUrl,
          canClose: res.data[0].canClose
        })
        if(res.data[0].forceLogin) {
          if(checkIfNewUser()) {
            Taro.cloud.callFunction({
              name: 'getUserInfo',
              complete: r => {
                if (r &&  r.result && r.result.data && r.result.data.length > 0 ) {
                  setStorageSync('user', r.result.data[0]);
                  that.setState({isUserLoaded: true})

                  if (!isTodayString(getStorageSync('poster-shown-at'))) {
                    that.setState({showPoster: true})
                  }

                } else {
                  that.setState({isNewUser: true});
                }
              }
            })
          } else {
            if (!isTodayString(getStorageSync('poster-shown-at'))) {
              that.setState({showPoster: true})
            }
          }
        } else {
          that.setState({showFooter: false})
          // Taro.showModal({
          //   title: '关于我们',
          //   content: '这是一个法律学习，法律信息查询的工具小程序, 祝大家司法考试顺利！',
          //   showCancel: false
          // })
        }
      }
    });

  }

  componentWillUnmount () { }

  componentDidShow () {
    const setting = getStorageSync('setting');
    if (setting && setting.isReadMode === false) {
      this.setState({isReadMode: false})
    } else {
      setStorageSync('setting', { isReadMode: true })
      this.setState({isReadMode: true})
      console.log('default set to read mode')
    }

    const {isReadMode} = this.state;
    if ( isReadMode ) {
      console.log('read')
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#F4ECD8'
      })
    }
  }

  componentDidHide () { }

  renderGridItems () {
    const {options, isNewUser, current} = this.state;
    let displayOptions;
    if (current === 0) {
      displayOptions = Object.values(options)
    } else {
      displayOptions = [options[titles[current].title], options['共有']]
    }
    return (<View>
      {displayOptions.map((items, index) => {
        return (
          <View key={`section-${current}-${index}`} className='grids'>
            {items.map((option, i )=> {
              return (<View className='grid-container' key={`grid-${i}`}>
                <GridItem option={option} disabled={isNewUser} />
              </View>)
            })}
          </View>
        )
      })}
    </View>)
  }


  renderUserFloatButton () {
    const {isUserLoaded} = this.state;
    return (<UserFloatButton isUserLoaded={isUserLoaded} avatarUrl={getUserAvatar()} />)
  }

  handleLoginSuccess = () => {
    this.setState({isNewUser: false});
    Taro.hideLoading();
  }

  handleCloseLogin = () => {
    this.setState({isNewUser: false});
  }

  handleShowFooter = throttle(() => {
    const that = this;
    that.setState({showFooter: true})
    setTimeout(() => {
      that.setState({showFooter: false})
    }, 8000)
  }, 8000, { trailing: false })

  handleSubscribe = () => {
    Taro.requestSubscribeMessage({
      tmplIds: [tmpId],
      success: function (res) {
        console.log(res)
        if (res[tmpId] === 'accept') {
          Taro.cloud.callFunction({
            name: 'subscribe',
            data: {
              tmpId
            }
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

  handleClick = (value) => {
    this.setState({
      current: value
    })
  }

  onPosterLoaded = () => {
    const { posterUrlForLoading } = this.state;
    this.setState({
      posterUrl: posterUrlForLoading,
      isPosterLoading: false
    });
  };

  handleClickMainSwiper = () => {
    Taro.showToast({
      title: '搜法～搜你想要的法律知识~',
      icon: 'none',
      duration: 2000
    })
  }

  handleClickSecondSwiper = () => {
    Taro.navigateTo({
      url: '/pages/examples/index'
    })
  }
  render () {
    const {isNewUser, isReadMode, showFooter, current, showPoster, posterUrlForLoading, isPosterLoading, posterUrl, joinGroupUrl, posterRedirect, swiperPosters, canClose} = this.state;
    return (
      <View className={`index-page ${isReadMode ? 'read-mode' : ''}`}>
        <AtNoticebar marquee speed={60}>
          本小程序数据信息均来源于最高检、最高法、公安部、司法部、人大等权威发布
        </AtNoticebar>
        {/*{getUserNickname() !== 'echo' && <View className='cake-container' onClick={() => {*/}
        {/*  Taro.navigateTo({*/}
        {/*    url: '/pages/cake/index'*/}
        {/*  })*/}
        {/*}}*/}
        {/*>*/}
        {/*  <AtBadge value='生日'>*/}
        {/*    <Image src={cake} className='cake' />*/}
        {/*  </AtBadge>*/}
        {/*</View>}*/}
        {/*  <View className='icon-container'>*/}
        {/*    <Image src={lawIcon} className='icon-title' />*/}
        {/*  </View>*/}
        <Swiper
          className='main-swiper'
          indicatorColor='#999'
          indicatorActiveColor='#333'
          circular
          autoplay
        >
          <SwiperItem>
            <View className='swiper-item-container' onClick={this.handleClickMainSwiper}>
              <Image className='image' src={swiperPosters[0]} mode='aspectFill' />
            </View>
          </SwiperItem>
          <SwiperItem>
            <View className='swiper-item-container' onClick={this.handleClickSecondSwiper}>
              <Image className='image' src={swiperPosters[1]} mode='aspectFill' />
            </View>
          </SwiperItem>
        </Swiper>
          {isSuperAdmin() && <View className='float-analytics' onClick={() => {
            Taro.navigateTo({
              url: '/pages/usage/index'
            })
          }}
          >
            <AtBadge value='统计'>
              <AtIcon value='analytics' size='30' color='#000'></AtIcon>
            </AtBadge>
          </View>}
          {/*{(!checkIfNewUser()) && <View className='float-subscribe' onClick={this.handleSubscribe}>*/}
          {/*  <AtBadge value='订阅'>*/}
          {/*    <AtIcon value='bell' size='30' color='#000'></AtIcon>*/}
          {/*  </AtBadge>*/}
          {/*</View>}*/}
          <View className='float-help' onClick={() => {
            Taro.navigateTo({
              url: '/pages/other/index'
            })
          }}
          >
            <AtBadge value='帮助'>
              <AtIcon value='help' size='30' color='#000'></AtIcon>
            </AtBadge>
          </View>
          <View>
            <AtTabs animated={false} current={current} tabList={titles} onClick={this.handleClick}>
              <AtTabsPane current={current} index={0} >
                {this.renderGridItems()}
              </AtTabsPane>
              <AtTabsPane current={current} index={1} >
                {this.renderGridItems()}
              </AtTabsPane>
              <AtTabsPane current={current} index={2} >
                {this.renderGridItems()}
              </AtTabsPane>
              <AtTabsPane current={current} index={3} >
                {this.renderGridItems()}
              </AtTabsPane>
            </AtTabs>
          </View>
         {(!isSuperAdmin()) && getUserNickname() && <View className='qrcode-container' onClick={() => {
           Taro.previewImage({
             current: joinGroupUrl,
             urls: [joinGroupUrl]
           })
         }}
         >
           <AtBadge value='加群'>
             <Image className='qrcode' src={qrcode} mode='aspectFill' />
           </AtBadge>
         </View>}
          {isNewUser && <LoginPopup handleLoginSuccess={this.handleLoginSuccess} handleCloseLogin={this.handleCloseLogin} canClose={canClose} />}
          {!isNewUser && this.renderUserFloatButton()}
          <View className='footer-container'>
            <AtDivider height='100'>
              <View className='footer' onClick={this.handleShowFooter}>
                <Image src={logo} className='logo' />
                {showFooter && <Text className='footer-logo'>武汉满屏星科技有限公司</Text>}
              </View>
            </AtDivider>
          </View>
          {/*<View>*/}
          {/*  <ImageCropper />*/}
          {/*</View>*/}
          <AtCurtain isOpened={showPoster && !isPosterLoading && posterUrl} onClose={() => {
            this.setState({showPoster: false})
            setStorageSync('poster-shown-at', getTodayDateString())
          }}
          >
            <Image
              className='poster'
              src={posterUrlForLoading}
              mode='widthFix'
              onClick={() => {
                if(posterRedirect.trim()) {
                  Taro.navigateTo({
                    url: posterRedirect.trim(),
                  })
                } else {
                  Taro.previewImage({
                    current: posterUrlForLoading,
                    urls: [posterUrlForLoading]
                  })
                }
              }}
            />
          </AtCurtain>
          <Image
            className='image-for-loading'
            src={posterUrlForLoading}
            onLoad={this.onPosterLoaded}
          />
      </View>
    )
  }
}
