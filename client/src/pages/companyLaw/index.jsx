import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import { AtSearchBar, AtActivityIndicator, AtNoticebar, AtFab } from 'taro-ui'
import {isEmpty} from "lodash";
import { TermSearchItem } from '../../components/termSearchItem/index.weapp'
import { CategoryList } from '../../components/categoryList/index.weapp'
import '../litigationRegulation/index.scss'
import {companyLawCategoryLines} from '../../util/util';

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '中华人民共和国公司法'
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

  componentDidShow () {
  }

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
              type='company-law'
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
    if(!searchValue.trim()) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }
    this.setState({isLoading: true});
    Taro.cloud.callFunction({
      name: 'getCompanyLaw',
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
      name: 'getCompanyLaw',
      data: {
        searchValue: searchValue,
        type: 'category'
      },
      complete: (r) => {
        console.log(r)
        that.handleDBSearchSuccess(r.result)
      }
    })
  }

  render () {
    const {searchValue, searchResult, isLoading, isReadMode} = this.state;
    return (
      <View className={`litigation-regulation-page ${isReadMode ? 'read-mode' : ''}`}>
          <AtNoticebar marquee speed={60}>
            根据2018年10月26日第十三届全国人民代表大会常务委员会第六次会议《关于修改〈中华人民共和国公司法〉的决定》第四次修正）
          </AtNoticebar>
          <View>
            <AtSearchBar
              value={searchValue}
              onChange={this.onChange}
              onActionClick={() => {
                this.onSearch(searchValue)
              }}
              onClear={this.onClear}
              placeholder='搜索公司法'
            />
          </View>
          <View>
            <View>
              {/*{searchResult.length === 0 && this.renderOptions()}*/}
              {searchResult.length === 0 &&
              <CategoryList isReadMode={isReadMode} type='' options={companyLawCategoryLines} onClick={this.onClickOptionItem} />}
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
