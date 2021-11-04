import Taro from '@tarojs/taro'
import {AtIcon} from "taro-ui";
import {Text, View, Image} from "@tarojs/components";
import './index.scss'

const types = ['不起诉','起诉','抗诉', '申诉']
const getType = title => {
  return types.find(t => title && title.indexOf(t) !== -1)
}

const JudgementSearchItem = (props) => {
  let {text, title, date, caseNumber, courtName, redirect, pocuratorate, category} = props;
  let displayedText = text;
  let showDot = false
  if (text && text.length > 100) {
    if (pocuratorate) {
      displayedText = text.substring(0, 40)
      showDot = true
      displayedText = `${text.substring(0, 40)}${showDot ? '...' : ''}`
    } else {
      displayedText = text.substring(0, 100)
      showDot = true
      displayedText = `${text.substring(0, 100)}${showDot ? '...' : ''}`
    }
  }

  let type = getType(title)

  return (<View className='search-item' onClick={redirect} >
    {type && pocuratorate && <View className='float-type'>{type.substring(0,3)}</View>}
    {category && <View className='float-type'>{category}</View>}
    <View className='line'>
      <View className='law'>{title}</View>
      {/*<Text className='number'>{number}</Text>*/}
      {/*<Image src={rightArrowIcon} className='right-arrow' />*/}
    </View>
    <View className='sub-line line'>
      <View className='date'>{courtName}</View>
      <View className='date'>{caseNumber}</View>
    </View>
    {/*<View className='line'>*/}
    {/*  <View className='date'>{date}</View>*/}
    {/*</View>*/}
    <View className='main-text'>
      {displayedText}
    </View>
  </View>)
}

export default JudgementSearchItem;
