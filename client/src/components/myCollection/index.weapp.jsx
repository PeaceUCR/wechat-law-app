import Taro, { getStorageSync} from '@tarojs/taro'
import { AtListItem} from "taro-ui";
import {View} from "@tarojs/components";
import {lawIdLabelMap, courtExampleTitleMap, courtExampleTitleComplementMap, procuratorateExampleTitleMap, procuratorateExampleTitleComplementMap} from '../../util/util';
import './index.scss'

const MyCollection = (props) => {
  let collection = getStorageSync('collection');
  collection = collection ? collection : {};
  let cachedItems = getStorageSync('cachedItems');
  cachedItems = cachedItems ? cachedItems : {};
  const allKeys = Object.keys(collection).filter(key => collection[key])

  const termKeys = allKeys.filter(key => lawIdLabelMap[key])
  const courtExampleKeys = allKeys.filter(key => courtExampleTitleMap[key] || courtExampleTitleComplementMap[key])
  const procuratorateExampleKeys = allKeys.filter(key => procuratorateExampleTitleMap[key] || procuratorateExampleTitleComplementMap[key])
  const otherKeys = allKeys.filter(key => cachedItems[key])

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
          title={lawIdLabelMap[termKey]}
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
      {procuratorateExampleKeys.length > 0 && <View className='sub-title'>
        <View className='divider'></View>
        <View className='text'>检察院案例</View>
        <View className='divider'></View>
      </View>}
      {procuratorateExampleKeys.map(procuratorateExampleKey => (
        <AtListItem
          key={procuratorateExampleKey}
          title={procuratorateExampleTitleMap[procuratorateExampleKey] || procuratorateExampleTitleComplementMap[procuratorateExampleKey]}
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
          title={courtExampleTitleMap[courtExampleKey] || courtExampleTitleComplementMap[courtExampleKey]}
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
        <View className='text'>相关法定解释、规定，指导意见，审判参考</View>
        <View className='divider'></View>
      </View>}
      {otherKeys.map(otherKey => (
        <AtListItem
          key={otherKey}
          title={cachedItems[otherKey].title}
          arrow='right'
          onClick={() => {
            Taro.navigateTo({
              url: `/pages/exampleDetail/index?type=${cachedItems[otherKey].type}&id=${otherKey}`,
            })
          }}
        />
      ))}
    </View>
    {allKeys.length === 0 && <View className='sub-title'>
      <View className='divider'></View>
      <View className='text'>没有任何收藏</View>
      <View className='divider'></View>
    </View>}
  </View>)
}

export default MyCollection;
