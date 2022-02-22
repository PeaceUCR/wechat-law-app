import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Image} from '@tarojs/components'
import {AtSearchBar, AtListItem, AtIcon, AtNoticebar} from 'taro-ui'
import {isEmpty} from 'lodash';
import { Loading } from '../../components/loading/index.weapp'
import '../localLaw/index.scss'
import Loading2 from "../../components/loading2/index.weapp";
import throttle from "lodash/throttle";
import GlobalSearchItem from '../../components/globalSearchItem/index.weapp'

export default class Index extends Component {

  state = {
    criminalLawNumber: -1,
    criminalLaw: '',
    searchValue: '',
    searchResult: [],
    isLoading: false,
    isReadMode: false,
  }

  config = {
    navigationBarTitleText: '相关裁判要旨案例',
    navigationBarBackgroundColor: '#F4ECD8'
  }

  onShareAppMessage() {
    return {
      path: 'pages/caiPanGuiZe/index'
    };
  }
  componentWillMount () {
    const that = this
    const {criminalLawNumber, criminalLaw} = this.$router.params;
    this.setState({
      criminalLawNumber,
      criminalLaw
    }, () => {
      that.onSearch()
    })
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
        {searchResult.map(((complement) => {return (
          <View className='result-item' key={`complement-${complement._id}`}>
            <GlobalSearchItem
              title={`${complement.title}`}
              publishInfo={complement.publishInfo}
              text={complement.judgeRule}
              isCaiPanGuiZe
              arrow='right'
              redirect={() => {
                Taro.navigateTo({
                  url: `/pages/caiPanGuiZeDetail/index?id=${complement._id}`,
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

  onSearch = throttle(() => {
      const that = this;
      const { searchValue, criminalLawNumber} = this.state;
      console.log(criminalLawNumber)
      this.setState({isLoading: true});
      Taro.cloud.callFunction({
        name: 'searchCaiPanGuiZe',
        data: {
          searchValue,
          criminalLawNumber
        },
        complete: r => {
          console.log(r)
          if (isEmpty(r.result.data)) {
            Taro.showToast({
              title: `未找到!`,
              icon: 'none',
              duration: 2000
            })
          } else {
            Taro.showToast({
              title: `显示前200条搜索结果!`,
              icon: 'none',
              duration: 6000
            })
          }
          that.setState({searchResult: r.result.data, isLoading: false});
        }
      })
    },
    1000,
    { trailing: false })

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: [],
    });
  }

  renderLaw = () => {
    const {criminalLaw} = this.state
    return (<View className='icon-line' onClick={() => {
    }}
    >
      <View>{criminalLaw}</View>
    </View>)
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
                placeholder='搜案例名或主旨'
              />
            </View>
          </View>
          <View >
            {this.renderLaw()}
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            {isLoading && <Loading2 />}
          </View>
      </View>
    )
  }
}
