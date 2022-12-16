import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View,Input, Button, RichText, Text} from '@tarojs/components'
import {AtFab, AtIcon, AtActivityIndicator, AtNoticebar, AtButton, AtBadge} from "taro-ui";
import { db } from '../../util/db'
import TextSection from '../../components/textSection/index.weapp'
import TextSectionComponent from '../../components/textSectionComponent/index'
import './index.scss'
import {checkIfNewUser, getCollectionLimit, redirectToIndexIfNewUser} from "../../util/login";
import throttle from "lodash/throttle";
import {DiscussionArea} from "../../components/discussionArea/index.weapp";
import {FloatSearch} from "../../components/floatSearch/index.weapp";
import {copy, findAndHighlight, getConfiguration, highlights, isStartWith, refine} from "../../util/util";
import {noTitleExampleTypes, getFirstLine} from "../../util/name";

const typeCollectionMap = {
  'court': 'example',
  'procuratorate': 'example',
  'court-open':'example',
  'consultant': 'consult',
  'civilLawExample': 'civil-law-link-example-detail',
  'civil-law-explaination': 'civil-law-explaination',
  'source': 'sentencingDetail-source',
  'complement-example': 'complement'
}

const demoSet = new Set(Object.keys(typeCollectionMap))

export default class ExampleDetail extends Component {

  foundKey = undefined
  state = {
    comment: '',
    isSent: false,
    id: '',
    type: '',
    example: {},
    keyword: '',
    zoomIn: false,
    isCollected: false,
    isReadMode: false,
    isLoading: true,
    enableAutoScroll: false,
    enableExampleDetailAd: false,
    selectedLine: -1,
    categories: undefined,
    openCategory: false
  }

  config = {
    navigationBarTitleText: '详情'
  }

  componentWillMount () {
    const that = this;
    const { id, type, keyword } = this.$router.params;

    getConfiguration().then((res) => {
      that.setState({
        enableExampleDetailAd: res.data[0].enableExampleDetailAd,
      })

      if (res.data[0].enableAutoScroll) {
        setStorageSync('enableAutoScroll', true);
      } else {
        setStorageSync('enableAutoScroll', false);
      }

      if(res.data[0].forceLogin) {
        if(checkIfNewUser()) {
          Taro.cloud.callFunction({
            name: 'getUserInfo',
            complete: r => {
              if (r &&  r.result && r.result.data && r.result.data.length > 0 ) {
                setStorageSync('user', r.result.data[0]);
                that.setState({isUserLoaded: true})

                if (getStorageSync('poster-shown') !== res.data[0].posterUrl) {
                  that.setState({showPoster: true})
                }

              } else {
                that.setState({isNewUser: true});
              }
            }
          })
        } else {
          if (getStorageSync('poster-shown') !== res.data[0].posterUrl) {
            that.setState({showPoster: true})
          } else {
            // that.setState({enablePosterAd: res.data[0].enablePosterAd})
          }
        }
      } else {
        that.setState({showFooter: false})
        // Taro.showModal({
        //   title: '关于我们',
        //   content: '这是一个法律学习，法律信息查询的工具小程序, 祝大家司法考试顺利！',
        //   showCancel: false
        // })
      }
    });

    // db.collection('configuration').where({}).get({
    //   success: (res) => {
    //     that.setState({
    //       enableExampleDetailAd: res.data[0].enableExampleDetailAd,
    //     })
    //
    //     if (res.data[0].enableAutoScroll) {
    //       setStorageSync('enableAutoScroll', true);
    //     } else {
    //       setStorageSync('enableAutoScroll', false);
    //     }
    //
    //     if(res.data[0].forceLogin) {
    //       if(checkIfNewUser()) {
    //         Taro.cloud.callFunction({
    //           name: 'getUserInfo',
    //           complete: r => {
    //             if (r &&  r.result && r.result.data && r.result.data.length > 0 ) {
    //               setStorageSync('user', r.result.data[0]);
    //               that.setState({isUserLoaded: true})
    //
    //               if (getStorageSync('poster-shown') !== res.data[0].posterUrl) {
    //                 that.setState({showPoster: true})
    //               }
    //
    //             } else {
    //               that.setState({isNewUser: true});
    //             }
    //           }
    //         })
    //       } else {
    //         if (getStorageSync('poster-shown') !== res.data[0].posterUrl) {
    //           that.setState({showPoster: true})
    //         } else {
    //           // that.setState({enablePosterAd: res.data[0].enablePosterAd})
    //         }
    //       }
    //     } else {
    //       that.setState({showFooter: false})
    //       // Taro.showModal({
    //       //   title: '关于我们',
    //       //   content: '这是一个法律学习，法律信息查询的工具小程序, 祝大家司法考试顺利！',
    //       //   showCancel: false
    //       // })
    //     }
    //   }
    // });

    if (typeCollectionMap[type]) {
      db.collection(typeCollectionMap[type]).where({_id: id}).get({
        success: (res) => {
          if (res.data[0]) {
            that.setState({example: res.data[0], isLoading: false, type, id, keyword});
          } else {
            that.setState({isLoading: false, type})
          }
        },
        fail: () => {
          console.log('fail')
          that.setState({isLoading: false, type})
        }
      });
    } else {
      db.collection(type).where({_id: id}).get({
        success: (res) => {
          if (res.data[0]) {
            const {special} = res.data[0]
            if (special) {
              const {title, subTitle} = res.data[0]
              that.setState({example: res.data[0], isLoading: false, type, id, keyword, categories:[title, subTitle]});
            } else {
              that.setState({example: res.data[0], isLoading: false, type, id, keyword});
            }
          } else {
            that.setState({isLoading: false, type})
          }
        },
        fail: () => {
          console.log('fail')
          that.setState({isLoading: false, type})
        }
      });
    }

    // let collection = getStorageSync('collection');
    // collection = collection ? collection : {};
    // that.setState({
    //   isCollected: collection[id] === true
    // })
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

    // const isEnableScroll = getStorageSync('enableAutoScroll');
    // if (isEnableScroll && keyword) {
    //   that.setState({
    //     enableAutoScroll: true
    //   })
    // }
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
    console.log('example')
    const {example, keyword, zoomIn} = this.state;
    const {text, title} = example;
    if (title) {
      Taro.setNavigationBarTitle({title: title})
    }
    return (<View>
      <View className='term-complement-title'>{title}</View>
      <TextSectionComponent data={text} keyword={keyword} zoomIn={zoomIn} />
    </View>)
  }

  renderSpecial = () => {
    console.log('special')
    const {example, keyword, zoomIn} = this.state;
    const {text, title, subTitle, subContent} = example;
    return (<View>
      <View id='category-0'></View>
      <TextSection data={title} keyword={keyword} zoomIn={zoomIn} isTitle={true} />
      <TextSection data={text} keyword={keyword} zoomIn={zoomIn} />
      <View id='category-1'></View>
      <TextSection data={subTitle} keyword={keyword} zoomIn={zoomIn} isTitle={true} />
      <TextSection data={subContent} keyword={keyword} zoomIn={zoomIn} />
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
      let title;
      if (type === 'explanation') { title = example.name }
      else if (type === 'procuratorate') { title = `${example.number}${example.name}` }
      else if (type === 'consultant') { title = `第${example.number}号${example.name}` }
      else if (type === 'civilLawExample') { title = example.text.split('\n').filter(line => line.trim() && line.trim().length > 0)[0] }
      else {title = example.title}
      Taro.cloud.callFunction({
        name: 'collect',
        data: {
          id: _id,
          type: type,
          title: noTitleExampleTypes[type] ? getFirstLine(text): title.trim(),
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

  pressTime
  touchStart = (index) => {
    console.log('start')
    this.pressTime = setTimeout(() => {
      //  你要do的事
      this.setState({selectedLine: index})
      // Taro.setClipboardData({
      //   data: text,
      //   success: function (res) {
      //     Taro.showToast({
      //       title: '本段已复制到剪贴板',
      //       icon: 'none',
      //       duration: 2000
      //     })
      //   }
      // });
    }, 1000);
  }

  touchEnd = () => {
    console.log('end')
    clearTimeout(this.pressTime);
  }

  resetSelectedLine = () => {
    this.setState({
      selectedLine: -1
    })
  }

  renderComplement = () => {
    const {example, keyword, zoomIn, selectedLine, enableAutoScroll, categories} = this.state;
    const {text, title, categoryList} = example;
    const that = this
    const setKey = (line, key) => {
      if (line && key) {
        const regExp = new RegExp(key,"g");
        const ifFound = regExp.test(line)
        if (ifFound) {
          this.foundKey = 'foundKey1'
          return 'foundKey1'
        }
      }
      return ''
    }
    if (selectedLine === -1 && enableAutoScroll) {
      setTimeout(() => {
        console.log('that.foundKey:', that.foundKey)
        if (that.foundKey) {
          Taro.pageScrollTo({
            selector: `#${that.foundKey}`,
            duration: 500
          })
        }
      }, 600)
    } else {
      console.log('detect copy')
    }

    const lines = text ? text.split('\n').filter(line => line.trim() && line.trim().length > 0).map(line => refine(line)) : []

    let c;
    if (categoryList && categoryList.length > 0) {
      c = categoryList
      if (!categories) {
        that.setState({
          categories: categoryList
        })
      }
    } else {
      c = categories
      if (!categories && text) {
        c = Array.from(new Set(lines.filter(l => isStartWith(l, highlights))))
        that.setState({
          categories: c
        })
      }
    }


    return (<View  className={`text-section ${zoomIn ? 'zoom-in' : ''}`}>
      <View className='term-complement-title'>{title}</View>
      {categoryList && categoryList.length > 0 && this.renderStaticCategory()}
      <View className='content'>{lines.map((line, index) => {
        return (<View id={setKey(line, keyword)}
                      className={`line ${index === selectedLine ? 'show-copy' : ''}`}
                      key={`text-example-detail-${index}`}
                      onTouchStart={() => this.touchStart(index)}
                      onTouchEnd={this.touchEnd}
        >
          {isStartWith(line, c) && c && <View id={`category-${c.indexOf(line)}`}></View>}
          <RichText nodes={findAndHighlight(line, index, keyword)} className={isStartWith(line, c) ? 'highlight': ''} ></RichText>
          {index === selectedLine && <View className='copy'>
            <AtButton size='small' type='primary' onClick={() => {
              copy(line, this.resetSelectedLine)
          }}>复制</AtButton>
            <Button className='copy-cancel' onClick={() => this.resetSelectedLine()}>取消</Button>
          </View>}
        </View>)
      })}</View>
    </View>)
  }


  changeKeyword = (keyword) => {
    const {example} = this.state
    const {text} = example
    if (keyword && keyword.trim()) {
      if (text.indexOf(keyword) === -1) {
        Taro.showToast({
          title: `未找到关键词"${keyword}"`,
          icon: 'none',
          duration: 2000
        })
        return ;
      }
      this.setState({keyword, enableAutoScroll: true})
    } else {
      Taro.showToast({
        title: '搜索关键词不能为空！',
        icon: 'none',
        duration: 2000
      })
      this.setState({keyword: undefined})
    }
  }

  onCancel = () => {
    this.setState({keyword: '',enableAutoScroll: false})
  }

  renderCategory = () => {
    const {categories} = this.state
    return (<View className='float-category'>
      {categories.map((c, index) => (<View
        className='float-category-item'
        key={c}
        onClick={() => {
          console.log(`click ${c}`)
          Taro.pageScrollTo({
            selector: `#category-${index}`,
            duration: 500
          })
        }}
      >{`${c}`}</View>))}
    </View>)
  }

  renderStaticCategory = () => {
    const {example} = this.state
    const {categoryList} = example
    return (<View className='static-category'>
      {categoryList.map((c, index) => (<View
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
  render () {
    const {isSent, keyword, comment, example, zoomIn, isCollected, isReadMode, isLoading, type, enableAutoScroll, enableExampleDetailAd, categories, openCategory} = this.state;
    const {special, text, title, categoryList} = example
    return (
      <View>
        {(example._id === '89b4bfb25f7dbcac007cec4b1f087eb1' || example._id === '89b4bfb25f7dbcac007cec402fa9835f') &&
        <AtNoticebar marquee speed={60}>
          最高人民法院关于部分指导性案例不再参照的通知(2021.1.1):为保证国家法律统一正确适用,根据《中华人民共和国民法典》等有关法律规定和审判实际,经最高人民法院审判委员会讨论决定,9号、20号指导性案例不再参照。但该指导性案例的裁判以及参照该指导性案例作出的裁判仍然有效。
        </AtNoticebar>
        }
        {
          (type === 'consultant' || type === 'consult') &&
          <AtNoticebar marquee speed={60}>
            刑事审判参考仅限用于学习交流!
          </AtNoticebar>
        }
        <View className={`example-detail-page page ${zoomIn ? 'zoom-in' : ''} ${isReadMode ? 'read-mode' : ''}`}>
          {categories && categories.length > 0 && openCategory && this.renderCategory()}
          {special && this.renderSpecial()}
          {!special && <View>
            {this.renderComplement()}
            {/*{!enableAutoScroll && this.renderExample()}*/}
          </View>}
          {categories && categories.length > 0 && <AtFab onClick={() => this.setState({openCategory: !openCategory})} size='small' className='float-category-icon'>
            <Text className={`at-fab__icon at-icon ${openCategory ? 'at-icon-close' : 'at-icon-menu'}`}></Text>
          </AtFab>}
          {!isLoading && !title && !text && this.renderNoData()}
          {!special && <FloatSearch keyword={keyword} onConfirm={this.changeKeyword} onCancel={this.onCancel} />}
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
          {enableExampleDetailAd && !isLoading && demoSet.has(type) && <View>
            <ad unit-id="adunit-aa47163462e4442f" ad-type="video" ad-theme="white"></ad>
          </View>}
          {enableExampleDetailAd && !isLoading && !demoSet.has(type) && <View>
            <ad unit-id="adunit-918b26ec218137ab"></ad>
          </View>}
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
