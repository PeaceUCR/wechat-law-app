import Taro, { Component, getStorageSync } from '@tarojs/taro'
import { View, Text, RichText, Input, Button } from '@tarojs/components'
import {AtFab,AtIcon,AtBadge,AtButton,AtActivityIndicator, AtDivider} from "taro-ui";
import { db } from '../../util/db'
import {checkIfNewUser, redirectToIndexIfNewUser} from '../../util/login'
import './index.scss'
import throttle from "lodash/throttle";
import {DiscussionArea} from "../../components/discussionArea/index.weapp";
import TextSection from "../../components/textSection/index.weapp";
import {convertNumberToChinese, isNumber} from "../../util/convertNumber";
import {getText} from "../../util/util";

const typeCollectionMap = {
  'police': 'police-regulation',
}

const shared = [
  'police',
  'police-admin-regulation',
  'public-order-admin-penalty-law',
  'supervision-law',
  'admin-punish-law',
  'labor-law',
  'labor-contract-law',
  'road-safe-law',
  'road-safe-regulation',
  'anti-terrorism-law',
  'anti-drug-law',
  'admin-litigation-law',
  'admin-litigation-explaination',
  'admin-force-law',
  'admin-reconsider-law',
  'admin-reconsider-regulation',
  'admin-allow-law',
  'company-law'
]
const otherLaws = [
  'criminal-litigation-explanation',
  'civil-litigation-explanation',
  'road-safe-violation-handling',
  'police-admin-regulation',
  'road-safe-regulation',
  'road-safe-law',
  'public-order-admin-penalty-law',
  'admin-allow-law',
  'admin-reconsider-regulation',
  'admin-reconsider-law',
  'admin-punish-law',
  'admin-force-law',
  'admin-litigation-explaination',
  'admin-litigation-law',
  'company-law',
  'labor-contract-law',
  'labor-law',
  'anti-drug-law',
  'anti-terrorism-law',
  'supervision-law',
  'police-regulation',
]

const commonLawSet = new Set(
  [
    'civil-law-regulation',
    ...shared,
    ...otherLaws
  ]
)

const collectionCommonLawSet = new Set(
  [
  'litigation-explanation',
    ...shared,
    ...otherLaws
  ]
)

const otherLawSet = new Set([...otherLaws])

export default class RegulationDetail extends Component {

  state = {
    comment: '',
    isSent: false,
    term: {},
    type: '',
    isLoading: true,
    isCollected: false,
    isReadMode: true,
    zoomIn: false,
    litigationLawDefinition: null
  }

  config = {
    navigationBarTitleText: '详情'
  }

  onShareAppMessage() {
    const {term,type} = this.state
    return {
      path: `pages/regulationDetail/index?id=${term._id}&type=${type}`
    };
  }

  componentWillMount () {
    const { id, type} = this.$router.params;
    const that = this;

    if (otherLawSet.has(type)) {
      db.collection('other-law').where({_id: id}).get({
        success: (res) => {
          const term = res.data[0];
          that.setState({term, type, isLoading: false});
        },
        fail: () => {
          console.log('fail')
          that.setState({isLoading: false})
        }
      })
    } else if (type === 'litigation-law') {
      db.collection('litigation-law').where({_id: id}).get({
        success: (res) => {
          const term = res.data[0];
          that.setState({term, type});
          db.collection('litigation-law-definition').where({number: term.number}).get({
            success: (r) => {
              that.setState({litigationLawDefinition: r.data[0], isLoading: false});
            },
            fail: () => {
              console.log('fail')
              that.setState({isLoading: false})
            }
          });
        },
        fail: () => {
          console.log('fail')
          that.setState({isLoading: false})
        }
      })
    } else if (typeCollectionMap[type]) {
      db.collection(typeCollectionMap[type]).where({_id: id}).get({
        success: (res) => {
          const term = res.data[0];
          that.setState({term, type, isLoading: false});
        },
        fail: () => {
          console.log('fail')
          that.setState({isLoading: false})
        }
      })
    } else {
      db.collection(type).where({_id: id}).get({
        success: (res) => {
          const term = res.data[0];
          that.setState({term, type, isLoading: false});
        },
        fail: () => {
          console.log('fail')
          that.setState({isLoading: false})
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

  renderLitigationLawDefinition = () => {
    const {litigationLawDefinition, zoomIn} = this.state
    return <View className='sentencings'>
      <AtDivider height='40' lineColor='#fff' />
      <View className='line-title'>
        <AtIcon value='alert-circle' size={zoomIn ? 24 : 18} color='#c6823b'></AtIcon>
        <Text>人大刑事诉讼法释义</Text>
      </View>
      <View className='sentencing'>
      <View className='line'>
        <TextSection data={litigationLawDefinition.text} zoomIn={zoomIn} />
      </View>
      <AtDivider height='40' lineColor='#fff' />
    </View>
    </View>
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
    const {_id, item, number, chnNumber, tag} = term

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
      if (collectionCommonLawSet.has(type)) {
        title = number
      } else if (type === 'civil-law-regulation') {
        title = `${chnNumber} ${tag}`
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

  renderAdminText = () => {
    const {term} = this.state;
    let {text, number} = term
    number = isNumber(number) ? convertNumberToChinese(number) : number;
    return (getText(text).split('\n').filter(t => t.trim()).map((t, index) => {
      return <View className='regulation-line' key={`police-${index}`}>
        <RichText nodes={this.findAndHighlightForRegulation(t, number, index)}></RichText>
      </View>
    }))
  }

  renderLitigation = () => {
    const {term} = this.state;
    const {part, chapter, section, text, number} = term;
    return (
      <View>
        <View className='header'>
          <View>{part}</View>
          <View>{chapter}</View>
          <View>{section}</View>
        </View>
        <View className='section'>
          {text.split('\n').filter(t => t.trim()).map((t, index) => {
            return <View className='regulation-line' key={`litigation-${index}`}>
            <RichText nodes={this.findAndHighlightForRegulation(t, convertNumberToChinese(number), index)}></RichText>
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

  findAndHighlightForRegulation = (str, key, index) => {
    let regExp = new RegExp(key);
    if (key && index === 0) {
      return '<div>' + key ? str.replace(regExp, `<span class='highlight-number'>${key}</span>`) : str + '</div>'
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

  renderNoData = () => {
    return (<View>
      <View className='no-data'>出错啦!</View>
      <View className='no-data'>数据不存在或者已经迁移</View>
      <View className='no-data'>麻烦重新搜索进入</View>
    </View>)
  }

  render () {
    const {isSent, comment, term, type, isCollected, isReadMode, zoomIn, isLoading, litigationLawDefinition} = this.state;
    const {text} = term
    return (
      <View className={`term-detail-page ${isReadMode ? 'read-mode' : ''} ${zoomIn ? 'zoom-in' : ''}`}>
        {(type === 'civil-law-regulation' || type === 'litigation-law') && term.tag && <View className='tag-line'><Text className='pre-tag'>法条要旨:</Text><Text className='tag'>{term.tag}</Text></View>}
        <View className='main section'>
            <View>
              {commonLawSet.has(type) && this.renderAdminText()}
              {(type === 'litigation-law' || type === 'litigation-regulation' || type === 'litigation-explanation') && this.renderLitigation()}
            </View>
          </View>

        {litigationLawDefinition && <View>
          {this.renderLitigationLawDefinition()}
        </View>}
        {!isLoading && !text && this.renderNoData()}
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
