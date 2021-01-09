import Taro, { getStorageSync} from '@tarojs/taro'
import { AtListItem} from "taro-ui";
import {View} from "@tarojs/components";
import {
  lawIdLabelMap,
  courtExampleTitleMap,
  courtExampleTitleComplementMap,
  procuratorateExampleTitleMap,
  procuratorateExampleTitleComplementMap,
  civilTagMap,
  civilLawIdNumberMap
} from '../../util/util';
import './index.scss'

const otherTypes = ['explanation', 'terms-complement','complement','consultant','court-open','civilLawExplaination','civilLawExample']
const MyCollection = (props) => {
  let {collection} = props;
  collection = collection ? collection : []
  const collectionObj = {};
  collection.forEach(c => collectionObj[c.collectionId] = c)
  const allKeys = Object.keys(collectionObj)
  const civilKeys = Object.keys(collectionObj).filter(key => civilLawIdNumberMap[key])

  const termKeys = allKeys.filter(key => lawIdLabelMap[key])
  const courtExampleKeys = allKeys.filter(key => courtExampleTitleMap[key] || courtExampleTitleComplementMap[key])
  const procuratorateExampleKeys = allKeys.filter(key => procuratorateExampleTitleMap[key] || procuratorateExampleTitleComplementMap[key])
  const otherKeys = allKeys.filter(key => otherTypes.indexOf(collectionObj[key].type) !== -1)

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
          title={`${civilLawIdNumberMap[civilKey]} ${civilTagMap[civilLawIdNumberMap[civilKey]]}`}
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
        <View className='text'>相关解释、规定、指导意见、案例、公报</View>
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
    {allKeys.length === 0 && civilKeys.length === 0 && <View className='sub-title'>
      <View className='divider'></View>
      <View className='text'>没有任何收藏</View>
      <View className='divider'></View>
    </View>}
  </View>)
}

export default MyCollection;
