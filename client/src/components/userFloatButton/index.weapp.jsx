import Taro from '@tarojs/taro'
import {AtAvatar, AtBadge} from "taro-ui";
import {View} from "@tarojs/components";
import './index.scss'

const UserFloatButton = (props) => {

  const { avatarUrl } = props;

  const handleClick = () => {
    Taro.navigateTo({
      url: '/pages/user/index'
    })
    // Taro.showToast({
    //   title: '敬请期待',
    //   icon: 'none',
    //   duration: 1000
    // })
  }
  return (<View className='user-float-button' >
    <View
      className='avatar-container'
      onClick={handleClick}
    >
      <AtBadge value=''>
        <AtAvatar circle image={avatarUrl}></AtAvatar>
      </AtBadge>
    </View>
  </View>)
}

export default UserFloatButton;
