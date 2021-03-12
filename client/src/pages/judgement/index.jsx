import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import {AtIcon, AtInput, AtSearchBar, AtActivityIndicator, AtListItem, AtLoadMore} from 'taro-ui'
import {isEmpty} from 'lodash';
import throttle from 'lodash/throttle';
import { db } from '../../util/db'
import './index.scss'

export default class Index extends Component {

  state = {
    searchValue: '',
    keyword: '',
    keywords: [],
    criminalLaw: '',
    criminalLaws: [],
    searchResult: [],
    isLoading: false,
    status: 'more',
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '裁判文书'
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
          <AtListItem
            key={`example-${example._id}`}
            title={`${example.title}`}
            note={example.date}
            arrow='right'
            onClick={() => {
              Taro.navigateTo({
                url: `/pages/exampleDetail/index?type=court-open&id=${example._id}&keyword=${searchValue}`,
              })
            }}
          />
          )}))}
      </View>
    </View>)
  }

  onSearchValueChange = (searchValue) => {
    this.setState({searchValue})
  }

  onKeywordChange = (value) => {
    this.setState({keyword: value})
  }

  onKeywordAdd = () => {
    const {keyword, keywords} = this.state;
    this.setState({keywords: [keyword, ...keywords]})
  }

  onCriminalLawChange = (value) => {
    this.setState({criminalLaw: value})
  }

  onCriminalLawAdd = () => {
    const {criminalLaw, criminalLaws} = this.state;
    this.setState({criminalLaws: [criminalLaw, ...criminalLaws]})
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
    if (selected === '全文搜索') {
      db.collection('court-open').orderBy('date', 'desc').skip(skip).where({text: db.RegExp({
          regexp: '.*' + searchValue,
          options: 'i',
        })}).get({
        success: (res) => {
          if (isEmpty(res.data)) {
            if (skip === 0) {
              Taro.showToast({
                title: `未找到含有${searchValue}的最高法公报`,
                icon: 'none',
                duration: 3000
              })
              that.setState({isLoading: false})
              return;
            } else {
              Taro.showToast({
                title: `没有更多啦`,
                icon: 'none',
                duration: 3000
              })
              that.setState({status: 'noMore', isLoading: false})
            }
          } else {
            if (skip === 0) {
              that.setState({searchResult: [...res.data], isLoading: false});
            } else {
              that.setState({searchResult: [...searchResult, ...res.data], isLoading: false});
            }
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

  onKeywordDelete = (index) => {
    const {keywords} = this.state;
    keywords.splice(index, 1)
    this.setState({
      keywords: [...keywords]
    });
  }

  onCriminalLawDelete = (index) => {
    const {criminalLaws} = this.state;
    criminalLaws.splice(index, 1)
    this.setState({
      criminalLaws: [...criminalLaws]
    });
  }

  renderKeywords = () => {
    const {keywords} = this.state;
    return keywords.map((keyword, index) => {
      return (<View className='keyword-option option' key={`keyword-option-${index}`} onClick={() => {this.onKeywordDelete(index)}}>
        <Text>{`关键词:${keyword}`}</Text>
        <AtIcon value='trash' size='22' color='#cc0000'></AtIcon>
      </View>)})
  }

  renderCriminalLaws = () => {
    const {criminalLaws} = this.state;
    return criminalLaws.map((criminalLaw, index) => {
      return (<View className='criminalLaw-option option' key={`criminalLaw-option-${index}`} onClick={() => {this.onCriminalLawDelete(index)}}>
        <Text>{`关键词:${criminalLaw}`}</Text>
        <AtIcon value='trash' size='22' color='#cc0000'></AtIcon>
      </View>)})
  }

  render () {
    const {searchValue, keyword, keywords, criminalLaw, criminalLaws, searchResult, isLoading, status, isReadMode} = this.state;
    return (
      <View className={`example-page ${isReadMode ? 'read-mode' : ''}`}>
          <AtSearchBar
            value={searchValue}
            onChange={this.onSearchValueChange}
            onActionClick={this.onSearch}
            onClear={this.onClear}
            placeholder='输入搜索词'
          />
          <View className='keyword-input-container'>
            <AtInput
              type='text'
              placeholder='添加关键词'
              value={keyword}
              onChange={this.onKeywordChange}
            />
            <AtIcon value='add-circle' size='30' color='#6190E8' onClick={this.onKeywordAdd}></AtIcon>
          </View>
          <View className='keyword-options'>
            {keywords.length > 0 && <Text>关键词:</Text>}
            {this.renderKeywords()}
          </View>
          <View className='keyword-input-container'>
            <AtInput
              type='text'
              placeholder='添加刑法'
              value={criminalLaw}
              onChange={this.onCriminalLawChange}
            />
            <View className={criminalLaw ? 'icon-animating icon-container' : 'icon-container'}>
              <AtIcon value='add-circle' size='30' color='#6190E8' onClick={this.onCriminalLawAdd}></AtIcon>
            </View>
          </View>
          <View className='keyword-options'>
            {criminalLaws.length > 0 && <Text>刑法:</Text>}
            {this.renderCriminalLaws()}
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
