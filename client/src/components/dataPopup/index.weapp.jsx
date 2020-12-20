import Taro from '@tarojs/taro'
import {Text, View} from "@tarojs/components";
import {AtIcon} from "taro-ui";
import './index.scss'

const DataPopup = (props) => {
  let {data ,type, num} = props;
  data = data ? data: {};
  const {name, number, title,  _id} = data;
  return (<View>
    <View className='line-center' onClick={() => Taro.navigateTo({
      url: `/pages/exampleDetail/index?type=${type}&id=${_id}&keyword=${num}`,
    })}
    >
      <Text className='title'>{type === 'court' || type === 'complement' ? title : number + name }</Text>
      <AtIcon value='external-link' size='16' color='#6190E8'></AtIcon>
    </View>
  </View>)
}

export default DataPopup;
