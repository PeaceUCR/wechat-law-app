import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Button,Image, Swiper, SwiperItem} from '@tarojs/components'
import { AtSearchBar, AtNoticebar, AtModal,AtModalHeader, AtModalContent,AtModalAction, AtRadio,AtDivider } from 'taro-ui'
import {isEmpty, groupBy} from "lodash";
import '../litigationRegulation/index.scss'
import Loading2 from '../../components/loading2/index.weapp'
import GlobalSearchItem from '../../components/globalSearchItem/index.weapp'
import {getValidArray} from "../../util/util";
import {searchHomePageOptions} from '../../util/name'
import {GridItem} from "../../components/grid/index.weapp";

export default class Index extends Component {
  state = {
    searchValue: '',
    searchResult: {},
    isLoading: false,
    isReadMode: false,
    showSetting: true,
    mode: ''
  }

  config = {
    navigationBarTitleText: '法律法规标题搜索'
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
    if (searchValue) {
      this.setState({searchValue})
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

  renderHomeOptionSearchList = () => {
    const {searchValue} = this.state;
    const homeOptions = searchHomePageOptions(searchValue)
    return (<View className='home-options'>
      {homeOptions.length > 0 && <AtDivider content={`匹配${searchValue}模块`} fontColor='#333' />}
      {homeOptions.length > 0 && homeOptions.map((option, i )=> {
        return (<View className='grid-container' key={`grid-${i}`}>
          <GridItem option={option} disabled={false} keyword={searchValue} />
        </View>)
      })}
    </View>)
  }

  renderSearchList = () => {
    const {searchResult, searchValue, mode} = this.state
    return (<View>
      {searchResult['terms'] && searchResult['terms'].length > 0 && <View className='type-container'>
        <View className='type-result-title'>
          <Text className='title'>刑法</Text>
        </View>
        {getValidArray(searchResult['terms']).map((
          (item) => {
            return (
              <GlobalSearchItem
                key={item._id}
                text={item.text}
                type='刑法'
                number={item.chnNumber}
                redirect={() => {
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
      {searchResult['civil-law'] && searchResult['civil-law'].length > 0 && <View className='type-container'>
        <View className='type-result-title'>
          <Text className='title'>民法典</Text>
        </View>
        {getValidArray(searchResult['civil-law']).map((
          (item) => {
            return (
              <GlobalSearchItem
                key={item._id}
                text={item.text}
                type='民法典'
                number={item.number}
                redirect={() => {
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
      {mode !== 'faxin' && <View>
        <View className='type-container'>
          <View className='type-result-title'>
            <Text className='title'>其他刑事法规</Text>
          </View>
          {getValidArray(searchResult['complement']).map((
            (item) => {
              return (
                <GlobalSearchItem
                  key={item._id}
                  text={item.text}
                  title={item.title}
                  type='刑事'
                  number={item.number}
                  redirect={() => {
                    if (item.link) {
                      Taro.navigateTo({
                        url: item.link,
                      })
                      return;
                    }
                    Taro.navigateTo({
                      url: `/pages/exampleDetail/index?id=${item._id}&type=complement`,
                    })
                  }}
                />
              )}))}
          <View className='more' onClick={() => {
            Taro.navigateTo({
              url: `/pages/criminalComplement/index?searchValue=${searchValue}`,
            })
          }}>去其他刑事法规搜索更多...</View>
        </View>
        <View className='type-container'>
          <View className='type-result-title'>
            <Text className='title'>其他民事法规</Text>
          </View>
          {getValidArray(searchResult['civil-law-explaination']).map((
            (item) => {
              return (
                <GlobalSearchItem
                  key={item._id}
                  text={item.text}
                  title={item.title}
                  type='民事'
                  number={item.number}
                  redirect={() => {
                    Taro.navigateTo({
                      url: `/pages/exampleDetail/index?id=${item._id}&type=civil-law-explaination`,
                    })
                  }}
                />
              )}))}
          <View className='more' onClick={() => {
            Taro.navigateTo({
              url: `/pages/civilLawExplaination/index?searchValue=${searchValue}`,
            })
          }}>去其他民事法规搜索更多...</View>
        </View>
        <View className='type-container'>
          <View className='type-result-title'>
            <Text className='title'>行政法规</Text>
          </View>
          {getValidArray(searchResult['admin-explanation']).map((
            (item) => {
              return (
                <GlobalSearchItem
                  key={item._id}
                  text={item.text}
                  title={item.title}
                  type='行政'
                  number={item.number}
                  redirect={() => {
                    Taro.navigateTo({
                      url: `/pages/exampleDetail/index?id=${item._id}&type=admin-explanation`,
                    })
                  }}
                />
              )}))}
          <View className='more' onClick={() => {
            Taro.navigateTo({
              url: `/pages/adminComplement/index?searchValue=${searchValue}`,
            })
          }}>去行政法规搜索更多...</View>
        </View>
      </View>}
      {searchResult['faxin-law'] && searchResult['faxin-law'].length > 0 && <View className='type-container'>
        <View className='type-result-title'>
          <Text className='title'>其他</Text>
        </View>
        {getValidArray(searchResult['faxin-law']).map((
          (item) => {
            return (
              <GlobalSearchItem
                key={item._id}
                text={item.text}
                title={item.title}
                type={item.type ? item.type:'其他'}
                number={item.number}
                publishInfo={item.publishInfo}
                redirect={() => {
                  Taro.navigateTo({
                    url: `/pages/exampleDetail/index?id=${item._id}&type=faxin-law-detail`,
                  })
                }}
              />
            )}))}
        {mode !== 'faxin' && <View className='more' onClick={() => {
          this.setState({
            mode: 'faxin'
          }, () => {
            this.onSearch(searchValue)
          })
        }}>其他搜索更多...</View>}
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

    if(!searchValue.trim()) {
      console.log('123')
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }
    this.setState({isLoading: true});

    const {mode} = that.state
    Taro.cloud.callFunction({
      name: 'globalSearchPlus',
      data: {
        searchValue: searchValue,
        mode
      },
      complete: (r) => {
        console.log(r)
        const result = {}
        r.result.results.forEach(item => {
          result[item.type] = item.data
        })
        that.setState({searchResult: result, isLoading: false})
        // that.handleDBSearchSuccess(r.result)
      }
    })
  }

  handleOpen = () => {
    this.setState({
      showSetting: true
    });
  }

  render () {
    const {searchValue, isLoading, isReadMode, showSetting} = this.state;
    return (
      <View className={`litigation-regulation-page page global-search ${isReadMode ? 'read-mode' : ''}`}>
        <AtNoticebar marquee speed={60}>
          此为标题搜索且只显示部分结果,麻烦去具体模块搜索更多！
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
              placeholder='法律法规全文精确搜索'
            />
          </View>
          <View>
            <View>
              {this.renderHomeOptionSearchList()}
              {this.renderSearchList()}
            </View>
            {isLoading && <Loading2 />}

          </View>
        {!isLoading && <View className='no-more'>
          <AtDivider content='没有更多了' fontColor='#333' />
          <View>也可以去单独的模块进行更精确的搜索😊</View>
        </View>}
        {!isLoading && !showSetting && <Swiper className='video-container'>
          <SwiperItem >
            <ad unit-id="adunit-aa47163462e4442f" ad-type="video" ad-theme="white"></ad>
          </SwiperItem>
        </Swiper>}
      </View>
    )
  }
}
