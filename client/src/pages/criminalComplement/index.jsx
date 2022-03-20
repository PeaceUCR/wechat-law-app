import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Image} from '@tarojs/components'
import {AtSearchBar, AtListItem} from 'taro-ui'
import {isEmpty} from 'lodash';
import Loading2 from '../../components/loading2/index.weapp'
import { targetImageSource } from '../../util/util'
import './index.scss'
import moment from "moment";

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '刑法相关解释、规定'
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

    const {searchValue} = this.$router.params;
    if (searchValue && searchValue.trim()) {
      this.setState({
        searchValue
      }, () => {
        this.onSearch()
      });
    } else {
      const that = this
      this.setState({isLoading: true});
      Taro.cloud.callFunction({
        name: 'searchCriminalComplement',
        data: {
          type: 'all-initial'
        },
        complete: r => {
          console.log(r)
          that.setState({searchResult: [...r.result.data], isLoading: false});
          Taro.showToast({
            title: `加载20篇最近添加的法规`,
            icon: 'none',
            duration: 4000
          })
        }
      })
    }

  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  renderSearchList = () => {
    const {searchResult, searchValue} = this.state
    return (<View>
      <View>
        {searchResult.map(((complement) => {return (
          <View className='result-item' key={`complement-${complement._id}`}>
            <Image
              src={targetImageSource}
              className={complement.exactMatch ? 'exact-match': 'exact-match-hide'}
              mode='widthFix'
            />
            <AtListItem
              title={`${complement.title}`}
              note={complement.effectiveDate ? moment(complement.effectiveDate).format('YYYY-MM-DD') : ''}
              arrow='right'
              onClick={() => {
                if (complement.link) {
                  Taro.navigateTo({
                    url: complement.link,
                  })
                  return ;
                }
                Taro.navigateTo({
                  url: `/pages/exampleDetail/index?type=complement&id=${complement._id}&keyword=${searchValue}`,
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
    const { searchValue } = this.state;
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
      name: 'searchCriminalComplement',
      data: {
        type: 'all',
        searchValue: searchValue
      },
      complete: r => {
        if (isEmpty(r.result.result.data)) {
          Taro.showToast({
            title: `未找到含有${searchValue}的案例`,
            icon: 'none',
            duration: 3000
          })
        }
        that.setState({searchResult: [...r.result.result.data], isLoading: false});
      }
    })
  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: [],
    });
  }

  render () {
    const {searchValue, searchResult, isLoading, isReadMode} = this.state;
    return (
      <View className={`example-page page ${isReadMode ? 'read-mode' : ''}`}>
          <View className='header'>
            <View className='search'>
              <AtSearchBar
                value={searchValue}
                onChange={this.onChange}
                onActionClick={() => this.onSearch(0)}
                onBlur={() => this.onSearch(0)}
                onClear={this.onClear}
                placeholder='全文搜索'
              />
            </View>
          </View>
          <View>
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            {isLoading && <Loading2 />}
          </View>

          <Image
            src={targetImageSource}
            className='exact-match-hide'
            mode='widthFix'
          />
      </View>
    )
  }
}
