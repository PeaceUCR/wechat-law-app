import Taro from '@tarojs/taro'
import {Image, Input, Text, View} from "@tarojs/components";
import './index.scss'

const TermSearchItem = (props) => {
  let {term} = props;
  term = term ? term : {};
  const {text, crime, tag, _id} = term;
  const isCrime = tag === crime;
  return (<View className='search-item' onClick={() => {
    Taro.navigateTo({
      url: `/pages/termDetail/index?id=${_id}`,
    })
  }} >
    <View className={isCrime? 'crime tag':'tag'}>{tag}</View>
    <View>{text}</View>
  </View>)
}

export default TermSearchItem;
