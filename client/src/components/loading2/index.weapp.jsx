import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

// import { Loading } from '../../components/loading/index.weapp'
const Loading2 = () => {
  return (<View className='loading-wrapper'>
    <View className='loading-text'>加载中...</View>
    <View className='loading-content'></View>
  </View>
  )
}



export default Loading2;
