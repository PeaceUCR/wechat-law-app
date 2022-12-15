import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import { AtSearchBar, AtActivityIndicator, AtNoticebar, AtFab } from 'taro-ui'
import {isEmpty} from "lodash";
import { db } from '../../util/db'
import { LitigationSearchItem } from '../../components/litigationSearchItem/index.weapp'
import { HierarchicalOptions } from '../../components/hierarchicalOptions/index.weapp'
import {convertNumberToChinese, getNumber} from '../../util/convertNumber'
import './index.scss'
import {getConfiguration, processLitigationOptions} from '../../util/util';

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    litigationRegulationChapters: [],
    litigationRegulationSections: [],
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '(最高检)刑事诉讼规则搜索'
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
    const {searchValue} = this.$router.params;
    if (searchValue && searchValue.trim()) {
      this.setState({
        searchValue
      }, () => {
        this.onSearch(searchValue)
      });
    }

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
    getConfiguration().then((res) => {
      that.setState({
        litigationRegulationChapters: res.data[0].litigationRegulationChapters,
        litigationRegulationSections: res.data[0].litigationRegulationSections,
        isLoading: false});
    });

    // db.collection('configuration').where({}).get({
    //   success: (res) => {
    //     that.setState({
    //       litigationRegulationChapters: res.data[0].litigationRegulationChapters,
    //       litigationRegulationSections: res.data[0].litigationRegulationSections,
    //       isLoading: false});
    //   }
    // });
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

  onClickOptionItem = (category, searchValue) => {
    if (category === "chapter") {
      this.onSearchByChapter(searchValue);
    } else {
      this.onSearchBySection(searchValue);
    }
  }

  renderOptions = () => {
    const {litigationRegulationChapters, litigationRegulationSections} = this.state;
    const that = this;
    return (<View className='options'>
      <View className='sub-options'>{litigationRegulationChapters && litigationRegulationChapters.length > 0 &&
      litigationRegulationChapters.map((c, index) => {
        return (<View className='crime-option option' key={`crime-option-${index}`} onClick={() => that.onClickOptionItem("chapter", c)}>
          {c}
        </View>)})}</View>
      <View className='sub-options'>{litigationRegulationSections && litigationRegulationSections.length >0 &&
      litigationRegulationSections.map((s, index) => {
        return (<View className='term-option option' key={`term-option-${index}`} onClick={() => that.onClickOptionItem("section", s)}>
          {s}
        </View>)})}</View>
    </View>)
  }

  onSearchResultClick = (data) => {
    const {_id} = data
    Taro.navigateTo({
      url: `/pages/regulationDetail/index?id=${_id}&type=litigation-regulation`,
    })
  }

  render () {
    const {searchValue, searchResult, isLoading, litigationRegulationChapters, litigationRegulationSections, isReadMode} = this.state;
    return (
      <View className={`litigation-regulation-page ${isReadMode ? 'read-mode' : ''}`}>
          <AtNoticebar marquee speed={60}>
            最高检公告:《人民检察院刑事诉讼规则》已经2019年12月2日最高检第十三届检察委员会第二十八次会议通过，现予公布，自2019年12月30日起施行。
          </AtNoticebar>
          <View>
            <AtSearchBar
              value={searchValue}
              onChange={this.onChange}
              onActionClick={() => {
                this.onSearch(searchValue)
              }}
              onClear={this.onClear}
              placeholder='搜索刑事诉讼规则'
            />
          </View>
          <View>
            <View>
              {/*{searchResult.length === 0 && this.renderOptions()}*/}
              {searchResult.length === 0 &&
              <HierarchicalOptions isReadMode={isReadMode} options={processLitigationOptions(litigationRegulationChapters, litigationRegulationSections)} onClick={this.onClickOptionItem} />}
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
