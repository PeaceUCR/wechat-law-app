import Taro, { Component } from '@tarojs/taro'
import {View, Image, Video} from '@tarojs/components'
import {AtDivider} from "taro-ui";
import './index.scss'
import TextSection from "../../components/textSection/index.weapp";
import {checkIfNewUser} from '../../util/login'


export default class Other extends Component {

  state = {
    criminalVideoUrl: 'https://res.cloudinary.com/mini-store-2020/video/upload/v1621580941/criminal_n7rbfn.mov',
    civilLawVideoUrl: 'https://res.cloudinary.com/mini-store-2020/video/upload/v1621582282/civil-law_tkqypy.mov',
    examplesVideoUrl: 'https://res.cloudinary.com/mini-store-2020/video/upload/v1621582314/example_xdcoe1.mov',
    consultantVideoUrl: 'https://res.cloudinary.com/mini-store-2020/video/upload/v1609563561/consultant_cmj1pg.mov',
    courtOpenVideoUrl: 'https://res.cloudinary.com/mini-store-2020/video/upload/v1609564138/court-open_iesnlt.mov',
    text: '搜法专业版（2021-1-2）\n新发布功能：\n- 民法典\n- 刑事审判参考\n- 最高法公报案例\n本APP中的法律条文，案例和材料均来自于公开的政府发布信息和网站',
    gifUrl: 'https://res.cloudinary.com/mini-store-2020/image/upload/v1607675316/type_kziho3.gif',
    id: '',
    hideVideo: false
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
    // const that = this;
    // that.setState({isLoading: true});
    // db.collection('configuration').where({}).get({
    //   success: (res) => {
    //
    //     that.setState({
    //       text: res.data[0].comment,
    //       videoUrl: res.data[0].videoUrl});
    //   }
    // });
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
    const {hideVideo, id, text, gifUrl, criminalVideoUrl, civilLawVideoUrl, examplesVideoUrl, consultantVideoUrl,courtOpenVideoUrl} = this.state;
    return (
      <View className='other-page'>
        <View>
          <AtDivider content='关于' />
          <View className='text-container'>
            <TextSection data={text} />
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
