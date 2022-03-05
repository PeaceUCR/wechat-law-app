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
    await db.collection('user').where({
      //下面这3行，为筛选条件
      openId
    }).update({
      data: {
        score: event.score || res.data[0].score,
        collectionLimit: event.collectionLimit || res.data[0].collectionLimit ,
        avatarUrl: event.avatarUrl || res.data[0].avatarUrl,
        nickName: event.nickName || res.data[0].nickName,
        lastTimeLogin: new Date()
      }
    });
    return {
      data: [{
        openId: wxContext.OPENID,
        score: event.score || res.data[0].score,
        collectionLimit: event.collectionLimit || res.data[0].collectionLimit ,
        avatarUrl: event.avatarUrl || res.data[0].avatarUrl,
        nickName: event.nickName || res.data[0].nickName,
        lastTimeLogin: new Date()
      }]
    }
  } else {
    await db.collection("user").add({
      data: {
        openId: wxContext.OPENID,//获取操作者_openid的方法
        avatarUrl: event.avatarUrl,
        nickName: event.nickName,
        score: 3,
        collectionLimit: 20,
        lastTimeLogin: new Date()
      }
    })
    return {
      data: [{
        openId: wxContext.OPENID,//获取操作者_openid的方法
        avatarUrl: event.avatarUrl,
        nickName: event.nickName,
        score: 3,
        collectionLimit: 20,
        lastTimeLogin: new Date()
      }]
    }
  }
}
