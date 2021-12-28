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
  const _ = db.command

  if (event.type === 'recognize') {
    return await db.collection("recognize").add({
      data: {
        openId: wxContext.OPENID,//获取操作者_openid的方法
        nickName: event.nickName,
        time: new Date()
      }
    })
  }

  const {location} = event
  if (location) {
    const {province, city} = location
    return await db.collection('user').where({
      //下面这3行，为筛选条件
      openId
    }).update({
      data: {
        province,
        city,
        lastTimeLogin: new Date()
      }
    })
  }
  return await db.collection('user').where({
    //下面这3行，为筛选条件
    openId
  }).update({
    data: {
      score: _.inc(1),
      lastTimeLogin: new Date()
    }
  });


  //
  // return {
  //   openid: wxContext.OPENID
  // }
}
