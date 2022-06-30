import Taro, { Component, getStorageSync } from '@tarojs/taro'
import { View, Text, RichText, Input, Button, Image } from '@tarojs/components'
import {AtFab,AtIcon,AtBadge,AtActivityIndicator, AtDivider} from "taro-ui";
import {checkIfNewUser, getCollectionLimit, redirectToIndexIfNewUser} from '../../util/login'
import '../sentencingDetail/index.scss'
import throttle from "lodash/throttle";
import TextSectionComponent from "../../components/textSectionComponent/index";
import Loading2 from "../../components/loading2/index.weapp";
import {db} from "../../util/db";

export default class SentencingDetail extends Component {

  state = {
    isSentencingLoading: true,
    isCollected: false,
    isReadMode: true,
    zoomIn: false,
    number: -1,
    id: '',
    sentencings: [],
    categories: [],
    openCategory: false
  }

  config = {
    navigationBarTitleText: '刑法释义'
  }

  onShareAppMessage() {
    const {number, id} = this.state
    Taro.cloud.callFunction({
      name: 'share',
      data: {
        url: `pages/termDetailExplanation/index?id=${id}&number=${number}`
      }
    })
    return {
      path: `pages/termDetailExplanation/index?id=${id}&number=${number}`
    };
  }

  componentWillMount () {
    const { number, id } = this.$router.params;
    const that = this;

    Taro.setNavigationBarTitle({title: `刑法第${number}条释义`})

    that.setState({
      number,
      id
    })

    db.collection('term-explanation-faxin-2020').where({number: parseInt(number)}).get({
      success: (r) => {
        db.collection('term-explanation-faxin-2020-zhi-yi').where({number: number}).get({
          success: (res) => {
            res.data.sort((a, b) => a['number-postfix'] - b['number-postfix'])
            const all = [...r.data,...res.data]
            const categories = all.map(s => {
              if (s['number-postfix']) {
                return `刑法第${number}条之${s['number-postfix']}释义【${s.crime}】`
              }
              return `刑法第${number}条释义`
            })
            that.setState({sentencings: all, isSentencingLoading: false, categories});
          }
        });

      }
    });


    Taro.cloud.callFunction({
      name: 'isCollected',
      data: {
        id: id,
        type: 'termDetailExplanation'
      },
      complete: (r) => {

        if (r && r.result && r.result.data && r.result.data.length > 0) {
          that.setState({isCollected: true})
        }
      },
      fail: (e) => {
        Taro.showToast({
          title: `获取收藏数据失败:${JSON.stringify(e)}`,
          icon: 'none',
          duration: 1000
        })
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
    const {sentencings, number, zoomIn} = this.state
    return <View className='sentencings'>
      {sentencings.map((sentencing, index) => {
        const {text} = sentencing
        return (<View className='sentencing' key={`sentencing-key-${index}`}>
          <View id={`category-${index}`}></View>
          <View className='line'>
            {sentencing['number-postfix'] && <View className='source static-category-item'>{`刑法第${number}条之${sentencing['number-postfix']}释义`}</View>}
            {!sentencing['number-postfix'] && <View className='source static-category-item'>{`刑法第${number}条释义`}</View>}
            <TextSectionComponent data={text} zoomIn={zoomIn} />
          </View>
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
    const {isCollected, number, id} = this.state;

    that.setState({isSentencingLoading: true})
    if (isCollected) {
      Taro.cloud.callFunction({
        name: 'deleteCollection',
        data: {
          id: id,
          type: 'termDetailExplanation'
        },
        complete: () => {
          Taro.showToast({
            title: '收藏取消',
            icon: 'none',
            duration: 1000
          })
          that.setState({isSentencingLoading: false, isCollected: false});
        }
      })
    } else {
      Taro.cloud.callFunction({
        name: 'collect',
        data: {
          id: id,
          type: 'termDetailExplanation',
          title: `刑法第${number}条释义`,
          criminalLawNumber: number,
          collectionLimit: getCollectionLimit()
        },
        complete: (r) => {
          if (r && r.result && r.result.errMsg !== 'collection.add:ok') {
            Taro.showToast({
              title: `收藏失败:${r.result.errMsg}`,
              icon: 'none',
              duration: 3000
            })
            that.setState({isSentencingLoading: false})
            return ;
          }
          Taro.showToast({
            title: '收藏成功',
            icon: 'none',
            duration: 1000
          })
          that.setState({isSentencingLoading: false, isCollected: true});
        }
      })
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
