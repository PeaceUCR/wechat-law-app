import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View,Input, Button, RichText, Text} from '@tarojs/components'
import {AtFab, AtIcon, AtActivityIndicator, AtDivider, AtButton, AtBadge} from "taro-ui";
import { db } from '../../util/db'
import TextSectionComponent from '../../components/textSectionComponent/index'
import '../exampleDetail/index.scss'
import {checkIfNewUser, getCollectionLimit, redirectToIndexIfNewUser} from "../../util/login";
import throttle from "lodash/throttle";
import {DiscussionArea} from "../../components/discussionArea/index.weapp";


export default class ExampleDetail extends Component {

  state = {
    comment: '',
    isSent: false,
    id: '',
    type: 'cai-pan-gui-ze',
    example: {},
    keyword: '',
    zoomIn: false,
    isCollected: false,
    isReadMode: false,
    isLoading: true,
    enableAutoScroll: false,
    enableExampleDetailAd: false,
  }

  config = {
    navigationBarTitleText: '裁判要旨案例详情'
  }

  componentWillMount () {
    const that = this;
    const { id } = this.$router.params;

    db.collection('cai-pan-gui-ze').where({_id: id}).get({
      success: (res) => {
        if (res.data[0]) {
          that.setState({example: res.data[0], isLoading: false, id});
        } else {
          that.setState({isLoading: false, id})
        }
      },
      fail: () => {
        console.log('fail')
        that.setState({isLoading: false, id})
      }
    });
    const {type} = this.state
    Taro.cloud.callFunction({
      name: 'isCollected',
      data: {
        id: id,
        type: type
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

  onShareAppMessage() {
    const {type, id, keyword} = this.state;
    Taro.cloud.callFunction({
      name: 'share',
      data: {
        url: `/pages/exampleDetail/index?type=${type}&id=${id}&keyword=${keyword}`
      }
    })
    return {
      path: `/pages/exampleDetail/index?type=${type}&id=${id}&keyword=${keyword}`
    };
  }

  componentDidMount () {
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  renderExample = () => {
    const {example, keyword, zoomIn} = this.state;
    const {text, judgeRule} = example;
    return (<View>
      <View className='term-complement-title'>裁判要旨:</View>
      <View className='term-complement-title'>
        <TextSectionComponent data={judgeRule} keyword={keyword} zoomIn={zoomIn} />
      </View>
      <AtDivider content='案例详情' />
      <TextSectionComponent data={text} keyword={keyword} zoomIn={zoomIn} />
    </View>)
  }

  handleZoom = () => {
    const {zoomIn} = this.state;
    this.setState({zoomIn: !zoomIn})
  }

  handleCollect = throttle(() => {
    if (checkIfNewUser()) {
      redirectToIndexIfNewUser()
      return ;
    }

    const that = this;
    const { isCollected, example, type } = this.state;
    const {_id, text} = example;
    that.setState({isLoading: true});

    if (isCollected) {
      Taro.cloud.callFunction({
        name: 'deleteCollection',
        data: {
          id: _id,
          type: type
        },
        complete: () => {
          that.setState({isLoading: false, isCollected: false});
          Taro.showToast({
            title: '收藏取消',
            icon: 'none',
            duration: 1000
          })
        }
      })
    } else {
      Taro.cloud.callFunction({
        name: 'collect',
        data: {
          id: _id,
          type: type,
          title: example.title,
          collectionLimit: getCollectionLimit()
        },
        complete: (r) => {
          if (r && r.result && r.result.errMsg !== 'collection.add:ok') {
            Taro.showToast({
              title: `收藏失败:${r.result.errMsg}`,
              icon: 'none',
              duration: 3000
            })
            that.setState({isLoading: false})
            return ;
          }

          that.setState({isLoading: false, isCollected: true});
          Taro.showToast({
            title: '收藏成功',
            icon: 'none',
            duration: 1000
          })
        }
      })
    }
  }, 3000, { trailing: false })

  handleCommentChange = (e) => {
    this.setState({
      comment: e.target.value
    })
  }
  handleClear = () => {
    this.setState({
      comment: ''
    })
  }

  handleSend = () => {
    if (checkIfNewUser()) {
      redirectToIndexIfNewUser()
      return ;
    }
    const {comment, example, type} = this.state
    if (comment) {
      this.setState({
        isSent: false
      })
      Taro.showLoading({
        title: '发送中',
      })
      Taro.cloud.callFunction({
        name: 'addComment',
        data: {
          topicId: example._id,
          page: 'exampleDetail',
          type,
          content: comment
        },
        complete: (r) => {
          console.log(r)
          if ((r && r.errMsg !== 'cloud.callFunction:ok')
            || (r.result && r.result.errMsg !== "collection.add:ok")) {
            Taro.showToast({
              title: `发表失败:${r.result.errMsg}`,
              icon: 'none',
              duration: 3000
            })
            return ;
          } else {
            this.setState({
              comment: '',
              isSent: true
            })
            Taro.showToast({
              title: `发表成功`,
              icon: 'none',
              duration: 3000
            })
          }
          Taro.hideLoading()
        }
      })
    } else {
      Taro.showToast({
        title: '发表内容不能为空',
        icon: 'none',
        duration: 3000
      })
    }
  }

  handleCommentsLoaded = () => {
    setTimeout(() => {
      Taro.pageScrollTo({
        selector: `#comments`
      })
    }, 100)
  }


  renderNoData = () => {
    const {type} = this.state
    return (<View>
      {type !== 'local-law-detail' && <View>
        <View className='no-data'>出错啦!</View>
        <View className='no-data'>数据不存在或者已经迁移</View>
        <View className='no-data'>麻烦重新搜索进入</View>
      </View>}
      {type === 'local-law-detail' && <View>
        <View className='no-data'>数据还在收录中</View>
        <View className='no-data'>敬请期待</View>
      </View>}
    </View>)
  }


  render () {
    const {isSent, keyword, comment, example, zoomIn, isCollected, isReadMode, isLoading, type, enableAutoScroll, enableExampleDetailAd, categories, openCategory} = this.state;
    const {text, title} = example
    return (
      <View>
        <View className={`example-detail-page page ${zoomIn ? 'zoom-in' : ''} ${isReadMode ? 'read-mode' : ''}`}>
          {this.renderExample()}
          {!isLoading && !title && !text && this.renderNoData()}
          <View className='footer'>
            <View className='text'>
              <Input
                className='input'
                value={comment}
                onInput={this.handleCommentChange}
                onClear={this.handleClear}
                type='text'
                placeholder='欢迎发表你的观点'
              />
              <AtButton type='primary' size='small' onClick={this.handleSend}>
                发表
              </AtButton>
            </View>
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
          <DiscussionArea topicId={example._id}  isSent={isSent} handleCommentsLoaded={this.handleCommentsLoaded} />
          <View id='comments'></View>
          {isLoading && <View className='loading-container'>
            <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
          </View>}
        </View>
      </View>
    )
  }
}
