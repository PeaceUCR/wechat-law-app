import Taro, {Component,getStorageSync } from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import {AtSearchBar, AtActivityIndicator, AtBadge, AtIcon, AtSwitch} from 'taro-ui'
import {isEmpty} from 'lodash';
import { db } from '../../util/db'
import { TermSearchItem } from '../../components/termSearchItem/index.weapp'
import { LawCategory } from '../../components/lawCategory/index.weapp'
import {convertNumberToChinese} from '../../util/convertNumber'
import {civilLawCategoryLines} from '../../util/util'
import clickIcon from '../../static/down.png';
import './index.scss'


export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    selected: "搜全文",
    options: ["搜全文", "搜序号", "搜条旨"],
    showAllCategories: true,
    isReadMode: false,
    civilLawLines: [],
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

  componentDidMount () {
    const that = this;
    that.setState({
      civilLawLines: civilLawCategoryLines,
      isCategoryLoading: false
    })
  }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  renderAllCatgories = () => {
    const {civilLawLines} = this.state
    return civilLawLines
      .map((catgoryLine, index)=> {
        return (<LawCategory catgoryLine={catgoryLine} key={`all-law-catgoryLine-${index}`} type='civil' />)
      })
  }

  renderSearchList = () => {
    const {searchResult,isReadMode} = this.state
    return (<View>
      {searchResult.map(((term) => {return (<TermSearchItem isReadMode={isReadMode} term={term} key={`term${term._id}`} type='civil' />)}))}
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
      db.collection('civil-law').where({text: db.RegExp({
          regexp: '.*' + searchValue,
          options: 'i',
        })}).get({
        success: (res) => {
          if (isEmpty(res.data)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的法条`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchResult: res.data, isLoading: false, hasSearched: true});
        }
      });
    }

    if (selected === '搜序号') {
      db.collection('civil-law').where({number: db.RegExp({
          regexp: '.*' + convertNumberToChinese(searchValue),
          options: 'i',
        })}).get({
        success: (res) => {
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
      db.collection('civil-law').where({tag: db.RegExp({
          regexp: '.*' + searchValue,
          options: 'i',
        })}).get({
        success: (res) => {
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
      options, showAllCategories, isReadMode, isCategoryLoading,
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
          <View className='switch-line' onClick={() => {
            this.handleChange()
          }}>
            <AtSwitch title={`点我切换成${isSearchMode ? '目录模式' : '搜索模式'}`} checked={isSearchMode} />
            <View className='arrow'>
              <AtIcon value='arrow-right' size='40' color='#6190E8'></AtIcon>
            </View>
          </View>
          <View>
            {!isSearchMode && <View className='all-law-categories'>
              {searchResult.length === 0 && showAllCategories && this.renderAllCatgories()}
            </View>}
            {/*{searchResult.length === 0 && <View className='all-title' onClick={() => this.setState({showAllLaws: !showAllLaws})}>全部法条<AtIcon value={showAllLaws ?'chevron-up': 'chevron-down'} size='18' color='#6190E8'></AtIcon></View>}*/}
            {/*<View className='all-law-options'>*/}
            {/*  {searchResult.length === 0 && showAllLaws && this.renderAllOptions()}*/}
            {/*</View>*/}
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            <View>
              {searchResult.length === 0 && !showAllCategories && this.renderHintOptions()}
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
          <View className={`${isSearchMode? 'search-mode': ''} float-help`} onClick={() => {
            Taro.navigateTo({
              url: '/pages/other/index?id=civilLaw'
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
