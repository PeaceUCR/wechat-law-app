import Taro, { Component, getStorageSync, setStorageSync } from '@tarojs/taro'
import {View, Image, Text} from '@tarojs/components'
import {AtIcon, AtDivider, AtBadge, AtNoticebar, AtTabs, AtTabsPane, AtCurtain} from "taro-ui";
import throttle from 'lodash/throttle';
import { GridItem } from '../../components/grid/index.weapp'
import { LoginPopup } from '../../components/loginPopup/index.weapp'
import { UserFloatButton } from '../../components/userFloatButton/index.weapp'
import lawIcon from '../../static/law.png';
import logo from '../../static/logo.png';
import {checkIfNewUser, getUserAvatar, getUserNickname} from '../../util/login';
import './index.scss'
import {db} from "../../util/db";
import {tmpId, isTodayString, getTodayDateString} from '../../util/util'

const titles = [{title:'全部'}, {title:'刑法相关'}, {title:'民法典相关'}]
export default class Index extends Component {

  state = {
    options: {
      '刑法相关': [
        {
          title:'刑法',
          url: '/pages/criminalLaw/index',
          isHot: true
        },
        {
          title: '刑事诉讼法',
          url: '/pages/litigationLaw/index'
        },
        {
          title: '(最高法)适用刑事诉讼法的解释',
          url: '/pages/litigationExplanation/index'
        },
        {
          title: '(最高检)刑事诉讼规则',
          url: '/pages/litigationRegulation/index'
        },
        {
          title: '公安机关办理刑事案件程序规定',
          url: '/pages/policeRegulation/index'
        },
        {
          title: '刑事审判参考',
          url: '/pages/consultant/index',
          isUpdated: true
        }
      ],
      '民法典相关': [
        {
        title: '民法典',
        url: '/pages/civilLaw/index',
        isHot: true
        },
        {
          title: '民事诉讼法',
          url: '/pages/civilLawRegulation/index'
        },
        {
          title: '民法典相关司法解释',
          url: '/pages/civilLawExplaination/index'
        }
      ],
      '共有': [
        {
          title: '指导案例',
          url: '/pages/examples/index'
        },
        {
          title: '最高法公报案例',
          url: '/pages/courtOpen/index'
        },
        {
          title: '裁判文书',
          url: '',
          isUnderConstruction: true
        }
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
    isPosterLoading: true
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
        that.setState({posterUrlForLoading: res.data[0].posterUrl})
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
    console.log('show')
    const setting = getStorageSync('setting');
    this.setState({isReadMode: setting && setting.isReadMode})
    if (setting && setting.isReadMode) {
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

  render () {
    const {isNewUser, isReadMode, showFooter, current, showPoster, posterUrlForLoading, isPosterLoading, posterUrl} = this.state;
    return (
      <View className={`index-page ${isReadMode ? 'read-mode' : ''}`}>
        <AtNoticebar marquee speed={60}>
          本小程序数据信息均来源于最高检，最高法，公安部，司法部等权威发布
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
          <View className='icon-container'>
            <Image src={lawIcon} className='icon-title' />
          </View>
          {(getUserNickname() === 'echo' || getUserNickname() === 'peace') && <View className='float-analytics' onClick={() => {
            Taro.navigateTo({
              url: '/pages/usage/index'
            })
          }}
          >
            <AtBadge value='统计'>
              <AtIcon value='analytics' size='30' color='#000'></AtIcon>
            </AtBadge>
          </View>}
          {(!checkIfNewUser()) && <View className='float-subscribe' onClick={this.handleSubscribe}>
            <AtBadge value='订阅'>
              <AtIcon value='bell' size='30' color='#000'></AtIcon>
            </AtBadge>
          </View>}
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
            </AtTabs>
          </View>
          {isNewUser && <LoginPopup handleLoginSuccess={this.handleLoginSuccess} />}
          {!isNewUser && this.renderUserFloatButton()}
          <View className='footer-container'>
            <AtDivider height='100'>
              <View className='footer' onClick={this.handleShowFooter}>
                <Image src={logo} className='logo' />
                {showFooter && <Text className='footer-logo'>武汉满屏星科技有限公司</Text>}
              </View>
            </AtDivider>
          </View>
          <AtCurtain isOpened={showPoster && !isPosterLoading && posterUrl} onClose={() => {
            this.setState({showPoster: false})
            setStorageSync('poster-shown-at', getTodayDateString())
          }}
          >
            <Image
              className='poster'
              src={posterUrlForLoading}
              mode='widthFix'
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
