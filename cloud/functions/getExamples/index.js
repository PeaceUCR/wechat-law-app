 const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

 // get example ids
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database()

  let procuratorateExamples = await db.collection('procuratorate-examples').limit(1000).get()
  procuratorateExamples = procuratorateExamples.data.filter(item => item.number).sort((a,b) => {
    return parseInt(a.number) - parseInt(b.number)
  }).map(item => {
    return {
      _id: item._id,
      name: item.name,
      number: item.number
    }
  })

  let courtExamples = await db.collection('court-examples').limit(1000).get()
  courtExamples = courtExamples.data.filter(item => item.number).sort((a,b) => {
    return parseInt(a.number) - parseInt(b.number)
  }).map(item => {
    return {
      _id: item._id,
      title: item.title,
      number: item.number
    }
  })
  return {
    procuratorateExamples,
    courtExamples
  }
}
