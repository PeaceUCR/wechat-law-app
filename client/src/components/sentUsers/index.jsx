import Taro, { Component } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import './index.scss';


export default class SentUsers extends Component{
  static defaultProps = {
    list: []
  };

  render() {
    let { list } =  this.props;
    if (list
      && list.length > 8
    ) {
      list = list.slice(0, 8)
    }

    return <View className='participator-list'>
      {
        list && list.map((user, index) => {
          return <View className='avatar-container' key={`${user.openId}-${index}`}>
            {user && user.avatarUrl && <Image className='avatar' src={user.avatarUrl}/>}
          </View>;
        })
      }
      {list && list.length > 8 && <View>...</View>}
    </View>;
  }
}
