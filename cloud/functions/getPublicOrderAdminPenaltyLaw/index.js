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

    const numberMap = { '第一章 总则': { value: '第一章 总则', start: 1, end: 9 },
        '第二章 处罚的种类和适用': { value: '第二章 处罚的种类和适用', start: 10, end: 22 },
        '第三章 违反治安管理的行为和处罚': { value: '第三章 违反治安管理的行为和处罚', start: 23, end: 76 },
        '第一节 扰乱公共秩序的行为和处罚': { value: '第一节 扰乱公共秩序的行为和处罚', start: 23, end: 29 },
        '第二节 妨害公共安全的行为和处罚': { value: '第二节 妨害公共安全的行为和处罚', start: 30, end: 39 },
        '第三节 侵犯人身权利、财产权利的行为和处罚': { value: '第三节 侵犯人身权利、财产权利的行为和处罚', start: 40, end: 49 },
        '第四节 妨害社会管理的行为和处罚': { value: '第四节 妨害社会管理的行为和处罚', start: 50, end: 76 },
        '第四章 处罚程序': { value: '第四章 处罚程序', start: 77, end: 48 },
        '第一节 调查': { value: '第一节 调查', start: 77, end: 90 },
        '第二节 决定': { value: '第二节 决定', start: 91, end: 102 },
        '第三节 执行': { value: '第三节 执行', start: 103, end: 111 },
        '第五章 执法监督': { value: '第五章 执法监督', start: 112, end: 117 },
        '第六章 附则': { value: '第六章 附则', start: 118, end: 119 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('public-order-admin-penalty-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('public-order-admin-penalty-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('public-order-admin-penalty-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
