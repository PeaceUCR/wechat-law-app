import Taro, {setStorageSync, useState, useEffect} from '@tarojs/taro'
import {Image, Text, View, Button} from "@tarojs/components";
import {AtIcon} from "taro-ui";
import {avatarUrl} from '../../util/util';
import './index.scss'
import {saveUser} from "../../util/userCollection";

const FAIL_AUTH_DENY = 'getUserInfo:fail auth deny';
const title = '首次使用，点我登录';

const LoginPopup = (props) => {
  const {canClose, handleCloseLogin, openId} = props
  const handleLogin = () => {
    // if (res.detail && res.detail.errMsg === FAIL_AUTH_DENY){
    //   return Taro.showToast({
    //     title: '授权失败',
    //     icon: 'none',
    //     duration: 1000
    //   });
    // }

    wx.getUserProfile({
      desc: '用于登录', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      fail: () => {
        Taro.showToast({
          title: '授权失败',
          icon: 'none',
          duration: 1000
        });
      },
      success: (res) => {
        console.log(res.userInfo)
        Taro.showLoading({
          title: '登录中',
        });
        saveUser(
          openId,
          res.userInfo.nickName,
          res.userInfo.avatarUrl,
        ).then(r => {
          setStorageSync('user', r);
          props.handleLoginSuccess();
          Taro.showToast({
            title: `欢迎${r.result.data[0].nickName},首次使用点击屏幕右上角的帮助查看使用指南`,
            icon: 'none',
            duration: 8000
          });
        })
      }
    })

  }
  const [text, setText] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const index = text.length;
      setText(title.substring(0, index + 1))
    }, 200);
    return () => {
      clearInterval(interval);
    }
  })

  return (<View className='login-popup'>
    <Button
      className='login-button'
      onClick={handleLogin}
    >
      <Image src={avatarUrl} className='avatar' />
      <Text className='text'>{text}<Text className='cursor'></Text></Text>
    </Button>
    {canClose && <View className='close-icon'>
      <AtIcon value='close-circle' size='30' color='#90EE90' onClick={handleCloseLogin}></AtIcon>
    </View>}
  </View>)
}

export default LoginPopup;
