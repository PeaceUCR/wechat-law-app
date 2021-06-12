import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import { AtSearchBar, AtActivityIndicator, AtNoticebar, AtFab } from 'taro-ui'
import {isEmpty} from "lodash";
import { db } from '../../util/db'
import { LitigationSearchItem } from '../../components/litigationSearchItem/index.weapp'
import { CategoryList } from '../../components/categoryList/index.weapp'
import {convertNumberToChinese, getNumber} from '../../util/convertNumber'
import './index.scss'
import {policeAdminRegulationCategoryLines} from '../../util/util';

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '公安机关办理行政案件程序规定'
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
    const that = this;
    that.setState({isLoading: true});
    db.collection('configuration').where({}).get({
      success: (res) => {
        that.setState({
          litigationRegulationChapters: res.data[0].litigationRegulationChapters,
          litigationRegulationSections: res.data[0].litigationRegulationSections,
          isLoading: false});
      }
    });
  }

  componentDidHide () { }

  renderSearchList = () => {
    const {searchValue, searchResult,isReadMode} = this.state
    searchResult.sort((a, b) => {
      return getNumber(a.item) - getNumber(b.item)
    })
    return (<View>
      {searchResult.map((
        (data) => {
          return (
            <LitigationSearchItem
              keyword={searchValue}
              isReadMode={isReadMode}
              data={data}
              key={`term-${data._id}`}
              onSearchResultClick={this.onSearchResultClick}
            />)}))}
    </View>)
  }

  onChange = (searchValue) => {
    this.setState({searchValue})
  }

  handleDBSearchSuccess = (res) => {
    if (isEmpty(res.data)) {
      Taro.showToast({
        title: `未找到相应的刑事诉讼法法条`,
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
      name: 'getLitigationRegulation',
      data: {
        searchValue: searchValue,
      },
      complete: (r) => {

        that.handleDBSearchSuccess(r.result)
      }
    })
  }

  onSearchByChapter = (searchValue) => {
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
      name: 'getLitigationRegulation',
      data: {
        searchValue: searchValue,
        type: 'chapter'
      },
      complete: (r) => {

        that.handleDBSearchSuccess(r.result)
      }
    })
  }

  onSearchBySection = (searchValue) => {
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
      name: 'getLitigationRegulation',
      data: {
        searchValue: searchValue,
        type: 'section'
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
    const that = this;
    Taro.cloud.callFunction({
      name: 'getPoliceAdminRegulation',
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

  onSearchResultClick = (data) => {
    const {_id} = data
    Taro.navigateTo({
      url: `/pages/regulationDetail/index?id=${_id}&type=litigation-regulation`,
    })
  }

  render () {
    const {searchValue, searchResult, isLoading, isReadMode} = this.state;
    return (
      <View className={`litigation-regulation-page ${isReadMode ? 'read-mode' : ''}`}>
          <AtNoticebar marquee speed={60}>
            《公安部关于修改〈公安机关办理行政案件程序规定〉的决定》已经2018年11月3日公安部部长办公会议通过，现予发布，自2019年1月1日起施行。
          </AtNoticebar>
          <View>
            <AtSearchBar
              value={searchValue}
              onChange={this.onChange}
              onActionClick={() => {
                this.onSearch(searchValue)
              }}
              onClear={this.onClear}
              placeholder='搜索行政案件程序规定'
            />
          </View>
          <View>
            <View>
              {/*{searchResult.length === 0 && this.renderOptions()}*/}
              {searchResult.length === 0 &&
              <CategoryList isReadMode={isReadMode} options={policeAdminRegulationCategoryLines} onClick={this.onClickOptionItem} />}
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
