import Taro, { Component, getStorageSync, setStorageSync } from '@tarojs/taro'
import {View, Image, Text, Swiper, SwiperItem} from '@tarojs/components'
import {AtIcon, AtDivider, AtBadge, AtNoticebar, AtTabs, AtTabsPane, AtCurtain, AtSearchBar } from "taro-ui";
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
import {tmpId} from '../../util/util'
import {otherLawNameMap} from '../../util/otherLaw'

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
          type: '刑法',
          isUpdated: true
        },
        {
          title: otherLawNameMap['criminal-litigation-explanation'],
          url: '/pages/otherLaw/index?law=criminal-litigation-explanation',
          type: '刑法'
        },
        // {
        //   title: '(最高法)适用刑事诉讼法的解释',
        //   url: '/pages/litigationExplanation/index',
        //   type: '刑法'
        // },
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
          title: '反恐怖主义法',
          url: '/pages/antiTerrorismLaw/index',
          type: '刑法',
          isNew: true
        },
        {
          title: '禁毒法',
          url: '/pages/antiDrugLaw/index',
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
          title: '民法典相关司法解释',
          url: '/pages/civilLawExplaination/index',
          type: '民法典'
        },
        {
          title: '民事诉讼法',
          url: '/pages/civilLawRegulation/index',
          type: '民法典'
        },
        {
          title: otherLawNameMap['civil-litigation-explanation'],
          url: '/pages/otherLaw/index?law=civil-litigation-explanation',
          type: '民法典'
        },
        {
          title: '劳动法',
          url: '/pages/laborLaw/index',
          type: '民法典',
          isNew: true
          // isHot: true
        },
        {
          title: '劳动合同法',
          url: '/pages/laborContractLaw/index',
          type: '民法典',
          isNew: true
          // isHot: true
        },
        {
          title: '公司法',
          url: '/pages/companyLaw/index',
          type: '民法典',
          isNew: true
          // isHot: true
        }
      ],
      '行政相关': [
        {
          title: '行政诉讼法',
          url: '/pages/adminLitigationLaw/index',
          type: '行政',
          isNew: true
        },
        {
          title: '最高法适用"行政诉讼法"的解释',
          url: '/pages/adminLitigationExplaination/index',
          type: '行政',
          isNew: true
        },
        {
          title: '行政强制法',
          url: '/pages/adminForceLaw/index',
          type: '行政',
          isNew: true
        },
        {
          title: '行政处罚法',
          url: '/pages/adminPunishLaw/index',
          type: '行政',
          isNew: true
          // isHot: true
        },
        {
          title: '行政复议法',
          url: '/pages/adminReconsiderLaw/index',
          type: '行政',
          isNew: true
          // isHot: true
        },
        {
          title: '行政复议法实施条例',
          url: '/pages/adminReconsiderRegulation/index',
          type: '行政',
          isNew: true
          // isHot: true
        },
        {
          title: '行政许可法',
          url: '/pages/adminAllowLaw/index',
          type: '行政',
          isNew: true
          // isHot: true
        },
        {
          title: '治安管理处罚法',
          url: '/pages/publicOrderAdminPenaltyLaw/index',
          type: '行政',
          isNew: true
          // isHot: true
        },
        {
          title: '道路交通安全法',
          url: '/pages/roadSafeLaw/index',
          type: '行政',
          isNew: true
        },
        {
          title: '道路交通安全法实施条例',
          url: '/pages/roadSafeRegulation/index',
          type: '行政',
          isNew: true
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
      'https://mmbiz.qpic.cn/mmbiz_jpg/6fKEyhdZU93zibwIDAjqC1D6vUA9MoQMhuRBKvt2YTvnv6WibIp33kib9P2d0NhKLGzVMKallINfdfn6la92avSyg/0?wx_fmt=jpeg',
      'https://mmbiz.qpic.cn/mmbiz_png/6fKEyhdZU93zibwIDAjqC1D6vUA9MoQMh7RfDn2viazdoymmbYkFWjziaMhGvxWHicFtQI7ib4XvgGvZ6xZygvvCIUg/0?wx_fmt=png'
    ],
    canClose: false,
    enableMainVideoAd: false,
    enableMainBanner: false,
    enableMainBottomVideo: false,
    searchValue: ''
    // enablePosterAd: false
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
    const that = this;
    db.collection('configuration').where({}).get({
      success: (res) => {
        that.setState({
          posterUrlForLoading: res.data[0].posterUrl,
          posterRedirect: res.data[0].posterRedirect,
          joinGroupUrl: res.data[0].joinGroupUrl,
          canClose: res.data[0].canClose,
          enableMainVideoAd: res.data[0].enableMainVideoAd,
          enableMainBanner: res.data[0].enableMainBanner,
          enableMainBottomVideo: res.data[0].enableMainBottomVideo
          // enablePosterAd: res.data[0].enablePosterAd
        })
        if(res.data[0].forceLogin) {
          if(checkIfNewUser()) {
            Taro.cloud.callFunction({
              name: 'getUserInfo',
              complete: r => {
                if (r &&  r.result && r.result.data && r.result.data.length > 0 ) {
                  setStorageSync('user', r.result.data[0]);
                  that.setState({isUserLoaded: true})

                  if (getStorageSync('poster-shown') !== res.data[0].posterUrl) {
                    that.setState({showPoster: true})
                  }

                } else {
                  that.setState({isNewUser: true});
                }
              }
            })
          } else {
            if (getStorageSync('poster-shown') !== res.data[0].posterUrl) {
              that.setState({showPoster: true})
            } else {
              // that.setState({enablePosterAd: res.data[0].enablePosterAd})
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

  isNoOption = () => {
    const {options, searchValue} = this.state
    const found = Object.values(options).flat().filter(i => i.title.indexOf(searchValue) !== -1)
    return found.length === 0
  }
  componentDidMount () {
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
    const {options, isNewUser, current, searchValue} = this.state;
    let displayOptions;
    if (current === 0) {
      displayOptions = Object.values(options)
    } else {
      displayOptions = [options[titles[current].title], options['共有']]
    }
    return (<View>
      {displayOptions.map((items, index) => {
        const filteredOptions = items.filter(option => {
          if (searchValue) {
            return option.title.indexOf(searchValue) !== -1
          }
          return true
        })
        return (
          <View key={`section-${current}-${index}`} className='grids'>
            {filteredOptions.map((option, i )=> {
              return (<View className='grid-container' key={`grid-${i}`}>
                <GridItem option={option} disabled={isNewUser} keyword={searchValue} />
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
      title: '搜法～搜你想要的法律知识',
      icon: 'none',
      duration: 2000
    })
  }

  handleClickSecondSwiper = () => {
    Taro.navigateTo({
      url: '/pages/examples/index'
    })
  }

  onChange = (searchValue) => {
    this.setState({searchValue})
    if (searchValue && this.isNoOption()) {
      Taro.showToast({
        title: '未找到模块!注意这个只是首页过滤,不是全局搜索',
        icon: 'none',
        duration: 6000
      })
    }
  }

  onClear = () => {
    this.setState({
      searchValue: ''
    });
  }

  render () {
    const {isNewUser, isReadMode, showFooter, current, showPoster, posterUrlForLoading, isPosterLoading, posterUrl, joinGroupUrl, posterRedirect, swiperPosters, canClose, enableMainVideoAd, enableMainBanner, searchValue, enableMainBottomVideo} = this.state;
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
        {!enableMainVideoAd && <Swiper
          className='main-swiper'
          indicatorColor='#999'
          indicatorActiveColor='#333'
          circular
          indicatorDots
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
        </Swiper>}
        {enableMainVideoAd && <Swiper className='video-container'>
          <SwiperItem >
            <ad unit-id='adunit-806ae2093227c183' ad-type='video' ad-theme='white'></ad>
          </SwiperItem>
        </Swiper>}
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
          <AtSearchBar
            showActionButton
            placeholder='搜模块,比如刑法'
            value={searchValue}
            onChange={this.onChange}
            onClear={this.onClear}
          />
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
            setStorageSync('poster-shown', posterUrl)
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
        {/*{enableMainBanner && <View><ad unit-id='adunit-918b26ec218137ab' ad-intervals='30'></ad></View>}*/}
        {enableMainBottomVideo && <Swiper className='video-container'>
          <SwiperItem >
            <ad unit-id='adunit-ac46445a5f7a8561' ad-type='video' ad-theme='white'></ad>
          </SwiperItem>
        </Swiper>}
      </View>
    )
  }
}
