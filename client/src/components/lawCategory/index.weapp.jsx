import Taro, {useState} from '@tarojs/taro'
import {View} from "@tarojs/components";
import {AtAccordion} from "taro-ui";
import './index.scss'
import {lawLabelMap, lawMap, civilLawIdMap, civilTagMap} from '../../util/util'

const LawCategory = (props) => {
  let {catgoryLine, type} = props;
  catgoryLine = catgoryLine ? catgoryLine : {}
  const [isHidden, setIsHidden] = useState(true);
  // return (<View className={`all-law-catgory-${catgoryLine.type}`}><View
  //   onClick={() => {
  //     if (catgoryLine.laws && catgoryLine.laws.length > 0) {
  //       setIsHidden(!isHidden)
  //     }
  //   }}
  // >{catgoryLine.value} {catgoryLine.laws && <AtIcon value={isHidden ?'chevron-up': 'chevron-down'} size='18' color='#6190E8'></AtIcon>}</View>
  //   {isHidden && <View>
  //     {catgoryLine.laws.map((law, index) => {
  //       return (<View key={`all-law-catgoryLine-option-${index}`} className='all-law-catgory-option' onClick={() => {
  //         Taro.navigateTo({
  //           url: `/pages/termDetail/index?id=${lawMap[law]}`,
  //         })
  //       }}
  //       >
  //         {lawLabelMap[law]}
  //       </View>)
  //       }
  //       )}
  //   </View>}
  // </View>)
  return (
    <View className={`all-law-catgory-${catgoryLine.type}`}>
      {catgoryLine.laws && <AtAccordion
        open={!isHidden}
        note={catgoryLine.value}
        hasBorder={false}
        onClick={() => {
          if (catgoryLine.laws && catgoryLine.laws.length > 0) {
            setIsHidden(!isHidden)
          }
        }}
      >
        {catgoryLine.laws && catgoryLine.laws.map((law, index) => {
            return (<View key={`all-law-catgoryLine-option-${index}`} className='all-law-catgory-option' onClick={() => {
              if (type === 'civil') {
                Taro.navigateTo({
                  url: `/pages/civilLawDetail/index?id=${civilLawIdMap[law]}`,
                })
              }else {
                Taro.navigateTo({
                  url: `/pages/termDetail/index?id=${lawMap[law]}`,
                })
              }

            }}
            >
              {type === 'civil'? `${law} ${civilTagMap[law]}` : lawLabelMap[law]}
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
