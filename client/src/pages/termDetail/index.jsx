import Taro, { Component, getStorageSync } from '@tarojs/taro'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import {AtIcon, AtFab, AtButton, AtBadge, AtDivider, AtAccordion, AtFloatLayout} from "taro-ui";
import throttle from "lodash/throttle";
import DataPopup from '../../components/dataPopup/index.weapp'
import {DiscussionArea} from '../../components/discussionArea/index.weapp'
import { db } from '../../util/db'
import {checkIfNewUser, getUserAvatar, getUserNickname, getUserOpenId, redirectToIndexIfNewUser, getCollectionLimit} from '../../util/login'
import {lawIdLabelMap, exampleIcon, sentencingIcon, explanationIcon, definitionIcon, consultIcon, judgementIcon, pDocIcon, evidenceIcon, policeIcon, allFileCaseNumber, copy} from '../../util/util'
import './index.scss'
import TextSectionComponent from "../../components/textSectionComponent/index";
import TextSectionLinked from "../../components/textSectionLinked/index.weapp";
import {otherLawExplanationSource} from "../../util/otherLaw";
import Loading2 from "../../components/loading2/index.weapp";
import {addScore, deleteCollection, isCollected, saveCollection} from "../../util/userCollection";

const getTermNumber = (text) => {
  return text.substring(0, text.indexOf('条') + 1);
}

const criminalLawNumberHasSentence = new Set(
  [133, 176, 192, 196, 224, 234, 236, 238, 263, 264, 266, 267, 271, 274, 277, 292, 293, 312, 347, 348, 354, 359]
)

const criminalLawNumberHasExplanationLink = new Set(
  [17,37,120,133,134,135,139,142,162,169,175,177,185,205,210,219,224,234,236,244,253,260,262,276,280,284,286,287,291,293,299,307,308,334,336,342,344,355,388,390,399,408],
)

export default class TermDetail extends Component {

  state = {
    comment: '',
    isSent: false,
    term: {},
    examples: [],
    courtExamples: [],
    complements: [],
    complementExamples: [],
    evidence: [],
    isProcuratorateExampleLoading: true,
    isCourtExampleLoading: true,
    isComplementLoading: true,
    isCollectedLoading: true,
    isTermExplanationLoading: true,
    showTermExplanation: false,
    showComplement: false,
    showExample: false,
    showConsult: false,
    showEvidence: false,
    showYiBenTong: false,
    enableYiBenTong: false,
    yiBenTongContent: [],
    isYiBenTongLoading: false,
    termExplanations: [],
    consult: [],
    isConsultLoading: true,
    isCollected: false,
    isReadMode: false,
    zoomIn: false,
    isLoading: false
  }

  config = {
    navigationBarTitleText: '刑法条文详情'
  }

  onShareAppMessage() {
    const {term} = this.state
    // TODO correct later
    addScore();
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

        const {number} = term

        db.collection('criminal-evidence')
          .where({
            number
          }).get({
          success: (res) => {
            console.log(res.data)
            this.setState({evidence: res.data})
          }
        });

        db.collection('example')
          .orderBy('number', 'desc')
          .where({
          criminalLaw: db.RegExp({
            regexp: '.*' + term.chnNumber,
            options: 'i',
          })}).get({
          success: (res) => {
            const courts = [];
            const procuratorates = [];
            res.data.forEach(item => {
              if (item.type === 'guide-examples-court') {
                courts.push(item)
              } else {
                procuratorates.push(item)
              }
            })
            that.setState({examples: procuratorates, courtExamples: courts, isCourtExampleLoading: false, isProcuratorateExampleLoading: false});
          }
        });

        db.collection('complement').where({criminalLaw: db.RegExp({
            regexp: '.*' + getTermNumber(term.text),
            options: 'i',
          })}).orderBy('effectiveDate','desc').get({
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

        db.collection('term-explanation-faxin-2020').where({number: term.number}).get({
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
      }
    })

    isCollected(id, 'criminalLawTermDetail').then((flag) => {
      if (flag) {
        that.setState({isCollected: true})
      }
      that.setState({isCollectedLoading: false});
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
      deleteCollection(_id).then(() => {
        Taro.showToast({
          title: '收藏取消',
          icon: 'none',
          duration: 1000
        })
        that.setState({isLoading: false, isCollected: false});
      })
    } else {
      saveCollection(_id, 'criminalLawTermDetail', lawIdLabelMap[_id]).then(() => {
        Taro.showToast({
          title: '收藏成功',
          icon: 'none',
          duration: 1000
        })
        that.setState({isLoading: false, isCollected: true});
      }).catch(() => {
        Taro.showToast({
          title: `收藏失败:${r.result.errMsg}`,
          icon: 'none',
          duration: 3000
        })
        that.setState({isLoading: false})
      });
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

  renderEvidence = () => {
    const {evidence, zoomIn} = this.state
    return <View className='sentencings'>
      {evidence.map((sentencing, index) => {
        const {text, crime} = sentencing
        return (<View className='sentencing' key={`sentencing-key-${index}`}>
          {/*<View className='title line example'>量刑指导意见:</View>*/}
          <View className='line crime-line'>
            <Text className='crime-line-item'>罪名:<Text className='crime'>{crime}</Text></Text>
          </View>
          <View className='line'>
            <TextSectionComponent data={text} zoomIn={zoomIn} />
          </View>
          <AtDivider height='40' lineColor='#fff' />
        </View>)
      })}
    </View>
  }

  loadMoreTermExplanation = () => {
    const that = this;
    const {term} = this.state
    that.setState({isTermExplanationLoading: true})
    db.collection('term-explanation-faxin-2020-zhi-yi').where({number: term.number + ""}).get({
      success: (res) => {
        that.setState({termExplanations: [...that.state.termExplanations, ...res.data], isTermExplanationLoading: false, showTermExplanationLoadMore: false});
      }
    });
  }
  renderTermExplanation = () => {
    const {termExplanations, zoomIn, term} = this.state
    return <View className='sentencings'>
      <View className='source'>来源：《中华人民共和国刑法》释解与适用2021</View>
      {termExplanations.map((sentencing, index) => {
        const {text} = sentencing
        return (<View className='sentencing' key={`sentencing-key-${index}`}>
          <View className='line'>
            <TextSectionComponent data={text} zoomIn={zoomIn} />
          </View>
        </View>)
      })}
      {criminalLawNumberHasExplanationLink.has(term.number) && <View className='load-more-explanation' onClick={this.jumpToTermExplanation}>更多释义</View>}
    </View>
  }

  openTermExplain = () => {
    const {showTermExplanation} = this.state
    this.setState({
      showTermExplanation: !showTermExplanation
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

  openEvidence = () => {
    const {showEvidence} = this.state
    this.setState({
      showEvidence: !showEvidence
    })
  }

  jumpToJudgement = () => {
    const {term} = this.state
    const redirectStr = `/pages/judgement/index?userOpenId=${getUserOpenId()}&userName=${getUserNickname()}&userAvatar=${encodeURIComponent(getUserAvatar())}&law=criminal&number=${term.number}`
    Taro.navigateTo({
      url: redirectStr
    });
  };

  jumpToProcuratorateDoc = () => {
    const {term} = this.state
    const redirectStr = `/pages/procuratorateDoc/index?searchValue=${term.chnNumber}`
    Taro.navigateTo({
      url: redirectStr
    });
  };

  jumpToSentencing = () => {
    const {term} = this.state
    const redirectStr = `/pages/sentencingDetail/index?id=${term._id}&criminalLawNumber=${term.number}`
    Taro.navigateTo({
      url: redirectStr
    });
  };

  jumpToCaiPanGuiZe = () => {
    const {term} = this.state
    const redirectStr = `/pages/caiPanGuiZe/index?criminalLawNumber=${term.number}&criminalLaw=${term.crime}`
    Taro.navigateTo({
      url: redirectStr
    });
  };

  jumpToFileCase = () => {
    const {term} = this.state
    const redirectStr = `/pages/fileCaseDetail/index?id=${term._id}&criminalLawNumber=${term.chnNumber}`
    Taro.navigateTo({
      url: redirectStr
    });
  };

  jumpToTermExplanation = () => {
    const {term} = this.state
    const redirectStr = `/pages/termDetailExplanation/index?id=${term._id}&number=${term.number}`
    Taro.navigateTo({
      url: redirectStr
    });
  };

  renderFileCase = () => {
    return (<View className='judgement-line left' onClick={this.jumpToFileCase}>
      <Image
        src={policeIcon}
        className='title-icon'
        mode='widthFix'
      />
      <View className='text'>立案追诉标准</View>
    </View>)
  }

  renderSentencingLine = () => {
    return (<View className='judgement-line' onClick={this.jumpToSentencing}>
      <Image
        src={sentencingIcon}
        className='title-icon'
        mode='widthFix'
      />
      <View className='text'>去量刑指导意见</View>
    </View>)
  }

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

  renderProcuratorateDoc = () => {
    return (<View className='judgement-line' onClick={this.jumpToProcuratorateDoc}>
      <Image
        src={pDocIcon}
        className='title-icon'
        mode='widthFix'
      />
      <View className='text'>去检察文书搜索更多😉</View>
    </View>)
  }

  renderCaiPanGuiZe = () => {
    return (<View className='judgement-line' onClick={this.jumpToCaiPanGuiZe}>
      <View className='text'>去搜索更多裁判要旨案例</View>
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
          <TextSectionComponent data={item.category} zoomIn={zoomIn} isTitle />
          <TextSectionComponent data={item.content} zoomIn={zoomIn} />
        </View>
      })}
      {yiBenTongContent.length === 0 && <View>
        <TextSectionComponent data={"暂无数据"} zoomIn={zoomIn} isTitle />
      </View>}
    </View>)
  }

  render () {
    const {isSent, comment, term, examples, courtExamples, complementExamples,
      complements, termExplanations, consult,
      isProcuratorateExampleLoading, isCourtExampleLoading, isComplementLoading,
      isCollectedLoading, isCollected, isReadMode, zoomIn,
      isTermExplanationLoading, isConsultLoading,
      showTermExplanation, showComplement, showExample, showConsult,
      showYiBenTong, enableYiBenTong, isYiBenTongLoading, evidence, showEvidence, isLoading} = this.state;
    return (
      <View className={`term-detail-page page ${isReadMode ? 'read-mode' : ''} ${zoomIn ? 'zoom-in' : ''}`}>
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
            {(allFileCaseNumber.has(term.chnNumber)) && this.renderFileCase()}
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

        {evidence && evidence.length > 0 && <View className='module-container'>
          <Image
            src={evidenceIcon}
            className='title-icon'
            mode='widthFix'
          />
          <AtAccordion
            hasBorder={false}
            open={showEvidence}
            onClick={this.openEvidence}
            title='证据指引'
            icon={{ value: 'alert-circle', color: 'transparent', size: '18' }}
            isAnimation={false}
          >
            {this.renderEvidence()}
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

        <View className='module-container'>
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
            {(examples.length > 0
              || courtExamples.length > 0
              || complementExamples.length >0) &&
            <View>{this.renderExample()}
              {this.renderCourtExample()}
              {this.renderCourtComplementExamples()}
            </View>}
            {this.renderCaiPanGuiZe()}
          </AtAccordion>

        </View>

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
        {criminalLawNumberHasSentence.has(term.number) && this.renderSentencingLine()}
        {/*{(term.number >=114 && term.number <=419) && this.renderProcuratorateDoc()}*/}
        {(term.number >=114 && term.number <=419) && this.renderJudgementLine()}

        {(isProcuratorateExampleLoading || isCourtExampleLoading
          || isComplementLoading || isCollectedLoading
          || isTermExplanationLoading || isConsultLoading || isYiBenTongLoading || isLoading) && <Loading2 />}

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
