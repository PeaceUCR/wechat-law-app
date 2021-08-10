import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {Button, View, Text} from '@tarojs/components'
import { AtSearchBar, AtActivityIndicator, AtFab, AtNoticebar } from 'taro-ui'
import {isEmpty} from "lodash"
import { db } from '../../util/db'
import { LitigationSearchItem } from '../../components/litigationSearchItem/index.weapp'
import {getNumber} from '../../util/convertNumber'
import './index.scss'
import {HierarchicalOptions} from "../../components/hierarchicalOptions/index.weapp";
import {litigationLawCategoryLines} from "../../util/util";
import {LawCategory} from "../../components/lawCategory/index.weapp";

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    litigationLawOptions: [],
    isLoading: false,
    modalContent: '',
    isOpened: false,
    isReadMode: true
  }

  config = {
    navigationBarTitleText: '刑事诉讼法搜索'
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
  }

  componentDidMount () {
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

  componentWillUnmount () { }

  componentDidShow () {
    // const that = this;
    // that.setState({isLoading: true});
    // db.collection('configuration').where({}).get({
    //   success: (res) => {
    //     that.setState({
    //       litigationLawOptions: res.data[0]['litigation-law'],
    //       isLoading: false});
    //   }
    // });
  }

  componentDidHide () { }

  renderSearchList = () => {
    const {searchValue, searchResult,isReadMode} = this.state
    searchResult.sort((a, b) => {
      return getNumber(a.item) - getNumber(b.item)
    })
    return (<View>
      {searchResult.map((
        (data) => {
          return (
            <LitigationSearchItem
              keyword={searchValue}
              isReadMode={isReadMode}
              data={data}
              key={`term-${data._id}`}
              onSearchResultClick={this.onSearchResultClick}
            />)}))}
    </View>)
  }

  handleDBSearchSuccess = (res) => {
    if (isEmpty(res.data)) {
      Taro.showToast({
        title: `未搜到相应法条`,
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
      name: 'getLitigationLaw',
      data: {
        searchValue: searchValue
      },
      complete: (r) => {

        that.handleDBSearchSuccess(r.result)
      }
    })
  }

  onSearchByChapter = (searchValue) => {
    const that = this;
    this.setState({isLoading: true});
    if(!searchValue.trim()) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }

    Taro.cloud.callFunction({
      name: 'getLitigationLaw',
      data: {
        searchValue: searchValue,
        type: 'chapter'
      },
      complete: (r) => {

        that.handleDBSearchSuccess(r.result)
      }
    })
  }

  onSearchBySection = (searchValue) => {
    const that = this;
    this.setState({isLoading: true});
    if(!searchValue.trim()) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }
    Taro.cloud.callFunction({
      name: 'getLitigationLaw',
      data: {
        searchValue: searchValue,
        type: 'section'
      },
      complete: (r) => {
        that.handleDBSearchSuccess(r.result)
      }
    })
  }

  onSearchByPart = (searchValue) => {
    const that = this;
    this.setState({isLoading: true});
    if(!searchValue.trim()) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }
    Taro.cloud.callFunction({
      name: 'getLitigationLaw',
      data: {
        searchValue: searchValue,
        type: 'part'
      },
      complete: (r) => {

        that.handleDBSearchSuccess(r.result)
      }
    })
  }

  // onClickOptionItem = (category, searchValue) => {
  //   this.setState({
  //     searchValue
  //   }, () => {
  //     if(searchValue === '执行') {
  //       this.onSearchByPart(searchValue);
  //     } else if (category === "chapter") {
  //       this.onSearchByChapter(searchValue);
  //     } else {
  //       this.onSearchBySection(searchValue);
  //     }
  //   });
  // }
  onClickOptionItem = (category, searchValue) => {
    if(searchValue === '执行') {
      this.onSearchByPart(searchValue);
    } else if (category === "chapter") {
      this.onSearchByChapter(searchValue);
    } else {
      this.onSearchBySection(searchValue);
    }
  }

  onChange = (searchValue) => {
    this.setState({searchValue})
  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: []
    });
  }

  // onSearchResultClick = (content) => {
  //   const that = this;
  //   that.setState({
  //     isOpened: true,
  //     modalContent: content
  //   });
  // }
  onSearchResultClick = (data) => {
    const {_id} = data
    Taro.navigateTo({
      url: `/pages/regulationDetail/index?id=${_id}&type=litigation-law`,
    })
  }

  onModalClose = () => {
    this.setState({
      isOpened: false,
      modalContent: ''
    });
  }

  renderAllCatgories = () => {
    return litigationLawCategoryLines
      .map((catgoryLine, index)=> {
        return (<LawCategory catgoryLine={catgoryLine} key={`all-law-catgoryLine-${index}`} type='litigation-law' />)
      })
  }
  render () {
    const {searchValue, searchResult, litigationLawOptions, isLoading, modalContent, isOpened, isReadMode} = this.state;
    return (
      <View className={`litigation-law-page ${isReadMode ? 'read-mode' : ''}`}>
          <AtNoticebar marquee speed={60}>
            根据2018年10月26日第十三届全国人民代表大会常务委员会第六次会议《关于修改〈中华人民共和国刑事诉讼法〉的决定》第三次修正
          </AtNoticebar>
          <View>
            <AtSearchBar
              value={searchValue}
              onChange={this.onChange}
              onActionClick={this.onSearch}
              onClear={this.onClear}
              placeholder='搜索刑事诉讼法'
            />
          </View>
          <View>
            <View>
              {searchResult.length === 0 && this.renderAllCatgories()}
            </View>
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            {searchResult.length > 0 && <AtFab className='float' onClick={() => this.reset()}>
              <Text>重置</Text>
            </AtFab>}
            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black'  size={82}></AtActivityIndicator>
            </View>}
          </View>
        {isOpened && <View className={`modal ${isReadMode ? 'read-mode' : ''}`}>
          <View className='modal-content'>{modalContent.join('\n')}</View>
          <Button onClick={this.onModalClose} className='modal-button'>确定</Button>
        </View>}
      </View>
    )
  }
}
