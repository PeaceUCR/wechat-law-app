const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

 // search Court Open Examples
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database()
  const _ = db.command;

  const type = event.type
  const searchValue = event.searchValue

  const regexpString = `${searchValue.split('').join('.*')}`

  const courtOpenExamples = await db.collection('court-open').where({
    text: db.RegExp({
      regexp: regexpString,
      options: 'i',
    })}).limit(1000).orderBy('date', 'desc').get()

  const searchResult = courtOpenExamples.data.map(e => {
    delete e.text
    return e
  })

  return {
    searchResult
  }
}
