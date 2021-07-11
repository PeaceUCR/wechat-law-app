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

    const numberMap = { '一、受案范围': { value: '一、受案范围', start: 1, end: 2 },
        '二、管辖': { value: '二、管辖', start: 3, end: 11 },
        '三、诉讼参加人': { value: '三、诉讼参加人', start: 12, end: 33 },
        '四、证据': { value: '四、证据', start: 34, end: 47 },
        '五、期间、送达': { value: '五、期间、送达', start: 48, end: 52 },
        '六、起诉与受理': { value: '六、起诉与受理', start: 53, end: 70 },
        '七、审理与判决': { value: '七、审理与判决', start: 71, end: 127 },
        '八、行政机关负责人出庭应诉': { value: '八、行政机关负责人出庭应诉', start: 128, end: 132 },
        '九、复议机关作共同被告': { value: '九、复议机关作共同被告', start: 133, end: 136 },
        '十、相关民事争议的一并审理': { value: '十、相关民事争议的一并审理', start: 137, end: 144 },
        '十一、规范性文件的一并审查': { value: '十一、规范性文件的一并审查', start: 145, end: 151 },
        '十二、执行': { value: '十二、执行', start: 152, end: 161 },
        '十三、附则': { value: '十三、附则', start: 162, end: 163 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('admin-litigation-explaination')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('admin-litigation-explaination').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('admin-litigation-explaination')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
