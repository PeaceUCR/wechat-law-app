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

    const numberMap = { '第一章 总则': { value: '第一章 总则', start: 1, end: 22 },
        '第二章 有限责任公司的设立和组织机构': { value: '第二章 有限责任公司的设立和组织机构', start: 23, end: 70 },
        '第一节 设立': { value: '第一节 设立', start: 76, end: 97 },
        '第二节 组织机构': { value: '第二节 组织机构', start: 36, end: 56 },
        '第三节 一人有限责任公司的特别规定': { value: '第三节 一人有限责任公司的特别规定', start: 57, end: 63 },
        '第四节 国有独资公司的特别规定': { value: '第四节 国有独资公司的特别规定', start: 64, end: 70 },
        '第三章 有限责任公司的股权转让': { value: '第三章 有限责任公司的股权转让', start: 71, end: 75 },
        '第四章 股份有限公司的设立和组织机构': { value: '第四章 股份有限公司的设立和组织机构', start: 76, end: 124 },
        '第二节 股东大会': { value: '第二节 股东大会', start: 98, end: 107 },
        '第三节 董事会、经理': { value: '第三节 董事会、经理', start: 108, end: 116 },
        '第四节 监事会': { value: '第四节 监事会', start: 117, end: 119 },
        '第五节 上市公司组织机构的特别规定': { value: '第五节 上市公司组织机构的特别规定', start: 120, end: 124 },
        '第五章 股份有限公司的股份发行和转让': { value: '第五章 股份有限公司的股份发行和转让', start: 125, end: 145 },
        '第一节 股份发行': { value: '第一节 股份发行', start: 125, end: 136 },
        '第二节 股份转让': { value: '第二节 股份转让"', start: 137, end: 145 },
        '第六章 公司董事、监事、高级管理人员的资格和义务': { value: '第六章 公司董事、监事、高级管理人员的资格和义务', start: 146, end: 152 },
        '第七章 公司债券': { value: '第七章 公司债券', start: 153, end: 162 },
        '第八章 公司财务、会计': { value: '第八章 公司财务、会计', start: 163, end: 171 },
        '第九章 公司合并、分立、增资、减资': { value: '第九章 公司合并、分立、增资、减资', start: 172, end: 179 },
        '第十章 公司解散和清算': { value: '第十章 公司解散和清算', start: 180, end: 190 },
        '第十一章 外国公司的分支机构': { value: '第十一章 外国公司的分支机构', start: 191, end: 197 },
        '第十二章 法律责任': { value: '第十二章 法律责任', start: 198, end: 215 },
        '第十三章 附则': { value: '第十三章 附则', start: 216, end: 218 } }

    if (!isNaN(parseInt(searchValue))) {
        return await db.collection('company-law')
            .where({number: parseInt(searchValue)}).orderBy('number', 'asc').limit(1000).get()
    }

    if (type === 'category') {
        const {start, end} = numberMap[searchValue]
        return await db.collection('company-law').where({
            number: _.and(_.gte(start),_.lte(end))
        }).orderBy('number', 'asc').limit(1000).get()
    }

    return await db.collection('company-law')
        .where({
            text: db.RegExp({
                regexp: '.*' + searchValue,
                options: 'i',
            })
        }).orderBy('number', 'asc').limit(1000).get()


}
