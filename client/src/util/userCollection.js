import Taro, { setStorageSync }  from '@tarojs/taro'
import { getUserOpenId } from "./login";

export const JOIN_GROUP_URL = 'https://mmbiz.qpic.cn/mmbiz_jpg/6fKEyhdZU93icqHcZb0EWEEnUGOyMKAX2SHr9FzJp2o74JsMFzIlCU2bwUAKibIWa0k4AjVxhUmzT4wiboFQ2KxWw/640?wx_fmt=jpeg'

export const STATIC_POSTER_URL = 'https://mmbiz.qpic.cn/mmbiz_jpg/6fKEyhdZU90LYdxSlnd2Xia3VXnRsLaMN2saVksN70FNVib2PDiaicsiaeeOjwj84AugS8cMrdY9UBfTsk1SQQJTrIQ/640?wx_fmt=jpeg&amp;from=appmsg'
export const STATIC_POSTER_REDIRECT = '/pages/otherLaw/index?law=civil-law-regulation-2024';
// export const STATIC_POSTER_REDIRECT = '/pages/exampleDetail/index?type=complement&id=dddb1aef65806a87028f981c48afc255';
// export const STATIC_POSTER_REDIRECT = '/pages/exampleDetail/index?type=complement&id=8182da276522c80102bc62c30b91e5ab';
// export const STATIC_POSTER_REDIRECT = '/pages/exampleDetail/index?type=civil-law-explaination&id=dddb1aef657826fb01c97fed0b84c863';


export const BASE_REQUEST_URL = 'https://www.sofa-app.asia'

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

export const showPopupAd = () => {
  let interstitialAd = null;
  if (wx.createInterstitialAd) {
    interstitialAd = wx.createInterstitialAd({
      adUnitId: 'adunit-25f5d95e7a759687'
    })
  }
  if(interstitialAd) {
    interstitialAd.show().catch((err) => {
      console.error(err);
    })
  }
}

// TODO save loading NOT working!
export const saveCollection = async (collectionId, type, title) => {
  // showPopupAd();
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
  console.log('res', res);
  if (res.statusCode > 399) {
    console.log('error');
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
  showPopupAd();
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




