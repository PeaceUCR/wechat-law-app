import Taro, {Component} from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import {AtSearchBar, AtActivityIndicator, AtBadge, AtFab} from 'taro-ui'
import {isEmpty} from 'lodash';
import { TermSearchItem } from '../../components/termSearchItem/index.weapp'
import { LawCategory } from '../../components/lawCategory/index.weapp'
import {convertNumberToChinese} from '../../util/convertNumber'
import {setGlobalData, getGlobalData} from '../../util/global'
import clickIcon from '../../static/down.png';
import './index.scss'


export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    selected: "搜全文",
    options: ["搜全文", "搜序号", "搜条旨"],
    isReadMode: true,
    isCategoryLoading: true,
    isSearchMode: false
  }

  config = {
    navigationBarTitleText: '民法典'
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
    };
  }
  componentWillMount () {
    const that = this;
    Taro.cloud.callFunction({
      name: 'getCivilLawsCategory',
      complete: ({result}) => {
        const {civilLawIdMap, civilLawCategoryLines} = result
        setGlobalData('civilLawIdMap', civilLawIdMap)
        setGlobalData('civilLawCategoryLines', civilLawCategoryLines)
        that.setState({
          isCategoryLoading: false
        })
      }
    })

    // const setting = getStorageSync('setting');
    const setting = {isReadMode: true};
    this.setState({isReadMode: setting && setting.isReadMode})
    if (setting && setting.isReadMode) {
      console.log('read')
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#F4ECD8'
      })
    }
  }

  componentDidMount () {
  }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  renderAllCatgories = () => {
    return getGlobalData('civilLawCategoryLines')
      .map((catgoryLine, index)=> {
        return (<LawCategory catgoryLine={catgoryLine} key={`all-law-catgoryLine-${index}`} type='civil' />)
      })
  }

  renderSearchList = () => {
    const {searchResult,isReadMode, searchValue} = this.state
    return (<View>
      {searchResult.map(((term) => {return (<TermSearchItem keyword={searchValue} isReadMode={isReadMode} term={term} key={`term${term._id}`} type='civil' />)}))}
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
        console.log(isNaN(parseInt(searchValue)))
        Taro.cloud.callFunction({
          name: 'getCivilLaws',
          data: {
            searchValue: convertNumberToChinese(parseInt(searchValue)),
            type: '搜序号'
          },
          complete: (r) => {
            const res = r.result
            if (isEmpty(res.data)) {
              Taro.showToast({
                title: `未找到含有${searchValue}的法条`,
                icon: 'none',
                duration: 3000
              })
            }
            that.setState({searchResult: res.data, isLoading: false, hasSearched: true});
          }
        })
        return ;
      }

      Taro.cloud.callFunction({
        name: 'getCivilLaws',
        data: {
          searchValue: searchValue,
          type: '搜全文'
        },
        complete: (r) => {
          const res = r.result
          if (isEmpty(res.data)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的法条`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchResult: res.data, isLoading: false, hasSearched: true});
        }
      })
    }

    if (selected === '搜序号') {

      Taro.cloud.callFunction({
        name: 'getCivilLaws',
        data: {
          searchValue: convertNumberToChinese(searchValue),
          type: '搜序号'
        },
        complete: (r) => {
          const res = r.result
          if (isEmpty(res.data)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的法条`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchResult: res.data, isLoading: false, hasSearched: true});
        }
      })
    }

    if (selected === '搜条旨') {
      Taro.cloud.callFunction({
        name: 'getCivilLaws',
        data: {
          searchValue: searchValue,
          type: '搜条旨'
        },
        complete: (r) => {
          const res = r.result
          if (isEmpty(res.data)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的法条`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchResult: res.data, isLoading: false, hasSearched: true});
        }
      })
    }
  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: []
    });
  }

  onSelect = (e) => {
    const {options} = this.state;
    this.setState({
      selected: options[e.detail.value]
    })
  }

  handleChange = () => {
    const {isSearchMode} = this.state;
    this.setState({
      isSearchMode: !isSearchMode
    })
  }
  render () {
    const {searchValue, searchResult, isLoading, selected,
      options, isReadMode, isCategoryLoading,
      isSearchMode} = this.state;
    let placeholder;
    if (selected === "搜全文") {
      placeholder = "搜法条全文，如合同"
    }
    if (selected === "搜序号") {
      placeholder = "搜法条序号，比如第一条"
    }
    if (selected === "搜条旨") {
      placeholder = "搜法条要旨，比如代理的效力"
    }
    return (
      <View className={`civil-law-page ${isReadMode ? 'read-mode' : ''}`}>
          {isSearchMode && <View className='header'>
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
                placeholder={placeholder}
              />
            </View>
          </View>}
          {/*<View className='switch-line' onClick={() => {*/}
          {/*  this.handleChange()*/}
          {/*}}*/}
          {/*>*/}
          {/*  <AtSwitch title={`点我切换成${isSearchMode ? '目录模式' : '搜索模式'}`} checked={isSearchMode} />*/}
          {/*  <View className='arrow'>*/}
          {/*    <AtIcon value='arrow-right' size='40' color='#6190E8'></AtIcon>*/}
          {/*  </View>*/}
          {/*</View>*/}
          <View>
            {!isSearchMode && !isCategoryLoading && <View className='all-law-categories'>
              {this.renderAllCatgories()}
            </View>}
            {/*{searchResult.length === 0 && <View className='all-title' onClick={() => this.setState({showAllLaws: !showAllLaws})}>全部法条<AtIcon value={showAllLaws ?'chevron-up': 'chevron-down'} size='18' color='#6190E8'></AtIcon></View>}*/}
            {/*<View className='all-law-options'>*/}
            {/*  {searchResult.length === 0 && showAllLaws && this.renderAllOptions()}*/}
            {/*</View>*/}
            <View>
              {searchResult.length > 0 && isSearchMode && this.renderSearchList()}
            </View>
            {/*<View>*/}
            {/*  {searchResult.length === 0 && this.renderHistories()}*/}
            {/*</View>*/}
            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
            </View>}
            {
              isCategoryLoading && <AtActivityIndicator mode='center' color='black' content='目录加载中...' size={62}></AtActivityIndicator>
            }
          </View>
          <View className='float'>
            <AtBadge value='点我切换'>
              <AtFab onClick={this.handleChange}>
                <Text>{isSearchMode ? '目录模式':'搜索模式'}</Text>
              </AtFab>
            </AtBadge>
          </View>
      </View>
    )
  }
}
