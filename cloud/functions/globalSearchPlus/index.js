const cloud = require('wx-server-sdk')

// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext();
    const db = cloud.database()
    const _ = db.command;

    const {searchValue, mode} = event

    let dbNames = mode === 'faxin' ? ['faxin-law'] : [
        'terms',
        'civil-law',
        'complement',
        'civil-law-explaination',
        'admin-explanation',
        'example',
        'faxin-law'
    ]

    const reg = `${searchValue.split('').join('.*')}`

    const limitPerLaw = 6

    const requests = dbNames.map(async (name) => {
            let result;
            if (name === 'terms' || name === 'civil-law') {
                result = await db.collection(name).where({
                    text: db.RegExp({
                        regexp: reg,
                        options: 'i',
                    }),
                }).limit(limitPerLaw).orderBy('number', 'asc').get()

            } else if (name === 'example') {
            result = await db.collection(name).where({
                title: db.RegExp({
                    regexp: reg,
                    options: 'i',
                }),
            }).limit(limitPerLaw).orderBy('effectiveDate', 'desc').get()

            } else {
                result = await db.collection(name).where({
                    title: db.RegExp({
                        regexp: reg,
                        options: 'i',
                    })
                }).limit(mode === 'faxin' ? 1000: limitPerLaw).orderBy('effectiveDate', 'desc').get()
            }

            return result
        })

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
