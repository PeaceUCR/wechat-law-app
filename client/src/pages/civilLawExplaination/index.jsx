import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Picker, Image, RichText} from '@tarojs/components'
import {AtSearchBar, AtActivityIndicator, AtListItem, AtIcon, AtList} from 'taro-ui'
import { db } from '../../util/db'
import './index.scss'
import {isEmpty} from "lodash";

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: true,
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
          civilExplainationIndex,
          isLoading: false,
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
          <View key={`example-${example._id}`} className='civil-explanation-item' onClick={() => {
            Taro.navigateTo({
              url: `/pages/exampleDetail/index?type=civil-law-explaination&id=${example._id}&keyword=${searchValue}`,
            })
          }}
          >
            <View className='title'>
              <Text className='text'>{example.title}</Text>
            </View>
            <AtIcon className='icon' value='chevron-right' size='40' color='#6190E8'></AtIcon>
          </View>

          )}))}
      </View>
    </View>)
  }

  onChange = (searchValue) => {
    this.setState({searchValue})
  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: [],
    });
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
      name: 'searchCivilLawExplaination',
      data: {
        searchValue: searchValue
      },
      complete: (r) => {
        const {result} = r
        const {searchResult} = result
        if (isEmpty(searchResult)) {
          Taro.showToast({
            title: `未找到含有${searchValue}的指导案例`,
            icon: 'none',
            duration: 3000
          })
        }
        that.setState({searchResult, isLoading: false});
      }
    })
  }

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
              url: `/pages/exampleDetail/index?type=civil-law-explaination&id=${civilExplaination[title]}`,
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
            <View>
              <AtSearchBar
                value={searchValue}
                onChange={this.onChange}
                onActionClick={() => this.onSearch()}
                onClear={this.onClear}
                placeholder='全文搜索'
              />
            </View>
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            <AtList>
              {searchResult.length === 0 && civilExplainationTitles.length > 0 && this.renderExplanations()}
            </AtList>
            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
            </View>}
          </View>
      </View>
    )
  }
}
