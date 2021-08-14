import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import { AtSearchBar, AtFab, AtListItem, AtNoticebar } from 'taro-ui'
import {isEmpty, groupBy} from "lodash";
import '../litigationRegulation/index.scss'
import {otherLawNameMap} from '../../util/otherLaw'
import {convertNumberToChinese} from '../../util/convertNumber'
import Loading2 from '../../components/loading2/index.weapp'


export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: {},
    isLoading: false,
    isReadMode: false,
    law:''
  }

  config = {
    navigationBarTitleText: '法律法规全文精确搜索'
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
    const {searchValue} = this.$router.params;
    this.setState({searchValue})
    if (searchValue.trim()) {
      this.onSearch(searchValue)
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
    const {searchResult, searchValue} = this.state
    const other = groupBy(searchResult['other-law'], item => item.type)
    return (<View>
      {searchResult['terms'] && searchResult['terms'].length > 0 && <View className='type-container'>
        {searchResult['terms'].map((
          (item) => {
            return (
              <AtListItem
                key={item._id}
                title={item.text}
                note={`[刑法]  ${item.chnNumber}`}
                arrow='right'
                onClick={() => {
                  Taro.navigateTo({
                    url: `/pages/termDetail/index?id=${item._id}`,
                  })
                }}
              />
            )}))}
        <View className='more' onClick={() => {
          Taro.navigateTo({
            url: `/pages/criminalLaw/index?searchValue=${searchValue}`,
          })
        }}>去刑法搜索更多...</View>
      </View>}
      {searchResult['litigation-law'] && searchResult['litigation-law'].length > 0 && <View className='type-container'>
        {searchResult['litigation-law'].map((
          (item) => {
            return (
              <AtListItem
                key={item._id}
                title={item.text}
                note={`[刑事诉讼法]  ${item.item}`}
                arrow='right'
                onClick={() => {
                  Taro.navigateTo({
                    url: `/pages/regulationDetail/index?id=${item._id}&type=litigation-law`,
                  })
                }}
              />
            )}))}
        <View className='more' onClick={() => {
          Taro.navigateTo({
            url: `/pages/litigationLaw/index?searchValue=${searchValue}`,
          })
        }}>去刑事诉讼法搜索更多...</View>
      </View>}
      {searchResult['civil-law'] && searchResult['civil-law'].length > 0 && <View className='type-container'>
        {searchResult['civil-law'].map((
          (item) => {
            return (
              <AtListItem
                key={item._id}
                title={item.text}
                note={`[民法典]  ${item.number}`}
                arrow='right'
                onClick={() => {
                  Taro.navigateTo({
                    url: `/pages/civilLawDetail/index?id=${item._id}`,
                  })
                }}
              />
            )}))}
        <View className='more' onClick={() => {
          Taro.navigateTo({
            url: `/pages/civilLaw/index?searchValue=${searchValue}`,
          })
        }}>去民法典搜索更多...</View>
      </View>}
      {searchResult['civil-law-regulation'] && searchResult['civil-law-regulation'].length > 0 && <View className='type-container'>
        {searchResult['civil-law-regulation'].map((
          (item) => {
            return (
              <AtListItem
                key={item._id}
                title={item.text}
                note={`[民事诉讼法]  ${item.number}`}
                arrow='right'
                onClick={() => {
                  Taro.navigateTo({
                    url: `/pages/regulationDetail/index?id=${item._id}&type=civil-law-regulation`,
                  })
                }}
              />
            )}))}
        <View className='more' onClick={() => {
          Taro.navigateTo({
            url: `/pages/civilLawRegulation/index?searchValue=${searchValue}`,
          })
        }}>去民事诉诉法搜索更多...</View>
      </View>}
      {searchResult['other-law'] && searchResult['other-law'].length > 0 && <View>
        {Object.keys(other).map(k => <View key={k} className='type-container'>
          {other[k].map((
            (item) => {
              return (
                <AtListItem
                  key={item._id}
                  title={item.text}
                  note={`[${otherLawNameMap[item.type]}]  ${convertNumberToChinese(item.number)}`}
                  arrow='right'
                  onClick={() => {
                    Taro.navigateTo({
                      url: `/pages/regulationDetail/index?id=${item._id}&type=${item.type}`,
                    })
                  }}
                />
              )}))}
          <View className='more' onClick={() => {
            Taro.navigateTo({
              url: `/pages/otherLaw/index?law=${k}&searchValue=${searchValue}`,
            })
          }}>{`去${otherLawNameMap[k]}搜索更多...`}</View>
        </View>)}
      </View>}
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
      name: 'globalSearch',
      data: {
        searchValue: searchValue
      },
      complete: (r) => {
        console.log(r.result.results)
        const result = {}
        r.result.results.forEach(item => {
          result[item.type] = item.data
        })
        that.setState({searchResult: result, isLoading: false})
        // that.handleDBSearchSuccess(r.result)
      }
    })
  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: []
    });
  }

  render () {
    const {searchValue, searchResult, isLoading, isReadMode, law} = this.state;
    return (
      <View className={`litigation-regulation-page global-search ${isReadMode ? 'read-mode' : ''}`}>
        <AtNoticebar marquee speed={60}>
          此为精确搜索(非模糊搜索),结果暂时根据序号排序！
        </AtNoticebar>
        <View>
            <AtSearchBar
              value={searchValue}
              onChange={this.onChange}
              onActionClick={() => {
                this.onSearch(searchValue)
              }}
              onClear={this.onClear}
              placeholder='法律法规全文精确搜索'
            />
          </View>
          <View>
            <View>
              {this.renderSearchList()}
            </View>
            {isLoading && <Loading2 />}
            {searchResult.length > 0 && <AtFab className='float' onClick={() => this.reset()}>
              <Text>重置</Text>
            </AtFab>}
          </View>
      </View>
    )
  }
}
