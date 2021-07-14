import Taro from '@tarojs/taro'
import {View,RichText} from "@tarojs/components";
import {getText} from "../../util/util";
import throttle from 'lodash/throttle';
import './index.scss'
import {convertNumberToChinese, isNumber} from "../../util/convertNumber";

const regulationDetailSet = new Set(
  [
    'police',
    'police-admin-regulation',
    'public-order-admin-penalty-law',
    'supervision-law',
    'admin-punish-law',
    'labor-law',
    'labor-contract-law',
    'road-safe-law',
    'road-safe-regulation',
    'civil-law-regulation',
    'anti-terrorism-law',
    'anti-drug-law',
    'admin-litigation-law',
    'admin-litigation-explaination',
    'admin-force-law'
  ])

const TermSearchItem = (props) => {
  let {term, disableRedirect, type, isReadMode, keyword} = props;
  term = term ? term : {};
  let {text, crime, tag, _id, isDeleted, number} = term;
  if (type === 'civil-law-regulation') {
    text = text.join('\n')
  }

  const isCrime = crime && tag === crime;
  const redirect = throttle(
    () => {
      if (disableRedirect) {
        return ;
      } else if (type === 'civil') {
        Taro.navigateTo({
          url: `/pages/civilLawDetail/index?id=${_id}`,
        })
      } else if (regulationDetailSet.has(type)) {
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
  const findAndHighlightForRegulation = (str, key, n, index) => {

    if (index === 0) {
      let numberKey = isNumber(n) ? convertNumberToChinese(n) : n;
      const numberRegExp =new RegExp(numberKey);
      str = str.replace(numberRegExp, `<span class='highlight-number'>${numberKey}</span>`)
    }

    if (key) {
      const regExp =new RegExp(key,"g");
      return '<div>' + key ? str.replace(regExp, `<span class='highlight-keyword'>${key}</span>`) : str + '</div>'
    } else {
      return '<div>' + str + '</div>'
    }
  }

  return (<View className={`search-item ${isReadMode ? 'read-mode' : ''} ${isDeleted ? 'deleted' : ''}`} onClick={redirect} >
    <View className={isCrime? 'crime tag':'tag'}>{tag}</View>
    {text && <View>{
      getText(text).split('\n').filter(line => line.trim() && line.trim().length > 0).map((t, index) => {
        return <View key={`term-${index}`}>
          <RichText nodes={findAndHighlightForRegulation(t, keyword, number, index)}></RichText>
        </View>
      })
    }</View>}
  </View>)
}

export default TermSearchItem;
