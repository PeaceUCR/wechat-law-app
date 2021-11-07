import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import { AtSearchBar, AtActivityIndicator, AtNoticebar, AtFab } from 'taro-ui'
import {isEmpty} from "lodash";
import TermSearchItem from '../../components/termSearchItem/index.weapp'
import CategoryList from '../../components/categoryList/index.weapp'
import '../litigationRegulation/index.scss'
import {otherLawNameMap, otherLawAnnounceMap, otherLawCategoryMap} from '../../util/otherLaw'


export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    isReadMode: false,
    law:''
  }

  config = {
    navigationBarTitleText: ''
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
    const {law,searchValue} = this.$router.params;
    this.setState({law,searchValue}, () => {
      if (searchValue) {
        this.onSearch(searchValue)
      }
    })
    if (otherLawNameMap[law]) {
      Taro.setNavigationBarTitle({title: otherLawNameMap[law]})
    }
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

  componentDidShow () {
  }

  componentDidHide () { }

  renderSearchList = () => {
    const {searchValue, searchResult,isReadMode, law} = this.state
    searchResult.sort((a, b) => {
      return a.number - b.number
    })
    return (<View>
      {searchResult.map((
        (data) => {
          return (
            <TermSearchItem
              type={law}
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
    const {law} = this.state
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
      name: 'getOtherLaw',
      data: {
        searchValue: searchValue,
        law
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
    const {law} = this.state
    this.setState({isLoading: true});
    const that = this;
    Taro.cloud.callFunction({
      name: 'getOtherLaw',
      data: {
        searchValue: searchValue,
        type: 'category',
        law
      },
      complete: (r) => {
        console.log(r)
        that.handleDBSearchSuccess(r.result)
      }
    })
  }

  render () {
    const {searchValue, searchResult, isLoading, isReadMode, law} = this.state;
    return (
      <View className={`litigation-regulation-page page ${isReadMode ? 'read-mode' : ''}`}>
          <AtNoticebar marquee speed={60}>
            {otherLawAnnounceMap[law]}
          </AtNoticebar>
          <View>
            <AtSearchBar
              value={searchValue}
              onChange={this.onChange}
              onActionClick={() => {
                this.onSearch(searchValue)
              }}
              onBlur={() => {
                this.onSearch(searchValue)
              }}
              onClear={this.onClear}
              placeholder={'搜索' + otherLawNameMap[law]}
            />
          </View>
          <View>
            <View>
              {/*{searchResult.length === 0 && this.renderOptions()}*/}
              {searchResult.length === 0 &&
              <CategoryList isReadMode={isReadMode} type='' options={otherLawCategoryMap[law]} onClick={this.onClickOptionItem} />}
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
