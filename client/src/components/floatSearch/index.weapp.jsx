import Taro, { useState} from '@tarojs/taro'
import {Text, View, Input, Button, Image} from "@tarojs/components";
import './index.scss'

const FloatSearch = (props) => {
  let {keyword, onConfirm} = props;
  console.log('keyword', keyword)
  const [isExpand, setIsExpand] = useState(false);
  const [value, setValue] = useState('');

  return (<View className={`float-search ${isExpand ? '' : 'hide'}`} >
    <Image
      src='https://mmbiz.qpic.cn/mmbiz_png/6fKEyhdZU92ZxgSc5ucTic6axZs8an92Bbbz7P6ia8oeXL2QgpSzIb2kFib1Wq1jgib0dkQjib3aEtp7qFSWpVbsNWw/0?wx_fmt=png'
      className='search'
      onClick={() => setIsExpand(!isExpand)}
    />
    <Input
      className='input'
      value={value}
      onInput={(event) => setValue(event.detail.value)}
      type='text'
      placeholder='文内搜索'
    />
    <Button className='button' size='mini' type='primary' onClick={() => onConfirm(value)}>确定</Button>
  </View>)
}

export default FloatSearch;
