 const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
   try {
     const result = await cloud.openapi.subscribeMessage.send({
       touser: cloud.getWXContext().OPENID, // 通过 getWXContext 获取 OPENID
       page: 'pages/other/index',
       data: {
         character_string1: {
           value: '1.0.1'
         },
         thing2: {
           value: 'test version'
         }
       },
       templateId: 'cZWxYVaMH0JFtk2NIxjsEBLZcpazvU5vkYJcQlKsnBo'
     })
     // result 结构
     // { errCode: 0, errMsg: 'openapi.templateMessage.send:ok' }
     return result
   } catch (err) {
     // 错误处理
     // err.errCode !== 0
     throw err
   }
 }


