import Taro, { Component, getStorageSync, setStorageSync } from '@tarojs/taro'
import {View, Picker, Button, Image} from '@tarojs/components'
import {AtDivider, AtSearchBar,AtNoticebar, AtList, AtListItem,  AtModal,AtModalHeader, AtModalContent,AtModalAction, AtInput, AtBadge, AtIcon, AtActionSheet, AtTag, AtDrawer, AtAccordion} from "taro-ui";
import UserFloatButton from '../../components/userFloatButton/index.weapp'
import './index.scss'
import {db} from "../../util/db";
import Loading2 from "../../components/loading2/index.weapp";
import {
  criminalLawOptions,
  getCriminalLawChnNumber,
  getCriminalLawNumber,
} from "../../util/name";
import JudgementSearchItem from '../../components/judgementSearchItem/index.weapp'
import {getUserAvatar} from "../../util/login";


const settingIcon =
  'https://mmbiz.qpic.cn/mmbiz_png/6fKEyhdZU92UYROmCwI9kIRFU6pnKzycaPtbJdQ4ibwv99ttVwWNj2GkAib2icbrPD3cyGLWuTNMjs8I3pB1X6QOw/0?wx_fmt=png'

const criminalKeywords = ['非法占有','自首','罚金','共同犯罪','故意犯','从犯','程序合法','减轻处罚','拘役','财产权','管制','犯罪未遂','违法所得','合法财产','返还','没收','所有权','偶犯','恶意透支','胁迫','立功','扣押','鉴定','合同','合同诈骗','冒用','伪造','合伙','共同故意','着手','没收财产','利息','聋哑人','人身权利','传唤']

export default class Index extends Component {

  state = {
    isNewUser: false,
    isReadMode: false,
    isUserLoaded: false,
    userName: '',
    userOpenId: '',
    userAvatar: '',
    law: 'criminal',
    number: '',
    searchValue: '',
    showSetting: true,
    showLoading: false,
    resultList: [],
    isMenuOpened: false,
    activeKeyMap: {},
    selectedCriminalKeywords: [],
    province: '',
    enableMainAd: false,
    hasVisit: true
  }

  config = {
    navigationBarTitleText: '裁判文书',
    navigationBarBackgroundColor: '#F4ECD8'
  }

  onShareAppMessage() {
    const {law, number, searchValue} = this.state;
    return {
      path: `/pages/judgement/index?law=${law}&number=${number}&searchValue=${searchValue}`
    };
  }

  componentWillMount () {
    const { userOpenId, userName, userAvatar, number, searchValue } = this.$router.params;
    this.setState({
      userOpenId,
      userName,
      userAvatar,
      number
    })
    const that = this
    db.collection('configuration').where({}).get({
      success: (res) => {
        console.log(res.data[0])
        const {enableMainAd} = res.data[0]
        that.setState({
          enableMainAd: enableMainAd
        })
      }
    });
  }

  componentDidMount () {

  }

  componentWillUnmount () { }

  componentDidShow () {
    const setting = getStorageSync('setting');
    if (setting && setting.isReadMode === false) {
      this.setState({isReadMode: false})
    } else {
      setStorageSync('setting', { isReadMode: true })
      this.setState({isReadMode: true})
      console.log('default set to read mode')
    }

    const {isReadMode} = this.state;
    if ( isReadMode ) {
      console.log('read')
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#F4ECD8'
      })
    }

    const userAvatar = getUserAvatar();
    this.setState({userAvatar})

    // if (!getStorageSync('hasVisit')) {
    //   Taro.showToast({
    //     title: `首次使用，请先点击右侧的帮助`,
    //     icon: 'none',
    //     duration: 4000
    //   })
    //   setStorageSync('hasVisit', true)
    //   this.setState({hasVisit: false})
    // } else {
    //   this.setState({hasVisit: true})
    // }
  }

  componentDidHide () { }

  renderUserFloatButton () {
    const {isUserLoaded, userAvatar} = this.state;
    return (<UserFloatButton isUserLoaded={isUserLoaded} avatarUrl={userAvatar} handleLoginSuccess={() => {
      Taro.navigateTo({
        url: '/pages/user/index'
      })
    }}
    />)
  }

  handleLoginSuccess = () => {
    this.setState({isNewUser: false});
    Taro.hideLoading();
  }

  selectCriminalNumber = (e) => {
    this.setState({
      number: getCriminalLawNumber(criminalLawOptions[e.detail.value])
    })
  }


  handleInputNumber = (value) => {
    this.setState({
      number: value
    })
  }

  handleProvinceChange = (value) => {
    this.setState({
      province: value
    })
  }

  renderSearchCriteria = () => {
    const {number, selectedCriminalKeywords, province} = this.state
    return <View>
      <View>
        <Picker mode='selector' range={criminalLawOptions} onChange={this.selectCriminalNumber}>
          <AtList>
            <AtListItem
              title='刑法法条'
              extraText={getCriminalLawChnNumber(number)}
            />
          </AtList>
        </Picker>
        <View>
          <AtInput
            type='text'
            placeholder='  或输入法条数字序号,如264'
            value={number}
            onChange={this.handleInputNumber}
          />
        </View>
        <View className='icon-line' onClick={() => {
          this.setState({
            isMenuOpened: true
          })}}
        >
          <AtBadge value={selectedCriminalKeywords.length}>
            <AtIcon value='tags' size='24' color='rgba(0,0,0)'></AtIcon>
          </AtBadge>
          <View className='text'>{selectedCriminalKeywords.length > 0 ? selectedCriminalKeywords.join(',') : '关键词'}</View>
        </View>
        <View className='icon-line'>
          <AtIcon value='map-pin' size='26' color='#b35900' onClick={() => {
            const that = this
            Taro.getLocation({
              success(res) {
                console.log(res)
                const {latitude, longitude} = res
                Taro.request({
                  url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=4POBZ-YEXYD-NPQ4R-PNZJ4-3XEE5-FFBXF`,
                  method: 'get',
                  success: function (r) {
                    console.log(r)
                    const {data} = r
                    const {result} = data
                    const {address_component} = result
                    const {province} = address_component
                    that.setState({
                      province:province
                    })
                  }
                })

              }
            })
          }}></AtIcon>
          <AtInput
            type='text'
            placeholder='位置'
            value={province}
            onChange={this.handleProvinceChange}
          />
        </View>
      </View>
    </View>
  }

  onChangeSearchValue = (value) => {
    this.setState({
      searchValue: value
    })
  }

  onSearch = () => {
    const that = this;
    const  { law, number, searchValue, selectedCriminalKeywords, province } = this.state;
    if (law === 'criminal') {
      let intVal = Number(number)
      if (isNaN(intVal) || number < 114 || number > 419) {
        Taro.showToast({
          title: `无效条文序号${number},请修正后再试！`,
          icon: 'none',
          duration: 4000
        })
        return ;
      }
    }
    this.setState({
      showLoading: true
    })
    Taro.cloud.callFunction({
      name: 'searchJudgements',
      data: {
        law,
        number,
        searchValue,
        selectedCriminalKeywords,
        province
      },
      complete: (r) => {
        console.log(r)
        if (r && r.result && r.result.data && r.result.data.length > 0) {
          that.setState({
            resultList: r.result.data
          })
          Taro.showToast({
            title: `仅显示前100个结果!`,
            icon: 'none',
            duration: 4000
          })
        } else {
          Taro.showToast({
            title: `未找到,可能是还未收录,敬请期待!`,
            icon: 'none',
            duration: 6000
          })
          that.setState({
            resultList: []
          })
        }
        that.setState({
          showLoading: false
        })
      }
    })
  }

  handleClose = () => {
    const {law, number} = this.state
    if (!law) {
      Taro.showToast({
        title: `请选法律`,
        icon: 'none',
        duration: 3000
      })
      return ;
    }
    if (!number && law === 'criminal') {
      Taro.showToast({
        title: `请选法条`,
        icon: 'none',
        duration: 3000
      })
      return ;
    }
    this.setState({
      showSetting: false
    })
    this.onSearch()
  }

  handleOpen = () => {
    this.setState({
      showSetting: true
    });
  }

  renderResults = () => {
    const {law, resultList, searchValue, selectedCriminalKeywords} = this.state
    let keyword
    if (selectedCriminalKeywords && selectedCriminalKeywords.length > 0) {
      if (searchValue) {
        keyword = [...selectedCriminalKeywords, searchValue].join('|');
      } else {
        keyword = [...selectedCriminalKeywords].join('|');
      }
    } else {
      keyword = searchValue ? searchValue : ''
    }
    return (<View>
      {resultList.map(item => {
        return (
          <JudgementSearchItem
            key={item._id}
            text={item.opinion}
            title={item.title}
            date={item.date}
            courtName={item.courtName}
            caseNumber={item.caseNumber}
            redirect={() => {
              Taro.navigateTo({
                url: `/pages/judgementDetail/index?id=${item.rowkey}&type=${law}&keyword=${keyword}`,
              })
              return ;

            }}
          />
        )
      })}
      {resultList.length > 0 && <AtDivider content='没有更多了' fontColor='#666' />}
      {resultList.length > 0 && <View >
        {/*<ad unit-id="adunit-0320f67c0e860e36"></ad>*/}
      </View>}
    </View>)
  }

  handleMenuClose = () => {
    const {activeKeyMap} = this.state
    const keys = Object.keys(activeKeyMap).filter(k => activeKeyMap[k])
    console.log(keys)
    this.setState({
      isMenuOpened: false,
      selectedCriminalKeywords: keys
    })
  }

  handleCriminalKeywordClick = (e) => {
    const {name} = e
    const {activeKeyMap} = this.state;
    activeKeyMap[name] = !activeKeyMap[name]
    this.setState({
      activeKeyMap: {...activeKeyMap}
    })
  }

  render () {
    const {isReadMode, law, number, searchValue, showSetting, showLoading,isMenuOpened, activeKeyMap, selectedCriminalKeywords, enableMainAd, resultList,
    } = this.state;
    return (
      <View className={`index-page ${isReadMode ? 'read-mode' : ''}`}>

        <AtNoticebar marquee speed={60}>
          数据信息均来源于裁判文书网，已收录超过10万份裁判文书，持续开发中...
        </AtNoticebar>
        <AtSearchBar
          placeholder='当前条件下搜索案由'
          value={searchValue}
          onChange={this.onChangeSearchValue}
          onActionClick={this.onSearch}
        />
        {this.renderResults()}
        {/*<View>userOpenId: {userOpenId}</View>*/}
        {/*<View>userName: {userName}</View>*/}
        {/*<View>userAvatar: {userAvatar}</View>*/}
        {/*<View>law: {law}</View>*/}
        {/*<View>number: {number}</View>*/}
        {/*<View>searchValue: {searchValue}</View>*/}
        <AtModal isOpened={showSetting}>
          <AtModalHeader>我要搜(刑事案件)</AtModalHeader>
          <AtModalContent>
            {this.renderSearchCriteria()}
          </AtModalContent>
          <AtModalAction>
            <Button className='btn-5' onClick={this.handleClose} >确定</Button>
          </AtModalAction>
          {/*<View className='search-law' onClick={this.jumpToMiniProgram}>去搜法搜更多法律知识</View>*/}
        </AtModal>

        {showLoading && <Loading2 />}
        <View onClick={this.handleOpen} className='float-setting'>
          <Image src={settingIcon} className='setting' mode='widthFix' />
        </View>

        <View className='float-help' onClick={() => {
          Taro.navigateTo({
            url: '/pages/judgementHelp/index'
          })
        }}
        >
          <AtBadge value='帮助'>
            <AtIcon value='help' size='26' color='rgba(0,0,0, 0.6)'></AtIcon>
          </AtBadge>
        </View>


        <AtActionSheet isOpened={isMenuOpened} cancelText='确定' title='请选择关键字(可多选)' onClose={() => {this.setState({isMenuOpened: false})}} onCancel={this.handleMenuClose}>
          <View>
            {criminalKeywords.map(criminalKeyword => {
              return (
                <AtTag
                  key={criminalKeyword}
                  name={criminalKeyword}
                  circle
                  active={activeKeyMap[criminalKeyword]}
                  onClick={this.handleCriminalKeywordClick}
                >{criminalKeyword}</AtTag>
              )
            })}
          </View>
        </AtActionSheet>
        {enableMainAd && resultList && resultList.length === 0 && !isMenuOpened && <View className='ad-bottom'>
          {/*<ad unit-id="adunit-0320f67c0e860e36"></ad>*/}
        </View>}
      </View>
    )
  }
}
