import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import { AtSearchBar, AtActivityIndicator, AtNoticebar, AtFab } from 'taro-ui'
import {isEmpty} from "lodash";
import { TermSearchItem } from '../../components/termSearchItem/index.weapp'
import { CategoryList } from '../../components/categoryList/index.weapp'
import '../litigationRegulation/index.scss'
import {supervisionCategoryLines} from '../../util/util';

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '中华人民共和国监察法'
  }

  reset = () => {
    this.setState({
      searchValue: '',
      searchResult: []
    })
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
    };
  }
  componentWillMount () {
  }

  componentDidMount () {
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

  componentWillUnmount () { }

  componentDidShow () {}

  componentDidHide () { }

  renderSearchList = () => {
    const {searchValue, searchResult,isReadMode} = this.state
    searchResult.sort((a, b) => {
      return a.number - b.number
    })
    return (<View>
      {searchResult.map((
        (data) => {
          return (
            <TermSearchItem
              type='supervision-law'
              keyword={searchValue}
              isReadMode={isReadMode}
              term={data}
              key={`term-${data._id}`}
            />)}))}
    </View>)
  }

  onChange = (searchValue) => {
    this.setState({searchValue})
  }

   handleDBSearchSuccess = (res) => {
    if (isEmpty(res.data)) {
      Taro.showToast({
        title: `未找到相应的法条`,
        icon: 'none',
        duration: 3000
      })
      this.setState({isLoading: false});
      return ;
    }

    Taro.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
    this.setState({searchResult: res.data, isLoading: false});
  }

  onSearch = (searchValue) => {
    const that = this;
    this.setState({isLoading: true});
    if(!searchValue.trim()) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }
    Taro.cloud.callFunction({
      name: 'getSupervisionLaw',
      data: {
        searchValue: searchValue,
      },
      complete: (r) => {

        that.handleDBSearchSuccess(r.result)
      }
    })
  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: []
    });
  }

  onClickOptionItem = (searchValue) => {
    this.setState({isLoading: true});
    const that = this;
    Taro.cloud.callFunction({
      name: 'getSupervisionLaw',
      data: {
        searchValue: searchValue,
        type: 'category'
      },
      complete: (r) => {
        that.handleDBSearchSuccess(r.result)
      }
    })
  }

  render () {
    const {searchValue, searchResult, isLoading, isReadMode} = this.state;
    return (
      <View className={`litigation-regulation-page ${isReadMode ? 'read-mode' : ''}`}>
          <AtNoticebar marquee speed={60}>
            2018年3月20日第十三届全国人民代表大会第一次会议通过
          </AtNoticebar>
          <View>
            <AtSearchBar
              value={searchValue}
              onChange={this.onChange}
              onActionClick={() => {
                this.onSearch(searchValue)
              }}
              onClear={this.onClear}
              placeholder='搜索监察法'
            />
          </View>
          <View>
            <View>
              {/*{searchResult.length === 0 && this.renderOptions()}*/}
              {searchResult.length === 0 &&
              <CategoryList isReadMode={isReadMode} type='' options={supervisionCategoryLines} onClick={this.onClickOptionItem} />}
            </View>
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black' size={82}></AtActivityIndicator>
            </View>}
            {searchResult.length > 0 && <AtFab className='float' onClick={() => this.reset()}>
              <Text>重置</Text>
            </AtFab>}
          </View>
      </View>
    )
  }
}