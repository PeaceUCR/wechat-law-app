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

    const numberMap = {
        '第一章 总则': { start: 1, end: 9 },
        '第二章 管辖': { start: 10, end: 16 },
        '第三章 回避': { start: 17, end: 25 },
        '第四章 证据': { start: 26, end: 34 },
        '第五章 期间与送达': { start: 35, end: 36 },
        '第六章 简易程序和快速办理': { value: '第六章 简易程序和快速办理', start: 37, end: 48 },
        '第一节 简易程序': { start: 37, end: 39 },
        '第二节 快速办理': { start: 40, end: 48 },
        '第七章 调查取证': { value: '第七章 调查取证', start: 49, end: 122 },
        '第一节 一般规定': { start: 198, end: 213 },
        '第二节 受案': { start: 60, end: 65 },
        '第三节 询问': { start: 66, end: 80 },
        '第四节 勘验、检查': { start: 81, end: 86 },
        '第五节 鉴定': { start: 87, end: 100 },
        '第六节 辨认': { start: 101, end: 106 },
        '第七节 证据保全': { start: 107, end: 116 },
        '第八节 办案协作': { start: 117, end: 122 },
        '第八章 听证程序': { value: '第八章 听证程序', start: 123, end: 153 },
        '第二节 听证人员和听证参加人': { start: 127, end: 131 },
        '第三节 听证的告知、申请和受理': { start: 132, end: 136 },
        '第四节 听证的举行': { start: 137, end: 153 },
        '第九章 行政处理决定': { value: '第九章 行政处理决定', start: 154, end: 177 },
        '第一节 行政处罚的适用': { start: 154, end: 164 },
        '第二节 行政处理的决定': { start: 165, end: 177 },
        '第十章 治安调解': { value: '第十章 治安调解', start: 178, end: 186 },
        '第十一章 涉案财物的管理和处理': { value: '第十一章 涉案财物的管理和处理', start: 187, end: 197 },
        '第十二章 执行': { value: '第十二章 执行', start: 198, end: 237 },
        '第二节 罚款的执行': { start: 214, end: 219 },
        '第三节 行政拘留的执行': { start: 220, end: 233 },
        '第四节 其他处理决定的执行': { start: 234, end: 237 },
        '第十三章 涉外行政案件的办理': { value: '第十三章 涉外行政案件的办理', start: 238, end: 257 },
        '第十四章 案件终结': { value: '第十四章 案件终结', start: 258, end: 262 },
        '第十五章 附则': { value: '第十五章 附则', start: 263, end: 266 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('police-admin-regulation')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('police-admin-regulation').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('police-admin-regulation')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
