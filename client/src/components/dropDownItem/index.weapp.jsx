import Taro, { useState} from '@tarojs/taro'
import {Text, View} from "@tarojs/components";
import { AtIcon } from 'taro-ui'
import {removeStringFrom, removeFirstLineBreak} from '../../util/util'
import './index.scss'

const DropDownItem = (props) => {
  let {data, type} = props;
  data = data ? data : {};
  const [isHidden, setIsHidden] = useState(true);
  if (type === 'example') {
    const {name, number, text} = data;

    return (<View className='drop-down-item' onClick={() => setIsHidden(!isHidden)}>
      <View className='toggle'><Text>{number}{name}</Text> <AtIcon value={isHidden ? 'chevron-down' : 'chevron-up'} size='20' color='#6190E8'></AtIcon></View>
      {!isHidden && <View className='text'>{removeFirstLineBreak(removeStringFrom(removeStringFrom(text, number), name))}</View>}
    </View>)
  }
  const {name, number, text} = data;

  return (<View className='drop-down-item' onClick={() => setIsHidden(!isHidden)}>
    <View className='toggle'><Text>{number}{name}</Text> <AtIcon value={isHidden ? 'chevron-down' : 'chevron-up'} size='20' color='#6190E8'></AtIcon></View>
    {!isHidden && <View className='text'>{text}</View>}
  </View>)
}

export default DropDownItem;
