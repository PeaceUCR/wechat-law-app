import Taro from '@tarojs/taro'
import {Text, View, RichText} from "@tarojs/components";
import './index.scss'
import {convertNumberToChinese, isNumber} from "../../util/convertNumber";

const findAndHighlightForRegulation = (str, key, n, index) => {
  str = str ? str : ''
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

const LitigationSearchItem = (props) => {
  let {data, onSearchResultClick, isReadMode, keyword} = props;
  data = data ? data : {content: []}
  const {chapter, section, text, number} = data;

  return (<View className={`search-item ${isReadMode ? 'read-mode' : ''}`} onClick={() => {onSearchResultClick(data)}}>
    {chapter && <View className='titles'>
      <Text className='chapter title'>{chapter}</Text>
      <Text className='section title'>{section}</Text>
    </View>}
    <RichText nodes={findAndHighlightForRegulation(text, keyword, number, 0)}></RichText>
  </View>)
}

export default LitigationSearchItem;
