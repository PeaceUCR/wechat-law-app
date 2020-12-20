import { getStorageSync } from '@tarojs/taro'

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

