const cloud = require('wx-server-sdk')

// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
    console.log(event)
    const db = cloud.database()
    const _ = db.command

    const { criminalLawNumber, crimeName } = event

    const r = await db.collection('sentencing')
        .where({
            criminalLawNumber: parseInt(criminalLawNumber)
        }).orderBy('effectiveDate', 'desc').limit(1000).get()
    const all = r.data.filter(s => !s.location)
    const other = r.data.filter(s => s.location)
    r.data = [...all, ...other]
    return r;
}
