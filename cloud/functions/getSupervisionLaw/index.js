const cloud = require('wx-server-sdk')

// https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-server-api/database/collection.where.html
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
    console.log(event)
    const db = cloud.database()
    const _ = db.command

    const type = event.type
    const searchValue = event.searchValue

    const numberMap = { '第一章 总则': { value: '第一章 总则', start: 1, end: 6 },
        '第二章 监察机关及其职责': { value: '第二章 监察机关及其职责', start: 7, end: 14 },
        '第三章 监察范围和管辖': { value: '第三章 监察范围和管辖', start: 15, end: 17 },
        '第四章 监察权限': { value: '第四章 监察权限', start: 18, end: 34 },
        '第五章 监察程序': { value: '第五章 监察程序', start: 35, end: 49 },
        '第六章 反腐败国际合作': { value: '第六章 反腐败国际合作', start: 50, end: 52 },
        '第七章 对监察机关和监察人员的监督': { value: '第七章 对监察机关和监察人员的监督', start: 53, end: 61 },
        '第八章 法律责任': { value: '第八章 法律责任', start: 62, end: 67 },
        '第九章 附则': { value: '第九章 附则', start: 68, end: 69 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('supervision-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('supervision-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('supervision-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
