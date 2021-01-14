import Taro from '@tarojs/taro'
import {View} from "@tarojs/components";
import { AtBadge } from "taro-ui";
import throttle from 'lodash/throttle';
import './index.scss'

const GridItem = (props) => {
  let {option, disabled} = props;
  option = option ? option : {title: '', url: ''};
  const {title, url, isNew, isHot, isUpdated} = option;
  const redirect = throttle(
    () => {
      if(disabled) {
        return ;
      }
      if (url) {
        Taro.navigateTo({
          url: option.url,
        })
      } else {
        Taro.showToast({
          title: '敬请期待',
          icon: 'none',
          duration: 1000
        })
      }
    },
    2000,
    { trailing: false }
  );

  return (
    <AtBadge value={isNew?'NEW':(isHot?'Hot':'')} dot={isUpdated ? true : false}>
      <View className='grid-item' onClick={redirect} >
        <View className='float-item'></View>
        <View className='title'>{title}</View>
      </View>
    </AtBadge>)
}

export default GridItem;
