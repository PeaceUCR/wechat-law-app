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

  const res = await db.collection('user').where({
    //下面这3行，为筛选条件
    openId
  }).get();

  const user = res.data[0]
  // update not work, but remove then add works, _.inc only works for positive
  if (user && user.score > 0) {
    const updateResult = await db.collection('user').doc(user._id).remove()
    user.score = user.score - 1
    await db.collection('user').add({
      data: {
        ...user
      }
    })
    return {
      isValid: true
    }
  }
  return {
    isValid: false
  }
}

