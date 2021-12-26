 const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  const db = cloud.database()

  const res = await db.collection('user').where({
    //下面这3行，为筛选条件
    openId
  }).get();

  if (res.data && res.data.length > 0) {
    return res;
  }
  await db.collection("user").add({
    data: {
      openId: wxContext.OPENID,//获取操作者_openid的方法
      avatarUrl: event.avatarUrl,
      nickName: event.nickName,
      score: 3,
      lastTimeLogin: new Date()
    }
  })

  return await db.collection('user').where({
    //下面这3行，为筛选条件
    openId
  }).get()

  //
  // return {
  //   openid: wxContext.OPENID
  // }
}
