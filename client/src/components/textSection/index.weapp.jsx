import Taro, {useState} from '@tarojs/taro'
import {RichText, View} from "@tarojs/components";
import './index.scss'
import {isStartWith, findAndHighlight} from "../../util/util";

const highlights = ['指导案例', '裁判要点', '相关法条', '相关法律规定', '基本案情', '裁判结果', '裁判理由', '刑法',
  '关键词', '要旨', '基本案情', '诉讼过程', '检察工作情况', '检察机关监督情况', '指导意义', '相关规定',
  '一、基本案情', '二、主要问题', '三、裁判理由','检察机关履职过程', '检察机关履职情况','裁判要旨','条文主旨','条文理解','审判实践中应注意的问题', '本条主旨', '本条释义',
  '办案经过','典型意义','检察履职情况'
];
const refine = (s) => {
  const str = s.trim()
  if(str && str.length > 0) {
    if(str.charAt(0) === '【' && str.charAt(str.length-1) === '】' ){
      return str.replace('【', '').replace('】', '');
    }
    if(str.charAt(0) === '[' && str.charAt(str.length-1) === ']' ){
      return str.replace('[', '').replace(']', '');
    }
  }
  return str;
}

let canCopy = true

const TextSection = (props) => {
  let {data, keyword, zoomIn, isTitle} = props;
  data = data ? data: '';
  keyword = keyword ? keyword: undefined

  // const [showCopy, setShowCopy] = useState(false);
  let pressTime;
  const touchStart = (text) => {
    console.log('start')
    pressTime = setTimeout(() => {
      //  你要do的事
      console.log('long', canCopy)
      if (canCopy) {
        Taro.setClipboardData({
          data: text,
          success: function (res) {
            Taro.showToast({
              title: '本段已复制到剪贴板',
              icon: 'none',
              duration: 2000
            })
          }
        });
        canCopy = false
      }

    }, 2000);
  }

  const touchEnd = () => {
    console.log('end')
    clearTimeout(pressTime);
  }

  return (<View  className={`text-section ${zoomIn ? 'zoom-in' : ''} ${isTitle ? 'title': ''}`}>
    <View className='content'>{data.split('\n').filter(line => line.trim() && line.trim().length > 0).map(line => refine(line)).map((line, index) => {
      return (<View className='line' key={`text-example-detail-${index}`} onTouchStart={() => touchStart(line)} onTouchEnd={touchEnd}>
        <RichText nodes={findAndHighlight(line, index, keyword)} className={isStartWith(line, highlights) ? 'highlight': ''} ></RichText>
      </View>)
    })}</View>
    {/*{showCopy && <View className='copy'>复制</View>}*/}
  </View>)
}

export default TextSection;
