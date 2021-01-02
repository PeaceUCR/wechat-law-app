import Taro from '@tarojs/taro'
import {Text, View} from "@tarojs/components";
import throttle from 'lodash/throttle';
import './index.scss'

const ExampleSearchItem = (props) => {
  let {example, type, disableRedirect, isReadMode} = props;
  example = example ? example : {};
  const {title, terms, keyword, name, number, _id} = example;
  const redirect = throttle(
    () => {
      if (disableRedirect) {
        return ;
      }
      Taro.navigateTo({
        url: `/pages/exampleDetail/index?type=${type}&id=${_id}`,
      })
    },
    2000,
    { trailing: false }
  );
  if (type === 'court') {
    return (<View className={`search-item ${isReadMode ? 'read-mode' : ''}`} onClick={redirect} >
      <Text className='tag'>法</Text>
      <View className='title'>{title}</View>
      <View>关键词:{keyword.replace('关键词', '')}</View>
      <View>{terms}</View>
    </View>)
  }
  return (<View className={`search-item ${isReadMode ? 'read-mode' : ''}`} onClick={redirect} >
    <Text className='tag procuratorate'>检</Text>
    <View className='title'>{number}:{name}</View>
    <View>关键词:{keyword}</View>
    <View>{terms}</View>
  </View>)
}

export default ExampleSearchItem;
