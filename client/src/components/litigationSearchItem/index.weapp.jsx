import Taro from '@tarojs/taro'
import {Text, View} from "@tarojs/components";
import './index.scss'

const LitigationSearchItem = (props) => {
  let {data, onSearchResultClick, isReadMode} = props;
  data = data ? data : {content: []}
  const {content, chapter, section} = data;
  const text = content.join('\n');

  return (<View className={`search-item ${isReadMode ? 'read-mode' : ''}`} onClick={() => {onSearchResultClick(content)}}>
    {chapter && <View className='titles'><Text className='chapter title'>{chapter}</Text><Text className='section title'>{section}</Text></View>}
    <View>{text}</View>
  </View>)
}

export default LitigationSearchItem;
