import Taro, { Component, getStorageSync } from '@tarojs/taro'
import {View, Text, Button,Image, Swiper, SwiperItem} from '@tarojs/components'
import { AtSearchBar, AtNoticebar, AtModal,AtModalHeader, AtModalContent,AtModalAction, AtRadio,AtDivider } from 'taro-ui'
import {isEmpty, groupBy} from "lodash";
import '../litigationRegulation/index.scss'
import {otherLawNameMap} from '../../util/otherLaw'
import {convertNumberToChinese} from '../../util/convertNumber'
import Loading2 from '../../components/loading2/index.weapp'
import GlobalSearchItem from '../../components/globalSearchItem/index.weapp'
import {settingIcon} from "../../util/util";
import {searchHomePageOptions} from '../../util/name'
import {GridItem} from "../../components/grid/index.weapp";

export default class Index extends Component {
  options1 = [
    {
      value: 'criminal',
      label: '刑法相关',
      // desc: '法律法规，司法解释规定，指导案例，最高法公报案例'
    },
    {
      value: 'civil',
      label: '民法典相关',
      // desc: '法律法规，司法解释规定，指导案例，最高法公报案例'
    },
    {
      value: 'admin',
      label: '行政法相关',
      // desc: '法律法规，司法解释规定，指导案例，最高法公报案例'
    }
  ]

  options2= {
    'criminal': [{
      value: 'term',
      label: '• 法律条文',
      desc: ''
    },{
      value: 'complement',
      label: '• 司法解释/规定',
      desc: ''
    },{
      value: 'example',
      label: '• 指导/典型/公报案例'
    },{
      value: 'consult',
      label: '• 刑事审判参考'
    }],
    'civil': [{
      value: 'term',
      label: '• 法律条文',
      desc: ''
    },{
      value: 'complement',
      label: '• 司法解释/规定',
      desc: ''
    },{
      value: 'example',
      label: '• 指导/典型/公报案例'
    }],
    'admin': [{
      value: 'term',
      label: '• 法律条文',
      desc: ''
    },{
      value: 'example',
      label: '• 指导/典型/公报案例'
    }]
  }

  state = {
    searchValue: '',
    searchResult: {},
    isLoading: false,
    isReadMode: false,
    showSetting: true,
    selectedOption1: '',
    selectedOption2: '',
    isInvalid1: false,
    isInvalid2: false,
  }

  config = {
    navigationBarTitleText: '法律法规全文精确搜索'
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
    const {searchValue} = this.$router.params;
    if (searchValue) {
      this.setState({searchValue})
    }
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
  }

  componentDidHide () { }

  renderHomeOptionSearchList = () => {
    const {searchValue} = this.state;
    const homeOptions = searchHomePageOptions(searchValue)
    return (<View className='home-options'>
      {homeOptions.length > 0 && <AtDivider content={`匹配${searchValue}模块`} fontColor='#333' />}
      {homeOptions.length > 0 && homeOptions.map((option, i )=> {
        return (<View className='grid-container' key={`grid-${i}`}>
          <GridItem option={option} disabled={false} keyword={searchValue} />
        </View>)
      })}
    </View>)
  }

  renderSearchList = () => {
    const {searchResult, searchValue} = this.state
    const other = groupBy(searchResult['other-law'], item => item.type)
    return (<View>
      {searchResult['terms'] && searchResult['terms'].length > 0 && <View className='type-container'>
        <View className='type-result-title'>
          <Text className='title'>刑法</Text>
        </View>
        {searchResult['terms'].map((
          (item) => {
            return (
              <GlobalSearchItem
                key={item._id}
                text={item.text}
                law='刑法'
                number={item.chnNumber}
                redirect={() => {
                  Taro.navigateTo({
                    url: `/pages/termDetail/index?id=${item._id}`,
                  })
                }}
              />
            )}))}
        <View className='more' onClick={() => {
          Taro.navigateTo({
            url: `/pages/criminalLaw/index?searchValue=${searchValue}`,
          })
        }}>去刑法搜索更多...</View>
      </View>}
      {searchResult['litigation-law'] && searchResult['litigation-law'].length > 0 && <View className='type-container'>
        <View className='type-result-title'>
          <Text className='title'>刑事诉讼法</Text>
        </View>
        {searchResult['litigation-law'].map((
          (item) => {
            return (
              <GlobalSearchItem
                key={item._id}
                text={item.text}
                law='刑事诉讼法'
                number={item.item}
                redirect={() => {
                  Taro.navigateTo({
                    url: `/pages/regulationDetail/index?id=${item._id}&type=litigation-law`,
                  })
                }}
              />
            )}))}
        <View className='more' onClick={() => {
          Taro.navigateTo({
            url: `/pages/litigationLaw/index?searchValue=${searchValue}`,
          })
        }}>去刑事诉讼法搜索更多...</View>
      </View>}
      {searchResult['civil-law'] && searchResult['civil-law'].length > 0 && <View className='type-container'>
        <View className='type-result-title'>
          <Text className='title'>民法典</Text>
        </View>
        {searchResult['civil-law'].map((
          (item) => {
            return (
              <GlobalSearchItem
                key={item._id}
                text={item.text}
                law='民法典'
                number={item.number}
                redirect={() => {
                  Taro.navigateTo({
                    url: `/pages/civilLawDetail/index?id=${item._id}`,
                  })
                }}
              />
            )}))}
        <View className='more' onClick={() => {
          Taro.navigateTo({
            url: `/pages/civilLaw/index?searchValue=${searchValue}`,
          })
        }}>去民法典搜索更多...</View>
      </View>}
      {searchResult['civil-law-regulation'] && searchResult['civil-law-regulation'].length > 0 && <View className='type-container'>
        <View className='type-result-title'>
          <Text className='title'>民事诉讼法</Text>
        </View>
        {searchResult['civil-law-regulation'].map((
          (item) => {
            return (
              <GlobalSearchItem
                key={item._id}
                text={item.text}
                law='民事诉讼法'
                number={item.chnNumber}
                redirect={() => {
                  Taro.navigateTo({
                    url: `/pages/regulationDetail/index?id=${item._id}&type=civil-law-regulation`,
                  })
                }}
              />
            )}))}
        <View className='more' onClick={() => {
          Taro.navigateTo({
            url: `/pages/civilLawRegulation/index?searchValue=${searchValue}`,
          })
        }}>去民事诉诉法搜索更多...</View>
      </View>}
      {searchResult['other-law'] && searchResult['other-law'].length > 0 && <View>
        {Object.keys(other).map(k => <View key={k} className='type-container'>
          <View className='type-result-title'>
            <Text className='title'>{otherLawNameMap[k]}</Text>
          </View>
          {other[k].map((
            (item) => {
              return (
                <GlobalSearchItem
                  key={item._id}
                  text={item.text}
                  law={otherLawNameMap[item.type]}
                  number={convertNumberToChinese(item.number)}
                  redirect={() => {
                    Taro.navigateTo({
                      url: `/pages/regulationDetail/index?id=${item._id}&type=${item.type}`,
                    })
                  }}
                />
              )}))}
          <View className='more' onClick={() => {
            Taro.navigateTo({
              url: `/pages/otherLaw/index?law=${k}&searchValue=${searchValue}`,
            })
          }}>{`去${otherLawNameMap[k]}搜索更多...`}</View>
        </View>)}
      </View>}
    </View>)
  }

  onChange = (searchValue) => {
    this.setState({searchValue})
  }

  handleDBSearchSuccess = (res) => {
    if (isEmpty(res.data)) {
      Taro.showToast({
        title: `未找到相应的法条`,
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

    if(!searchValue.trim()) {
      console.log('123')
      Taro.showToast({
        title: '搜索不能为空',
        icon: 'none',
        duration: 2000
      })
      return ;
    }
    this.setState({isLoading: true});

    const {selectedOption1, selectedOption2} = that.state

    Taro.cloud.callFunction({
      name: 'globalSearch',
      data: {
        searchValue: searchValue,
        selectedOption1,
        selectedOption2
      },
      complete: (r) => {
        console.log(r.result.results)
        const result = {}
        r.result.results.forEach(item => {
          result[item.type] = item.data
        })
        that.setState({searchResult: result, isLoading: false})
        // that.handleDBSearchSuccess(r.result)
      }
    })
  }

  handleOpen = () => {
    this.setState({
      showSetting: true
    });
  }

  handleClose = () => {
    const {selectedOption1, selectedOption2} = this.state
    console.log(selectedOption1, selectedOption2)
    this.setState({
      isInvalid1: !selectedOption1,
      isInvalid2: !selectedOption2
    })
    if (selectedOption1 && selectedOption2) {
      if (selectedOption2 == 'example') {
        Taro.navigateTo({
          url: `/pages/examples/index`
        });
        return ;
      }
      if (selectedOption2 == 'open-example') {
        Taro.navigateTo({
          url: `/pages/courtOpen/index`
        });
        return ;
      }
      if (selectedOption2 == 'consult') {
        Taro.navigateTo({
          url: `/pages/consultant/index`
        });
        return ;
      }
      if (selectedOption1 == 'criminal' && selectedOption2 == 'complement') {
        Taro.navigateTo({
          url: `/pages/criminalComplement/index`
        });
        return ;
      }

      if (selectedOption1 == 'civil' && selectedOption2 == 'complement') {
        Taro.navigateTo({
          url: `/pages/civilLawExplaination/index`
        });
        return ;
      }

      this.setState({
        showSetting: false
      });
      const {searchValue} = this.state
      this.onSearch(searchValue)
    } else {
      Taro.showToast({
        title: '请选择',
        icon: 'none',
        duration: 2000
      })
    }


  }

  handleSelect1 = (value) => {
    this.setState({
      selectedOption1: value
    });
  }
  handleSelect2 = (value) => {
    this.setState({
      selectedOption2: value
    });
  }
  render () {
    const {searchValue, isLoading, isReadMode, showSetting, selectedOption1, selectedOption2, isInvalid1, isInvalid2} = this.state;
    return (
      <View className={`litigation-regulation-page page global-search ${isReadMode ? 'read-mode' : ''}`}>
        <AtNoticebar marquee speed={60}>
          此为精确搜索(非模糊搜索),且只显示部分结果,麻烦去具体法律模块搜索更多！
        </AtNoticebar>
        <View>
            <AtSearchBar
              value={searchValue}
              onChange={this.onChange}
              onActionClick={() => {
                this.onSearch(searchValue)
              }}
              onBlur={() => {
                this.onSearch(searchValue)
              }}
              onClear={this.onClear}
              placeholder='法律法规全文精确搜索'
            />
          </View>
          <View>
            <View>
              {this.renderHomeOptionSearchList()}
              {this.renderSearchList()}
            </View>
            {isLoading && <Loading2 />}
            <View onClick={this.handleOpen} className='float-setting'>
              <Image src={settingIcon} className='setting' mode='widthFix' />
            </View>

          </View>
        <AtModal isOpened={showSetting}>
          <AtModalHeader>我要搜</AtModalHeader>
          <AtModalContent>
            <View className={isInvalid1 ? 'invalid select normal' : 'select normal'}>
              <AtRadio
                options={this.options1}
                value={selectedOption1}
                onClick={this.handleSelect1}
              />
            </View>
            {selectedOption1 && <View className={isInvalid2 ? 'invalid normal' : 'normal'}>
              <AtRadio
                options={this.options2[selectedOption1]}
                value={selectedOption2}
                onClick={this.handleSelect2}
              />
            </View>}

          </AtModalContent>
          <AtModalAction><Button onClick={this.handleClose} >确定</Button> </AtModalAction>
        </AtModal>
        {!isLoading && <View className='no-more'>
          <AtDivider content='没有更多了' fontColor='#333' />
          <View>也可以去单独的模块进行更精确的搜索😊</View>
        </View>}
        {!isLoading && !showSetting && <Swiper className='video-container'>
          <SwiperItem >
            <ad unit-id="adunit-aa47163462e4442f" ad-type="video" ad-theme="white"></ad>
          </SwiperItem>
        </Swiper>}
      </View>
    )
  }
}
