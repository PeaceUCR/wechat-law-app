const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext();
  const db = cloud.database()

  const type = event.type
  const searchValue = event.searchValue

  let result

  if (type === 'all') {
    const regexpString = `${searchValue.split('').join('.*')}`
    result = await db.collection('consult').limit(1000).where({
      content: db.RegExp({
        regexp: regexpString,
        options: 'i',
      })
    }).orderBy('number', 'desc').get();

  } else if (type === 'number') {
    result = await db.collection('consult').limit(1000).where({
      number: parseInt(event.number)
    }).orderBy('number', 'desc').get();

  } else {
    result = await db.collection('consult').limit(1000).where({name: db.RegExp({
        regexp: '.*' + event.name,
        options: 'i',
      })}).orderBy('number', 'desc').get();
  }
  result.data.forEach(r => delete r.content)
  return {
    result
  }
}
