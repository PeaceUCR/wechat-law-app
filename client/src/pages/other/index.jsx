import Taro, { Component } from '@tarojs/taro'
import {View, Image, Video, Text} from '@tarojs/components'
import {AtDivider} from "taro-ui";
import './index.scss'
import {checkIfNewUser} from '../../util/login'
import {db} from "../../util/db";


export default class Other extends Component {

  state = {
    criminalVideoUrl: 'https://res.cloudinary.com/mini-store-2020/video/upload/v1621580941/criminal_n7rbfn.mov',
    civilLawVideoUrl: 'https://res.cloudinary.com/mini-store-2020/video/upload/v1621582282/civil-law_tkqypy.mov',
    examplesVideoUrl: 'https://res.cloudinary.com/mini-store-2020/video/upload/v1621582314/example_xdcoe1.mov',
    consultantVideoUrl: 'https://res.cloudinary.com/mini-store-2020/video/upload/v1609563561/consultant_cmj1pg.mov',
    courtOpenVideoUrl: 'https://res.cloudinary.com/mini-store-2020/video/upload/v1609564138/court-open_iesnlt.mov',
    text: '本小程序数据信息均来源于最高检、最高法、公安部、司法部、人大等权威发布。\n先加微信联系人"pinghe_2016",他会拉你进群获取更多帮助和最新更新😊',
    gifUrl: 'https://res.cloudinary.com/mini-store-2020/image/upload/v1607675316/type_kziho3.gif',
    id: '',
    hideVideo: false,
    joinGroupUrl: ''
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
          joinGroupUrl: res.data[0].joinGroupUrl
        });
      }
    });
    if (checkIfNewUser()) {
      this.setState({hideVideo: true});
    }
    const { id } = this.$router.params;
    if (id) {
      this.setState({id});
      setTimeout(() => {
        Taro.pageScrollTo({
          selector: `#${id}`
        })
      }, 600)
    }
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    const {hideVideo, id, text, gifUrl, joinGroupUrl, criminalVideoUrl, civilLawVideoUrl, examplesVideoUrl, consultantVideoUrl,courtOpenVideoUrl} = this.state;
    return (
      <View className='other-page'>
        <View>
          <AtDivider content='关于' />
          <View className='text-container'>
            <Text>{text}</Text>
          </View>
          <View className='poster-container'>
            <Image
              className='poster'
              src={joinGroupUrl}
              mode='widthFix'
              onClick={() => {
                Taro.previewImage({
                  current: joinGroupUrl,
                  urls: [joinGroupUrl]
                })
              }}
            />
          </View>
        </View>
        {(!hideVideo) && <View>
          {(!id || id === 'criminalLaw') && <View>
            <AtDivider content='刑法功能视频演示' />
            <View className='video-container'>
              <Video id='criminalLaw' src={criminalVideoUrl} />
            </View>
          </View>}
          {(!id || id === 'civilLaw') && <View>
            <AtDivider content='民法典功能视频演示' />
            <View className='video-container'>
              <Video id='civilLaw' src={civilLawVideoUrl} />
            </View>
          </View>}
          {(!id || id === 'examples') && <View>
            <AtDivider content='指导案例能视频演示' />
            <View className='video-container'>
              <Video id='examples' src={examplesVideoUrl} />
            </View>
          </View>}
          {(!id || id === 'consultant') && <View>
            <AtDivider content='刑事审判参考功能视频演示' />
            <View className='video-container'>
              <Video id='consultant' src={consultantVideoUrl} />
            </View>
          </View>}
          {(!id || id === 'courtOpen') && <View>
            <AtDivider content='最高法公报案例功能视频演示' />
            <View className='video-container'>
              <Video id='courtOpen' src={courtOpenVideoUrl} />
            </View>
          </View>}
        </View>}
        <AtDivider content='持续开发中，更多功能敬请期待' />
        <Image id='abc' src={gifUrl} className='background-image' mode='widthFix' />

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
