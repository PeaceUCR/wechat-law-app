import Taro, { Component } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import './index.scss';

// import { Loading } from '../../components/loading/index.weapp'
const Loading = () => {
  return (<View className='loading-container'>
    <View className='loading-cat'>
      <View className='body'></View>
      <View className='head'>
        <View className='face'></View>
      </View>
      <View className='foot'>
        <View className='tummy-end'></View>
        <View className='bottom'></View>
        <View className='legs left'></View>
        <View className='legs right'></View>
      </View>
      <View className='hands left'></View>
      <View className='hands right'></View>
    </View>
    <View className='center'>加载中...</View>
  </View>)
}
// const Loading = () => {
//   return (<View className='loading-container'>
//     <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
//   </View>)
// }


export default Loading;
