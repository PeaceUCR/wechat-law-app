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

    const searchValue = event.searchValue

    const exactRegexp = `.*${searchValue}`

    const dbNames = [
        'terms',
        'litigation-law',
        'civil-law',
        'civil-law-regulation',
        'other-law'
    ]

    const requests = dbNames.map(name =>
        db.collection(name).where({
            text: db.RegExp({
                regexp: exactRegexp,
                options: 'i',
            })
        }).limit(name === 'other-law' ? 100 : 10).orderBy('number', 'asc').get())

    const results = await Promise.all(requests)

    results.forEach((r, index) => {
        r.type = dbNames[index]
    })

    await db.collection("global-search-records").add({
        data: {
            openId: wxContext.OPENID,//获取操作者_openid的方法
            words: searchValue,
            time: new Date()
        }
    })

    return {
        results
    }
}
