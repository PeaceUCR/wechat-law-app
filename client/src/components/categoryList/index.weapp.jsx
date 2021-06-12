import Taro from '@tarojs/taro'
import {View} from "@tarojs/components";
import './index.scss'
//component function can't have default params value
// options = [{ level: 1, vaue: '第一章 总则'}]
const CategoryList = (props) => {
  let {options, onClick, isReadMode} = props;
  options = options && options.length > 0 ? options : [];
  return (<View className='category-list' >
    {options.map((option, index) => {
      const {level, value} = option;
      return (<View key={`category-level-${level}-${index}`} className={`category-option-container ${isReadMode ? 'read-mode' : ''}`}>
        <View onClick={() => onClick(option.value)} className='category-option'>{value}</View>
      </View>)
    })}
  </View>)
}

export default CategoryList;
