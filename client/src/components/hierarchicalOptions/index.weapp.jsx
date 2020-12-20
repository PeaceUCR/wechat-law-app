import Taro from '@tarojs/taro'
import {View} from "@tarojs/components";
import './index.scss'
//component function can't have default params value
const HierarchicalOptions = (props) => {
  let {options, onClick} = props;
  options = options && options.length > 0 ? options : [];
  return (<View className='hierarchical-options' >
    {options.map((option, index) => {
      return (<View key={`hierarchical-options-chapter-${index}`} className='hierarchical-option'>
        <View onClick={() => onClick("chapter", option.chapter)} className='chapter-option'>{option.chapter}</View>
        <View className='section-options'>
          {option.sub && option.sub.length>0 && option.sub.map((section, subIndex) => {
            return (<View key={`hierarchical-options-section-${subIndex}`}
                          onClick={() => {
                            onClick("section", section )
                          }}
                          className='section-option'
            >
              {section}
            </View>)
          })}
        </View>
      </View>)
    })}
  </View>)
}

export default HierarchicalOptions;
