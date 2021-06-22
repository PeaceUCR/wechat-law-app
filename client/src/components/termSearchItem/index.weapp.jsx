import Taro from '@tarojs/taro'
import {View,RichText} from "@tarojs/components";
import throttle from 'lodash/throttle';
import './index.scss'

const TermSearchItem = (props) => {
  let {term, disableRedirect, type, isReadMode, keyword} = props;
  term = term ? term : {};
  const {text, crime, tag, _id, isDeleted} = term;
  const isCrime = crime && tag === crime;
  const redirect = throttle(
    () => {
      if (disableRedirect) {
        return ;
      } else if (type === 'civil') {
        Taro.navigateTo({
          url: `/pages/civilLawDetail/index?id=${_id}`,
        })
      } else if (type === 'police') {
        Taro.navigateTo({
          url: `/pages/regulationDetail/index?id=${_id}&type=${type}&keyword=${keyword}`,
        })
      } else if (type === 'police-admin-regulation') {
        Taro.navigateTo({
          url: `/pages/regulationDetail/index?id=${_id}&type=${type}&keyword=${keyword}`,
        })
      } else if (type === 'public-order-admin-penalty-law') {
        Taro.navigateTo({
          url: `/pages/regulationDetail/index?id=${_id}&type=${type}&keyword=${keyword}`,
        })
      } else if (type === 'supervision-law') {
        Taro.navigateTo({
          url: `/pages/regulationDetail/index?id=${_id}&type=${type}&keyword=${keyword}`,
        })
      } else if (type === 'admin-punish-law') {
        Taro.navigateTo({
          url: `/pages/regulationDetail/index?id=${_id}&type=${type}&keyword=${keyword}`,
        })
      } else if (type === 'labor-law') {
        Taro.navigateTo({
          url: `/pages/regulationDetail/index?id=${_id}&type=${type}&keyword=${keyword}`,
        })
      } else if (type === 'labor-contract-law') {
        Taro.navigateTo({
          url: `/pages/regulationDetail/index?id=${_id}&type=${type}&keyword=${keyword}`,
        })
      } else {
        Taro.navigateTo({
          url: `/pages/termDetail/index?id=${_id}`,
        })
      }

    },
    2000,
    { trailing: false }
  );
  const findAndHighlight = (str, key) => {
    var regExp =new RegExp(key,"g");
    if (key) {
      return '<div>' + key ? str.replace(regExp, `<span class='highlight-keyword'>${key}</span>`) : str + '</div>'
    } else {
      return '<div>' + str + '</div>'
    }
  }

  return (<View className={`search-item ${isReadMode ? 'read-mode' : ''} ${isDeleted ? 'deleted' : ''}`} onClick={redirect} >
    <View className={isCrime? 'crime tag':'tag'}>{tag}</View>
    {type !== 'police'
    && text && <View>{
      text.split('\n').filter(line => line.trim() && line.trim().length > 0).map((t, index) => {
        return <View key={`term-${index}`}>
          <RichText nodes={findAndHighlight(t, keyword)}></RichText>
        </View>
      })
    }</View>}
    {type === 'police'
      && text && (text.map((t, index) => {
      return <View key={`police-${index}`}>
        <RichText nodes={findAndHighlight(t, keyword)}></RichText>
      </View>
    }))}
  </View>)
}

export default TermSearchItem;
