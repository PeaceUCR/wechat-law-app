import Taro from '@tarojs/taro'
import {AtIcon} from "taro-ui";
import {Text, View, Image} from "@tarojs/components";
import './index.scss'
import {rightArrowIcon} from'../../util/util'

const GlobalSearchItem = (props) => {
  let {text,title, law, number, redirect, type, publishInfo} = props;
  let displayedText = text;
  let showDot = false
  if (text && text.length > 40) {
    showDot = true
    displayedText = `${text.trim().substring(0, 40)}${showDot ? '...' : ''}`
  }

  return (<View className='search-item' onClick={redirect} >
    {type && <View className='float-type'>{type}</View>}
    {/*<View className='line'>*/}
    {/*  <Text className='law'>{law}</Text>*/}
    {/*  <Text className='number'>{number}</Text>*/}
    {/*  <Image src={rightArrowIcon} className='right-arrow' />*/}
    {/*</View>*/}
    {title && <View>{title}</View>}
    {!title && <View className='main-text'>
      {displayedText}
    </View>}
    {publishInfo && <View className='publish-info'>{publishInfo}</View>}

  </View>)
}

export default GlobalSearchItem;
