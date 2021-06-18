import Taro, { Component, getStorageSync } from '@tarojs/taro'
import { View, Text, RichText, Input, Button } from '@tarojs/components'
import {AtFab,AtIcon,AtBadge,AtButton,AtActivityIndicator} from "taro-ui";
import { db } from '../../util/db'
import {checkIfNewUser, redirectToIndexIfNewUser} from '../../util/login'
import './index.scss'
import throttle from "lodash/throttle";
import {DiscussionArea} from "../../components/discussionArea/index.weapp";


export default class RegulationDetail extends Component {

  state = {
    comment: '',
    isSent: false,
    term: {},
    type: '',
    keyword: '',
    isLoading: false,
    isCollected: false,
    isReadMode: false,
    zoomIn: false
  }

  config = {
    navigationBarTitleText: '详情'
  }

  onShareAppMessage() {
    const {term,type,keyword} = this.state
    return {
      path: `pages/regulationDetail/index?id=${term._id}&type=${type}&keyword=${keyword}`
    };
  }

  componentWillMount () {
    const { id, type, keyword } = this.$router.params;
    const that = this;
    if (type === 'police') {
      db.collection('police-regulation').where({_id: id}).get({
        success: (res) => {
          const term = res.data[0];
          that.setState({term, type, keyword});
        }
      })
    }

    if (type === 'police-admin-regulation') {
      db.collection('police-admin-regulation').where({_id: id}).get({
        success: (res) => {
          const term = res.data[0];
          that.setState({term, type, keyword});
        }
      })
    }
    if (type === 'public-order-admin-penalty-law') {
      db.collection('public-order-admin-penalty-law').where({_id: id}).get({
        success: (res) => {
          const term = res.data[0];
          that.setState({term, type, keyword});
        }
      })
    }

    if (type === 'public-order-admin-penalty-law') {
      db.collection('public-order-admin-penalty-law').where({_id: id}).get({
        success: (res) => {
          const term = res.data[0];
          that.setState({term, type, keyword});
        }
      })
    }

    if (type === 'supervision-law') {
      db.collection('supervision-law').where({_id: id}).get({
        success: (res) => {
          const term = res.data[0];
          that.setState({term, type, keyword});
        }
      })
    }

    if (type === 'litigation-law') {
      db.collection('litigation-law').where({_id: id}).get({
        success: (res) => {
          const term = res.data[0];
          that.setState({term, type, keyword});
        }
      })
    }

    if (type === 'litigation-regulation') {
      db.collection('litigation-regulation').where({_id: id}).get({
        success: (res) => {
          const term = res.data[0];
          that.setState({term, type, keyword});
        }
      })
    }

    if (type === 'litigation-explanation') {
      db.collection('litigation-explanation').where({_id: id}).get({
        success: (res) => {
          const term = res.data[0];
          that.setState({term, type, keyword});
        }
      })
    }

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
    const {isCollected, term, type} = this.state;
    const {_id, item, number, tag} = term

    that.setState({isLoading: true})
    if (isCollected) {
      Taro.cloud.callFunction({
        name: 'deleteCollection',
        data: {
          id: _id,
          type: type
        },
        complete: () => {
          Taro.showToast({
            title: '收藏取消',
            icon: 'none',
            duration: 1000
          })
          that.setState({isLoading: false, isCollected: false});
        }
      })
    } else {
      let title;
      if (type === 'litigation-explanation' || type === 'police' || type === 'police-admin-regulation' || type === 'public-order-admin-penalty-law' || type === 'supervision-law') {
        title = number
      } else if (type === 'civil-law-regulation') {
        title = `${number} ${tag}`
      } else if (type === 'litigation-law') {
        title = `${item} ${tag}`
      } else {
        title = item
      }
      Taro.cloud.callFunction({
        name: 'collect',
        data: {
          id: _id,
          type: type,
          title: title
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
          Taro.showToast({
            title: '收藏成功',
            icon: 'none',
            duration: 1000
          })
          that.setState({isLoading: false, isCollected: true});
        }
      })
    }
  }, 3000, { trailing: false })

  renderTermText = () => {
    const {term, keyword} = this.state;
    const {text} = term
    return (text.map((t, index) => {
      return <View className='regulation-line' key={`police-${index}`}>
        <RichText nodes={this.findAndHighlight(t, keyword)}></RichText>
      </View>
    }))
  }

  renderAdminText = () => {
    const {term, keyword} = this.state;
    const {text} = term
    return (text.split('\n').map((t, index) => {
      return <View className='regulation-line' key={`police-${index}`}>
        <RichText nodes={this.findAndHighlight(t, keyword)}></RichText>
      </View>
    }))
  }

  renderLitigation = () => {
    const {term, keyword} = this.state;
    const {part, chapter, section, content} = term;
    return (
      <View>
        <View className='header'>
          <View>{part}</View>
          <View>{chapter}</View>
          <View>{section}</View>
        </View>
        <View className='section'>
          {content.map((t, index) => {
            return <View className='regulation-line' key={`litigation-${index}`}>
            <RichText nodes={this.findAndHighlight(t, keyword)}></RichText>
            </View>
          })}
        </View>
      </View>
    )

  }

  handleZoom = () => {
    const {zoomIn} = this.state;
    this.setState({zoomIn: !zoomIn})
  }

  findAndHighlight = (str, key) => {
    let regExp =new RegExp(key,"g");
    if (key) {
      return '<div>' + key ? str.replace(regExp, `<span class='highlight-keyword'>${key}</span>`) : str + '</div>'
    } else {
      return '<div>' + str + '</div>'
    }
  }

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
    const {comment, term, type} = this.state
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
          topicId: term._id,
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

  render () {
    const {isSent, comment, term, type, isCollected, isReadMode, zoomIn, isLoading} = this.state;
    return (
      <View className={`term-detail-page ${isReadMode ? 'read-mode' : ''} ${zoomIn ? 'zoom-in' : ''}`}>
        {(type === 'civil-law-regulation' || type === 'litigation-law') && term.tag && <View className='tag-line'><Text className='pre-tag'>法条要旨:</Text><Text className='tag'>{term.tag}</Text></View>}
        <View className='main section'>
            <View>
              {(type === 'police' || type === 'civil-law-regulation') && this.renderTermText()}
              {(type === 'police-admin-regulation' || type === 'public-order-admin-penalty-law' || type === 'supervision-law') && this.renderAdminText()}
              {(type === 'litigation-law' || type === 'litigation-regulation' || type === 'litigation-explanation') && this.renderLitigation()}
            </View>
          </View>

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
        <DiscussionArea topicId={term._id}  isSent={isSent} handleCommentsLoaded={this.handleCommentsLoaded} />
        <View id='comments'></View>

        {isLoading && <View className='loading-container'>
          <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
        </View>}
      </View>
    )
  }
}
