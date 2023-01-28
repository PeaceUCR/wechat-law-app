import Taro, { setStorageSync }  from '@tarojs/taro'
import { getUserOpenId } from "./login";

export const STATIC_POSTER_URL = 'https://mmbiz.qpic.cn/mmbiz_jpg/6fKEyhdZU93uF3JQicicicV4oYUfPJFaEercEPYY9USfxiaJNBWEtdgJnCH1XzNGwHFicuVlVnShYxUv02kckUEEibXg/0?wx_fmt=jpeg';
export const STATIC_POSTER_REDIRECT = '';


export const BASE_REQUEST_URL = 'https://www.best-sofa.top'

export const isCollected = async (id, type) => {
  const openId = getUserOpenId();
  if (!openId) {
    Taro.showToast({
      title: '为检测到登陆用户，请返回首页登陆',
      icon: 'none',
      duration: 3000
    });
    return ;
  }
  const params = {
    url: `${BASE_REQUEST_URL}/api/user-collection?openId=${openId}&collectionId=${id}`,
    method: 'GET',
  }
  try {
    const res = await Taro.request(params);
    if (res.statusCode > 399) {
      throw 'error'
    }
    const { data } = res;
    return data;
  } catch (e) {
    Taro.showToast({
      title: '获取收藏数据失败！',
      icon: 'none',
      duration: 3000
    })
    console.log('error', e);
    return false;
  }
}

export const getUserCollections = async () => {
  const openId = getUserOpenId();
  if (!openId) {
    Taro.showToast({
      title: '为检测到登陆用户，请返回首页登陆',
      icon: 'none',
      duration: 3000
    });
    return ;
  }
  const params = {
    url: `${BASE_REQUEST_URL}/api/user-collection/list?openId=${openId}`,
    method: 'GET',
  }
  try {
    const res = await Taro.request(params);
    if (res.statusCode > 399) {
      throw 'error'
    }
    const { data } = res;
    return data;
  } catch (e) {
    Taro.showToast({
      title: '获取收藏数据失败！',
      icon: 'none',
      duration: 3000
    })
    console.log('error', e);
    return false;
  }
}

export const saveCollection = async (collectionId, type, title) => {
  const openId = getUserOpenId();
  if (!openId) {
    Taro.showToast({
      title: '为检测到登陆用户，请返回首页登陆',
      icon: 'none',
      duration: 3000
    });
    return ;
  }
  const params = {
    url: `${BASE_REQUEST_URL}/api/user-collection`,
    method: 'POST',
    data: {
      openId,
      collectionId,
      type,
      title
    }
  }

  const res = await Taro.request(params);
  if (res.statusCode > 399) {
    Taro.showToast({
      title: '收藏失败！',
      icon: 'none',
      duration: 3000
    })
    throw 'error'
  }
  const { data } = res;
  return data;
}

export const deleteCollection = async (collectionId) => {
  const openId = getUserOpenId();
  if (!openId) {
    Taro.showToast({
      title: '为检测到登陆用户，请返回首页登陆',
      icon: 'none',
      duration: 3000
    });
    return ;
  }
  const params = {
    url: `${BASE_REQUEST_URL}/api/user-collection`,
    method: 'DELETE',
    data: {
      openId,
      collectionId,
    }
  }
  try {
    const res = await Taro.request(params);
    if (res.statusCode > 399) {
      throw 'error'
    }
    const { data } = res;
    return data;
  } catch (e) {
    Taro.showToast({
      title: '获取收藏数据失败！',
      icon: 'none',
      duration: 3000
    })
    console.log('error', e);
    return false;
  }

}

export const saveUser = async (openId, nickname, avatarUrl) => {
  const params = {
    url: `${BASE_REQUEST_URL}/api/user`,
    method: 'POST',
    data: {
      openId,
      nickname,
      avatarUrl
    }
  }
  try {
    const res = await Taro.request(params);
    if (res.statusCode > 399) {
      throw 'error'
    }
    const { data } = res;
    return data;
  } catch (e) {
    Taro.showToast({
      title: '保存用户数据失败！',
      icon: 'none',
      duration: 3000
    })
    console.log('error', e);
    return false;
  }
}

export const getUserByOpenId = async (openId) => {
  const params = {
    url: `${BASE_REQUEST_URL}/api/user/${openId}`,
    method: 'GET',
  }
  try {
    const res = await Taro.request(params);
    if (res.statusCode > 399) {
      throw 'error'
    }
    const { data } = res;
    return data;
  } catch (e) {
    Taro.showToast({
      title: '获取用户数据失败！',
      icon: 'none',
      duration: 3000
    })
    console.log('error', e);
    return false;
  }
}

export const recordUser = async () => {
  const openId = getUserOpenId();
  if (!openId) {
    Taro.showToast({
      title: '为检测到登陆用户，请返回首页登陆',
      icon: 'none',
      duration: 3000
    });
    return ;
  }
  const params = {
    url: `${BASE_REQUEST_URL}/api/user/record/${openId}`,
    method: 'PUT',
  }
  try {
    const res = await Taro.request(params);
    if (res.statusCode > 399) {
      throw 'error'
    }
    const { data } = res;
    return data;
  } catch (e) {
    Taro.showToast({
      title: '获取用户数据失败！',
      icon: 'none',
      duration: 3000
    })
    console.log('error', e);
    return false;
  }
}

export const addScore = async () => {
  const openId = getUserOpenId();
  if (!openId) {
    Taro.showToast({
      title: '为检测到登陆用户，请返回首页登陆',
      icon: 'none',
      duration: 3000
    });
    return ;
  }
  const params = {
    url: `${BASE_REQUEST_URL}/api/user/add/${openId}`,
    method: 'PUT',
  }
  try {
    const res = await Taro.request(params);
    if (res.statusCode > 399) {
      throw 'error'
    }
    const { data } = res;
    setStorageSync('user', data);
    return data;
  } catch (e) {
    Taro.showToast({
      title: '获取用户数据失败！',
      icon: 'none',
      duration: 3000
    })
    console.log('error', e);
    return false;
  }
}

export const checkBeforeCopy = async () => {
  const openId = getUserOpenId();
  if (!openId) {
    Taro.showToast({
      title: '为检测到登陆用户，请返回首页登陆',
      icon: 'none',
      duration: 3000
    });
    return ;
  }
  const params = {
    url: `${BASE_REQUEST_URL}/api/user/checkBeforeCopy/${openId}`,
    method: 'PUT',
  }
  const res = await Taro.request(params);
  if (res.statusCode > 399) {
    Taro.showToast({
      title: '没有足够积分或服务器错误！',
      icon: 'none',
      duration: 3000
    })
    throw 'error'
  }
  const { data } = res;
  setStorageSync('user', data);
  return data;
}




