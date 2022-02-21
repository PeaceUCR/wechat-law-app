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

  return await db.collection('user').where({
    //下面这3行，为筛选条件
    openId
  }).update({
    data: {
      isNewVersion: event.isNewVersion
    }
  });

}


