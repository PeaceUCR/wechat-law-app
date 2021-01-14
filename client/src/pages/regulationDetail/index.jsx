import Taro, { Component, getStorageSync } from '@tarojs/taro'
import { View, RichText } from '@tarojs/components'
import {AtFab} from "taro-ui";
import { db } from '../../util/db'
import {checkIfNewUser, redirectToIndexIfNewUser} from '../../util/login'
import {lawIdLabelMap} from '../../util/util'
import './index.scss'
import throttle from "lodash/throttle";


export default class RegulationDetail extends Component {

  state = {
    term: {},
    type: '',
    keyword: '',
    isCollectedLoading: true,
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

    if (type === 'civil-law-regulation') {
      db.collection('civil-law-regulation').where({_id: id}).get({
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

    // Taro.cloud.callFunction({
    //   name: 'isCollected',
    //   data: {
    //     id: id,
    //     type: 'criminalLawTermDetail'
    //   },
    //   complete: (r) => {
    //
    //     if (r && r.result && r.result.data && r.result.data.length > 0) {
    //       that.setState({isCollected: true})
    //     }
    //     that.setState({isCollectedLoading: false});
    //   },
    //   fail: (e) => {
    //     that.setState({isCollectedLoading: false});
    //     Taro.showToast({
    //       title: `获取收藏数据失败:${JSON.stringify(e)}`,
    //       icon: 'none',
    //       duration: 1000
    //     })
    //   }
    // })

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
    const {term, keyword} = this.state;
    const {text} = term
    return (text.map((t, index) => {
      return <View className='regulation-line' key={`police-${index}`}>
        <RichText nodes={this.findAndHighlight(t, keyword)}></RichText>
      </View>
    }))
  }

  renderLitigation = () => {
    const {term} = this.state;
    const {part, chapter, section, content} = term;
    return (
      <View>
        <View className='header'>
          <View>{part}</View>
          <View>{chapter}</View>
          <View>{section}</View>
        </View>
        <View className='section'>{content}</View>
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

  render () {
    const {type, isCollected, isReadMode, zoomIn} = this.state;
    return (
      <View className={`term-detail-page ${isReadMode ? 'read-mode' : ''} ${zoomIn ? 'zoom-in' : ''}`}>
          <View className='main section'>
            <View>
              {(type === 'police' || type === 'civil-law-regulation') &&this.renderTermText()}
              {(type === 'litigation-law' || type === 'litigation-regulation') && this.renderLitigation()}
            </View>
          </View>
        {/*<View className='favorite-container' onClick={this.handleCollect} >*/}
        {/*  <AtIcon value={isCollected ? 'star-2' : 'star'} size='34' color={isCollected ? '#ffcc00' : 'rgba(0, 0, 0, 0.6)'}></AtIcon>*/}
        {/*</View>*/}
        <AtFab size='small' className='float-zoom' onClick={() => {this.handleZoom()}}>
          <View  className={`zoom ${zoomIn ? 'zoom-in': 'zoom-out'}`} mode='widthFix' />
        </AtFab>
      </View>
    )
  }
}
