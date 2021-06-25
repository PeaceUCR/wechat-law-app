import Taro from '@tarojs/taro'
import {Text, View} from "@tarojs/components";
import {AtIcon} from "taro-ui";
import './index.scss'

const DataPopup = (props) => {
  let {data ,type, num, zoomIn} = props;
  data = data ? data: {};
  const {name, number, title,  _id, sourceName, sourceId, crimeName, effectiveDate, special} = data;

  let displayName = ''

  if (type === 'court' || type === 'complement') {
    displayName = title
    if (special) {
      displayName = title.replace(/\n/g,'')
    }
  } else if (type === 'procuratorate') {
    if (number) {
      displayName = `检例第(${number})号:${name}`
    } else {
      displayName = name
    }

  } else if (type === 'source') {
    displayName = `来源:${sourceName}`
  } else {
    displayName = name
  }

  return (<View className={`${zoomIn ? 'zoom-in' : ''}`}>
    <View className='line-center' onClick={() => {
      if (type === 'source') {
        Taro.navigateTo({
          url: `/pages/exampleDetail/index?type=${type}&id=${sourceId}&keyword=${crimeName}`,
        })
        return ;
      }
      Taro.navigateTo({
        url: `/pages/exampleDetail/index?type=${type}&id=${_id}&keyword=${num}`,
      })
    }}
    >
      <Text className='title'>{displayName}</Text>
      <AtIcon value='external-link' size='14' color='#4d4dff'></AtIcon>
    </View>
    {effectiveDate && <View className='time'>{new Date(Date.parse(effectiveDate)).toLocaleDateString('fr-CA')}</View>}
  </View>)
}

export default DataPopup;
