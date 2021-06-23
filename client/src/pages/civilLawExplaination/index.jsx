import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Picker, Image, RichText} from '@tarojs/components'
import {AtSearchBar, AtActivityIndicator, AtListItem, AtLoadMore, AtBadge, AtIcon, AtList, AtInput, AtTag} from 'taro-ui'
import {isEmpty} from 'lodash';
import { db } from '../../util/db'
import './index.scss'

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    selected: '全文搜索',
    options: ['全文搜索'],
    status: 'more',
    isReadMode: false,
    civilExplaination: {},
    civilExplainationTitles: [],
    civilExplainationIndex: {}
  }

  config = {
    navigationBarTitleText: '民法典相关司法解释'
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

    const that = this;
    db.collection('configuration').where({}).get({
      success: (res) => {
        const { civilExplaination, civilExplainationTitles, civilExplainationIndex } = res.data[0]

        that.setState({
          civilExplaination,
          civilExplainationTitles,
          civilExplainationIndex
        });
      }
    });
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
  }

  componentDidHide () { }

  renderSearchList = () => {
    const {searchResult,searchValue} = this.state
    return (<View>
      <View>
        {searchResult.map(((example) => {return (
          <AtListItem
            key={`example-${example._id}`}
            title={`${example.title}`}
            note={example.date}
            arrow='right'
            onClick={() => {
              Taro.navigateTo({
                url: `/pages/exampleDetail/index?type=court-open&id=${example._id}&keyword=${searchValue}`,
              })
            }}
          />
          )}))}
      </View>
    </View>)
  }

  onChange = (searchValue) => {
    this.setState({searchValue})
  }

  onSearch = (skip) => {
    skip = skip ? skip : 0;
    const that = this;
    this.setState({isLoading: true});
    const { searchValue, searchResult, selected } = this.state;
    if(!searchValue.trim()) {
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }
    if (selected === '全文搜索') {
      db.collection('court-open').orderBy('date', 'desc').skip(skip).where({text: db.RegExp({
          regexp: '.*' + searchValue,
          options: 'i',
        })}).get({
        success: (res) => {
          if (isEmpty(res.data)) {
            if (skip === 0) {
              Taro.showToast({
                title: `未找到含有${searchValue}的最高法公报`,
                icon: 'none',
                duration: 3000
              })
              that.setState({isLoading: false})
              return;
            } else {
              Taro.showToast({
                title: `没有更多啦`,
                icon: 'none',
                duration: 3000
              })
              that.setState({status: 'noMore', isLoading: false})
            }
          } else {
            if (skip === 0) {
              that.setState({searchResult: [...res.data], isLoading: false});
            } else {
              that.setState({searchResult: [...searchResult, ...res.data], isLoading: false});
            }
          }

        }
      });
    }

  }

  loadMore = () => {
    const {searchResult} = this.state
    this.onSearch(searchResult.length)
  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: [],
    });
  }


  // renderExplanations = () => {
  //   const titles = Object.keys(civilExplaination)
  //   return titles.map((title, index) => {
  //     return (<AtListItem key={`civil-explanation-${index}`} title={title.replace('最高人民法院','最高法')} arrow='right' onClick={
  //       () => {
  //         Taro.navigateTo({
  //           url: `/pages/exampleDetail/index?type=civilLawExplaination&id=${civilExplaination[title]}`,
  //         })
  //       }
  //     }
  //     />)
  //   })
  // }

  findAndHighlight = (str, key) => {
    var regExp =new RegExp(key,"g");
    if (key) {
      return '<div>' + key ? str.replace(regExp, `<span class='highlight-keyword'>${key}</span>`) : str + '</div>'
    } else {
      return '<div>' + str + '</div>'
    }
  }
  renderExplanations = () => {
    const {searchValue, civilExplainationTitles, civilExplaination, civilExplainationIndex} = this.state

    return civilExplainationTitles.filter(title => !searchValue || title.indexOf(searchValue) !== -1).map((title, index) => {
      return <View className={`civil-explanation-item ${civilExplaination[title] ? '' : 'tag'}`} key={`civil-explanation-${index}`} onClick={
        () => {
          if (civilExplaination[title]) {
            Taro.navigateTo({
              url: `/pages/exampleDetail/index?type=civilLawExplaination&id=${civilExplaination[title]}`,
            })
          }
        }
      }
      >
        <View className='title'>
          <Text className='text'>{`${civilExplainationIndex[title]}.`}</Text>
          <RichText nodes={this.findAndHighlight(title, searchValue)} />
          {/*<View><AtTag>{civilExplainationMap[title]}</AtTag></View>*/}
        </View>
        <AtIcon className='icon' value='chevron-right' size='40' color='#6190E8'></AtIcon>
      </View>
    })
  }

  render () {
    const {searchValue, searchResult, isLoading, isReadMode, civilExplainationTitles} = this.state;
    return (
      <View className={`example-page ${isReadMode ? 'read-mode' : ''}`}>
          <View>
            <View className='fixed'>
              <AtInput
                type='text'
                placeholder='搜标题'
                value={searchValue}
                onChange={this.onChange}
              /></View>
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            <AtList>
              {civilExplainationTitles.length > 0 && this.renderExplanations()}
            </AtList>
            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
            </View>}
          </View>
      </View>
    )
  }
}
