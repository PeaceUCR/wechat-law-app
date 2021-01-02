import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Image, Text} from '@tarojs/components'
import {AtIcon, AtDivider, AtBadge, AtNoticebar} from "taro-ui";
import throttle from 'lodash/throttle';
import { GridItem } from '../../components/grid/index.weapp'
import { LoginPopup } from '../../components/loginPopup/index.weapp'
import { UserFloatButton } from '../../components/userFloatButton/index.weapp'
import lawIcon from '../../static/law.png';
import logo from '../../static/logo.png';
import {checkIfNewUser, getUserAvatar} from '../../util/login';
import './index.scss'
import {db} from "../../util/db";

export default class Index extends Component {

  state = {
    options: [
      {
        title:'刑法',
        url: '/pages/criminalLaw/index'
      }, {
        title: '民法典',
        url: '/pages/civilLaw/index',
        isNew: true
      }, {
        title: '刑事诉讼法',
        url: '/pages/litigationLaw/index'
      }, {
        title: '刑事诉讼规则(检)',
        url: '/pages/litigationRegulation/index'
      }, {
        title: '指导案例',
        url: '/pages/examples/index'
      }, {
        title: '刑事审判参考',
        url: '/pages/consultant/index'
      }, {
        title: '最高法公报案例',
        url: '/pages/courtOpen/index',
        isNew: true
      }],
    isNewUser: false,
    showFooter: false,
    isReadMode: false
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
        if(res.data[0].forceLogin) {
          if(checkIfNewUser()) {
            that.setState({isNewUser: true});
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
    const {options, isNewUser} = this.state;
    return (<View className='grids'>
      {options.map((option, index )=> {
        return (<View className='grid-container' key={`grid-${index}`}>
          <GridItem option={option} disabled={isNewUser} />
        </View>)
      })}
    </View>)
  }

  renderUserFloatButton () {
    return (<UserFloatButton avatarUrl={getUserAvatar()} />)
  }

  handleLoginSuccess = () => {
    this.setState({isNewUser: false});
    Taro.hideLoading();
  }

  handleShowFooter = () => {
    const that = this;
    that.setState({showFooter: true})
    setTimeout(() => {
      that.setState({showFooter: false})
    }, 8000)
  }
  render () {
    const {options, isNewUser, isReadMode, showFooter} = this.state;
    return (
      <View className={`index-page ${isReadMode ? 'read-mode' : ''}`}>
        <AtNoticebar marquee speed={60}>
          本小程序数据信息均来源于最高检，最高法，公安部，司法部等权威发布
        </AtNoticebar>
          <View className='icon-container'>
            <Image src={lawIcon} className='icon-title' />
          </View>
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
            {options && options.length > 0 && this.renderGridItems()}
          </View>
          {isNewUser && <LoginPopup handleLoginSuccess={this.handleLoginSuccess} />}
          {!isNewUser && this.renderUserFloatButton()}
          <View className='footer-container'>
            <AtDivider height='100'>
              <View className='footer' onClick={
                throttle(this.handleShowFooter, 8000, { trailing: false })
              }
              >
                <Image src={logo} className='logo' />
                {showFooter && <Text className='footer-logo'>武汉满屏星科技有限公司</Text>}
              </View>
            </AtDivider>
          </View>
      </View>
    )
  }
}
