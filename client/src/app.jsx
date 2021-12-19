import Taro, { Component, getStorageSync, setStorageSync } from '@tarojs/taro'
import Index from './pages/index'

import './app.scss'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/localLaw/index',
      'pages/adminComplement/index',
      'pages/adminCriminalLink/index',
      'pages/procuratorateDoc/index',
      'pages/judgement/index',
      'pages/judgementHelp/index',
      'pages/globalSearch/index',
      'pages/criminalComplement/index',
      'pages/otherLaw/index',
      'pages/judgementDetail/index',
      // 'pages/companyLaw/index',
      // 'pages/adminAllowLaw/index',
      // 'pages/adminReconsiderRegulation/index',
      // 'pages/adminReconsiderLaw/index',
      // 'pages/adminForceLaw/index',
      // 'pages/adminLitigationLaw/index',
      // 'pages/adminLitigationExplaination/index',
      // 'pages/antiDrugLaw/index',
      // 'pages/antiTerrorismLaw/index',
      // 'pages/roadSafeRegulation/index',
      // 'pages/roadSafeLaw/index',
      // 'pages/laborContractLaw/index',
      // 'pages/laborLaw/index',
      // 'pages/adminPunishLaw/index',
      // 'pages/supervisionLaw/index',
      // 'pages/cake/index',
      // 'pages/publicOrderAdminPenaltyLaw/index',
      // 'pages/policeAdminRegulation/index',
      // 'pages/judgement/index',
      'pages/usage/index',
      'pages/examples/index',
      'pages/criminalLaw/index',
      'pages/other/index',
      'pages/litigationLaw/index',
      // 'pages/litigationRegulation/index',
      'pages/termDetail/index',
      'pages/exampleDetail/index',
      'pages/user/index',
      'pages/consultant/index',
      'pages/civilLaw/index',
      'pages/civilLawDetail/index',
      // 'pages/courtOpen/index',
      'pages/civilLawExplaination/index',
      // 'pages/policeRegulation/index',
      'pages/regulationDetail/index',
      'pages/civilLawRegulation/index',
      // 'pages/litigationExplanation/index'
    ],
    permission: {
      "scope.userLocation": {
        "desc": "你的位置信息将用于识别和推荐地域性法律、法规、案例等"
      }
    },
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTextStyle: 'black'
    },
    cloud: true
  }

  componentDidMount () {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init()
    }
  }

  componentDidShow () {
    console.log('app jsx show')
    Taro.cloud.init({
      traceUser: true
    });
    Taro.cloud.callFunction({
      name: 'record'
    })
  }

  componentDidHide () {}

  componentDidCatchError () {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Index />
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
