import Taro from '@tarojs/taro'
import {View, Text, Image} from "@tarojs/components";
import './index.scss'
import {rightArrowIcon} from "../../util/util";

const RenderLabel = (props) => {
  let {label} = props
  label = label ? label : ''
  const fragments = label.split('条')
  const n = fragments.shift()
  const t = fragments.join('条')
  if (n && t) {
    return (<View className='label'>
      <Text className='number'>{`${n}条 ${t.trim()}`}</Text>
      {/*<Text className='law'>{t.trim()}</Text>*/}
      {/*<Image*/}
      {/*  src={rightArrowIcon}*/}
      {/*  className='left-hand'*/}
      {/*  mode='widthFix'*/}
      {/*/>*/}
    </View>)
  }

  return (<View className='label'><Text className='number'>{label}</Text></View>)
}

export default RenderLabel;
