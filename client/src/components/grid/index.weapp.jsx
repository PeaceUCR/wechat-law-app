import Taro from '@tarojs/taro'
import {View,Image,RichText} from "@tarojs/components";
import { AtBadge, AtIcon } from "taro-ui";
import throttle from 'lodash/throttle';
import './index.scss'
// import constructionIcon from '../../static/under-construction.png';
import {isStartWith} from "../../util/util";

const colors = {
  '刑法': '#F67B78',
  '民法典': '#92A5F8',
  '行政': '#008000',
  '共有': '#BFA13C'
}

const findAndHighlight = (str, index, key) => {
  const regExp =new RegExp(key,"g");
  if (key) {
    return '<div>' + key ? str.replace(regExp, `<span class='highlight-keyword'>${key}</span>`) : str + '</div>'
  } else {
    return '<div>' + str + '</div>'
  }
}

const GridItem = (props) => {
  let {option, disabled, keyword} = props;
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
        <View className='float-item'>
          {(option.type === '共有' || option.type === '刑法') && <View className='tag criminal'>刑</View>}
          {(option.type === '共有' || option.type === '民法典') && <View className='tag'>民</View>}
          {(option.type === '共有' || option.type === '行政') && <View className='tag admin'>行</View>}
        </View>
        {/*{isUnderConstruction && <View className='icon-container'><Image src={constructionIcon} className='construction-icon' /></View>}*/}
        <View className='title-container'>
          <AtIcon value='chevron-right' size='22' color={colors[option.type]}></AtIcon>
          <View className='title'>
            <RichText nodes={findAndHighlight(title, 0, keyword)} ></RichText>
          </View>
        </View>
      </View>
    </AtBadge>)
}

export default GridItem;
