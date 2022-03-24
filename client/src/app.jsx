import Taro, { Component, getStorageSync, setStorageSync } from '@tarojs/taro'
import moment from 'moment';
import Index from './pages/index'
import {getLastTimeLogin} from './util/login'
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
      'pages/criminalExecution/index',
      'pages/fileCaseDetail/index',
      'pages/supervision/index',
      'pages/appeal/index',
      'pages/caiPanGuiZe/index',
      'pages/caiPanGuiZeDetail/index',
      'pages/sentencingDetail/index',
      'pages/localLaw/index',
      'pages/adminComplement/index',
      'pages/adminCriminalLink/index',
      'pages/procuratorateDoc/index',
      'pages/judgement/index',
      'pages/judgementHelp/index',
      'pages/globalSearch+/index',
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
      // 'pages/supervision/index',
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
    const visitDate = getStorageSync('visitDate')
    const today = moment().format('YYYY-MM-DD')
    // const lastTimeLogin = getLastTimeLogin() && moment(getLastTimeLogin()).format('YYYY-MM-DD')
    const shouldAddScore = visitDate !== today
      // && lastTimeLogin !== undefined
      // && today !== lastTimeLogin
    console.log(visitDate, today, shouldAddScore)
    Taro.cloud.init({
      traceUser: true
    });
    Taro.cloud.callFunction({
      name: 'record',
      data: {
        shouldAddScore
      }
    })
    setStorageSync('visitDate', today);
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
