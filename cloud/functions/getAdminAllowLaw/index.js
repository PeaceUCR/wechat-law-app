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

    const numberMap = { '第一章 总则': { value: '第一章 总则', start: 1, end: 10 },
        '第二章 行政许可的设定': { value: '第二章 行政许可的设定', start: 11, end: 21 },
        '第三章 行政许可的实施机关': { value: '第三章 行政许可的实施机关', start: 22, end: 28 },
        '第四章 行政许可的实施程序': { value: '第四章 行政许可的实施程序', start: 29, end: 57 },
        '第一节 申请与受理': { value: '第一节 申请与受理', start: 29, end: 33 },
        '第二节 审查与决定': { value: '第二节 审查与决定', start: 34, end: 41 },
        '第三节 期限': { value: '第三节 期限', start: 42, end: 45 },
        '第四节 听证': { value: '第四节 听证', start: 46, end: 48 },
        '第五节 变更与延续': { value: '第五节 变更与延续', start: 49, end: 50 },
        '第六节 特别规定': { value: '第六节 特别规定', start: 51, end: 57 },
        '第五章 行政许可的费用': { value: '第五章 行政许可的费用', start: 58, end: 59 },
        '第六章 监督检查': { value: '第六章 监督检查', start: 60, end: 70 },
        '第七章 法律责任': { value: '第七章 法律责任', start: 71, end: 81 },
        '第八章 附则': { value: '第八章 附则', start: 82, end: 83 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('admin-allow-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('admin-allow-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('admin-allow-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
