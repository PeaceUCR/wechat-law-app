import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import { AtSearchBar, AtActivityIndicator, AtNoticebar, AtFab } from 'taro-ui'
import {isEmpty} from "lodash";
import { LitigationSearchItem } from '../../components/litigationSearchItem/index.weapp'
import { HierarchicalOptions } from '../../components/hierarchicalOptions/index.weapp'
import {convertNumberToChinese} from '../../util/convertNumber'
import '../litigationRegulation/index.scss'
import {processLitigationOptions} from '../../util/util';

export default class Index extends Component {

  state = {
    searchValue: '',
    searchResult: [],
    isLoading: false,
    litigationExplanationChapters: ["第一章 管辖","第二章 回避","第三章 辩护与代理","第四章 证据","第五章 强制措施","第六章 附带民事诉讼","第七章 期间、送达、审理期限","第八章 审判组织","第九章 公诉案件第一审普通程序","第十章 自诉案件第一审程序","第十一章 单位犯罪案件的审理","第十二章 认罪认罚案件的审理","第十三章 简易程序","第十四章 速裁程序","第十五章 第二审程序","第十六章 在法定刑以下判处刑罚和特殊假释的核准","第十七章 死刑复核程序","第十八章 涉案财物处理","第十九章 审判监督程序","第二十章 涉外刑事案件的审理和刑事司法协助","第二十一章 执行程序","第二十二章 未成年人刑事案件诉讼程序","第二十三章 当事人和解的公诉案件诉讼程序","第二十四章 缺席审判程序","第二十五章 犯罪嫌疑人、被告人逃匿、死亡案件违法所得的没收程序","第二十六章 依法不负刑事责任的精神病人的强制医疗程序","第二十七章 附则"],
    litigationExplanationSections: [
      {"chapter":"第四章 证据","section":"第一节 一般规定"},
      {"chapter":"第四章 证据","section":"第二节 物证、书证的审查与认定"},
      {"chapter":"第四章 证据","section":"第三节 证人证言、被害人陈述的审查与认定"},
      {"chapter":"第四章 证据","section":"第四节 被告人供述和辩解的审查与认定"},
      {"chapter":"第四章 证据","section":"第五节 鉴定意见的审查与认定"},
      {"chapter":"第四章 证据","section":"第六节 勘验、检查、辨认、侦查实验等笔录的审查与认定"},
      {"chapter":"第四章 证据","section":"第七节 视听资料、电子数据的审查与认定"},
      {"chapter":"第四章 证据","section":"第八节 技术调查、侦查证据的审查与认定"},
      {"chapter":"第四章 证据","section":"第九节 非法证据排除"},
      {"chapter":"第四章 证据","section":"第十节 证据的综合审查与运用"},
      {"chapter":"第九章 公诉案件第一审普通程序","section":"第一节 审查受理与庭前准备"},
      {"chapter":"第九章 公诉案件第一审普通程序","section":"第二节 庭前会议与庭审衔接"},
      {"chapter":"第九章 公诉案件第一审普通程序","section":"第三节 宣布开庭与法庭调查"},
      {"chapter":"第九章 公诉案件第一审普通程序","section":"第四节 法庭辩论与最后陈述"},
      {"chapter":"第九章 公诉案件第一审普通程序","section":"第五节 评议案件与宣告判决"},
      {"chapter":"第九章 公诉案件第一审普通程序","section":"第六节 法庭纪律与其他规定"},
      {"chapter":"第二十章 涉外刑事案件的审理和刑事司法协助","section":"第一节 涉外刑事案件的审理"},
      {"chapter":"第二十章 涉外刑事案件的审理和刑事司法协助","section":"第二节 刑事司法协助"},
      {"chapter":"第二十一章 执行程序","section":"第一节 死刑的执行"},
      {"chapter":"第二十一章 执行程序","section":"第二节 死刑缓期执行、无期徒刑、有期徒刑、拘役的交付执行"},
      {"chapter":"第二十一章 执行程序","section":"第三节 管制、缓刑、剥夺政治权利的交付执行"},
      {"chapter":"第二十一章 执行程序","section":"第四节 刑事裁判涉财产部分和附带民事裁判的执行"},
      {"chapter":"第二十一章 执行程序","section":"第五节 减刑、假释案件的审理"},
      {"chapter":"第二十一章 执行程序","section":"第六节 缓刑、假释的撤销"},
      {"chapter":"第二十二章 未成年人刑事案件诉讼程序","section":"第一节 一般规定"},
      {"chapter":"第二十二章 未成年人刑事案件诉讼程序","section":"第二节 开庭准备"},
      {"chapter":"第二十二章 未成年人刑事案件诉讼程序","section":"第三节 审判"},
      {"chapter":"第二十二章 未成年人刑事案件诉讼程序","section":"第四节 执行"}
    ],
    isReadMode: false
  }

  config = {
    navigationBarTitleText: '(最高法)适用刑事诉讼法的解释'
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
    //       litigationExplanationChapters: res.data[0].litigationExplanationChapters,
    //       litigationExplanationSections: res.data[0].litigationExplanationSections,
    //       isLoading: false});
    //   }
    // });
  }

  componentDidHide () { }

  renderSearchList = () => {
    const {searchValue, searchResult,isReadMode} = this.state
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

  onChange = (searchValue) => {
    this.setState({searchValue})
  }

  handleDBSearchSuccess = (res) => {
    if (isEmpty(res.data)) {
      Taro.showToast({
        title: `未找到相应的刑事诉讼法法条`,
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

  onSearch = (searchValue) => {
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
      name: 'getLitigationExplanation',
      data: {
        searchValue: convertNumberToChinese(searchValue),
        type: 'content'
      },
      complete: (r) => {
        that.handleDBSearchSuccess(r.result)
      }
    })

    // db.collection('litigation-explanation').where({content: db.RegExp({
    //     regexp: '.*' + convertNumberToChinese(searchValue),
    //     options: 'i',
    //   })}).get({
    //   success: that.handleDBSearchSuccess
    // });
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
      name: 'getLitigationExplanation',
      data: {
        searchValue: searchValue,
        type: 'chapter'
      },
      complete: (r) => {
        that.handleDBSearchSuccess(r.result)
      }
    })
    // db.collection('litigation-explanation').where({chapter: db.RegExp({
    //     regexp: '.*' + searchValue,
    //     options: 'i',
    //   })}).get({
    //   success: that.handleDBSearchSuccess
    // });
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
      name: 'getLitigationExplanation',
      data: {
        searchValue: searchValue,
        type: 'section'
      },
      complete: (r) => {
        that.handleDBSearchSuccess(r.result)
      }
    })
  }

  onClear = () => {
    this.setState({
      searchValue: '',
      searchResult: []
    });
  }

  onClickOptionItem = (category, searchValue) => {
    if (category === "chapter") {
      this.onSearchByChapter(searchValue);
    } else {
      this.onSearchBySection(searchValue);
    }
  }

  renderOptions = () => {
    const {litigationExplanationChapters, litigationExplanationSections} = this.state;
    const that = this;
    return (<View className='options'>
      <View className='sub-options'>{litigationExplanationChapters && litigationExplanationChapters.length > 0 &&
      litigationExplanationChapters.map((c, index) => {
        return (<View className='crime-option option' key={`crime-option-${index}`} onClick={() => that.onClickOptionItem("chapter", c)}>
          {c}
        </View>)})}</View>
      <View className='sub-options'>{litigationExplanationSections && litigationExplanationSections.length >0 &&
      litigationExplanationSections.map((s, index) => {
        return (<View className='term-option option' key={`term-option-${index}`} onClick={() => that.onClickOptionItem("section", s)}>
          {s}
        </View>)})}</View>
    </View>)
  }

  onSearchResultClick = (data) => {
    const {_id} = data
    Taro.navigateTo({
      url: `/pages/regulationDetail/index?id=${_id}&type=litigation-explanation`,
    })
  }

  render () {
    const {searchValue, searchResult, isLoading, litigationExplanationChapters, litigationExplanationSections, isReadMode} = this.state;
    return (
      <View className={`litigation-regulation-page ${isReadMode ? 'read-mode' : ''}`}>
          <AtNoticebar marquee speed={60}>
            最高法公告:《最高法关于适用〈中华人民共和国刑事诉讼法〉的解释》已于2020年12月7日由最高法审判委员会第1820次会议通过，现予公布，自2021年3月1日起施行。
          </AtNoticebar>
          <View>
            <AtSearchBar
              value={searchValue}
              onChange={this.onChange}
              onActionClick={() => {
                this.onSearch(searchValue)
              }}
              onClear={this.onClear}
              placeholder='搜索刑事诉讼规则'
            />
          </View>
          <View>
            <View>
              {/*{searchResult.length === 0 && this.renderOptions()}*/}
              {searchResult.length === 0 &&
              <HierarchicalOptions isReadMode={isReadMode} options={processLitigationOptions(litigationExplanationChapters, litigationExplanationSections)} onClick={this.onClickOptionItem} />}
            </View>
            <View>
              {searchResult.length > 0 && this.renderSearchList()}
            </View>
            {isLoading && <View className='loading-container'>
              <AtActivityIndicator mode='center' color='black' size={82}></AtActivityIndicator>
            </View>}
            {searchResult.length > 0 && <AtFab className='float' onClick={() => this.reset()}>
              <Text>重置</Text>
            </AtFab>}
          </View>
      </View>
    )
  }
}
