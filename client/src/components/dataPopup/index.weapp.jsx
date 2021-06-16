import Taro from '@tarojs/taro'
import {Text, View} from "@tarojs/components";
import {AtIcon} from "taro-ui";
import './index.scss'

const DataPopup = (props) => {
  let {data ,type, num, zoomIn} = props;
  data = data ? data: {};
  const {name, number, title,  _id, sourceName, sourceId, crimeName} = data;

  let displayName = ''

  if (type === 'court' || type === 'complement') {
    displayName = title
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

  return (<View>
    <View className={`line-center  ${zoomIn ? 'zoom-in' : ''}`} onClick={() => {
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
      <AtIcon value='external-link' size='16' color='#6190E8'></AtIcon>
    </View>
  </View>)
}

export default DataPopup;
