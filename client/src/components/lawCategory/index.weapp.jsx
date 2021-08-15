import Taro, {useState} from '@tarojs/taro'
import {View, Text} from "@tarojs/components";
import {AtAccordion} from "taro-ui";
import './index.scss'
import {getGlobalData} from '../../util/global'
import {lawLabelMap, lawMap, civilLawRegulationIdMap, litigationLawIdMap} from '../../util/util'
import RenderLabel from '../renderLabel/index.weapp'

const LawCategory = (props) => {
  let {catgoryLine, type} = props;
  catgoryLine = catgoryLine ? catgoryLine : {}
  const [isHidden, setIsHidden] = useState(true);
  const getLabel = (law) => {
    if (type === 'civil') {
      return `${law} ${getGlobalData('civilTagMap')[law]}`
    } else if (type === 'civil-law-regulation' || type === 'litigation-law') {
      return law
    }
    return lawLabelMap[law]
  }
  return (
    <View className={`all-law-catgory-${catgoryLine.type}`}>
      {catgoryLine.laws && <AtAccordion
        isAnimation={false}
        open={!isHidden}
        note={catgoryLine.value}
        hasBorder={false}
        onClick={() => {
          if (catgoryLine.laws && catgoryLine.laws.length > 0) {
            setIsHidden(!isHidden)
          }
        }}
      >
        {!isHidden && catgoryLine.laws && catgoryLine.laws.map((law, index) => {
            return (<View key={`all-law-catgoryLine-option-${index}`} className='all-law-catgory-option' onClick={() => {
              if (type === 'civil') {
                Taro.navigateTo({
                  url: `/pages/civilLawDetail/index?id=${getGlobalData('civilLawIdMap')[law]}`,
                })
              } else if (type === 'civil-law-regulation') {
                Taro.navigateTo({
                  url: `/pages/regulationDetail/index?id=${civilLawRegulationIdMap[law]}&type=${type}`,
                })
              }  else if (type === 'litigation-law') {
                Taro.navigateTo({
                  url: `/pages/regulationDetail/index?id=${litigationLawIdMap[law]}&type=${type}`,
                })
              } else {
                Taro.navigateTo({
                  url: `/pages/termDetail/index?id=${lawMap[law]}`,
                })
              }

            }}
            >
              <RenderLabel label={getLabel(law)} />
            </View>)
          }
        )}
      </AtAccordion>}
      {catgoryLine.laws === undefined && <View className='all-law-catgory-title'>
        {catgoryLine.value}
      </View>}
    </View>)
}

export default LawCategory;
