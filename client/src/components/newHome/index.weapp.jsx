import Taro from '@tarojs/taro'
import {View,Image,RichText,Text} from "@tarojs/components";
import {criminalIcon, civilIcon, adminIcon, publicInterestIcon, appealIcon} from '../../util/util'
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
    title: '公益',
    icon: publicInterestIcon
  },{
    title: '控申',
    icon: appealIcon,
    redirect: () => {
      Taro.navigateTo({
        url: `/pages/appeal/index`,
      })
    }
  },
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
            selectCurrent(index + 1)
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
