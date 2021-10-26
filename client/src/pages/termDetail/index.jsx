import Taro, { Component, getStorageSync } from '@tarojs/taro'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import {AtActivityIndicator, AtIcon, AtFab, AtButton, AtBadge, AtDivider, AtAccordion, AtFloatLayout} from "taro-ui";
import throttle from "lodash/throttle";
import DataPopup from '../../components/dataPopup/index.weapp'
import {DiscussionArea} from '../../components/discussionArea/index.weapp'
import { db } from '../../util/db'
import {checkIfNewUser, getUserAvatar, getUserNickname, getUserOpenId, redirectToIndexIfNewUser} from '../../util/login'
import {lawIdLabelMap, exampleIcon, sentencingIcon, explanationIcon, definitionIcon, consultIcon, judgementIcon, copy} from '../../util/util'
import './index.scss'
import TextSection from "../../components/textSection/index.weapp";
import TextSectionLinked from "../../components/textSectionLinked/index.weapp";
import moment from "moment";

const getTermNumber = (text) => {
  return text.substring(0, text.indexOf('条') + 1);
}

export default class TermDetail extends Component {

  state = {
    comment: '',
    isSent: false,
    term: {},
    examples: [],
    courtExamples: [],
    complements: [],
    complementExamples: [],
    isProcuratorateExampleLoading: true,
    isCourtExampleLoading: true,
    isComplementLoading: true,
    isCollectedLoading: true,
    isSentencingLoading: true,
    isTermExplanationLoading: true,
    showTermExplanation: false,
    showSentencing: false,
    showComplement: false,
    showExample: false,
    showConsult: false,
    showYiBenTong: false,
    enableYiBenTong: false,
    yiBenTongContent: [],
    isYiBenTongLoading: false,
    sentencings: [],
    termExplanations: [],
    consult: [],
    isConsultLoading: true,
    isCollected: false,
    isReadMode: false,
    zoomIn: false
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
    const { id, chnNumber } = this.$router.params;
    const that = this;
    let searchParams;
    if (chnNumber) {
      searchParams = {chnNumber}
    } else {
      searchParams = {_id: id}
    }
    db.collection('terms').where(searchParams).get({
      success: (res) => {
        const term = res.data[0];
        that.setState({term});

        db.collection('example')
          .orderBy('number', 'desc')
          .where({
          criminalLaw: db.RegExp({
            regexp: '.*' + getTermNumber(term.text),
            options: 'i',
          })}).get({
          success: (res) => {
            const courts = [];
            const procuratorates = [];
            const other = []
            res.data.forEach(item => {
              if (item.type === 'guide-examples-court') {
                courts.push(item)
              } else if (item.type === 'guide-examples-procuratorate') {
                procuratorates.push(item)
              } else {
                other.push(item)
              }
            })
            that.setState({examples: procuratorates, courtExamples: courts, isCourtExampleLoading: false, isProcuratorateExampleLoading: false});
          }
        });

        db.collection('complement').where({criminalLaw: db.RegExp({
            regexp: '.*' + getTermNumber(term.text),
            options: 'i',
          })}).get({
          success: (res) => {
            if (res.data.length > 0) {
              const complementExamples = res.data.filter(item => item.title.indexOf('案例') !== -1).map(e => {
                if (e.title.indexOf('检') !== -1) {
                  e.type = 'procuratorate'
                } else {
                  e.type = 'court'
                }
                return e;
              })
              if(complementExamples.length > 0) {
                const complements = res.data.filter(item => item.title.indexOf('案例') === -1)
                that.setState({complements, complementExamples, isComplementLoading: false});

              } else {
                that.setState({complements: res.data, isComplementLoading: false});
              }
            } else {
              that.setState({isComplementLoading: false})
            }

          }
        })

        db.collection('term-explanation').where({chnNumber: term.chnNumber}).get({
          success: (res) => {
            that.setState({termExplanations: res.data, isTermExplanationLoading: false});
          }
        });

        if (term.consult && term.consult.length > 0) {

          Taro.cloud.callFunction({
            name: 'getConsults',
            data: {
              type: 'criminal-detail',
              searchValue: term.consult
            },
            complete: r => {

              that.setState({consult: [...r.result.result.data], isConsultLoading: false});
            }
          })
        } else {

          that.setState( {
            isConsultLoading: false
          })
        }

        // db.collection('yi-ben-tong').where({number: term.number}).get({
        //   success: (res) => {
        //     // console.log(res.data)
        //     that.setState({yibentongData: res.data, isYibentongDataLoading: false});
        //   }
        // })

        Taro.cloud.callFunction({
          name: 'getSentencing',
          data: {
            criminalLawNumber: term.number
          },
          complete: r => {
            that.setState( {
              isSentencingLoading: false,
              sentencings: r.result.data
            })
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
    const enableYiBenTong = getStorageSync('enableYiBenTong');

    this.setState({isReadMode: setting && setting.isReadMode, enableYiBenTong})
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
        <Text className='tag procuratorate'>检</Text>
        <DataPopup data={example} type='procuratorate' num={num} zoomIn={zoomIn} />
      </View>))}
    </View>)
  }

  renderCourtExample = () => {
    const {courtExamples, term, zoomIn} = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {courtExamples.map(example => (<View className='example' key={`court-example-${example._id}`}>
        <Text className='tag'>法</Text>
        <DataPopup data={example} type='court' num={num} zoomIn={zoomIn} />
      </View>))}
    </View>)
  }

  renderExplanationAndComplement = () => {
    const {complements, term, zoomIn} = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');

    const all = [...complements.map(e => {
      e.type = 'complement'
      return e
    })]
    // console.log(all)
    all.sort((a, b) => {
      if (a.effectiveDate && b.effectiveDate) {
        return  b.effectiveDate - a.effectiveDate
      }

      if (a.effectiveDate) {
        return -1
      }

      return 1

    })
    return (<View>
      {
        all.map(e => (<View className='example' key={`explanation-${e._id}`}>
        <DataPopup data={e} type={`${e.type}`} num={num} zoomIn={zoomIn} />
      </View>))}
    </View>)
  }

  renderCourtComplementExamples = () => {
    const { complementExamples, term, zoomIn } = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {complementExamples.map(complement => (<View className='example' key={`complement-${complement._id}`}>
        {complement.type === 'court' ? <Text className='tag'>法</Text>: <Text className='tag procuratorate'>检</Text>}
        <DataPopup data={complement} type='complement-example' num={num} zoomIn={zoomIn} />
      </View>))}
    </View>)
  }

  renderConsult = () => {
    const {consult, term, zoomIn} = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {consult.map(example => (<View className='example' key={`court-example-${example._id}`}>
        <DataPopup data={example} type='consult' num={num} zoomIn={zoomIn} />
      </View>))}
    </View>)
  }

  // renderYiBenTong = () => {
  //   const {yibentongData, term, zoomIn} = this.state;
  //   const num = getTermNumber(term.text).replace('第', '').replace('条', '')
  //   return yibentongData.map((item, i) => {
  //     return (<View key={`yibentong-item-${i}`}>
  //       {item.contents.map((c, j) => {
  //         return (<YiBenTongSection
  //           key={`yibentong-item-${j}`}
  //           data={c.content}
  //           title={c.category}
  //           zoomIn={zoomIn}
  //           keyword={num}
  //         >
  //         </YiBenTongSection>)
  //       })}
  //     </View>)
  //   })
  // }

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
    const {term, zoomIn} = this.state;
    const {text, linkedCriminalTerms} = term
    return (<TextSectionLinked data={text} keywords={linkedCriminalTerms} zoomIn={zoomIn} />)
    // term.text = term.text ? term.text : ''
    // const lines = term.text.split('\n').filter(l => l.trim())
    // return (lines.map((line, index) => {
    //   return (<View className='term-line' key={`key-civil-${index}`}>{line}</View>)
    // }))
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

  renderSentencings = () => {
    const {sentencings, zoomIn} = this.state
    return <View className='sentencings'>
      {sentencings.map((sentencing, index) => {
        const {crimeName, text, sourceName, sourceId, effectiveDate} = sentencing
        return (<View className='sentencing' key={`sentencing-key-${index}`}>
          {/*<View className='title line example'>量刑指导意见:</View>*/}
          <View className='line crime-line'>
            <Text className='crime-line-item'>罪名:<Text className='crime'>{crimeName}</Text></Text>
            <Text className='date crime-line-item'>
            实施日期:{moment(effectiveDate).format('YYYY-MM-DD')}</Text>
          </View>
          <View className='line'>
            <TextSection data={text} zoomIn={zoomIn} />
          </View>
          <View className='line link'>
            <DataPopup data={{sourceName, sourceId, crimeName}} type='source'zoomIn={zoomIn} />
          </View>
          <AtDivider height='40' lineColor='#fff' />
        </View>)
      })}
    </View>
  }

  renderTermExplanation = () => {
    const {termExplanations, zoomIn} = this.state
    return <View className='sentencings'>
      {termExplanations.map((sentencing, index) => {
        const {text} = sentencing
        return (<View className='sentencing' key={`sentencing-key-${index}`}>
          <View className='line'>
            <TextSection data={text} zoomIn={zoomIn} />
          </View>
        </View>)
      })}
    </View>
  }

  openTermExplain = () => {
    const {showTermExplanation} = this.state
    this.setState({
      showTermExplanation: !showTermExplanation
    })
  }

  openSentencing = () => {
    const {showSentencing} = this.state
    this.setState({
      showSentencing: !showSentencing
    })
  }

  openComplement = () => {
    const {showComplement} = this.state
    this.setState({
      showComplement: !showComplement
    })
  }

  openConsult = () => {
    const {showConsult} = this.state
    this.setState({
      showConsult: !showConsult
    })
  }

  openExample = () => {
    const {showExample} = this.state
    this.setState({
      showExample: !showExample
    })
  }

  jumpToJudgement = () => {
    const {term} = this.state
    const redirectStr = `/pages/judgement/index?userOpenId=${getUserOpenId()}&userName=${getUserNickname()}&userAvatar=${encodeURIComponent(getUserAvatar())}&law=criminal&number=${term.number}`

    Taro.navigateTo({
      url: redirectStr
    });
  };

  renderJudgementLine = () => {
    return (<View className='judgement-line' onClick={this.jumpToJudgement}>
      <Image
        src={judgementIcon}
        className='title-icon'
        mode='widthFix'
      />
      <View className='text'>去裁判文书搜索更多😊</View>
    </View>)
  }

  copyToClipboard = () => {
    const {term} = this.state
    copy(term.text)
  }

  openYiBenTong = () => {
    const that = this
    const {term} = this.state
    that.setState({isYiBenTongLoading: true})
    db.collection('yi-ben-tong').where({number:  term.number}).get({
      success: (res) => {
        console.log(res)
        const {contents} = res.data[0]
        that.setState({yiBenTongContent: contents, showYiBenTong: true, isYiBenTongLoading: false})
      }
    })
  }

  renderYiBenTong = () => {
    const {yiBenTongContent, zoomIn} = this.state
    return (<View>
      {yiBenTongContent.map(item => {
        return <View key={item.category}>
          <TextSection data={item.category} zoomIn={zoomIn} isTitle />
          <TextSection data={item.content} zoomIn={zoomIn} />
        </View>
      })}
      {yiBenTongContent.length === 0 && <View>
        <TextSection data={"暂无数据"} zoomIn={zoomIn} isTitle />
      </View>}
    </View>)
  }
  render () {
    const {isSent, comment, term, examples, courtExamples, complementExamples,
      complements, termExplanations, consult,
      isProcuratorateExampleLoading, isCourtExampleLoading, isComplementLoading,
      isCollectedLoading, isCollected, isReadMode, zoomIn,
      isSentencingLoading, sentencings, isTermExplanationLoading, isConsultLoading,
      showTermExplanation, showSentencing, showComplement, showExample, showConsult,
      showYiBenTong, enableYiBenTong, isYiBenTongLoading} = this.state;
    return (
      <View className={`term-detail-page ${isReadMode ? 'read-mode' : ''} ${zoomIn ? 'zoom-in' : ''}`}>
          <View className='copy-icon-container' onClick={this.copyToClipboard}>
            <Image
              src='https://cdn-icons-png.flaticon.com/512/1828/1828249.png'
              className='copy-icon'
              mode='widthFix'
            />
          </View>
          <View className='main section'>
            <View>
              {this.renderSectionAndChapter()}
            </View>
            <View className='text-holder'>
              {this.renderTermText()}
              {enableYiBenTong && <Image
                src='https://mmbiz.qpic.cn/mmbiz_png/6fKEyhdZU91nE8WT2EPjiaWXdNEo7E0Thatent0Wibb9ETPxiaaBmsQRgFTGHSiaXtIrNhtODM1CXFYVur7hLiazTOg/0?wx_fmt=png'
                className='yi-ben-tong-icon'
                mode='widthFix'
                onClick={this.openYiBenTong}
              />}
            </View>
          </View>
          {termExplanations.length > 0 &&
          <View className='module-container'>
            <Image
              src={definitionIcon}
              className='title-icon'
              mode='widthFix'
            />
            <AtAccordion
              hasBorder={false}
              open={showTermExplanation}
              onClick={this.openTermExplain}
              title='刑法释义'
              icon={{ value: 'alert-circle', color: 'transparent', size: '18' }}
              isAnimation={false}
            >
              {this.renderTermExplanation()}
            </AtAccordion>
          </View>}


        {sentencings && sentencings.length > 0 && <View className='module-container'>
          <Image
            src={sentencingIcon}
            className='title-icon'
            mode='widthFix'
          />
          <AtAccordion
            hasBorder={false}
            open={showSentencing}
            onClick={this.openSentencing}
            title='量刑指导意见'
            icon={{ value: 'alert-circle', color: 'transparent', size: '18' }}
            isAnimation={false}
          >
            {this.renderSentencings()}
          </AtAccordion>
        </View>}

        {
          complements.length > 0 && <View className='module-container'>
            <Image
              src={explanationIcon}
              className='title-icon'
              mode='widthFix'
            />
            <AtAccordion
              hasBorder={false}
              open={showComplement}
              onClick={this.openComplement}
              title='相关法定解释、规定和指导意见'
              icon={{ value: 'alert-circle', color: 'transparent', size: '18' }}
              isAnimation={false}
            >
              {this.renderExplanationAndComplement()}
            </AtAccordion>
          </View>
        }


        {(examples.length > 0
        || courtExamples.length > 0
        || complementExamples.length >0) && <View className='module-container'>
          <Image
            src={exampleIcon}
            className='title-icon'
            mode='widthFix'
          />
          <AtAccordion
            hasBorder={false}
            open={showExample}
            onClick={this.openExample}
            title='指导案例'
            icon={{ value: 'alert-circle', color: 'transparent', size: '16' }}
            isAnimation={false}
          >
            {this.renderExample()}
            {this.renderCourtExample()}
            {this.renderCourtComplementExamples()}
          </AtAccordion>

        </View>}

        {
          consult.length > 0 && <View className='module-container'>
            <Image
              src={consultIcon}
              className='title-icon'
              mode='widthFix'
            />
            <AtAccordion
              hasBorder={false}
              open={showConsult}
              onClick={this.openConsult}
              title='刑事审判参考'
              icon={{ value: 'alert-circle', color: 'transparent', size: '18' }}
              isAnimation={false}
            >
              {this.renderConsult()}
            </AtAccordion>
          </View>
        }
        {(term.number >=114 && term.number <=419) && this.renderJudgementLine()}

        {(isProcuratorateExampleLoading || isCourtExampleLoading
          || isComplementLoading || isCollectedLoading || isSentencingLoading
          || isTermExplanationLoading || isConsultLoading || isYiBenTongLoading) && <View className='loading-container'>
          <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
        </View>}

        <AtFloatLayout isOpened={showYiBenTong} scrollY title='YiBenTong' onClose={() => {this.setState({showYiBenTong: false})}}>
          {this.renderYiBenTong()}
        </AtFloatLayout>
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
          <View className='discussion-container'>
            <DiscussionArea topicId={term._id} isSent={isSent} handleCommentsLoaded={this.handleCommentsLoaded} />
          </View>
          <View id='comments'></View>
      </View>
    )
  }
}
