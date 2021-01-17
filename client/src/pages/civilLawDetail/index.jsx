import Taro, { Component, getStorageSync } from '@tarojs/taro'
import { View, Text, RichText, Input } from '@tarojs/components'
import { AtDivider, AtActivityIndicator, AtTabs, AtTabsPane, AtListItem, AtIcon, AtButton } from "taro-ui";
import throttle from 'lodash/throttle';
import DataPopup from '../../components/dataPopup/index.weapp'
import { db } from '../../util/db'
import {getNumber} from '../../util/convertNumber'
import './index.scss'
import {lawIdLabelMap} from "../../util/util";
import {checkIfNewUser, redirectToIndexIfNewUser} from "../../util/login";
import {DiscussionArea} from "../../components/discussionArea/index.weapp";

const getTermNumber = (text) => {
  return text.substring(0, text.indexOf('条') + 1);
}
export default class CivilLawDetail extends Component {

  state = {
    comment: '',
    isSent: false,
    term: {},
    examples: [],
    isCollected: false,
    isReadMode: false,
    isLinkLoading: true,
    isExampleLinkLoading: true,
    isLoading: false,
    links: [],
    exampleLinks: []
  }

  config = {
    navigationBarTitleText: '民法典条文详情'
  }

  onShareAppMessage() {
    const {term} = this.state
    return {
      path: `pages/civilLawDetail/index?id=${term._id}`
    };
  }

  componentWillMount () {
    const { id } = this.$router.params;
    const that = this;
    db.collection('civil-law').where({_id: id}).get({
      success: (res) => {
        const term = res.data[0];
        that.setState({term});
        db.collection('civil-law-links').where({number: getNumber(term.number)}).get({
          success: (r) => {
            if (r.data && r.data.length > 0) {
              console.log(JSON.parse(r.data[0].data))
              that.setState({links: JSON.parse(r.data[0].data) || [], isLinkLoading: false});
            }
            that.setState({isLinkLoading: false});
          }
        });

        db.collection('civil-law-link-examples').where({number: getNumber(term.number)}).get({
          success: (r) => {
            console.log(r)
            if (r.data && r.data.length > 0) {
              that.setState({exampleLinks: r.data[0].examples || [], isExampleLinkLoading: false});
            }
            that.setState({isExampleLinkLoading: false});
          }
        });
      }
    })

    that.setState({isLoading: true})
    Taro.cloud.callFunction({
      name: 'isCollected',
      data: {
        id: id,
        type: 'civilLawTermDetail'
      },
      complete: (r) => {

        if (r && r.result && r.result.data && r.result.data.length > 0) {
          that.setState({isCollected: true})
        }
        that.setState({isLoading: false})
      },
      fail: (e) => {
        that.setState({isLoading: false})
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

  renderExample = () => {
    const {examples, term} = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {examples.map(example => (<View className='example' key={`example-${example._id}`}>
        <DataPopup data={example} type='procuratorate' num={num} />
      </View>))}
    </View>)
  }

  renderComplement = () => {
    const { complements, term } = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {complements.map(complement => (<View className='example' key={`complement-${complement._id}`}>
        <DataPopup data={complement} type='complement' num={num} />
      </View>))}
    </View>)
  }

  handleCollect = throttle(() => {
    if (checkIfNewUser()) {
      redirectToIndexIfNewUser()
      return ;
    }

    const that = this;
    const { isCollected, term } = this.state;
    const {_id} = term

    that.setState({isLoading: true})

    if (isCollected) {
      Taro.cloud.callFunction({
        name: 'deleteCollection',
        data: {
          id: _id,
          type: 'civilLawTermDetail'
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
      Taro.cloud.callFunction({
        name: 'collect',
        data: {
          id: _id,
          type: 'civilLawTermDetail',
          title: lawIdLabelMap[_id]
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
    const {term} = this.state;
    term.text = term.text ? term.text : ''
    const lines = term.text.split('\n').filter(l => l.trim())
    return (lines.map((line, index) => {
      return (<View className='civil-term-line' key={`key-civil-${index}`}>{line}</View>)
    }))
  }

  handleClick = (value) => {
    this.setState({
      current: value
    })
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
    const {comment, term} = this.state
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
          page: 'civilLaw',
          type: 'civilLaw',
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
    const {isSent, comment, current, term, isLinkLoading, isExampleLinkLoading, isLoading, links, exampleLinks, isCollected, isReadMode} = this.state;
    return (
      <View className={`civil-term-detail-page ${isReadMode ? 'read-mode' : ''}`}>
          <View className='main section'>
            <View className='tag-line'><Text className='pre-tag'>法条要旨:</Text><Text className='tag'>{term.tag}</Text></View>
            {this.renderTermText()}
          </View>
          {!isLinkLoading && links.length === 0 && <View className='center'>暂无</View>}
          <AtTabs
            current={current}
            scroll
            tabList={[
              { title: '关联法条' },
              { title: '关联案例' }
            ]}
            onClick={this.handleClick}
          >
            <AtTabsPane current={current} index={0}>
              <View className='pane'>
                {links.map((link, index) => {
                  return (<View className={`link ${link.title.indexOf('时效性：失效') === -1 ? '' : 'out-dated'}`} key={`civil-key-${index}`}>
                    <View className='title'><RichText nodes={link.title}></RichText></View>
                    <RichText nodes={link.content}></RichText>
                    <AtDivider lineColor='#777' height='60' />
                  </View>)
                })}
                {links.length === 0 && !isLinkLoading && (<View>暂无</View>)}
              </View>
            </AtTabsPane>
            <AtTabsPane current={current} index={1}>
              <View className='pane'>
                {exampleLinks.map((link, index) => {
                  return (<View key={`civil-example-key-${index}`} onClick={() => {
                    Taro.navigateTo({
                      url: `/pages/exampleDetail/index?type=civilLawExample&id=${link.detailId}`,
                    })
                  }
                  }
                  >
                    <AtListItem title={link.subhead} note={link.title} arrow='right' />
                  </View>)
                })}
                {exampleLinks.length === 0 && !isExampleLinkLoading && (<View>暂无</View>)}
              </View>
            </AtTabsPane>
          </AtTabs>

          {
            (isLinkLoading || isExampleLinkLoading || isLoading) && <AtActivityIndicator mode='center' color='black' content='数据加载中...' size={62}></AtActivityIndicator>
          }
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
        </View>
        <DiscussionArea topicId={term._id}  isSent={isSent} handleCommentsLoaded={this.handleCommentsLoaded} />
        <View id='comments'></View>
      </View>
    )
  }
}
