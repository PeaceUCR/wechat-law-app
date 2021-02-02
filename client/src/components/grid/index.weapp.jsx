import Taro from '@tarojs/taro'
import {View,Image} from "@tarojs/components";
import { AtBadge } from "taro-ui";
import throttle from 'lodash/throttle';
import './index.scss'
import constructionIcon from '../../static/under-construction.png';


const GridItem = (props) => {
  let {option, disabled} = props;
  option = option ? option : {title: '', url: ''};
  const {title, url, isNew, isHot, isUpdated, isUnderConstruction} = option;
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
          title: '全力开发中，点击左上角，订阅重大更新消息哦',
          icon: 'none',
          duration: 6000
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
        {isUnderConstruction && <View className='icon-container'><Image src={constructionIcon} className='construction-icon' /></View>}
        <View className='title'>{title}</View>
      </View>
    </AtBadge>)
}

export default GridItem;
