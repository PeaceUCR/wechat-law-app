import Taro, { Component, getStorageSync} from '@tarojs/taro'
import { View } from '@tarojs/components'
import {AtNoticebar, AtListItem, AtList, AtActivityIndicator, AtLoadMore, AtSearchBar} from "taro-ui";
import {isEmpty} from 'lodash';
import './index.scss'
import {db} from "../../util/db";

export default class User extends Component {

  state = {
    isLoading: true,
    isReadMode: false,
    loadResult: 'more',
    searchValue: '',
    list: []
  }

  config = {
    navigationBarTitleText: '用户统计',
    enablePullDownRefresh: true
  }
  onPullDownRefresh () {
    console.log('pull')
    this.loadUser(0, true)
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
    };
  }

  componentWillMount () {
    this.loadUser()
    const setting = getStorageSync('setting');
    this.setState({isReadMode: setting && setting.isReadMode})

    if (setting && setting.isReadMode) {
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#F4ECD8'
      })
    }
  }

  componentDidMount () {
  }

  componentWillUnmount () { }


  componentDidHide () { }

  loadUser = (skip, reset = false) => {
    skip = skip ? skip : 0;
    const that = this;
    const {searchValue} = that.state
    that.setState({isLoading: true});
    db.collection('user').where({nickName: db.RegExp({
        regexp: '.*' + searchValue,
        options: 'i',
      })})
      .orderBy('lastTimeLogin', 'desc')
      .skip(skip)
      .get({
      success: (res) => {
        if (isEmpty(res.data)) {
          that.setState({loadResult: 'noMore', isLoading: false});
          return ;
        }
        if (reset) {
          that.setState({list: [...res.data], loadResult: 'more', isLoading: false});
          Taro.showToast({
            title: '数据已经是最新的啦',
            icon: 'none',
            duration: 1000
          })
          Taro.stopPullDownRefresh()
          return ;
        }
        const {list} = that.state;
        that.setState({list: [...list, ...res.data], loadResult: 'more', isLoading: false});
      }
    })
  }

  renderUserList = () => {
    const {list} = this.state;
    return (list.map((user, index) => {
      return (<AtListItem
        key={`user-item-${index}`}
        title={`昵称:${user.nickName}`}
        note={`上次进入时间:${new Date(Date.parse(user.lastTimeLogin)).toLocaleString('zh-CN')}`}
        thumb={user.avatarUrl}
      />)
    }))
  }
  onChange = (searchValue) => {
    this.setState({searchValue})
  }
  onClear = () => {
    this.setState({
      searchValue: '',
      list: []
    });
  }
  render () {
    const {isLoading, isReadMode, loadResult, list, searchValue} = this.state;
    return (
      <View className={`user-page ${isReadMode ? 'read-mode' : ''}`}>
        <View className='search'>
          <AtSearchBar
            fixed
            value={searchValue}
            onChange={this.onChange}
            onActionClick={() => {this.loadUser(0, true)}}
            onClear={this.onClear}
            placeholder='搜昵称'
          />
        </View>
        <AtList>
          {this.renderUserList()}
          {list.length > 0 && <AtLoadMore
            status={isLoading ? 'loading' : loadResult}
            onClick={() => {
              this.loadUser(list.length)
            }}
          />}
        </AtList>
        {isLoading && <View className='loading-container'>
          <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
        </View>}
      </View>
    )
  }
}
