import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import {AtSearchBar, AtListItem, AtBadge, AtButton, AtNoticebar, AtFab, AtIndexes} from 'taro-ui'
import {isEmpty} from 'lodash';
import clickIcon from '../../static/down.png';
import Loading2 from "../../components/loading2/index.weapp";
import { targetImageSource } from '../../util/util'
import './index.scss'
import throttle from "lodash/throttle";

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    selected: '搜全文',
    options: ['搜全文', '搜案例名', '搜案例号'],
    isReadMode: false,
    categoryList: [],
    type: 'most-recent'
  }

  config = {
    navigationBarTitleText: '刑事审判参考搜索'
  }

  onShareAppMessage() {
    const {categoryList} = this.state
    return {
      path: `pages/consultant/index?isCategory=${categoryList.length > 0 ? 'true' : 'false'}`
    };
  }

  componentWillMount () {
    const {isCategory} = this.$router.params;
    if (isCategory === 'true') {
      this.loadCategory()
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

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  loadCategory = throttle(() => {
    console.log('load')
    this.setState({
      isLoading: true
    })
    const that = this;
    Taro.cloud.callFunction({
      name: 'getConsultsCategory',
      data: {
        type: that.state.type
      },
      complete: ({result}) => {

        const {categoryList} = result
        categoryList.forEach(c => c.title = `第${c.key}辑 ${c.title ? c.title:''}`)

        this.setState({
          categoryList,
          isLoading: false
        })
      }
    })
  }, 6000, { trailing: false })

  loadAll = () => {
    this.setState({type: ''},() => {
      this.loadCategory()
      Taro.pageScrollTo({
        scrollTop: 0,
        duration: 0
      })
    })
  }
  renderCategoryList = () => {
    const {categoryList, type} = this.state
    return (<View style='height:100vh'>
      <AtIndexes
        list={categoryList}
        onScrollIntoView={fn => { this.scrollIntoView = fn }}
        onClick={(item) => {
          Taro.navigateTo({
            url: `/pages/exampleDetail/index?type=consultant&id=${item._id}`,
          })
        }}
      >
        <View className='category-divider'>刑事审判参考全目录</View>
      </AtIndexes>
      {type === 'most-recent' && <AtButton type='primary' onClick={() => this.loadAll()}>加载更多</AtButton>}
    </View>)
  }

  renderSearchList = () => {
    const {searchResult, searchValue} = this.state
    return (<View>
      <View>
        {searchResult.map(((example) => {return (
          <View className='result-item' key={`example-${example._id}`}>
            <Image
              src={targetImageSource}
              className={example.exactMatch ? 'exact-match': 'exact-match-hide'}
              mode='widthFix'
            />
            <AtListItem
              title={`[第${example.number}号]${example.name}`}
              arrow='right'
              onClick={() => {
                Taro.navigateTo({
                  url: `/pages/exampleDetail/index?type=consultant&id=${example._id}&keyword=${searchValue}`,
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
    const { searchValue, selected } = this.state;
    if(!searchValue.trim()) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }
    this.setState({isLoading: true});
    if (selected === '搜全文') {

      if (!isNaN(parseInt(searchValue))) {

        Taro.cloud.callFunction({
          name: 'getConsults',
          data: {
            type: 'number',
            number: searchValue
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

        return ;
      }

      Taro.cloud.callFunction({
        name: 'getConsults',
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
          console.log(r)
          that.setState({searchResult: [...r.result.result.data], isLoading: false});
        }
      })
    }

    if (selected === '搜案例名') {
      Taro.cloud.callFunction({
        name: 'getConsults',
        data: {
          type: 'name',
          name: searchValue
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

    if (selected === '搜案例号') {
      Taro.cloud.callFunction({
        name: 'getConsults',
        data: {
          type: 'number',
          number: searchValue
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
  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: [],
    });
  }

  onSelect = (e) => {
    const {options} = this.state;
    this.setState({
      selected: options[e.detail.value],
      searchResult: []
    })
  }

  render () {
    const {searchValue, searchResult, isLoading, selected, options, isReadMode, categoryList} = this.state;
    return (
      <View className={`example-page page ${isReadMode ? 'read-mode' : ''}`}>
        <AtNoticebar marquee speed={60}>
          刑事审判参考1-1464号案例已补全
        </AtNoticebar>
          <View className='header'>
            <View className='select'>
              <View>
                <Picker mode='selector' mode='selector' range={options} onChange={this.onSelect}>
                  <Text>{selected}</Text>
                </Picker>
              </View>
              <Image src={clickIcon} className='icon-click' />
            </View>
            <View className='search'>
              <AtSearchBar
                value={searchValue}
                onChange={this.onChange}
                onActionClick={() => this.onSearch(0)}
                onBlur={() => this.onSearch(0)}
                onClear={this.onClear}
                placeholder={selected === '搜案例号' ? '123' : '案由/案例号'}
              />
            </View>
          </View>
          <View>
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            <View>
              {!searchValue && searchResult.length === 0 && categoryList.length > 0 && this.renderCategoryList()}
            </View>
            {isLoading && <Loading2 />}
          </View>
          <Image
            src={targetImageSource}
            className='exact-match-hide'
            mode='widthFix'
          />
          <AtFab className='float-category' onClick={() => this.loadCategory()}>
            <Text>目录</Text>
          </AtFab>
      </View>
    )
  }
}
