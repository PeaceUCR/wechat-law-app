import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import {AtSearchBar, AtActivityIndicator, AtListItem, AtBadge, AtIcon} from 'taro-ui'
import {isEmpty} from 'lodash';
import clickIcon from '../../static/down.png';
import './index.scss'
import {targetImageSource} from "../../util/util";

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    selected: '全文搜索',
    options: ['全文搜索'],
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '最高法公报案例搜索'
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
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
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  renderSearchList = () => {
    const {searchResult,searchValue} = this.state
    return (<View>
      <View>
        {searchResult.map(((example) => {return (
          <View className='result-item' key={`example-${example._id}`}>
            <Image
              src={targetImageSource}
              className={example.exactMatch ? 'exact-match': 'exact-match-hide'}
              mode='widthFix'
            />
            <AtListItem
              title={`${example.title}`}
              note={example.date}
              arrow='right'
              onClick={() => {
                Taro.navigateTo({
                  url: `/pages/exampleDetail/index?type=court-open&id=${example._id}&keyword=${searchValue}`,
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

  onSearch = () => {
    const that = this;
    this.setState({isLoading: true});
    const { searchValue, selected } = this.state;
    if(!searchValue.trim()) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }

    if (selected === '全文搜索') {
      Taro.cloud.callFunction({
        name: 'searchCourtOpen',
        data: {
          searchValue: searchValue
        },
        complete: ({result}) => {
          const {searchResult} = result
          if (isEmpty(searchResult)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的指导案例`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchResult, isLoading: false});
        }
      })
    }

  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: [],
    });
  }

  onSelect = (e) => {
    const {options} = this.state;
    this.setState({
      selected: options[e.detail.value],
      searchResult: []
    })
  }

  render () {
    const {searchValue, searchResult, isLoading, selected, options, isReadMode} = this.state;
    return (
      <View className={`example-page ${isReadMode ? 'read-mode' : ''}`}>
          <View className='header'>
            <View className='select'>
              <View>
                <Picker mode='selector' mode='selector' range={options} onChange={this.onSelect}>
                  <Text>{selected}</Text>
                </Picker>
              </View>
              <Image src={clickIcon} className='icon-click' />
            </View>
            <View className='search'>
              <AtSearchBar
                value={searchValue}
                onChange={this.onChange}
                onActionClick={() => this.onSearch()}
                onClear={this.onClear}
                placeholder={selected === '全文搜索' ? '案由，关键词' : ''}
              />
            </View>
          </View>
          <View>
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
            </View>}
          </View>
      </View>
    )
  }
}
