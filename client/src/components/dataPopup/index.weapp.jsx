import Taro from '@tarojs/taro'
import {Text, View} from "@tarojs/components";
import {AtIcon} from "taro-ui";
import './index.scss'
import moment from "moment";

const DataPopup = (props) => {
  let {data ,type, num, zoomIn} = props;
  data = data ? data: {};
  const {name, number, title,  _id, sourceName, sourceId, crimeName, effectiveDate, special} = data;
  const isExample = type === 'procuratorate'
    || type === 'court'
    || type === 'complement-example'

  let displayName = ''

  if (type === 'court' || type === 'complement' || type === 'complement-example') {
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
  } else if (type === 'consult') {
    displayName = `[${number}]${title}`
  }else {
    displayName = name
  }

  return (<View className={`${zoomIn ? 'zoom-in' : ''}`}>
    <View className={`${isExample ? 'example': ''} line-center`} onClick={() => {
      if (type === 'source') {
        Taro.navigateTo({
          url: `/pages/exampleDetail/index?type=complement&id=${sourceId}&keyword=${crimeName}`,
        })
        return ;
      }
      Taro.navigateTo({
        url: `/pages/exampleDetail/index?type=${type}&id=${_id}&keyword=${num}`,
      })
    }}
    >
      <Text className='title'>{displayName}</Text>
      <AtIcon value='external-link' size='16' color='#4d4dff'></AtIcon>
    </View>
    {effectiveDate && <View className='time'>{moment(effectiveDate).format('YYYY-MM-DD')}</View>}
  </View>)
}

export default DataPopup;
