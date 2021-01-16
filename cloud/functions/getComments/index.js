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

  const {page, type, topicId} = event;

  let commentRes;
  if (topicId) {
    commentRes = await db.collection('comment').where({
      //下面这3行，为筛选条件
      topicId
    }).get();
  } else {
    commentRes = await db.collection('comment').where({
      //下面这3行，为筛选条件
      openId
    }).get();
  }

  const comments = commentRes.data;
  const openIds = comments.map(commend => commend.openId)
  const userRes = await db.collection('user').where({
    openId: db.command.in(openIds)
  }).get();

  console.log(userRes)
  const userMap = {};
  userRes.data.forEach(user => userMap[user.openId] = user)
  comments.forEach(comment => {
    comment.user = userMap[comment.openId]
  })

  return comments

  //
  // return {
  //   openid: wxContext.OPENID
  // }
}
