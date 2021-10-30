import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Picker, Image} from '@tarojs/components'
import { AtSearchBar, AtActivityIndicator, AtFab, AtBadge, AtIcon, AtListItem } from 'taro-ui'
import {isEmpty} from 'lodash';
import {
  targetImageSource, getExampleSearchTag
} from '../../util/util'
import '../examples/index.scss'
import {db} from "../../util/db";
import {getNumber} from "../../util/convertNumber";
import JudgementSearchItem from "../../components/judgementSearchItem"

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    isExpandLabel: false,
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '检察文书搜索'
  }

  onShareAppMessage() {
    return {
      path: 'pages/procuratorateDoc/index'
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

    that.setState({isLoading: true});
    db.collection('procuratorate-doc').where({}).orderBy('effectiveDate', 'desc').get({
      success: (r) => {
        console.log(r)
        that.setState({searchResult: r.data, isLoading: false})
      }
    });
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
    db.collection('procuratorate-doc').where({text: db.RegExp({
        regexp: '.*' + searchValue,
        options: 'i',
      })}).orderBy('effectiveDate', 'desc').get({
      success: (r) => {
        console.log(r)
        that.setState({searchResult: r.data, isLoading: false})
      }
    });

  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: []
    });
  }

  onRedirect = (id, type) => {
    Taro.navigateTo({
      url: `/pages/exampleDetail/index?type=procuratorate-doc&id=${id}`,
    })
  }

  renderSearchList = () => {
    const {searchResult,searchValue} = this.state
    return (<View>
      <View>
        {searchResult.map(((example) => {return (
          <View className='result-item' key={`example-${example._id}`}>
            <JudgementSearchItem
              title={`${example.title}`}
              text={example.text}
              pocuratorate
              redirect={() => {
                Taro.navigateTo({
                  url: `/pages/exampleDetail/index?type=procuratorate-doc&id=${example._id}&keyword=${searchValue}`,
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
      <View className={`example-page page ${isReadMode ? 'read-mode' : ''}`}>
          <View className='header'>
            <View>
              <AtSearchBar
                value={searchValue}
                onChange={this.onChange}
                onActionClick={this.onSearch}
                onClear={this.onClear}
                placeholder='全文搜索'
              />
            </View>
          </View>
          <View>
            <View>
              {(searchResult.length > 0 || searchResult.length > 0) && this.renderSearchList()}
            </View>

            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
            </View>}
          </View>
      </View>
    )
  }
}
