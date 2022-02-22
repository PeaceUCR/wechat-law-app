const cloud = require('wx-server-sdk')

 // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext();
  const db = cloud.database()
  const _ = db.command

  const {criminalLawNumber, searchValue} = event
  if (searchValue) {
    const searchValueRegex = `.*${searchValue}`
    const result = await db.collection('cai-pan-gui-ze').limit(200).where(
        _.and({
          matchedCriminalLawNumbers: parseInt(criminalLawNumber)
        },
        _.or([
              {
                title: db.RegExp({
                  regexp: searchValueRegex,
                  options: 'i'
                })
              },
              {
                judgeRule: db.RegExp({
                  regexp: searchValueRegex,
                  options: 'i'
                })
              },
            ]))
        ).orderBy('number', 'desc').get();
    result.data.forEach(r => delete r.text)
    return result
  }
  const result = await db.collection('cai-pan-gui-ze').limit(200).where({
    matchedCriminalLawNumbers: parseInt(criminalLawNumber)
  }).orderBy('number', 'desc').get();
  result.data.forEach(r => delete r.text)
  return result
}
