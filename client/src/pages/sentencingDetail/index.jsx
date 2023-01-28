import Taro, { Component, getStorageSync } from '@tarojs/taro'
import { View, Text, RichText, Input, Button, Image } from '@tarojs/components'
import {AtFab,AtIcon,AtBadge,AtActivityIndicator, AtDivider} from "taro-ui";
import {checkIfNewUser, getCollectionLimit, redirectToIndexIfNewUser} from '../../util/login'
import './index.scss'
import throttle from "lodash/throttle";
import {DiscussionArea} from "../../components/discussionArea/index.weapp";
import TextSectionComponent from "../../components/textSectionComponent/index";
import {getSentencingTag} from "../../util/util";
import DataPopup from "../../components/dataPopup/index.weapp";
import moment from "moment";
import Loading2 from "../../components/loading2/index.weapp";
import {addScore, deleteCollection, isCollected, saveCollection} from "../../util/userCollection";

export default class SentencingDetail extends Component {

  state = {
    isSentencingLoading: true,
    isCollected: false,
    isReadMode: true,
    zoomIn: false,
    criminalLawNumber: -1,
    id: '',
    sentencings: [],
    categories: [],
    openCategory: false
  }

  config = {
    navigationBarTitleText: '量刑指导意见'
  }

  onShareAppMessage() {
    const {criminalLawNumber, id} = this.state
    // TODO correct later
    addScore();
    return {
      path: `pages/sentencingDetail/index?id=${id}&criminalLawNumber=${criminalLawNumber}`
    };
  }

  componentWillMount () {
    const { criminalLawNumber, id } = this.$router.params;
    const that = this;

    Taro.setNavigationBarTitle({title: `刑法第${criminalLawNumber}条量刑指导意见`})

    that.setState({
      criminalLawNumber,
      id
    })

    Taro.cloud.callFunction({
      name: 'getSentencing',
      data: {
        criminalLawNumber: parseInt(criminalLawNumber)
      },
      complete: r => {
        if (r.result.data) {
          const categories = r.result.data.map(s => {
            const {crimeName, effectiveDate, location} = s
            return getSentencingTag(crimeName, location, effectiveDate)
          })
          that.setState( {
            isSentencingLoading: false,
            sentencings: r.result.data,
            categories
          })
        }
      }
    })

    isCollected(id, 'sentencing').then((flag) => {
      if (flag) {
        that.setState({isCollected: true})
      }
    })

    const setting = getStorageSync('setting');
    this.setState({isReadMode: setting && setting.isReadMode})
    if (setting && setting.isReadMode) {
      console.log('read')
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#F4ECD8'
      })
    }
  }

  renderSentencings = () => {
    const {sentencings, zoomIn} = this.state
    return <View className='sentencings'>
      {sentencings.map((sentencing, index) => {
        const {crimeName, text, sourceName, sourceId, effectiveDate, location} = sentencing
        return (<View className='sentencing' key={`sentencing-key-${index}`}>
          <View id={`category-${index}`}></View>
          <View className='tag'>{getSentencingTag(crimeName, location, effectiveDate)}</View>
          <View className='line crime-line'>
            <Text className='crime-line-item'>罪名:<Text className='crime'>{crimeName}</Text></Text>
            <Text className='date crime-line-item'>
              实施日期:{moment(effectiveDate).format('YYYY-MM-DD')}</Text>
          </View>
          <View className='line'>
            <TextSectionComponent data={text} zoomIn={zoomIn} />
          </View>
          <View className='line link'>
            <DataPopup data={{sourceName, sourceId, crimeName}} type='source' zoomIn={zoomIn} />
          </View>
          <AtDivider height='40' lineColor='#fff' />
        </View>)
      })}
    </View>
  }

  renderCategory = () => {
    const {categories} = this.state
    return (<View className='float-category'>
      {categories.map((c, index) => (<View
        className='float-category-item'
        key={c}
        onClick={() => {
          console.log(`click ${index}`)
          Taro.pageScrollTo({
            selector: `#category-${index}`,
            duration: 500
          })
        }}
      >{`${c}`}</View>))}
    </View>)
  }

  renderStaticCategory = () => {
    const {categories} = this.state
    return (<View >
      <View>目录</View>
      {categories.map((c, index) => (<View
        className='static-category-item'
        key={c}
        onClick={() => {
          console.log(`click ${index}`)
          Taro.pageScrollTo({
            selector: `#category-${index}`,
            duration: 500
          })
        }}
      >{`${c}`}</View>))}
    </View>)
  }

  componentDidMount () {
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleCollect = throttle(() => {
    console.log('collect')

    if (checkIfNewUser()) {
      redirectToIndexIfNewUser()
      return ;
    }

    const that = this;
    const {isCollected, criminalLawNumber, id} = this.state;

    that.setState({isSentencingLoading: true})
    if (isCollected) {
      deleteCollection(id).then(() => {
        Taro.showToast({
          title: '收藏取消',
          icon: 'none',
          duration: 1000
        })
        that.setState({isSentencingLoading: false, isCollected: false});
      })

    } else {

      saveCollection(id, 'sentencing', `刑法第${criminalLawNumber}条量刑指导意见`).then(() => {
        Taro.showToast({
          title: '收藏成功',
          icon: 'none',
          duration: 1000
        })
        that.setState({isSentencingLoading: false, isCollected: true});
      }).catch(() => {
        Taro.showToast({
          title: `收藏失败:${r.result.errMsg}`,
          icon: 'none',
          duration: 3000
        })
        that.setState({isSentencingLoading: false})
      });
    }
  }, 3000, { trailing: false })

  handleZoom = () => {
    const {zoomIn} = this.state;
    this.setState({zoomIn: !zoomIn})
  }

  renderNoData = () => {
    return (<View>
      <View className='no-data'>出错啦!</View>
      <View className='no-data'>数据不存在或者已经迁移</View>
      <View className='no-data'>麻烦重新搜索进入</View>
    </View>)
  }

  render () {
    const { sentencings, isCollected, isReadMode, zoomIn, isSentencingLoading, categories, openCategory} = this.state;
    return (
      <View className={`term-detail-page page ${isReadMode ? 'read-mode' : ''} ${zoomIn ? 'zoom-in' : ''}`}>
        {categories && categories.length > 0 && this.renderStaticCategory()}
        {this.renderSentencings()}
        {!isSentencingLoading && sentencings && sentencings.length === 0 && this.renderNoData()}
        {categories && categories.length > 0 && openCategory && this.renderCategory()}
        <AtFab onClick={() => this.setState({openCategory: !openCategory})} size='small' className='float-category-icon'>
          <Text className={`at-fab__icon at-icon ${openCategory ? 'at-icon-close' : 'at-icon-menu'}`}></Text>
        </AtFab>
        <View className='footer'>
          <View className='favorite-container' onClick={this.handleCollect} >
            <AtIcon value={isCollected ? 'star-2' : 'star'} size='32' color={isCollected ? '#ffcc00' : 'rgba(0, 0, 0, 0.6)'}></AtIcon>
          </View>
          <AtFab size='small' className='float-zoom' onClick={() => {this.handleZoom()}}>
            <View  className={`zoom ${zoomIn ? 'zoom-in': 'zoom-out'}`} mode='widthFix' />
          </AtFab>
          <View className='share-container'>
            <AtBadge value='分享'>
              <Button className='share-button' openType='share'>
                <AtIcon value='share-2' size='32' color='#6190E8'></AtIcon>
              </Button>
            </AtBadge>
          </View>
        </View>

        {isSentencingLoading && <Loading2 />}
      </View>
    )
  }
}
