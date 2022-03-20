import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import { AtSearchBar, AtActivityIndicator, AtFab, AtBadge, AtIcon, AtListItem, AtDivider } from 'taro-ui'

import '../examples/index.scss'
import GlobalSearchItem from "../../components/globalSearchItem/index.weapp"
import Loading2 from "../../components/loading2/index.weapp"
import moment from "moment"

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    isExpandLabel: false,
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '行政—刑事衔接规定搜索'
  }

  onShareAppMessage() {
    return {
      path: 'pages/adminCriminalLink/index'
    };
  }

  componentWillMount () {
    const that = this;
    const setting = getStorageSync('setting');
    this.setState({isReadMode: setting && setting.isReadMode})
    if (setting && setting.isReadMode) {
      console.log('read')
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#F4ECD8'
      })
    }

    this.onSearch(true)
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  onChange = (searchValue) => {
    this.setState({searchValue})
  }

  onSearch = (isCategory) => {
    const that = this;
    const { searchValue } = this.state;
    if(!searchValue.trim() && !isCategory) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }
    this.setState({isLoading: true});
    console.log('isCategory',isCategory)
    Taro.cloud.callFunction({
      name: 'searchCriminalComplement',
      data: {
        type: 'admin-criminal-link',
        isCategory,
        searchValue
      },
      complete: r => {
        console.log(r)
        that.setState({searchResult: isCategory === true ? r.result.data : r.result.result.data, isLoading: false})
      }
    });
  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: []
    });
  }

  renderSearchList = () => {
    const {searchResult,searchValue} = this.state
    return (<View>
      <View>
        {searchResult.map(((example) => {return (
          <View className='result-item' key={`example-${example._id}`}>
            <GlobalSearchItem
              showFullTitle
              title={`${example.title}`}
              publishInfo={moment(example.effectiveDate).format('YYYY-MM-DD')}
              type={example.category}
              redirect={() => {
                Taro.navigateTo({
                  url: `/pages/exampleDetail/index?type=complement&id=${example._id}&keyword=${searchValue}`,
                })
              }}
            />
          </View>

        )}))}
      </View>
      {searchResult.length > 0 && <AtDivider content='没有更多了' fontColor='#666' />}
    </View>)
  }

  render () {
    const {searchValue, searchResult, isLoading, isExpandLabel, isReadMode} = this.state;
    return (
      <View className={`example-page page ${isReadMode ? 'read-mode' : ''}`}>
          <View className='header'>
            <View>
              <AtSearchBar
                value={searchValue}
                onChange={this.onChange}
                onActionClick={this.onSearch}
                onBlur={this.onSearch}
                onClear={this.onClear}
                placeholder='全文搜索'
              />
            </View>
          </View>
          <View>
            <View>
              {(searchResult.length > 0 || searchResult.length > 0) && this.renderSearchList()}
            </View>

            {isLoading && <Loading2 />}
          </View>
      </View>
    )
  }
}
