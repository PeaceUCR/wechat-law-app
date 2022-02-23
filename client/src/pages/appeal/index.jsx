import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import { AtSearchBar, AtActivityIndicator, AtFab, AtBadge, AtIcon, AtListItem, AtDivider } from 'taro-ui'
import {isEmpty} from 'lodash';
import {
  targetImageSource, getExampleSearchTag
} from '../../util/util'
import '../examples/index.scss'
import JudgementSearchItem from "../../components/judgementSearchItem"
import Loading2 from "../../components/loading2/index.weapp";

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    isExpandLabel: false,
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '控申工作实用法规'
  }

  onShareAppMessage() {
    return {
      path: 'pages/appeal/index'
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
        type: 'appeal',
        isCategory,
        searchValue
      },
      complete: r => {
        // console.log(r)
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
            <JudgementSearchItem
              title={`${example.title}`}
              text={example.text}
              category={example.category}
              redirect={() => {
                if (example.link) {
                  Taro.navigateTo({
                    url: `/${example.link}`,
                  })
                  return ;
                }
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
