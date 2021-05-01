import Taro, { Component, getStorageSync } from '@tarojs/taro'
import { View, Text, Input, Button } from '@tarojs/components'
import {AtActivityIndicator, AtIcon, AtFab, AtButton, AtBadge, AtDivider, AtTabs, AtTabsPane} from "taro-ui";
import throttle from "lodash/throttle";
import DataPopup from '../../components/dataPopup/index.weapp'
import {DiscussionArea} from '../../components/discussionArea/index.weapp'
import { db } from '../../util/db'
import {checkIfNewUser, redirectToIndexIfNewUser} from '../../util/login'
import {lawIdLabelMap} from '../../util/util'
import './index.scss'
import YiBenTongSection from "../../components/yibentongSection/index.weapp";

const getTermNumber = (text) => {
  return text.substring(0, text.indexOf('条') + 1);
}

const tabs = [{title:'关联数据'}, {title: '其他'}]
export default class TermDetail extends Component {

  state = {
    comment: '',
    isSent: false,
    term: {},
    examples: [],
    courtExamples: [],
    explanations: [],
    complements: [],
    yibentongData:[],
    courtComplementExamples: [],
    isProcuratorateExampleLoading: true,
    isCourtExampleLoading: true,
    isExplanationLoading: true,
    isComplementLoading: true,
    isCollectedLoading: true,
    isYibentongDataLoading: true,
    isCollected: false,
    isReadMode: false,
    zoomIn: false,
    currentTab: 0
  }

  config = {
    navigationBarTitleText: '刑法条文详情'
  }

  onShareAppMessage() {
    const {term} = this.state
    return {
      path: `pages/termDetail/index?id=${term._id}`
    };
  }

  componentWillMount () {
    const { id } = this.$router.params;
    const that = this;
    db.collection('terms').where({_id: id}).get({
      success: (res) => {
        console.log('res', res)
        const term = res.data[0];
        that.setState({term});
        db.collection('procuratorate-examples')
          .orderBy('number', 'asc')
          .where({terms: db.RegExp({
            regexp: '.*' + getTermNumber(term.text),
            options: 'i',
          })}).get({
          success: (res) => {
            that.setState({examples: res.data, isProcuratorateExampleLoading: false});
          }
        });

        db.collection('court-examples').where({criminalLaw: db.RegExp({
            regexp: '.*' + getTermNumber(term.text),
            options: 'i',
          })}).get({
          success: (res) => {
            that.setState({courtExamples: res.data, isCourtExampleLoading: false});
          }
        });

        db.collection('explanation').where({criminalLaw: db.RegExp({
            regexp: '.*' + getTermNumber(term.text),
            options: 'i',
          })}).get({
          success: (res) => {
            that.setState({explanations: res.data, isExplanationLoading: false});
          }
        });

        db.collection('complement').where({criminalLaw: db.RegExp({
            regexp: '.*' + getTermNumber(term.text),
            options: 'i',
          })}).get({
          success: (res) => {

            if (res.data.length > 0) {
              const courtComplementExamples = res.data.filter(item => item.title.indexOf('案例') !== -1)
              if(courtComplementExamples.length > 0) {
                const complements = res.data.filter(item => item.title.indexOf('案例') === -1)
                that.setState({complements, courtComplementExamples, isComplementLoading: false});

              } else {
                that.setState({complements: res.data, isComplementLoading: false});
              }
            } else {
              that.setState({isComplementLoading: false})
            }

          }
        })

        db.collection('yi-ben-tong').where({number: term.number}).get({
          success: (res) => {
            // console.log(res.data)
            that.setState({yibentongData: res.data, isYibentongDataLoading: false});
          }
        })
      }
    })

    Taro.cloud.callFunction({
      name: 'isCollected',
      data: {
        id: id,
        type: 'criminalLawTermDetail'
      },
      complete: (r) => {
        console.log(r)
        if (r && r.result && r.result.data && r.result.data.length > 0) {
          that.setState({isCollected: true})
        }
        that.setState({isCollectedLoading: false});
      },
      fail: (e) => {
        that.setState({isCollectedLoading: false});
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

  renderSectionAndChapter = () => {
    const {term} = this.state;
    const {part, chapter, section} = term;
    return (
      <View className='header'>
        <View>{part}</View>
        <View>{chapter}</View>
        <View>{section}</View>
      </View>
    )
  }

  renderExample = () => {
    const {examples, term, zoomIn} = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {examples.map(example => (<View className='example' key={`example-${example._id}`}>
        <DataPopup data={example} type='procuratorate' num={num} zoomIn={zoomIn} />
      </View>))}
    </View>)
  }

  renderCourtExample = () => {
    const {courtExamples, term, zoomIn} = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {courtExamples.map(example => (<View className='example' key={`court-example-${example._id}`}>
        <DataPopup data={example} type='court' num={num} zoomIn={zoomIn} />
      </View>))}
    </View>)
  }

  renderExplanation = () => {
    const {explanations, term, zoomIn} = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {explanations.map(explanation => (<View className='example' key={`explanation-${explanation._id}`}>
        <DataPopup data={explanation} type='explanation' num={num} zoomIn={zoomIn} />
      </View>))}
    </View>)
  }

  renderComplement = () => {
    const { complements, term, zoomIn } = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {complements.map(complement => (<View className='example' key={`complement-${complement._id}`}>
        <DataPopup data={complement} type='complement' num={num} zoomIn={zoomIn} />
      </View>))}
    </View>)
  }

  renderCourtComplementExamples = () => {
    const { courtComplementExamples, term, zoomIn } = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {courtComplementExamples.map(complement => (<View className='example' key={`complement-${complement._id}`}>
        <DataPopup data={complement} type='complement' num={num} zoomIn={zoomIn} />
      </View>))}
    </View>)
  }

  renderYiBenTong = () => {
    const {yibentongData, term, zoomIn} = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '')
    return yibentongData.map((item, i) => {
      return (<View key={`yibentong-item-${i}`}>
        {item.contents.map((c, j) => {
          return (<YiBenTongSection
            key={`yibentong-item-${j}`}
            data={c.content}
            title={c.category}
            zoomIn={zoomIn}
            keyword={num}
          >
          </YiBenTongSection>)
        })}
      </View>)
    })
  }

  handleCollect = throttle(() => {
    console.log('collect')
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
          type: 'criminalLawTermDetail'
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
          type: 'criminalLawTermDetail',
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
      return (<View className='term-line' key={`key-civil-${index}`}>{line}</View>)
    }))
  }

  handleZoom = () => {
    const {zoomIn} = this.state;
    this.setState({zoomIn: !zoomIn})
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
          page: 'criminalLaw',
          type: 'criminalLaw',
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

  handleChangeTab = (value) => {
    this.setState({
      currentTab: value
    })
  }
  render () {
    const {isSent, comment, term, examples, explanations, courtExamples, complements, courtComplementExamples,
      isProcuratorateExampleLoading, isCourtExampleLoading, isExplanationLoading, isComplementLoading,
      isYibentongDataLoading, isCollectedLoading, isCollected, isReadMode, zoomIn, currentTab} = this.state;
    return (
      <View className={`term-detail-page ${isReadMode ? 'read-mode' : ''} ${zoomIn ? 'zoom-in' : ''}`}>
          <View className='main section'>
            <View>
              {this.renderSectionAndChapter()}
            </View>
            <View>
              {this.renderTermText()}
            </View>
          </View>
          {/*<AtDivider lineColor='#d6e4ef' height='50' />*/}
          {/*<AtTabs*/}
          {/*  tabList={tabs}*/}
          {/*  current={currentTab}*/}
          {/*  onClick={this.handleChangeTab}*/}
          {/*>*/}
          {/*  <AtTabsPane current={currentTab} index={0} ></AtTabsPane>*/}
          {/*  <AtTabsPane current={currentTab} index={1} ></AtTabsPane>*/}
          {/*</AtTabs>*/}
          {/*<View className='section'>*/}
          {/*  {this.renderYiBenTong()}*/}
          {/*</View>*/}
          <View className='examples section'>
            <Text className='section-title'>相关法定解释、规定和指导意见：{complements.length ===0 && explanations.length ===0 ? '暂无' : ''}</Text>
            <View>
              {explanations.length > 0 && this.renderExplanation()}
              {complements.length > 0 && this.renderComplement()}
            </View>
          </View>
          <View className='examples section'>
            <Text className='section-title'>相关检察院案例：{examples.length ===0 ? '暂无' : ''}</Text>
            <View>
              {examples.length > 0 && this.renderExample()}
            </View>
          </View>

          <View className='examples section'>
            <Text className='section-title'>相关法院案例：{courtExamples.length ===0 && courtComplementExamples.length ===0 ? '暂无' : ''}</Text>
            <View>
              {courtExamples.length > 0 && this.renderCourtExample()}
              {courtComplementExamples.length > 0 && this.renderCourtComplementExamples()}
            </View>
          </View>

        {(isProcuratorateExampleLoading || isCourtExampleLoading || isExplanationLoading
          || isComplementLoading || isYibentongDataLoading || isCollectedLoading) && <View className='loading-container'>
          <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
        </View>}

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
          <DiscussionArea topicId={term._id} isSent={isSent} handleCommentsLoaded={this.handleCommentsLoaded} />
          <View id='comments'></View>
      </View>
    )
  }
}
