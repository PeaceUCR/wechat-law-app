import Taro from '@tarojs/taro'
import { AtListItem} from "taro-ui";
import {View} from "@tarojs/components";
import {
  lawIdLabelMap,
  courtExampleTitleComplementMap,
  procuratorateExampleTitleComplementMap,
} from '../../util/util';
import {otherLawNameMap} from '../../util/otherLaw'

import './index.scss'

const otherTypes = [
  'admin-explanation',
  'explanation',
  'terms-complement',
  'complement',
  'consultant',
  'court-open',
  'civil-law-explaination',
  'civilLawExample']

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
}

const MyCollection = (props) => {
  let {collection} = props;
  collection = collection ? collection : []
  const collectionObj = {};
  collection.forEach(c => collectionObj[c.collectionId] = c)
  const allKeys = Object.keys(collectionObj)
  const civilKeys = Object.keys(collectionObj).filter(key => collectionObj[key].type === 'civilLawTermDetail')

  const termKeys = allKeys.filter(key => lawIdLabelMap[key])
  const courtExampleKeys = allKeys.filter(key => collectionObj[key].type === 'court' || courtExampleTitleComplementMap[key])
  const procuratorateExampleKeys = allKeys.filter(key => collectionObj[key].type === 'procuratorate'|| procuratorateExampleTitleComplementMap[key])
  const otherKeys = allKeys.filter(key => otherTypes.indexOf(collectionObj[key].type) !== -1)

  const litigationLawKeys = allKeys.filter(key => collectionObj[key].type === 'litigation-law')
  const litigationExplanationKeys = allKeys.filter(key => collectionObj[key].type === 'litigation-explanation')
  const litigationRegulationawKeys = allKeys.filter(key => collectionObj[key].type === 'litigation-regulation')
  const civilLawRegulationKeys = allKeys.filter(key => collectionObj[key].type === 'civil-law-regulation')

  const sourceKeys = allKeys.filter(key => collectionObj[key].type === 'source')

  return (<View className='my-collection' >
    <View>
      {termKeys.length > 0 && <View className='sub-title'>
        <View className='divider'></View>
        <View className='text'>刑法法条</View>
        <View className='divider'></View>
      </View>}
      {termKeys.map(termKey => (
        <AtListItem
          key={termKey}
          title={collectionObj[termKey].title}
          arrow='right'
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/termDetail/index?id=${termKey}`,
            })
          }}
        />
        ))}
    </View>
    <View>
      {civilKeys.length > 0 && <View className='sub-title'>
        <View className='divider'></View>
        <View className='text'>民法典法条</View>
        <View className='divider'></View>
      </View>}
      {civilKeys.map(civilKey => (
        <AtListItem
          key={civilKey}
          title={collectionObj[civilKey].title}
          arrow='right'
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/civilLawDetail/index?id=${civilKey}`,
            })
          }}
        />
      ))}
    </View>
    <View>
      {procuratorateExampleKeys.length > 0 && <View className='sub-title'>
        <View className='divider'></View>
        <View className='text'>检察院案例</View>
        <View className='divider'></View>
      </View>}
      {procuratorateExampleKeys.map(procuratorateExampleKey => (
        <AtListItem
          key={procuratorateExampleKey}
          title={collectionObj[procuratorateExampleKey].title}
          arrow='right'
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/exampleDetail/index?type=procuratorate&id=${procuratorateExampleKey}`,
            })
          }}
        />
      ))}
    </View>
    <View>
      {courtExampleKeys.length > 0 && <View className='sub-title'>
        <View className='divider'></View>
        <View className='text'>法院案例</View>
        <View className='divider'></View>
      </View>}
      {courtExampleKeys.map(courtExampleKey => (
        <AtListItem
          key={courtExampleKey}
          title={collectionObj[courtExampleKey].title}
          arrow='right'
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/exampleDetail/index?type=court&id=${courtExampleKey}`,
            })
          }}
        />
        ))}
    </View>
    <View>
      {otherKeys.length > 0 && <View className='sub-title'>
        <View className='divider'></View>
        <View className='text'>相关解释、规定、指导意见、案例、公报、参考</View>
        <View className='divider'></View>
      </View>}
      {otherKeys.map(otherKey => (
        <AtListItem
          key={otherKey}
          title={collectionObj[otherKey].title}
          arrow='right'
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/exampleDetail/index?type=${collectionObj[otherKey].type}&id=${otherKey}`,
            })
          }}
        />
      ))}
    </View>
    <View>
      {litigationLawKeys.length > 0 && <View className='sub-title'>
        <View className='divider'></View>
        <View className='text'>刑事诉讼法</View>
        <View className='divider'></View>
      </View>}
      {litigationLawKeys.map(litigationLawKey => (
        <AtListItem
          key={litigationLawKey}
          title={collectionObj[litigationLawKey].title}
          arrow='right'
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/regulationDetail/index?type=${collectionObj[litigationLawKey].type}&id=${litigationLawKey}`,
            })
          }}
        />
      ))}
    </View>
    <View>
      {litigationExplanationKeys.length > 0 && <View className='sub-title'>
        <View className='divider'></View>
        <View className='text'>(最高法)适用刑事诉讼法的解释</View>
        <View className='divider'></View>
      </View>}
      {litigationExplanationKeys.map(litigationExplanationKey => (
        <AtListItem
          key={litigationExplanationKey}
          title={collectionObj[litigationExplanationKey].title}
          arrow='right'
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/regulationDetail/index?type=${collectionObj[litigationExplanationKey].type}&id=${litigationExplanationKey}`,
            })
          }}
        />
      ))}
    </View>
    <View>
      {litigationRegulationawKeys.length > 0 && <View className='sub-title'>
        <View className='divider'></View>
        <View className='text'>刑事诉讼规则(检)</View>
        <View className='divider'></View>
      </View>}
      {litigationRegulationawKeys.map(litigationRegulationawKey => (
        <AtListItem
          key={litigationRegulationawKey}
          title={collectionObj[litigationRegulationawKey].title}
          arrow='right'
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/regulationDetail/index?type=${collectionObj[litigationRegulationawKey].type}&id=${litigationRegulationawKey}`,
            })
          }}
        />
      ))}
    </View>
    <View>
      {civilLawRegulationKeys.length > 0 && <View className='sub-title'>
        <View className='divider'></View>
        <View className='text'>民事诉讼法</View>
        <View className='divider'></View>
      </View>}
      {civilLawRegulationKeys.map(civilLawRegulationKey => (
        <AtListItem
          key={civilLawRegulationKey}
          title={collectionObj[civilLawRegulationKey].title}
          arrow='right'
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/regulationDetail/index?type=${collectionObj[civilLawRegulationKey].type}&id=${civilLawRegulationKey}`,
            })
          }}
        />
      ))}
    </View>

    <View>
      {Object.keys(newLaws).map(law => {
        const targetKeys = allKeys.filter(key => collectionObj[key].type === law)
        return (<View key={law}>
          <View>
            {targetKeys.length > 0 && <View className='sub-title'>
              <View className='divider'></View>
              <View className='text'>{newLaws[law]}</View>
              <View className='divider'></View>
            </View>}
            {targetKeys.map(targetKey => (
              <AtListItem
                key={targetKey}
                title={collectionObj[targetKey].title}
                arrow='right'
                onClick={() => {
                  Taro.navigateTo({
                    url: `/pages/regulationDetail/index?type=${collectionObj[targetKey].type}&id=${targetKey}`,
                  })
                }}
              />
            ))}
          </View>


        </View>)
      })}
    </View>

    <View>
      {sourceKeys.length > 0 && <View className='sub-title'>
        <View className='divider'></View>
        <View className='text'>量刑指导意见</View>
        <View className='divider'></View>
      </View>}
      {sourceKeys.map(policeKey => (
        <AtListItem
          key={policeKey}
          title={collectionObj[policeKey].title}
          arrow='right'
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/exampleDetail/index?type=${collectionObj[policeKey].type}&id=${policeKey}`,
            })
          }}
        />
      ))}
    </View>
    {allKeys.length === 0 && civilKeys.length === 0 && <View className='sub-title'>
      <View className='divider'></View>
      <View className='text'>没有任何收藏</View>
      <View className='divider'></View>
    </View>}
  </View>)
}

export default MyCollection;
