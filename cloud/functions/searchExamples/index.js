const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

 // search Examples
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database()
  const _ = db.command;

  const type = event.type
  const searchValue = event.searchValue

  const regexpString = `${searchValue.split('').join('.*')}`
  // examples exclude typical(no number properties)
  const procuratorateExamples = await db.collection('procuratorate-examples').where({
    text: db.RegExp({
      regexp: regexpString,
      options: 'i',
    })}).limit(1000).orderBy('number', 'asc').get()

  const searchProcuratorateResult = procuratorateExamples.data.filter(e => e.number).map(e => {
    delete e.text
    delete e.content
    return e
  })

  const courtExamples = await db.collection('court-examples').where({
    text: db.RegExp({
      regexp: regexpString,
      options: 'i',
    })}).limit(1000).orderBy('number', 'asc').get()

  const searchCourtResult = courtExamples.data.filter(e => e.number).map(e => {
    delete e.content
    delete e.text
    return e
  })
  return {
    searchProcuratorateResult,
    searchCourtResult
  }
}
