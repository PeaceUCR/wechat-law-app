import Taro, {Component,getStorageSync } from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtSearchBar, AtActivityIndicator, AtNoticebar} from 'taro-ui'
import {isEmpty} from 'lodash';
import { db } from '../../util/db'
import { TermSearchItem } from '../../components/termSearchItem/index.weapp'
import { LawCategory } from '../../components/lawCategory/index.weapp'
import {convertNumberToChinese} from '../../util/convertNumber'
import {policeRegulationCategoryLines} from '../../util/util'
import './index.scss'


export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    selected: "搜全文",
    options: ["搜全文", "搜序号"],
    showAllCategories: true,
    isReadMode: false,
    policeLawLines: []
  }

  config = {
    navigationBarTitleText: '公安机关办理刑事案件程序规定(2020修正)'
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
      policeLawLines: policeRegulationCategoryLines
    })
  }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  renderAllCatgories = () => {
    const {policeLawLines} = this.state
    return policeLawLines
      .map((catgoryLine, index)=> {
        return (<LawCategory catgoryLine={catgoryLine} key={`all-law-catgoryLine-${index}`} type='police' />)
      })
  }

  renderSearchList = () => {
    const {searchResult,isReadMode,searchValue} = this.state
    return (<View>
      {searchResult.map(((term) => {return (<TermSearchItem isReadMode={isReadMode} term={term} key={`term${term._id}`} type='police' keyword={searchValue} />)}))}
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
        db.collection('police-regulation').where({number: db.RegExp({
            regexp: '.*' + convertNumberToChinese(parseInt(searchValue)),
            options: 'i',
          })}).get({
          success: (res) => {
            if (isEmpty(res.data)) {
              Taro.showToast({
                title: `未找到含有${searchValue}的程序规定`,
                icon: 'none',
                duration: 3000
              })
            }
            that.setState({searchResult: res.data, isLoading: false, hasSearched: true});
          }
        })
        return ;
      }
      db.collection('police-regulation').where({text: db.RegExp({
          regexp: '.*' + searchValue,
          options: 'i',
        })}).get({
        success: (res) => {
          if (isEmpty(res.data)) {
            Taro.showToast({
              title: `未找到含有${searchValue}的程序规定`,
              icon: 'none',
              duration: 3000
            })
          }
          that.setState({searchResult: res.data, isLoading: false, hasSearched: true});
        }
      });
    }
  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: []
    });
  }

  render () {
    const {searchValue, searchResult, isLoading,
      showAllCategories, isReadMode} = this.state;
    return (
      <View className={`civil-law-page ${isReadMode ? 'read-mode' : ''}`}>
          <AtNoticebar marquee speed={60}>
            公安机关办理刑事案件程序规定(2020修正),颁布单位:公安部,文号:中华人民共和国公安部令第159号,颁布日期:2020-07-20,执行日期:2020-09-01,时效性:现行有效,效力级别:部门规章
          </AtNoticebar>
          <View className='search'>
            <AtSearchBar
              value={searchValue}
              onChange={this.onChange}
              onActionClick={this.onSearch}
              onClear={this.onClear}
              placeholder='关键词 或 法条序号'
            />
          </View>
          <View>
            <View className='all-law-categories'>
              {searchResult.length === 0 && showAllCategories && this.renderAllCatgories()}
            </View>
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            <View>
              {searchResult.length === 0 && !showAllCategories && this.renderHintOptions()}
            </View>
            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
            </View>}
          </View>

      </View>
    )
  }
}
