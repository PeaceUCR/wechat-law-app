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

    const {searchValue, selectedOption1} = event

    const exactRegexp = `.*${searchValue}`

    let dbNames = [
        'terms',
        'litigation-law',
        'civil-law',
        'civil-law-regulation',
        'other-law'
    ]
    let otherLawNames = [
        'criminal-litigation-explanation',
        'civil-litigation-explanation',
        'road-safe-violation-handling',
        'police-admin-regulation',
        'road-safe-regulation',
        'road-safe-law',
        'public-order-admin-penalty-law',
        'admin-allow-law',
        'admin-reconsider-regulation',
        'admin-reconsider-law',
        'admin-punish-law',
        'admin-force-law',
        'admin-litigation-explaination',
        'admin-litigation-law',
        'company-law',
        'labor-contract-law',
        'labor-law',
        'anti-drug-law',
        'anti-terrorism-law',
        'supervision-law',
        'police-regulation',
        'litigation-regulation'
    ]

    if (selectedOption1 === 'criminal') {
        dbNames = [
            'terms',
            'litigation-law',
            'other-law'
        ]
        otherLawNames = [
            'criminal-litigation-explanation',
            'anti-drug-law',
            'anti-terrorism-law',
            'supervision-law',
            'police-regulation',
            'litigation-regulation'
        ]
    } else if (selectedOption1 === 'civil') {
        dbNames = [
            'civil-law',
            'civil-law-regulation',
            'other-law'
        ]
        otherLawNames = [
            'civil-litigation-explanation',
            'company-law',
            'labor-contract-law',
            'labor-law',
        ]
    } else if (selectedOption1 === 'admin') {
        dbNames = [
            'other-law'
        ]
        otherLawNames = [
            'road-safe-violation-handling',
            'police-admin-regulation',
            'road-safe-regulation',
            'road-safe-law',
            'public-order-admin-penalty-law',
            'admin-allow-law',
            'admin-reconsider-regulation',
            'admin-reconsider-law',
            'admin-punish-law',
            'admin-force-law',
            'admin-litigation-explaination',
            'admin-litigation-law',
        ]
    }


    const reg = new RegExp(searchValue, "gi");
    const getWeight = (text) => {
       if (Array.isArray(text)) {
           text = text.join('\n')
       }
       const ocurrences = (text.match(reg) || []).length;
       return ocurrences / text.length
    }

    const limitPerLaw = 6

    const requests = dbNames.map(async (name) => {
            let result;

            if (name == 'other-law') {
                result = await db.collection(name).where({
                    text: db.RegExp({
                        regexp: exactRegexp,
                        options: 'i',
                    }),
                    type: db.RegExp({
                    regexp: otherLawNames.join('|'),
                    options: 'i',
                    }),
                }).limit(1000).orderBy('number', 'asc').get()

            } else {
                result = await db.collection(name).where({
                    text: db.RegExp({
                        regexp: exactRegexp,
                        options: 'i',
                    })
                }).limit(1000).orderBy('number', 'asc').get()
            }


            result.data.sort((a,b) => {
                return getWeight(b.text) - getWeight(a.text)
            })

            if (result.data.length > limitPerLaw && name !== 'other-law') {
                result.data = result.data.slice(0, limitPerLaw)
            }

            return result
        }
    )

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
