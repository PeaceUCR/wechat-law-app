import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Image} from '@tarojs/components'
import {AtSearchBar, AtListItem, AtIcon, AtNoticebar} from 'taro-ui'
import {isEmpty} from 'lodash';
import { Loading } from '../../components/loading/index.weapp'
import './index.scss'
import moment from "moment";
import {getCity, getProvince} from "../../util/login";
import Loading2 from "../../components/loading2/index.weapp";
import throttle from "lodash/throttle";

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    isReadMode: false,
    province: undefined,
    city: undefined
  }

  config = {
    navigationBarTitleText: '地方法律法规'
  }

  onShareAppMessage() {
    return {
      path: 'pages/localLaw/index'
    };
  }
  componentWillMount () {
    const setting = getStorageSync('setting');
    this.setState({isReadMode: setting && setting.isReadMode})
    if (setting && setting.isReadMode) {
      console.log('read')
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#F4ECD8'
      })
    }

    this.setState({
      province: getProvince(),
      city: getCity()
    })
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  renderLocation = () => {
    const {province, city} = this.state
    return (<View className='icon-line' onClick={() => {
    }}>
      <AtIcon value='map-pin' size='22' color='#b35900'></AtIcon>
      {province && city && <View>{`${province}-${city}`}</View>}
      {(!province || !city) && <View>暂无、请先在'我的'页面设置位置信息</View>}
    </View>)
  }

  renderSearchList = () => {
    const {searchResult, searchValue} = this.state
    return (<View>
      <View>
        {searchResult.map(((complement) => {return (
          <View className='result-item' key={`complement-${complement._id}`}>
            <AtListItem
              title={`${complement.title}`}
              note={complement.publishInfo}
              arrow='right'
              onClick={() => {
                Taro.navigateTo({
                  url: `/pages/exampleDetail/index?type=local-law-detail&id=${complement._id}&keyword=${searchValue}`,
                })
              }}
            />
          </View>
          )}))}
      </View>
    </View>)
  }

  onChange = (searchValue) => {
    this.setState({searchValue})
  }

  onSearch = throttle(() => {
      const that = this;
      const { searchValue, province, city } = this.state;
      console.log(searchValue, province, city)
      if (province && city) {
        this.setState({isLoading: true});
        Taro.cloud.callFunction({
          name: 'searchLocalLaw',
          data: {
            searchValue,
            province,
            city
          },
          complete: r => {
            console.log(r)
            if (isEmpty(r.result.data)) {
              Taro.showToast({
                title: `未找到!`,
                icon: 'none',
                duration: 2000
              })
            }
            that.setState({searchResult: [...r.result.data], isLoading: false});
          }
        })
      } else {
        Taro.showToast({
          title: "请先在'我的'页面设置位置信息",
          icon: 'none',
          duration: 2000
        })
      }
    },
    1000,
    { trailing: false })


  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: [],
    });
  }

  render () {
    const {searchValue, searchResult, isLoading, isReadMode} = this.state;
    return (
      <View className={`example-page page ${isReadMode ? 'read-mode' : ''}`}>
        <AtNoticebar marquee speed={60}>
          收录十万+地方法规
        </AtNoticebar>
        <View className='header'>
            <View className='search'>
              <AtSearchBar
                value={searchValue}
                onChange={this.onChange}
                onActionClick={() => this.onSearch(0)}
                onBlur={() => this.onSearch(0)}
                onClear={this.onClear}
                placeholder='搜标题'
              />
            </View>
          </View>
          <View >
            {this.renderLocation()}
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            {isLoading && <Loading2 />}
          </View>
      </View>
    )
  }
}
