import Taro, { Component } from '@tarojs/taro'
import {View, Image, Video} from '@tarojs/components'
import {AtDivider} from "taro-ui";
import { db } from '../../util/db'
import './index.scss'
import TextSection from "../../components/textSection/index.weapp";



export default class Other extends Component {

  state = {
    videoUrl: '',
    text: '',
    gifUrl: 'https://res.cloudinary.com/mini-store-2020/image/upload/v1607675316/type_kziho3.gif'
  }

  config = {
    navigationBarTitleText: ''
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
    };
  }

  componentWillMount () {
  }

  componentDidMount () {
    const that = this;
    that.setState({isLoading: true});
    db.collection('configuration').where({}).get({
      success: (res) => {
        that.setState({
          text: res.data[0].comment,
          videoUrl: res.data[0].videoUrl});
      }
    });

  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    const {text, gifUrl, videoUrl} = this.state;
    return (
      <View className='other-page'>
        <View >
          <AtDivider content='关于' />
          <View className='text-container'>
            <TextSection data={text} />
          </View>
        </View>
        {videoUrl && <View>
          <AtDivider content='视频演示' />
          <View className='video-container'>
            <Video src={videoUrl} />
          </View>
        </View>}
        <AtDivider content='持续开发中，更多功能敬请期待' />
        <Image src={gifUrl} className='background-image' mode='widthFix' />

        {/*<View className='comments'>*/}
        {/*  <View><Image src={avatarUrl} className='avatar' /></View>*/}
        {/*  <View className='comment'>*/}
        {/*    <View className='comment-box'>*/}
        {/*      {isLoading && (<View className='loading'>*/}
        {/*        <AtIcon value='loading-3' size='20' color='#fff'></AtIcon>*/}
        {/*      </View>)}*/}
        {/*      {!isLoading && <TextSection data={text} />}*/}
        {/*    </View>*/}
        {/*  </View>*/}
        {/*</View>*/}
      </View>
    )
  }
}
