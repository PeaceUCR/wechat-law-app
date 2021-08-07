import Taro, { Component, getStorageSync} from '@tarojs/taro'
import { View, Text, Swiper,SwiperItem } from '@tarojs/components'
import {AtIcon, AtListItem, AtList, AtActivityIndicator, AtLoadMore, AtSearchBar} from "taro-ui";
import {isEmpty} from 'lodash';
import './index.scss'
import {db} from "../../util/db";

let videoAd = null

export default class User extends Component {

  state = {
    isLoading: true,
    isReadMode: false,
    loadResult: 'more',
    searchValue: '',
    list: [],
    date: '',
    todayUsers: 0
  }

  config = {
    navigationBarTitleText: '用户统计',
    enablePullDownRefresh: true
  }
  onPullDownRefresh () {
    console.log('pull')
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-f8070b31831d3c12'
      })
      videoAd.onLoad(() => {})
      videoAd.onError((err) => {})
      videoAd.onClose((res) => {})
    }
    if (videoAd) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            console.log('激励视频 广告显示失败')
          })
      })
    }
    this.loadUser(0, true)
    this.loadTodayUsers()
  }

  onShareAppMessage() {
    return {
      path: 'pages/usage/index'
    };
  }

  componentWillMount () {
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-f8070b31831d3c12'
      })
      videoAd.onLoad(() => {})
      videoAd.onError((err) => {})
      videoAd.onClose((res) => {})
    }
    if (videoAd) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            console.log('激励视频 广告显示失败')
          })
      })
    }
    this.loadUser()
    this.loadTodayUsers()
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

  loadTodayUsers = () => {
    const that = this;
    const start = new Date().setHours(0,0,0,0)
    const end = new Date().setHours(23,59,59,0)
    Taro.cloud.callFunction({
      name: 'getTodayUsers',
      data: {
        start,
        end
      },
      complete: r => {
        that.setState({
          date: new Date(start).toLocaleDateString('fr-CA'),
          todayUsers: r.result.userNumber
        })
      }
    })
  }

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
    const {isLoading, isReadMode, loadResult, list, searchValue, todayUsers, date} = this.state;
    return (
      <View className={`user-page ${isReadMode ? 'read-mode' : ''}`}>
        {/*<Swiper className='video-container'>*/}
        {/*  <SwiperItem >*/}
        {/*    <ad unit-id='adunit-aa47163462e4442f' ad-type='video' ad-theme='white'></ad>*/}
        {/*  </SwiperItem>*/}
        {/*</Swiper>*/}
        <Swiper className='video-container'>
          <SwiperItem >
            <ad unit-id='adunit-b09895fd83835652' ad-intervals='30'></ad>
          </SwiperItem>
        </Swiper>
        <View className='search'>
          <AtSearchBar
            // fixed
            value={searchValue}
            onChange={this.onChange}
            onActionClick={() => {this.loadUser(0, true)}}
            onClear={this.onClear}
            placeholder='搜昵称'
          />
        </View>
        {todayUsers > 0 && <View className='float'>
          <View className='line'><AtIcon value='calendar' size='18' color='#c6823b'></AtIcon>日期:<Text className='highlight'>{date}</Text></View>
          <View className='line'><AtIcon value='user' size='18' color='#c6823b'></AtIcon>今天访问人数:<Text className='highlight'>{todayUsers}</Text></View>
        </View>}
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
