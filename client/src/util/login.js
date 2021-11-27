import Taro, { getStorageSync, setStorageSync } from '@tarojs/taro'

export const redirectToIndexIfNewUser = () => {
  Taro.showToast({
    title: '未检测到登录用户，无法使用收藏功能, 请先去首页登录',
    icon: 'none',
    duration: 3000
  })
}

export const checkIfNewUser = () => {
  const user = getStorageSync('user');
  if (user) {
    return false;
  }
  return true;
}

export const getUserAvatar = () => {
  const user = getStorageSync('user');
  return user.avatarUrl;
}

export const getUserOpenId = () => {
  const user = getStorageSync('user');
  return user.openId;
}

export const getUserNickname = () => {
  const user = getStorageSync('user');
  return user.nickName;
}

export const isSuperAdmin = () => {
  const user = getStorageSync('user');
  return user.openId === 'o00Y-5C_d5zfv685dF7SI0zy4mS4' || user.openId === 'o00Y-5ECkT-Pz6rMDXTpDLj5a0NQ';
}

export const setLocation = (location) => {
  const user = getStorageSync('user');
  const {province, city} = location
  user.province = province
  user.city = city
  setStorageSync('user', user);
}

export const getProvince = () => {
  const user = getStorageSync('user');
  return user.province;
}

export const getCity = () => {
  const user = getStorageSync('user');
  return user.city;
}
