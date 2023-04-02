import Taro, { setStorageSync }  from '@tarojs/taro'
import { BASE_REQUEST_URL } from './consult'

export const getJudgmentDetailByRowKey = async (rowKey) => {
  const params = {
    url: `${BASE_REQUEST_URL}/api/judgment-detail/${rowKey}`,
    method: 'GET',
  }

  const res = await Taro.request(params);
  if (res.statusCode > 399) {
    Taro.showToast({
      title: '搜索失败！',
      icon: 'none',
      duration: 3000
    })
    throw 'error'
  }
  const { data } = res;
  return data;
}
