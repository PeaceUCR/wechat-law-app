import Taro from '@tarojs/taro'
import {View} from '@tarojs/components';
import './index.scss'


const VideoAd = (props) => {

  return (<View className='adContainer' >
    <ad unit-id='adunit-806ae2093227c183' ad-type='video' ad-theme='white'></ad>
  </View>)
}

export default VideoAd;
