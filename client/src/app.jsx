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
      // 'pages/cake/index',
      'pages/publicOrderAdminPenaltyLaw/index',
      'pages/policeAdminRegulation/index',
      'pages/judgement/index',
      'pages/usage/index',
      'pages/examples/index',
      'pages/criminalLaw/index',
      'pages/other/index',
      'pages/litigationLaw/index',
      'pages/litigationRegulation/index',
      'pages/termDetail/index',
      'pages/exampleDetail/index',
      'pages/user/index',
      'pages/consultant/index',
      'pages/civilLaw/index',
      'pages/civilLawDetail/index',
      'pages/courtOpen/index',
      'pages/civilLawExplaination/index',
      'pages/policeRegulation/index',
      'pages/regulationDetail/index',
      'pages/civilLawRegulation/index',
      'pages/litigationExplanation/index'
    ],
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
