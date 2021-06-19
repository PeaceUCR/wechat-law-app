import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import { AtSearchBar, AtActivityIndicator, AtFab, AtBadge, AtIcon } from 'taro-ui'
import {isEmpty} from 'lodash';
import { db } from '../../util/db'
import {
  invalidCourtExample
} from '../../util/util'
import { ExampleSearchItem } from '../../components/exampleSearchItem/index.weapp'
import {convertNumberToChinese} from '../../util/convertNumber'
import clickIcon from '../../static/down.png';
import './index.scss'

export default class Index extends Component {

  state = {
    searchValue: '',
    searchCourtResult: [],
    searchProcuratorateResult: [],
    isLoading: false,
    isExpandLabel: false,
    selected: '搜全文',
    options: ['搜全文', '搜关键字', '搜案例名', '搜相关法条'],
    isReadMode: false,
    procuratorateMap: {},
    procuratorateExampleTitleMap: {},
    courtMap: {},
    courtExampleTitleMap: {}
  }

  config = {
    navigationBarTitleText: '指导案例搜索'
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
        procuratorateExamples.forEach(e => {
          procuratorateMap[e.number] = e._id
          procuratorateExampleTitleMap[e._id] = `(检例第${e.number}号)${e.name}`
        })
        courtExamples.forEach(e => {
          courtMap[e.number] = e._id
          courtExampleTitleMap[e._id] = e.title
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

  renderSearchList = () => {
    const {searchValue, searchCourtResult, searchProcuratorateResult, isReadMode} = this.state
    return (<View>
      <View>
        {searchCourtResult.map(((example) => {return (<ExampleSearchItem isReadMode={isReadMode} example={example} type='court' searchValue={searchValue} key={`example-${example._id}`} />)}))}
      </View>
      <View>
        {searchProcuratorateResult.map(((example) => {return (<ExampleSearchItem isReadMode={isReadMode} example={example} type='procuratorate' searchValue={searchValue} key={`example-${example._id}`} />)}))}
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
      Taro.cloud.callFunction({
        name: 'searchExamples',
        data: {
          searchValue: searchValue
        },
        complete: ({result}) => {
          const {searchCourtResult, searchProcuratorateResult} = result
          if (isEmpty(searchCourtResult) || isEmpty(searchProcuratorateResult)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的指导案例`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchCourtResult, searchProcuratorateResult, isLoading: false});
        }
      })
    }


    if (selected === '搜案例名') {
      db.collection('court-examples').where({title: db.RegExp({
          regexp: '.*' + searchValue,
          options: 'i',
        })}).orderBy('number', 'asc').get({
        success: (res) => {
          if (isEmpty(res.data)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的法院指导案例`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchCourtResult: res.data, isLoading: false});
        }
      });

      db.collection('procuratorate-examples').where({name: db.RegExp({
          regexp: '.*' + searchValue,
          options: 'i',
        })}).orderBy('number', 'asc').get({
        success: (res) => {
          if (isEmpty(res.data)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的检察院指导案例`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchProcuratorateResult: res.data, isLoading: false});
        }
      });
    }

    if (selected === '搜关键字') {
      db.collection('court-examples').where({keyword: db.RegExp({
          regexp: '.*' + searchValue,
          options: 'i',
        })}).orderBy('number', 'asc').get({
        success: (res) => {
          if (isEmpty(res.data)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的法院指导案例`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchCourtResult: res.data, isLoading: false});
        }
      });

      db.collection('procuratorate-examples').where({keyword: db.RegExp({
          regexp: '.*' + searchValue,
          options: 'i',
        })}).orderBy('number', 'asc').get({
        success: (res) => {
          if (isEmpty(res.data)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的检察院指导案例`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchProcuratorateResult: res.data, isLoading: false});
        }
      });
    }

    if (selected === '搜相关法条') {
      db.collection('court-examples').where({terms: db.RegExp({
          regexp: '.*' + convertNumberToChinese(searchValue),
          options: 'i',
        })}).orderBy('number', 'asc').get({
        success: (res) => {
          if (isEmpty(res.data)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的法院指导案例`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchCourtResult: res.data, isLoading: false});
        }
      });

      db.collection('procuratorate-examples').where({terms: db.RegExp({
          regexp: '.*' + convertNumberToChinese(searchValue),
          options: 'i',
        })}).orderBy('number', 'asc').get({
        success: (res) => {
          if (isEmpty(res.data)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的检察院指导案例`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchProcuratorateResult: res.data, isLoading: false});
        }
      });
    }
  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchCourtResult: [],
      searchProcuratorateResult: []
    });
  }

  onSelect = (e) => {
    const {options} = this.state;
    this.setState({
      selected: options[e.detail.value]
    })
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
      <View className='title'>检察院指导案例：</View>
      <View className='options'>
        {Object.keys(procuratorateMap)
        .map((number, index )=>
        {return (<Text className={`procuratorate-option option ${isExpandLabel ? 'expand': ''}`} key={`procuratorate-option-${index}`} onClick={() => {this.onRedirect(procuratorateMap[number], 'procuratorate')}}>{isExpandLabel ? procuratorateExampleTitleMap[procuratorateMap[number]] : number}</Text>)})}
      </View>
      <View className='title'>法院指导案例：</View>
      <View className='options'>
        {Object.keys(courtMap)
          .map((number, index )=>
          {return (<Text className={`court-option option ${invalidCourtExample.has(number) ? 'out-dated' : ''} ${isExpandLabel ? 'expand': ''}`} key={`court-option-${index}`} onClick={() => {this.onRedirect(courtMap[number], 'court')}}>{isExpandLabel ? courtExampleTitleMap[courtMap[number]] : number}</Text>)})}
      </View>
    </View>)
  }

  render () {
    const {searchValue, searchCourtResult, searchProcuratorateResult, isLoading, selected, options, isExpandLabel, isReadMode} = this.state;
    return (
      <View className={`example-page ${isReadMode ? 'read-mode' : ''}`}>
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
                onActionClick={this.onSearch}
                onClear={this.onClear}
                placeholder='搜法院检察院指导案例'
              />
            </View>
          </View>
          <View>
            <View>
              {searchCourtResult.length === 0 && searchProcuratorateResult.length ===0 && this.renderOptionList()}
            </View>
            <View>
              {(searchCourtResult.length > 0 || searchProcuratorateResult.length > 0) && this.renderSearchList()}
            </View>
            {searchCourtResult.length === 0 && searchProcuratorateResult.length ===0 && <AtFab className='float' onClick={() => this.setState({isExpandLabel: !isExpandLabel})}>
              <Text>{`${isExpandLabel ? '收缩' : '展开'}`}</Text>
            </AtFab>}
            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
            </View>}
          </View>
          <View className='float-help' onClick={() => {
            Taro.navigateTo({
              url: '/pages/other/index?id=examples'
            })
          }}
          >
            <AtBadge value='帮助'>
              <AtIcon value='help' size='30' color='#000'></AtIcon>
            </AtBadge>
          </View>
      </View>
    )
  }
}
