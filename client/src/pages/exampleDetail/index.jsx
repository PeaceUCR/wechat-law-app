import Taro, { Component, setStorageSync, getStorageSync } from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtFab, AtIcon} from "taro-ui";
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
    isReadMode: false
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
          that.setState({example: res.data[0], type, id, keyword});
        }
      });
    } else if (type ==='procuratorate') {
      db.collection('procuratorate-examples').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], type, id, keyword});
        }
      });
    } else if (type ==='explanation') {
      db.collection('explanation').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], type, id, keyword});
        }
      });
    } else if (type ==='terms-complement') {
      db.collection('terms-complement').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], type, id, keyword});
        }
      });
    } else if (type ==='complement') {
      db.collection('complement').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], type, id, keyword});
        }
      });
    } else if (type ==='consultant') {
      db.collection('consult').where({_id: id}).get({
        success: (res) => {
          that.setState({example: res.data[0], type, id, keyword});
        }
      });
    }

    let collection = getStorageSync('collection');
    collection = collection ? collection : {};
    that.setState({
      isCollected: collection[id] === true
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
    return {
      path: 'pages/index/index'
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

  handleCollect = () => {
    const { isCollected, example, type } = this.state;
    const {_id} = example
    let collection = getStorageSync('collection');
    collection = collection ? collection : {};
    if (isCollected) {
      collection[_id] = false
      setStorageSync('collection', collection)
    } else {
      collection[_id] = true
      setStorageSync('collection', collection)

      if (type === 'terms-complement' || type === 'explanation' || type === 'complement' || type === 'consultant')  {
        let cachedItems = getStorageSync('cachedItems');
        cachedItems = cachedItems ? cachedItems : {};
        cachedItems[_id] = {type, title: type === 'explanation' ? example.name : example.title}
        if (type === 'explanation') {
          cachedItems[_id].title = example.name
        } else if (type === 'consultant') {
          cachedItems[_id].title = `第${example.number}号${example.name}`
        } else {
          cachedItems[_id].title = example.title

        }
        setStorageSync('cachedItems', cachedItems)
      }
    }
    Taro.showToast({
      title: isCollected ? '收藏取消' : '收藏成功',
      icon: 'none',
      duration: 1000
    })
    this.setState({isCollected : !isCollected})
  };

  render () {
    const {type, zoomIn, isCollected, isReadMode} = this.state;
    return (
      <View className={`example-detail-page ${zoomIn ? 'zoom-in' : ''} ${isReadMode ? 'read-mode' : ''}`}>
        {type === 'court' && this.renderCourtExample()}
        {(type === 'procuratorate' || type === 'explanation') && this.renderProcuratorateExample()}
        {type === 'terms-complement' && this.renderTermComplement()}
        {(type === 'complement' || type ==='consultant') && this.renderComplement()}
        <AtFab  className={`float ${zoomIn ? 'zoom-in': 'zoom-out'}`} onClick={() => {this.handleZoom()}}>
          <View  className={`zoom ${zoomIn ? 'zoom-in': 'zoom-out'}`} mode='widthFix' onClick={() => {this.handleZoom()}} />
        </AtFab>
        <View className='favorite-container' onClick={this.handleCollect} >
          <AtIcon value={isCollected ? 'star-2' : 'star'} size='42' color={isCollected ? '#ffcc00' : 'rgba(0, 0, 0, 0.6)'}></AtIcon>
        </View>
      </View>
    )
  }
}
