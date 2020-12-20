import Taro from '@tarojs/taro'
import {View} from "@tarojs/components";
import throttle from 'lodash/throttle';
import './index.scss'

const TermSearchItem = (props) => {
  let {term, disableRedirect, type} = props;
  term = term ? term : {};
  const {text, crime, tag, _id} = term;
  const isCrime = tag === crime;
  const redirect = throttle(
    () => {
      if (disableRedirect) {
        return ;
      } else if (type === 'civil') {
        Taro.navigateTo({
          url: `/pages/civilLawDetail/index?id=${_id}`,
        })
      } else {
        Taro.navigateTo({
          url: `/pages/termDetail/index?id=${_id}`,
        })
      }

    },
    2000,
    { trailing: false }
  );
  return (<View className='search-item' onClick={redirect} >
    <View className={isCrime? 'crime tag':'tag'}>{tag}</View>
    <View>{text}</View>
  </View>)
}

export default TermSearchItem;
