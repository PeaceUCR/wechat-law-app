import Taro, { Component } from '@tarojs/taro'
import {View, Image, Text} from '@tarojs/components'
import {AtIcon, AtDivider, AtBadge} from "taro-ui";
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
        title: '民法典',
        url: '/pages/civilLaw/index',
        isNew: true
      }],
    isNewUser: false,
    showFooter: true
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

  componentDidShow () { }

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

  render () {
    const {options, isNewUser} = this.state;
    return (
      <View className='index-page'>
          <View className='icon-container'>
            <Image src={lawIcon} className='icon-title' />
          </View>
          <View className='float-help' onClick={() => {
            Taro.navigateTo({
              url: '/pages/other/index'
            })
          }}
          >
            <AtBadge value='NEW'>
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
              <View className='footer'>
                <Image src={logo} className='logo' />
                <Text className='text'>武汉满屏星科技有限公司</Text>
              </View>
            </AtDivider>
          </View>
      </View>
    )
  }
}
