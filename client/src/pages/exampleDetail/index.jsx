import Taro, { Component, setStorageSync, getStorageSync } from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtFab, AtIcon, AtActivityIndicator} from "taro-ui";
import { db } from '../../util/db'
import TextSection from '../../components/textSection/index.weapp'
import './index.scss'

export default class ExampleDetail extends Component {

  state = {
    id: '',
    type: '',
    example: {},
    keyword: '',
    zoomIn: false,
    isCollected: false,
    isReadMode: false,
    isLoading: true
  }

  config = {
    navigationBarTitleText: '详情'
  }

  componentWillMount () {
    const that = this;
    const { id, type, keyword } = this.$router.params;
    if(type === 'court') {
      db.collection('court-examples').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], isLoading: false, type, id, keyword});
        }
      });
    } else if (type ==='procuratorate') {
      db.collection('procuratorate-examples').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], isLoading: false, type, id, keyword});
        }
      });
    } else if (type ==='explanation') {
      db.collection('explanation').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], isLoading: false, type, id, keyword});
        }
      });
    } else if (type ==='terms-complement') {
      db.collection('terms-complement').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], isLoading: false, type, id, keyword});
        }
      });
    } else if (type ==='complement') {
      db.collection('complement').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], isLoading: false, type, id, keyword});
        }
      });
    } else if (type ==='consultant') {
      db.collection('consult').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], isLoading: false, type, id, keyword});
        }
      });
    } else if (type ==='court-open') {
      db.collection('court-open').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], isLoading: false, type, id, keyword});
        }
      });
    } else if (type ==='civilLawExample') {
      db.collection('civil-law-link-example-detail').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], isLoading: false, type, id, keyword});
        }
      });
    } else if (type ==='civilLawExplaination') {
      db.collection('civil-law-explaination').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], isLoading: false, type, id, keyword});
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
  }

  onShareAppMessage() {
    const {type, id, keyword} = this.state;
    return {
      path: `/pages/exampleDetail/index?type=${type}&id=${id}&keyword=${keyword}`
    };
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

  renderCourtExample = () => {
    const {example, keyword, zoomIn} = this.state;
    const {content} = example;
    return (<View>
      <TextSection data={content.join('\n')} keyword={keyword} zoomIn={zoomIn} />
    </View>)
  }

  renderProcuratorateExample = () => {
    const {example, keyword, zoomIn} = this.state;
    const {text} = example;
    return (<View>
      <TextSection data={text} keyword={keyword} zoomIn={zoomIn} />
    </View>)
  }

  renderTermComplement = () => {
    const {example, keyword, zoomIn} = this.state;
    const {content, title} = example;
    return (<View>
      <View className='term-complement-title'>{title}</View>
      <TextSection data={content} keyword={keyword} zoomIn={zoomIn} />
    </View>)
  }

  renderComplement = () => {
    const {example, keyword, zoomIn} = this.state;
    const {content, title} = example;
    return (<View>
      <View className='term-complement-title'>{title}</View>
      <TextSection data={content} keyword={keyword} zoomIn={zoomIn} />
    </View>)
  }

  handleZoom = () => {
    const {zoomIn} = this.state;
    this.setState({zoomIn: !zoomIn})
  }

  // handleCollect = () => {
  //   const { isCollected, example, type } = this.state;
  //   const {_id} = example
  //   let collection = getStorageSync('collection');
  //   collection = collection ? collection : {};
  //   if (isCollected) {
  //     collection[_id] = false
  //     setStorageSync('collection', collection)
  //   } else {
  //     collection[_id] = true
  //     setStorageSync('collection', collection)
  //
  //     if (type === 'terms-complement'
  //       || type === 'explanation'
  //       || type === 'complement'
  //       || type === 'consultant'
  //       || type === 'court-open'
  //       || type === 'civilLawExample'
  //       || type === 'civilLawExplaination')  {
  //       let cachedItems = getStorageSync('cachedItems');
  //       cachedItems = cachedItems ? cachedItems : {};
  //       cachedItems[_id] = {type, title: type === 'explanation' ? example.name : example.title}
  //       if (type === 'explanation') {
  //         cachedItems[_id].title = example.name
  //       } else if (type === 'consultant') {
  //         cachedItems[_id].title = `第${example.number}号${example.name}`
  //       } else if (type === 'civilLawExample') {
  //         cachedItems[_id].title = example.content.split('\n').filter(line => line.trim() && line.trim().length > 0)[0]
  //       } else {
  //         cachedItems[_id].title = example.title
  //
  //       }
  //       setStorageSync('cachedItems', cachedItems)
  //     }
  //   }
  //   Taro.showToast({
  //     title: isCollected ? '收藏取消' : '收藏成功',
  //     icon: 'none',
  //     duration: 1000
  //   })
  //   this.setState({isCollected : !isCollected})
  // };

  handleCollect = () => {
    const that = this;
    const { isCollected, example, type } = this.state;
    const {_id} = example;
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
      else if (type === 'civilLawExample') { title = example.content.split('\n').filter(line => line.trim() && line.trim().length > 0)[0] }
      else {title = example.title}
      Taro.cloud.callFunction({
        name: 'collect',
        data: {
          id: _id,
          type: type,
          title: title
        },
        complete: () => {
          that.setState({isLoading: false, isCollected: true});
          Taro.showToast({
            title: '收藏成功',
            icon: 'none',
            duration: 1000
          })
        }
      })
    }
  }
  render () {
    const {type, zoomIn, isCollected, isReadMode, isLoading} = this.state;
    return (
      <View className={`example-detail-page ${zoomIn ? 'zoom-in' : ''} ${isReadMode ? 'read-mode' : ''}`}>
        {type === 'court' && this.renderCourtExample()}
        {(type === 'procuratorate' || type === 'explanation' || type === 'court-open') && this.renderProcuratorateExample()}
        {type === 'terms-complement' && this.renderTermComplement()}
        {(type === 'complement' || type ==='consultant' || type === 'civilLawExample' || type === 'civilLawExplaination') && this.renderComplement()}
        <AtFab  className={`float ${zoomIn ? 'zoom-in': 'zoom-out'}`} onClick={() => {this.handleZoom()}}>
          <View  className={`zoom ${zoomIn ? 'zoom-in': 'zoom-out'}`} mode='widthFix' />
        </AtFab>
        <View className='favorite-container' onClick={this.handleCollect} >
          <AtIcon value={isCollected ? 'star-2' : 'star'} size='42' color={isCollected ? '#ffcc00' : 'rgba(0, 0, 0, 0.6)'}></AtIcon>
        </View>
        {isLoading && <View className='loading-container'>
          <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
        </View>}
      </View>
    )
  }
}
