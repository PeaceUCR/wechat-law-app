import Taro, { setStorageSync }  from '@tarojs/taro'


export const BASE_REQUEST_URL = 'https://www.best-sofa.top'
// export const BASE_REQUEST_URL = 'http://localhost:8080'

export const getConsultCategory = async () => {
  const params = {
    url: `${BASE_REQUEST_URL}/consults-category.json`,
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
      title: '获取数据失败！',
      icon: 'none',
      duration: 3000
    })
    console.log('error', e);
    return false;
  }
}

export const getConsultById = async (id) => {
  const params = {
    url: `${BASE_REQUEST_URL}/api/example/${id}`,
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
      title: '获取数据失败！',
      icon: 'none',
      duration: 3000
    })
    console.log('error', e);
    return false;
  }
}
