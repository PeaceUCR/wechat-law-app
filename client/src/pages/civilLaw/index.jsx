import Taro, {Component } from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import {AtSearchBar, AtActivityIndicator} from 'taro-ui'
import {isEmpty} from 'lodash';
import { db } from '../../util/db'
import { TermSearchItem } from '../../components/termSearchItem/index.weapp'
import { LawCategory } from '../../components/lawCategory/index.weapp'
import {setGlobalData} from '../../util/global'
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
    options: ["搜全文", "搜法条"],
    showAllCategories: true
  }

  config = {
    navigationBarTitleText: '民法典搜索'
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
    };
  }
  componentWillMount () {
  }

  componentDidMount () {
  }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  renderAllCatgories = () => {
    return civilLawCategoryLines
      .map((catgoryLine, index)=> {
        return (<LawCategory catgoryLine={catgoryLine} key={`all-law-catgoryLine-${index}`} type='civil' />)
      })
  }

  renderSearchList = () => {
    const {searchResult} = this.state
    return (<View>
      {searchResult.map(((term) => {return (<TermSearchItem term={term} key={`term${term._id}`} type='civil' />)}))}
    </View>)
  }

  renderHintOptions = () => {
    const {crimes, terms} = this.state;
    const that = this;
    return (<View className='options'>
      <View className='option-title'>常用罪名关键字</View>
      <View className='sub-options'>{crimes && crimes.length > 0 && crimes.map((crime, index) => {
        return (<View className='crime-option option' key={`crime-option-${index}`} onClick={() => that.onClickOptionItem("搜罪名", crime)}>
          {crime}
      </View>)})}</View>
      <View className='option-title'>常用法条关键字</View>
      <View className='sub-options'>{terms && terms.length >0 && terms.map((term, index) => {
        return (<View className='term-option option' key={`term-option-${index}`} onClick={() => that.onClickOptionItem("搜法条", term)}>
          {term}
        </View>)})}</View>
    </View>)
  }

  onClickOptionItem = (category, searchValue) => {
    this.setState({
      selected: category,
      searchValue
    }, () => {
      this.onSearch()
    });
  }

  onChange = (searchValue) => {
    setGlobalData('searchValue', searchValue)
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

    if (selected === '搜法条') {
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

  render () {
    const {searchValue, searchResult, isLoading, selected, options, showAllCategories} = this.state;
    return (
      <View className='criminal-page'>
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
                placeholder={selected === "搜全文" ? "搜全文" :'搜法律条文，比如第一条'}
              />
            </View>
          </View>
          <View>
            <View className='all-law-categories'>
              {searchResult.length === 0 && showAllCategories && this.renderAllCatgories()}
            </View>
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
          </View>
      </View>
    )
  }
}
