import Taro from '@tarojs/taro'
import {View,Image} from "@tarojs/components";
import {criminalIcon, civilIcon, adminIcon, publicInterestIcon, appealIcon, supervisionIcon, criminalExecutionIcon, exampleHomeIcon} from '../../util/util'
import './index.scss'

const options = [
  {
    title: '刑事',
    icon: criminalIcon
  },{
    title: '民事',
    icon: civilIcon
  },{
    title: '行政',
    icon: adminIcon
  },{
    title: '纪监',
    icon: supervisionIcon,
    redirect: () => {
      Taro.navigateTo({
        url: `/pages/supervision/index`,
      })
    }
  },{
    title: '控申',
    icon: appealIcon,
    redirect: () => {
      Taro.navigateTo({
        url: `/pages/appeal/index`,
      })
    }
  },{
    title: '刑执',
    icon: criminalExecutionIcon,
    redirect: () => {
      Taro.navigateTo({
        url: `/pages/criminalExecution/index`,
      })
    }
  },{
    title: '公益',
    icon: publicInterestIcon
  },{
    title: '案例',
    icon: exampleHomeIcon
  }
]


const NewHome = (props) => {
  const {selectCurrent} = props
  return (
    <View className='new-home'>
      {options.map((option, index) => {
        return (<View key={index} className='option' onClick={() => {
          if (option.redirect) {
            option.redirect()
          } else {
            if (option.title === '公益') {
              selectCurrent(4)
            } else if (option.title === '案例') {
              selectCurrent(5)
            } else {
              selectCurrent(index + 1)
            }
          }
        }}>
          <Image src={option.icon} className='option-icon' mode='widthFix' />
          <View>{option.title}</View>
        </View>)
      })}
    </View>
  )
}

export default NewHome;
