import moment from "moment";
import Taro from '@tarojs/taro'
import { AtListItem, AtDivider, AtIcon } from "taro-ui";
import {View} from "@tarojs/components";

import {otherLawNameMap} from '../../util/otherLaw'

import './index.scss'

const newLaws = {
  'police': '公安机关办理刑事案件程序规定',
  'police-admin-regulation': '公安机关办理行政案件程序规定',
  'public-order-admin-penalty-law': '治安管理处罚法',
  'supervision-law': '监察法',
  'admin-punish-law': '行政处罚法',
  'labor-law': '劳动法',
  'labor-contract-law': '劳动合同法',
  'road-safe-law': '道路交通安全法',
  'road-safe-regulation': '道路交通安全法实施条例',
  'anti-terrorism-law': '反恐怖主义法',
  'anti-drug-law': '禁毒法',
  'admin-litigation-law': '行政诉讼法',
  'admin-litigation-explaination': '最高法关于适用"行政诉讼法"的解释',
  'admin-force-law': '行政强制法',
  'admin-reconsider-law': '行政复议法',
  'admin-reconsider-regulation': '行政复议法实施条例',
  'admin-allow-law': '行政许可法',
  'company-law': '公司法',
  'criminal-litigation-explanation': otherLawNameMap['criminal-litigation-explanation'],
  'civil-litigation-explanation': otherLawNameMap['civil-litigation-explanation'],
  'road-safe-violation-handling': otherLawNameMap['road-safe-violation-handling'],
  'police-law':otherLawNameMap['police-law'],
  'police-enforce-detail': otherLawNameMap['police-enforce-detail'],
  'national-compensation': otherLawNameMap['national-compensation'],
  'exit-entry-law': otherLawNameMap['exit-entry-law'],
  'help-law': otherLawNameMap['help-law'],
  'consumer-right-protect-law': otherLawNameMap['consumer-right-protect-law'],
  'public-interest-rule': otherLawNameMap['public-interest-rule'],
  'fire-fighting': otherLawNameMap['fire-fighting'],
  'labor-conciliation': otherLawNameMap['labor-conciliation'],
  'medical-malpractice-regulation': otherLawNameMap['medical-malpractice-regulation']
}

const typeMap = {
  'criminalLawTermDetail': '刑法',
  'civilLawTermDetail': '民法典',
  ...newLaws,
  ...otherLawNameMap,
}

const MyCollection2 = (props) => {
  let {collection, removeCollectionAtIndex} = props;
  collection = collection ? collection : []

  const redirect = (c) => {
    const {type, collectionId} = c

    if (otherLawNameMap[type] !== undefined) {
      Taro.navigateTo({
        url: `/pages/regulationDetail/index?type=${type}&id=${collectionId}`,
      })
      return;
    }

    switch (type) {
      case 'criminalLawTermDetail':
        Taro.navigateTo({
          url: `/pages/termDetail/index?id=${collectionId}`,
        })
        break;
      case 'civilLawTermDetail':
        Taro.navigateTo({
          url: `/pages/civilLawDetail/index?id=${collectionId}`,
        })
        break;
      case 'fileCase':
        Taro.navigateTo({
          url: `/pages/fileCaseDetail/index?id=${collectionId}&criminalLawNumber=${c.criminalLawNumber}`,
        })
        break;
      case 'sentencing':
        Taro.navigateTo({
          url: `/pages/sentencingDetail/index?id=${collectionId}&criminalLawNumber=${c.criminalLawNumber}`,
        })
        break;
      case 'cai-pan-gui-ze':
        Taro.navigateTo({
          url: `/pages/caiPanGuiZeDetail/index?id=${collectionId}`,
        })
        break;
      default:
        Taro.navigateTo({
          url: `/pages/exampleDetail/index?type=${type}&id=${collectionId}`,
        })
        break;
    }
  }

  return (<View className='my-collection'>
    <View className='sub-title'>
      <View className='divider'></View>
      <View className='text'>我的收藏</View>
      <View className='divider'></View>
    </View>
    <View className='my-collection-list'>
      {collection.map((c, index)=> (<View className='my-collection-list-item' key={c._id}>

        <View className='time'>{moment(c.time).format('YYYY-MM-DD HH:mm')}</View>
        <View className='item-line'>
          <View className='main'>
            <AtListItem
              key={c._id}
              title={c.title}
              note={typeMap[c.type]}
              onClick={() => redirect(c)}
              arrow='right'
            />
          </View>
          <View className='item-line-delete' onClick={() => {
            removeCollectionAtIndex(c, index)
          }}
          >
            <AtIcon value='trash' size='26' color='#990000'></AtIcon>
          </View>
        </View>
      </View>))}
    </View>
    {/*<AtDivider content='没有更多了' fontColor='#666' />*/}
  </View>)
}

export default MyCollection2;
