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
    const regexpString1 = `${searchValue.split('').join('.*')}`
    const regexpString2 = `.*${searchValue}`
    result1 = await db.collection('consult').limit(1000).where({
      content: db.RegExp({
        regexp: regexpString1,
        options: 'i',
      })
    }).orderBy('number', 'desc').get();

    // exact match
    result2 = await db.collection('consult').limit(1000).where({
      content: db.RegExp({
        regexp: regexpString2,
        options: 'i',
      })
    }).orderBy('number', 'desc').get();

    const exist = new Set(result2.data.map(item => item._id))
    const complement = result1.data.filter(item => !exist.has(item._id))

    result2Flag = result2.data.map(item => {
      item.exactMatch = true
      return item;
    })
    complementFlag = complement.map(item => {
      item.exactMatch = false
      return item
    })

    result = {
      data: [...result2Flag, ...complementFlag]
    }


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
