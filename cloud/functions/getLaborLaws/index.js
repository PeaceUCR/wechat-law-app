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
        '第二章 促进就业': { value: '第二章 促进就业', start: 10, end: 15 },
        '第三章 劳动合同和集体合同': { value: '第三章 劳动合同和集体合同', start: 16, end: 35 },
        '第四章 工作时间和休息休假': { value: '第四章 工作时间和休息休假', start: 36, end: 45 },
        '第五章 工资': { value: '第五章 工资', start: 46, end: 51 },
        '第六章 劳动安全卫生': { value: '第六章 劳动安全卫生', start: 52, end: 57 },
        '第七章 女职工和未成年工特殊保护': { value: '第七章 女职工和未成年工特殊保护', start: 58, end: 65 },
        '第八章 职业培训': { value: '第八章 职业培训', start: 66, end: 69 },
        '第九章 社会保险和福利': { value: '第九章 社会保险和福利', start: 70, end: 76 },
        '第十章 劳动争议': { value: '第十章 劳动争议', start: 77, end: 84 },
        '第十一章 监督检查': { value: '第十一章 监督检查', start: 85, end: 88 },
        '第十二章 法律责任': { value: '第十二章 法律责任', start: 89, end: 105 },
        '第十三章 附则': { value: '第十三章 附则', start: 106, end: 107 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('labor-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('labor-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('labor-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
