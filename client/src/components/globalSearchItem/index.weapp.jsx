import Taro from '@tarojs/taro'
import {AtIcon} from "taro-ui";
import {Text, View, Image} from "@tarojs/components";
import './index.scss'
import {rightArrowIcon} from'../../util/util'

const GlobalSearchItem = (props) => {
  let {text, law, number, redirect} = props;
  let displayedText = text;
  let showDot = false
  if (text && text.length > 40) {
    displayedText = text.substring(0, 40)
    showDot = true
    displayedText = `${text.substring(0, 40)}${showDot ? '...' : ''}`
  }

  return (<View className='search-item' onClick={redirect} >
    <View className='line'>
      <Text className='law'>{law}</Text>
      {/*<Text className='number'>{number}</Text>*/}
      <Image src={rightArrowIcon} className='right-arrow' />
    </View>
    <View className='main-text'>
      {displayedText}
    </View>
  </View>)
}

export default GlobalSearchItem;
