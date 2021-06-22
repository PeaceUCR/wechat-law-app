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
        '第二章 劳动合同的订立': { value: '第二章 劳动合同的订立', start: 7, end: 28 },
        '第三章 劳动合同的履行和变更': { value: '第三章 劳动合同的履行和变更', start: 29, end: 35 },
        '第四章 劳动合同的解除和终止': { value: '第四章 劳动合同的解除和终止', start: 36, end: 50 },
        '第五章 特别规定': { value: '第五章 特别规定', start: 51, end: 72 },
        '第一节 集体合同': { value: '第一节 集体合同', start: 51, end: 56 },
        '第二节 劳务派遣': { value: '第二节 劳务派遣', start: 57, end: 67 },
        '第三节 非全日制用工': { value: '第三节 非全日制用工', start: 68, end: 72 },
        '第六章 监督检查': { value: '第六章 监督检查', start: 73, end: 79 },
        '第七章 法律责任': { value: '第七章 法律责任', start: 80, end: 95 },
        '第八章 附则': { value: '第八章 附则', start: 96, end: 98 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('labor-contract-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('labor-contract-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('labor-contract-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
