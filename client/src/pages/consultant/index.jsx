import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import {AtSearchBar, AtListItem, AtBadge, AtIcon, AtNoticebar} from 'taro-ui'
import {isEmpty} from 'lodash';
import clickIcon from '../../static/down.png';
import { Loading } from '../../components/loading/index.weapp'
import { targetImageSource } from '../../util/util'
import './index.scss'

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    selected: '搜全文',
    options: ['搜全文', '搜案例名', '搜案例号'],
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '刑事审判参考搜索'
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
    this.setState({isLoading: true});
    const { searchValue, selected } = this.state;
    if(!searchValue.trim()) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }

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
            console.log(r.result.result.data)
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
    const {searchValue, searchResult, isLoading, selected, options, isReadMode} = this.state;
    return (
      <View className={`example-page ${isReadMode ? 'read-mode' : ''}`}>
        <AtNoticebar marquee speed={60}>
          刑事审判参考1-1353号案例已补全
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
                onClear={this.onClear}
                placeholder={selected === '搜案例号' ? '123' : '诈骗'}
              />
            </View>
          </View>
          <View>
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            {isLoading && <Loading />}
            <View className='float-help' onClick={() => {
              Taro.navigateTo({
                url: '/pages/other/index?id=consultant'
              })
            }}
            >
              <AtBadge value='帮助'>
                <AtIcon value='help' size='30' color='#000'></AtIcon>
              </AtBadge>
            </View>
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
