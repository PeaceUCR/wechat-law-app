import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import { AtSearchBar, AtActivityIndicator, AtFab, AtBadge, AtIcon, AtListItem } from 'taro-ui'
import {isEmpty} from 'lodash';
import {
  invalidCourtExample, targetImageSource, getExampleSearchTag
} from '../../util/util'
import './index.scss'

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    isExpandLabel: false,
    isReadMode: false,
    procuratorateMap: {},
    procuratorateExampleTitleMap: {},
    courtMap: {},
    courtExampleTitleMap: {}
  }

  config = {
    navigationBarTitleText: '指导/典型/公报案例搜索'
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
    };
  }

  componentWillMount () {
    const that = this;
    const setting = getStorageSync('setting');
    this.setState({isReadMode: setting && setting.isReadMode})
    if (setting && setting.isReadMode) {
      console.log('read')
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#F4ECD8'
      })
    }

    Taro.showLoading({
      title: '目录加载中',
    })
    Taro.cloud.callFunction({
      name: 'getExamples',
      complete: r => {
        const {result} = r;
        const {courtExamples, procuratorateExamples} = result;
        const procuratorateMap = {}
        const procuratorateExampleTitleMap = {}
        const courtMap = {}
        const courtExampleTitleMap = {}

        const regex = new RegExp('指导案例.{1,3}号', 'g')

        procuratorateExamples.forEach(e => {
          procuratorateMap[e.number] = e._id
          procuratorateExampleTitleMap[e._id] = e.name
        })
        courtExamples.forEach(e => {
          courtMap[e.number] = e._id
          courtExampleTitleMap[e._id] = e.title.replace(regex,'').replace('：','').replace(':','')
        })
        that.setState({
          procuratorateMap,
          procuratorateExampleTitleMap,
          courtMap,
          courtExampleTitleMap
        })

        Taro.hideLoading()
      }
    })
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  onChange = (searchValue) => {
    this.setState({searchValue})
  }

  onSearch = () => {
    const that = this;
    this.setState({isLoading: true});
    const { searchValue } = this.state;
    if(!searchValue.trim()) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }
    Taro.cloud.callFunction({
      name: 'searchAllExamples',
      data: {
        searchValue: searchValue
      },
      complete: ({result}) => {
        console.log(result)
        const {searchResult} = result
        if (isEmpty(searchResult)) {
          Taro.showToast({
            title: `未找到含有${searchValue}的案例`,
            icon: 'none',
            duration: 3000
          })
        }
        that.setState({searchResult, isLoading: false});
        // const {searchCourtResult, searchProcuratorateResult} = result
        // if (isEmpty(searchCourtResult) || isEmpty(searchProcuratorateResult)) {
        //   Taro.showToast({
        //     title: `未找到含有${searchValue}的案例`,
        //     icon: 'none',
        //     duration: 3000
        //   })
        // }
        // that.setState({searchCourtResult, searchProcuratorateResult, isLoading: false});
      }
    })

  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: []
    });
  }

  onRedirect = (id, type) => {
    Taro.navigateTo({
      url: `/pages/exampleDetail/index?type=${type}&id=${id}`,
    })
  }

  renderOptionList = () => {
    const {
      isExpandLabel,
      procuratorateMap,
      procuratorateExampleTitleMap,
      courtMap,
      courtExampleTitleMap
    } = this.state;
    return (<View>
      <View className='title'>最高检指导案例：</View>
      <View className='options'>
        {Object.keys(procuratorateMap)
        .map((number, index )=>
        {return (<Text className={`procuratorate-option option ${isExpandLabel ? 'expand': ''}`} key={`procuratorate-option-${index}`} onClick={() => {this.onRedirect(procuratorateMap[number], 'procuratorate')}}>{isExpandLabel ? procuratorateExampleTitleMap[procuratorateMap[number]] : number}</Text>)})}
      </View>
      <View className='title'>最高法指导案例：</View>
      <View className='options'>
        {Object.keys(courtMap)
          .map((number, index )=>
          {return (<Text className={`court-option option ${invalidCourtExample.has(number) ? 'out-dated' : ''} ${isExpandLabel ? 'expand': ''}`} key={`court-option-${index}`} onClick={() => {this.onRedirect(courtMap[number], 'court')}}>{isExpandLabel ? courtExampleTitleMap[courtMap[number]] : number}</Text>)})}
      </View>
    </View>)
  }

  renderSearchList = () => {
    const {searchResult,searchValue} = this.state
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
              title={`${example.title}`}
              note={getExampleSearchTag(example)}
              arrow='right'
              onClick={() => {
                Taro.navigateTo({
                  url: `/pages/exampleDetail/index?type=court-open&id=${example._id}&keyword=${searchValue}`,
                })
              }}
            />
          </View>

        )}))}
      </View>
    </View>)
  }

  render () {
    const {searchValue, searchResult, isLoading, isExpandLabel, isReadMode} = this.state;
    return (
      <View className={`example-page ${isReadMode ? 'read-mode' : ''}`}>
          <View className='header'>
            <View>
              <AtSearchBar
                value={searchValue}
                onChange={this.onChange}
                onActionClick={this.onSearch}
                onClear={this.onClear}
                placeholder='案例全文搜索'
              />
            </View>
          </View>
          <View>
            <View>
              {searchResult.length === 0 && searchResult.length ===0 && this.renderOptionList()}
            </View>
            <View>
              {(searchResult.length > 0 || searchResult.length > 0) && this.renderSearchList()}
            </View>
            {searchResult.length === 0 && <AtFab className='float' onClick={() => this.setState({isExpandLabel: !isExpandLabel})}>
              <Text>{`${isExpandLabel ? '收缩' : '展开'}`}</Text>
            </AtFab>}
            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
            </View>}
          </View>
      </View>
    )
  }
}
