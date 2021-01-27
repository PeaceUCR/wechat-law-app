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
         name2: {
           value: 'Echo'
         },
         date1: {
           value: '2021年01月18日 12:30'
         },
         thing4: {
           value: 'Peace is my husband'
         }
       },
       templateId: 'hxJ0NRqsrqGfUtxxAvOJvU9Eqe-ftY4k7lkKGOgbwiU'
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


