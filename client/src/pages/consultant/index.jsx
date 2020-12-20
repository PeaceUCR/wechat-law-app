import Taro, { Component } from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import {AtSearchBar, AtActivityIndicator, AtListItem, AtLoadMore} from 'taro-ui'
import {isEmpty} from 'lodash';
import throttle from 'lodash/throttle';
import { db } from '../../util/db'
import clickIcon from '../../static/down.png';
import './index.scss'

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    selected: '搜案例名',
    options: ['搜案例名', '搜案例号'],
    status: 'more'
  }

  config = {
    navigationBarTitleText: '刑事审判参考搜索'
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
    };
  }
  componentWillMount () {
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  renderSearchList = () => {
    const {searchResult} = this.state
    return (<View>
      <View>
        {searchResult.map(((example) => {return (
          <AtListItem
            key={`example-${example._id}`}
            title={`[第${example.number}号]${example.name}`}
            arrow='right'
            onClick={() => {
              Taro.navigateTo({
                url: `/pages/exampleDetail/index?type=consultant&id=${example._id}`,
              })
            }}
          />
          )}))}
      </View>
    </View>)
  }

  onChange = (searchValue) => {
    this.setState({searchValue})
  }

  onSearch = (skip) => {
    skip = skip ? skip : 0;
    const that = this;
    this.setState({isLoading: true});
    const { searchValue, searchResult, selected } = this.state;
    if(!searchValue.trim()) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }
    if (selected === '搜案例名') {
      db.collection('consult').orderBy('number', 'asc').skip(skip).where({name: db.RegExp({
          regexp: '.*' + searchValue,
          options: 'i',
        })}).get({
        success: (res) => {
          if (isEmpty(res.data)) {
            if (skip === 0) {
              Taro.showToast({
                title: `未找到含有${searchValue}的刑事审判参考`,
                icon: 'none',
                duration: 3000
              })
            } else {
              Taro.showToast({
                title: `没有更多啦`,
                icon: 'none',
                duration: 3000
              })
              that.setState({status: 'noMore', isLoading: false})
            }
          } else {
            that.setState({searchResult: [...searchResult, ...res.data], isLoading: false});
          }

        }
      });
    }

    if (selected === '搜案例号') {
      db.collection('consult').orderBy('number', 'asc').skip(skip).where({number: parseInt(searchValue)}).get({
        success: (res) => {
          if (isEmpty(res.data)) {
            if (skip === 0) {
              Taro.showToast({
                title: `未找到含有${searchValue}的刑事审判参考`,
                icon: 'none',
                duration: 3000
              })
            } else {
              Taro.showToast({
                title: `没有更多啦`,
                icon: 'none',
                duration: 3000
              })
              that.setState({status: 'noMore', isLoading: false})
            }
          } else {
            that.setState({searchResult: [...searchResult, ...res.data], isLoading: false});
          }

        }
      });

    }

  }

  loadMore = () => {
    const {searchResult} = this.state
    this.onSearch(searchResult.length)
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
      status: 'more',
      searchResult: []
    })
  }

  render () {
    const {searchValue, searchResult, isLoading, selected, options, status} = this.state;
    return (
      <View className='example-page'>
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
                onActionClick={() => this.onSearch(0)}
                onClear={this.onClear}
                placeholder={selected === '搜案例号' ? '123' : '蓝海诈骗案'}
              />
            </View>
          </View>
          <View>
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            {searchResult && searchResult.length>0 && (<AtLoadMore
              onClick={
                throttle(this.loadMore, 2000, { trailing: false })
              }
              status={status}
            />)}
            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
            </View>}
          </View>
      </View>
    )
  }
}
