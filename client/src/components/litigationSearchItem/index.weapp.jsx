import Taro from '@tarojs/taro'
import {Text, View, RichText} from "@tarojs/components";
import './index.scss'

const findAndHighlight = (str, key) => {
  var regExp =new RegExp(key,"g");
  if (key) {
    return '<div>' + key ? str.replace(regExp, `<span class='highlight-keyword'>${key}</span>`) : str + '</div>'
  } else {
    return '<div>' + str + '</div>'
  }
}

const LitigationSearchItem = (props) => {
  let {data, onSearchResultClick, isReadMode, keyword} = props;
  data = data ? data : {content: []}
  const {content, chapter, section} = data;
  const text = content.join('\n');

  return (<View className={`search-item ${isReadMode ? 'read-mode' : ''}`} onClick={() => {onSearchResultClick(data)}}>
    {chapter && <View className='titles'>
      <Text className='chapter title'>{chapter}</Text>
      <Text className='section title'>{section}</Text>
    </View>}
    <RichText nodes={findAndHighlight(text, keyword)}></RichText>
  </View>)
}

export default LitigationSearchItem;
