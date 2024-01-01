import Taro, {Component,getStorageSync } from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtSearchBar, AtActivityIndicator, AtNoticebar} from 'taro-ui'
import {isEmpty} from 'lodash';
import { db } from '../../util/db'
import { TermSearchItem } from '../../components/termSearchItem/index.weapp'
import { LawCategory } from '../../components/lawCategory/index.weapp'
import {convertNumberToChinese} from '../../util/convertNumber'
import {civilLawRegulationCategoryLines} from '../../util/util'
import './index.scss'


export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    showAllCategories: false,
    isReadMode: false,
    civilLawRegulationLines: []
  }

  config = {
    navigationBarTitleText: '民事诉讼法'
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
    };
  }
  componentWillMount () {
    const {searchValue} = this.$router.params;
    if (searchValue && searchValue.trim()) {
      this.setState({
        searchValue
      }, () => {
        this.onSearch()
      });
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

  componentDidMount () {
    const that = this;
    that.setState({
      civilLawRegulationLines: civilLawRegulationCategoryLines
    })
    that.setState({isLoading: true});
    Taro.cloud.callFunction({
      name: 'getCivilLawRegulation',
      data: {
        type: 'all',
      },
      complete: (r) => {
        that.setState({searchResult: r.result.data, isLoading: false});
      }
    })

    Taro.showToast({
      title: '加载全部法条, 目录/条旨版将随后推出',
      icon: 'none',
      duration: 3000
    })
  }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  renderAllCatgories = () => {
    const {civilLawRegulationLines} = this.state
    return civilLawRegulationLines
      .map((catgoryLine, index)=> {
        return (<LawCategory catgoryLine={catgoryLine} key={`all-civil-regulation-line-${index}`} type='civil-law-regulation-2024' />)
      })
  }

  renderSearchList = () => {
    const {searchResult,isReadMode,searchValue} = this.state
    return (<View>
      {searchResult.map(((term) => {return (<TermSearchItem isReadMode={isReadMode} term={term} key={`term${term._id}`} type='civil-law-regulation-2024' keyword={searchValue} />)}))}
    </View>)
  }

  onChange = (searchValue) => {
    this.setState({searchValue})
  }

  onSearch = () => {
    const that = this;
    const { searchValue } = this.state;
    if(!searchValue.trim()) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }
    this.setState({isLoading: true});
    Taro.cloud.callFunction({
      name: 'getCivilLawRegulation',
      data: {
        searchValue: searchValue,
      },
      complete: (r) => {
        if (isEmpty(r.result.data)) {
          Taro.showToast({
            title: `未找到含有${searchValue}的法条`,
            icon: 'none',
            duration: 3000
          })
        }
        that.setState({searchResult: r.result.data, isLoading: false});
      }
    })
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
      <View className={`civil-law-page page ${isReadMode ? 'read-mode' : ''}`}>
          <AtNoticebar marquee speed={60}>
            《全国人民代表大会常务委员会关于修改＜中华人民共和国民事诉讼法＞的决定》已由中华人民共和国第十三届全国人民代表大会常务委员会第三十二次会议于2021年12月24日通过，现予公布，自2022年1月1日起施行。
          </AtNoticebar>
          <View className='search'>
            <AtSearchBar
              value={searchValue}
              onChange={this.onChange}
              onActionClick={this.onSearch}
              onBlur={this.onSearch}
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
            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
            </View>}
          </View>

      </View>
    )
  }
}
