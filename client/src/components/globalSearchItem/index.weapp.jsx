import Taro from '@tarojs/taro'
import {Text, View, Image} from "@tarojs/components";
import './index.scss'

const GlobalSearchItem = (props) => {
  let {text,title, law, number, redirect, type, publishInfo, isCaiPanGuiZe} = props;
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
    {title && <View className='title'>{title}</View>}
    {(!title || isCaiPanGuiZe) && <View className='main-text'>
      {displayedText}
    </View>}
    {publishInfo && <View className='publish-info'>{publishInfo}</View>}

  </View>)
}

export default GlobalSearchItem;
