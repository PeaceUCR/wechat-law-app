import Taro from '@tarojs/taro'
import { flattenDeep, isEmpty } from "lodash";
import {otherLawNameMap} from "./otherLaw";

const lawNameMap = {
  'criminal': '刑事案件',
  'civil': '民事案件',
}

const lawChnNameMap = {
  '刑事案件': 'criminal',
  '民事案件': 'civil',
}
function swap(json){
  var ret = {};
  for(var key in json){
    ret[json[key]] = key;
  }
  return ret;
}

const criminalLawOptionMap =
  {"114":"第一百一十四条 放火罪、决水罪、爆炸罪、投放危险物质罪、以危险方法危害公共安全罪之一","115":"第一百一十五条 放火罪、决水罪、爆炸罪、投放危险物质罪、以危险方法危害公共安全罪之二","116":"第一百一十六条 破坏交通工具罪","117":"第一百一十七条 破坏交通设施罪","118":"第一百一十八条 破坏电力设备罪、破坏易燃易爆设备罪","119":"第一百一十九条 破坏交通工具罪、破坏交通设施罪、破坏电力设备罪、破坏易燃易爆设备罪","120":"第一百二十条 组织、领导、参加恐怖组织罪；帮助恐怖活动罪；准备实施恐怖活动罪；宣扬恐怖主义、极端主义、煽动实施恐怖活动罪；利用极端主义破坏法律实施罪；强制穿戴宣扬恐怖主义、极端主义服饰、标志罪；非法持有宣扬恐怖主义、极端主义物品罪","121":"第一百二十一条 劫持航空器罪","122":"第一百二十二条 劫持船只、汽车罪","123":"第一百二十三条 暴力危及飞行安全罪","124":"第一百二十四条 破坏广播电视设施、公用电信设施罪","125":"第一百二十五条 非法制造、买卖、运输、邮寄、储存枪支、弹药、爆炸物罪、非法制造、买卖、运输、储存危险物质罪","126":"第一百二十六条 违规制造、销售枪支罪","127":"第一百二十七条 盗窃、抢夺枪支、弹药、爆炸物、危险物质罪、抢劫枪支、弹药、爆炸物、危险物质罪","128":"第一百二十八条 非法持有、私藏枪支、弹药罪、非法出租、出借枪支罪","129":"第一百二十九条 丢失枪支不报罪","130":"第一百三十条 非法携带枪支、弹药、管制刀具、危险物品危及公共安全罪","131":"第一百三十一条 重大飞行事故罪","132":"第一百三十二条 铁路运营安全事故罪","133":"第一百三十三条 交通肇事罪；危险驾驶罪；妨害安全驾驶罪","134":"第一百三十四条 重大责任事故罪；强令、组织他人违章冒险作业罪；危险作业罪","135":"第一百三十五条 重大劳动安全事故罪；大型群众性活动重大安全事故罪","136":"第一百三十六条 危险物品肇事罪","137":"第一百三十七条 工程重大安全事故罪","138":"第一百三十八条 教育设施重大安全事故罪","139":"第一百三十九条 消防责任事故罪；不报、谎报安全事故罪","140":"第一百四十条 生产、销售伪劣产品罪","141":"第一百四十一条 生产、销售、提供假药罪","142":"第一百四十二条 生产、销售、提供劣药罪；妨害药品管理罪","143":"第一百四十三条 生产、销售不符合安全标准的食品罪","144":"第一百四十四条 生产、销售有毒、有害食品罪","145":"第一百四十五条 生产、销售不符合标准的卫生器材罪","146":"第一百四十六条 生产、销售不符合安全标准的产品罪","147":"第一百四十七条 生产、销售伪劣农药、兽药、化肥、种子罪","148":"第一百四十八条 生产、销售不符合卫生标准的化妆品罪","149":"第一百四十九条 对生产、销售伪劣商品行为的法条适用原则","150":"第一百五十条 单位犯本节规定之罪的处罚规定","151":"第一百五十一条 走私武器、弹药罪、走私核材料罪、走私假币罪；走私文物罪、走私贵重金属罪、走私珍贵动物罪、走私珍贵动物制品罪；走私国家禁止进出口的货物、物品罪","152":"第一百五十二条 走私淫秽物品罪；走私废物罪","153":"第一百五十三条 走私普通货物、物品罪","154":"第一百五十四条 特殊形式的走私普通货物、物品罪","155":"第一百五十五条 间接走私行为以相应走私犯罪论处的规定","156":"第一百五十六条 走私共犯","157":"第一百五十七条 武装掩护走私、抗拒缉私的处罚规定","158":"第一百五十八条 虚报注册资本罪","159":"第一百五十九条 虚假出资、抽逃出资罪","160":"第一百六十条 欺诈发行证券罪","161":"第一百六十一条 违规披露、不披露重要信息罪","162":"第一百六十二条 妨害清算罪；隐匿、故意销毁会计凭证、会计账簿、财务会计报告罪；虚假破产罪","163":"第一百六十三条 非国家工作人员受贿罪","164":"第一百六十四条 对非国家工作人员行贿罪；对外国公职人员、国际公共组织官员行贿罪","165":"第一百六十五条 非法经营同类营业罪","166":"第一百六十六条 为亲友非法牟利罪","167":"第一百六十七条 签订、履行合同失职被骗罪","168":"第一百六十八条 国有公司、企业、事业单位人员失职罪、国有公司、企业、事业单位人员滥用职权罪","169":"第一百六十九条 徇私舞弊低价折股、出售国有资产罪；背信损害上市公司利益罪","170":"第一百七十条 伪造货币罪","171":"第一百七十一条 出售、购买、运输假币罪；金融工作人员购买假币、以假币换取货币罪；伪造货币罪","172":"第一百七十二条 持有、使用假币罪","173":"第一百七十三条 变造货币罪","174":"第一百七十四条 擅自设立金融机构罪；伪造、变造、转让金融机构经营许可证、批准文件罪","175":"第一百七十五条 高利转贷罪；骗取贷款、票据承兑、金融票证罪","176":"第一百七十六条 非法吸收公众存款罪","177":"第一百七十七条 伪造、变造金融票证罪；妨害信用卡管理罪；窃取、收买、非法提供信用卡信息罪","178":"第一百七十八条 伪造、变造国家有价证券罪；伪造、变造股票、公司、企业债券罪","179":"第一百七十九条 擅自发行股票、公司、企业债券罪","180":"第一百八十条 内幕交易、泄露内幕信息罪；利用未公开信息交易罪","181":"第一百八十一条 编造并传播证券、期货交易虚假信息罪；诱骗投资者买卖证券、期货合约罪","182":"第一百八十二条 操纵证券、期货市场罪","183":"第一百八十三条 职务侵占罪；贪污罪","184":"第一百八十四条 非国家工作人员受贿罪","185":"第一百八十五条 挪用资金罪、挪用公款罪；背信运用受托财产罪；违法运用资金罪","186":"第一百八十六条 违法发放贷款罪","187":"第一百八十七条 吸收客户资金不入账罪","188":"第一百八十八条 违规出具金融票证罪","189":"第一百八十九条 对违法票据承兑、付款、保证罪","190":"第一百九十条 逃汇罪","191":"第一百九十一条 洗钱罪","192":"第一百九十二条 集资诈骗罪","193":"第一百九十三条 贷款诈骗罪","194":"第一百九十四条 票据诈骗罪、金融凭证诈骗罪","195":"第一百九十五条 信用证诈骗罪","196":"第一百九十六条 信用卡诈骗罪、盗窃罪","197":"第一百九十七条 有价证券诈骗罪","198":"第一百九十八条 保险诈骗罪","199":"第一百九十九条 集资诈骗罪","200":"第二百条 单位犯金融诈骗罪的处罚规定","201":"第二百零一条 逃税罪","202":"第二百零二条 抗税罪","203":"第二百零三条 逃避追缴欠税罪","204":"第二百零四条 骗取出口退税罪、偷税罪","205":"第二百零五条 虚开增值税专用发票、用于骗取出口退税、抵扣税款发票罪；虚开发票罪","206":"第二百零六条 伪造、出售伪造的增值税专用发票罪","207":"第二百零七条 非法出售增值税专用发票罪","208":"第二百零八条 非法购买增值税专用发票、购买伪造的增值税专用发票罪；虚开增值税专用发票罪、出售伪造的增值税专用发票罪、非法出售增值税专用发票罪","209":"第二百零九条 非法制造、出售非法制造的用于骗取出口退税、抵扣税款发票罪；非法制造、出售非法制造的发票罪；非法出售用于骗取出口退税、抵扣税款发票罪；非法出售发票罪","210":"第二百一十条 盗窃罪、诈骗罪；持有伪造的发票罪","211":"第二百一十一条 单位犯危害税收征管罪的处罚规定","212":"第二百一十二条 税务机关征缴优先原则","213":"第二百一十三条 假冒注册商标罪","214":"第二百一十四条 销售假冒注册商标的商品罪","215":"第二百一十五条 非法制造、销售非法制造的注册商标标识罪","216":"第二百一十六条 假冒专利罪","217":"第二百一十七条 侵犯著作权罪","218":"第二百一十八条 销售侵权复制品罪","219":"第二百一十九条 侵犯商业秘密罪；为境外窃取、刺探、收买、非法提供商业秘密罪","220":"第二百二十条 单位犯侵犯知识产权罪的处罚规定","221":"第二百二十一条 损害商业信誉、商品声誉罪","222":"第二百二十二条 虚假广告罪","223":"第二百二十三条 串通投标罪","224":"第二百二十四条 合同诈骗罪；组织、领导传销活动罪","225":"第二百二十五条 非法经营罪","226":"第二百二十六条 强迫交易罪","227":"第二百二十七条 伪造、倒卖伪造的有价票证罪；倒卖车票、船票罪","228":"第二百二十八条 非法转让、倒卖土地使用权罪","229":"第二百二十九条 提供虚假证明文件罪；出具证明文件重大失实罪","230":"第二百三十条 逃避商检罪","231":"第二百三十一条 单位犯扰乱市场秩序罪的处罚规定","232":"第二百三十二条 故意杀人罪","233":"第二百三十三条 过失致人死亡罪","234":"第二百三十四条 故意伤害罪；组织出卖人体器官罪","235":"第二百三十五条 过失致人重伤罪","236":"第二百三十六条 强奸罪；负有照护职责人员性侵罪","237":"第二百三十七条 强制猥亵、侮辱罪、猥亵儿童罪","238":"第二百三十八条 非法拘禁罪","239":"第二百三十九条 绑架罪","240":"第二百四十条 拐卖妇女、儿童罪","241":"第二百四十一条 收买被拐卖的妇女、儿童罪；强奸罪；非法拘禁罪；故意伤害罪；侮辱罪；拐卖妇女、儿童罪","242":"第二百四十二条 妨害公务罪；聚众阻碍解救被收买的妇女、儿童罪","243":"第二百四十三条 诬告陷害罪","244":"第二百四十四条 强迫劳动罪；雇用童工从事危重劳动罪","245":"第二百四十五条 非法搜查罪、非法侵入住宅罪","246":"第二百四十六条 侮辱罪、诽谤罪","247":"第二百四十七条 刑讯逼供罪、暴力取证罪","248":"第二百四十八条 虐待被监管人罪","249":"第二百四十九条 煽动民族仇恨、民族歧视罪","250":"第二百五十条 出版歧视、侮辱少数民族作品罪","251":"第二百五十一条 非法剥夺公民宗教信仰自由罪、侵犯少数民族风俗习惯罪","252":"第二百五十二条 侵犯通信自由罪","253":"第二百五十三条 私自开拆、隐匿、毁弃邮件、电报罪；盗窃罪；侵犯公民个人信息罪","254":"第二百五十四条 报复陷害罪","255":"第二百五十五条 打击报复会计、统计人员罪","256":"第二百五十六条 破坏选举罪","257":"第二百五十七条 暴力干涉婚姻自由罪","258":"第二百五十八条 重婚罪","259":"第二百五十九条 破坏军婚罪；强奸罪","260":"第二百六十条 虐待罪；虐待被监护、看护人罪","261":"第二百六十一条 遗弃罪","262":"第二百六十二条 拐骗儿童罪；组织残疾人、儿童乞讨罪；组织未成年人进行违反治安管理活动罪","263":"第二百六十三条 抢劫罪","264":"第二百六十四条 盗窃罪","265":"第二百六十五条 盗窃罪","266":"第二百六十六条 诈骗罪","267":"第二百六十七条 抢夺罪；抢劫罪","268":"第二百六十八条 聚众哄抢罪","269":"第二百六十九条 抢劫罪","270":"第二百七十条 侵占罪","271":"第二百七十一条 职务侵占罪；贪污罪","272":"第二百七十二条 挪用资金罪；挪用公款罪","273":"第二百七十三条 挪用特定款物罪","274":"第二百七十四条 敲诈勒索罪","275":"第二百七十五条 故意毁坏财物罪","276":"第二百七十六条 破坏生产经营罪；拒不支付劳动报酬罪","277":"第二百七十七条 妨害公务罪；袭警罪","278":"第二百七十八条 煽动暴力抗拒法律实施罪","279":"第二百七十九条 招摇撞骗罪","280":"第二百八十条 伪造、变造、买卖国家机关公文、证件、印章罪；盗窃、抢夺、毁灭国家机关公文、证件、印章罪；伪造公司、企业、事业单位、人民团体印章罪；伪造、变造、买卖身份证件罪；使用虚假身份证件、盗用身份证件罪；冒名顶替罪","281":"第二百八十一条 非法生产、买卖警用装备罪","282":"第二百八十二条 非法获取国家秘密罪；非法持有国家绝密、机密文件、资料、物品罪","283":"第二百八十三条 非法生产、销售专用间谍器材、窃听、窃照专用器材罪","284":"第二百八十四条 非法使用窃听、窃照专用器材罪；考试作弊罪；组织考试作弊罪；非法出售、提供试题答案罪；代替考试罪","285":"第二百八十五条 非法侵入计算机信息系统罪；非法获取计算机信息系统数据、非法控制计算机信息系统罪；提供侵入、非法控制计算机信息系统程序、工具罪","286":"第二百八十六条 破坏计算机信息系统罪；网络服务渎职罪；拒不履行信息网络安全管理义务罪","287":"第二百八十七条 利用计算机实施犯罪的提示性规定；非法利用信息网络罪；帮助信息网络犯罪活动罪","288":"第二百八十八条 扰乱无线电管理秩序罪","289":"第二百八十九条 对聚众“打砸抢”行为的处理规定","290":"第二百九十条 聚众扰乱社会秩序罪；聚众冲击国家机关罪、扰乱国家机关工作秩序罪；组织、资助非法聚焦罪","291":"第二百九十一条 聚众扰乱公共场所秩序、交通秩序罪；投放虚假危险物质罪；编造、故意传播虚假恐怖信息罪；投放虚假危险物质罪；编造、故意传播虚假信息罪；高空抛物罪","292":"第二百九十二条 聚众斗殴罪；故意伤害罪；故意杀人罪","293":"第二百九十三条 寻衅滋事罪；催收非法债务罪","294":"第二百九十四条 组织、领导、参加黑社会性质组织罪；入境发展黑社会组织罪；包庇、纵容黑社会性质组织罪","295":"第二百九十五条 传授犯罪方法罪","296":"第二百九十六条 非法集会、游行示威罪","297":"第二百九十七条 非法携带武器、管制刀具、爆炸物参加集会、游行、示威罪","298":"第二百九十八条 破坏集会、游行、示威罪","299":"第二百九十九条 侮辱国旗、国徽、国歌罪；侵害英雄烈士名誉、荣誉罪","300":"第三百条 组织、利用会道门、邪教组织、利用迷信破坏法律实施罪；组织、利用会道门、邪教组织、利用迷信致人重伤、死亡罪；强奸罪；诈骗罪","301":"第三百零一条 聚众淫乱罪；引诱未成年人聚众淫乱罪","302":"第三百零二条 盗窃、侮辱、故意毁坏尸体、尸骨、骨灰罪","303":"第三百零三条 赌博罪；开设赌场罪；组织参与国（境）外赌博罪","304":"第三百零四条 故意延误投递邮件罪","305":"第三百零五条 伪证罪","306":"第三百零六条 辩护人、诉讼代理人毁灭证据、伪造证据、妨害作证罪","307":"第三百零七条 妨害作证罪；帮助毁灭、伪造证据罪；虚假诉讼罪","308":"第三百零八条 打击报复证人罪；泄秘罪；泄露不应公开的案件信息罪；故意泄露国家秘密罪；披露、报道不应公开的案件信息罪","309":"第三百零九条 扰乱法庭秩序罪","310":"第三百一十条 窝藏、包庇罪","311":"第三百一十一条 拒绝提供间谍犯罪、恐怖主义犯罪、极端主义犯罪证据罪","312":"第三百一十二条 掩饰、隐瞒犯罪所得、犯罪所得收益罪","313":"第三百一十三条 拒不执行判决、裁定罪","314":"第三百一十四条 非法处置查封、扣押、冻结的财产罪","315":"第三百一十五条 破坏监管秩序罪","316":"第三百一十六条 脱逃罪；劫夺被押解人员罪","317":"第三百一十七条 组织越狱罪；暴动越狱罪；聚众持械劫狱罪","318":"第三百一十八条 组织他人偷越国（边）境罪","319":"第三百一十九条 骗取出境证件罪","320":"第三百二十条 提供伪造、变造的出入境证件罪；出售出入境证件罪","321":"第三百二十一条 运送他人偷越国（边）境罪","322":"第三百二十二条 偷越国（边）境罪","323":"第三百二十三条 破坏界碑、界桩罪；破坏永久性测量标志罪","324":"第三百二十四条 故意损毁文物罪；故意损毁名胜古迹罪；过失损毁文物罪","325":"第三百二十五条 非法向外国人出售、赠送珍贵文物罪","326":"第三百二十六条 倒卖文物罪","327":"第三百二十七条 非法出售、私赠文物藏品罪","328":"第三百二十八条 盗掘古文化遗址、古墓葬罪；盗掘古人类化石、古脊椎动物化石罪","329":"第三百二十九条 盗窃、抢夺国有档案罪；擅自出卖、转让国有档案罪","330":"第三百三十条 妨害传染病防治罪","331":"第三百三十一条 传染病菌种、毒种扩散罪","332":"第三百三十二条 妨害国境卫生检疫罪","333":"第三百三十三条 非法组织卖血罪；强迫卖血罪；故意伤害罪","334":"第三百三十四条 非法采集、供应血液、制作、供应血液制品罪；采集、供应血液、制作、供应血液制品事故罪；非法采集人类遗传资源、走私人类遗传资源材料罪","335":"第三百三十五条 医疗事故罪","336":"第三百三十六条 非法行医罪；非法进行节育手术罪；非法植入基因编辑、克隆胚胎罪","337":"第三百三十七条 妨害动植物防疫、检疫罪","338":"第三百三十八条 污染环境罪","339":"第三百三十九条 非法处置进口的固体废物罪；擅自进口固体废物罪；走私固体废物罪","340":"第三百四十条 非法捕捞水产品罪","341":"第三百四十一条 危害珍贵、濒危野生动物罪；非法猎捕、收购、运输出售陆生野生动物罪","342":"第三百四十二条 非法占用农用地罪；破坏自然保护地罪","343":"第三百四十三条 非法采矿罪；破坏性采矿罪","344":"第三百四十四条 危害国家重点保护植物罪；非法引进、释放、丢弃外来入侵物种罪","345":"第三百四十五条 盗伐林木罪；滥伐林木罪；非法收购、运输盗伐、滥伐的林木罪","346":"第三百四十六条 单位犯破坏环境资源保护罪的处罚规定","347":"第三百四十七条 走私、贩卖、运输、制造毒品罪","348":"第三百四十八条 非法持有毒品罪","349":"第三百四十九条 包庇毒品犯罪分子罪；窝藏、转移、隐瞒毒品、毒赃罪","350":"第三百五十条 非法生产、买卖、运输制毒物品、走私制毒物品罪","351":"第三百五十一条 非法种植毒品原植物罪","352":"第三百五十二条 非法买卖、运输、携带、持有毒品原植物种子、幼苗罪","353":"第三百五十三条 引诱、教唆、欺骗他人吸毒罪；强迫他人吸毒罪","354":"第三百五十四条 容留他人吸毒罪","355":"第三百五十五条 非法提供麻醉药品、精神药品罪；妨害兴奋剂管理罪","356":"第三百五十六条 毒品犯罪的再犯","357":"第三百五十七条 毒品的范围及毒品数量的计算原则","358":"第三百五十八条 组织卖淫罪；强迫卖淫罪；协助组织卖淫罪","359":"第三百五十九条 引诱、容留、介绍卖淫罪；引诱幼女卖淫罪","360":"第三百六十条 传播性病罪","361":"第三百六十一条 特定单位的人员组织、强迫、引诱、容留、介绍卖淫的处理规定","362":"第三百六十二条 包庇罪","363":"第三百六十三条 制作、复制、出版、贩卖、传播淫秽物品牟利罪；为他人提供书号出版淫秽书刊罪","364":"第三百六十四条 传播淫秽物品罪；组织播放淫秽音像制品罪","365":"第三百六十五条 组织淫秽表演罪","366":"第三百六十六条 单位犯本节规定之罪的处罚","367":"第三百六十七条 淫秽物品的范围","368":"第三百六十八条 阻碍军人执行职务罪；阻碍军事行动罪","369":"第三百六十九条 破坏武器装备、军事设施、军事通信罪；过失损坏武器装备、军事设施、军事通信罪","370":"第三百七十条 故意提供不合格武器装备、军事设施罪；过失提供不合格武器装备、军事设施罪","371":"第三百七十一条 聚众冲击军事禁区罪；聚众扰乱军事管理区秩序罪","372":"第三百七十二条 冒充军人招摇撞骗罪","373":"第三百七十三条 煽动军人逃离部队罪；雇用逃离部队军人罪","374":"第三百七十四条 接送不合格兵员罪","375":"第三百七十五条 伪造、变造、买卖武装部队公文、证件、印章罪；盗窃、抢夺武装部队公文、证件、印章罪；非法生产、买卖武装部队制式服装罪；伪造、盗窃、买卖、非法提供、非法使用武装部队专用标志罪","376":"第三百七十六条 战时拒绝、逃避征召、军事训练罪；战时拒绝、逃避服役罪","377":"第三百七十七条 战时故意提供虚假敌情罪","378":"第三百七十八条 战时造谣扰乱军心罪","379":"第三百七十九条 战时窝藏逃离部队军人罪","380":"第三百八十条 战时拒绝、故意延误军事订货罪","381":"第三百八十一条 战时拒绝军事征收、征用罪","382":"第三百八十二条 贪污罪","383":"第三百八十三条 对犯贪污罪的处罚规定","384":"第三百八十四条 挪用公款罪","385":"第三百八十五条 受贿罪","386":"第三百八十六条 对犯受贿罪的处罚规定","387":"第三百八十七条 单位受贿罪","388":"第三百八十八条 受贿罪；利用影响力受贿罪","389":"第三百八十九条 行贿罪","390":"第三百九十条 对犯行贿罪的处罚；关联行贿罪；对有影响力的人行贿罪","391":"第三百九十一条 对单位行贿罪","392":"第三百九十二条 介绍贿赂罪","393":"第三百九十三条 单位行贿罪","394":"第三百九十四条 贪污罪","395":"第三百九十五条 巨额财产来源不明罪；隐瞒境外存款罪","396":"第三百九十六条 私分国有资产罪；私分罚没财物罪","397":"第三百九十七条 滥用职权罪；玩忽职守罪","398":"第三百九十八条 故意泄露国家秘密罪；过失泄露国家秘密罪","399":"第三百九十九条 徇私枉法罪；民事、行政枉法裁判罪；执行判决、裁定失职罪；执行判决、裁定滥用职权罪；枉法仲裁罪","400":"第四百条 私放在押人员罪；失职致使在押人员脱逃罪","401":"第四百零一条 徇私舞弊减刑、假释、暂予监外执行罪","402":"第四百零二条 徇私舞弊不移交刑事案件罪","403":"第四百零三条 滥用管理公司、证券职权罪","404":"第四百零四条 徇私舞弊不征、少征税款罪","405":"第四百零五条 徇私舞弊发售发票、抵扣税款、出口退税罪；违法提供出口退税证罪","406":"第四百零六条 国家机关工作人员签订、履行合同失职被骗罪","407":"第四百零七条 违法发放林木采代许可证罪","408":"第四百零八条 环境监管失职罪；食品监管渎职罪；食品、药品监管渎职罪","409":"第四百零九条 传染病防治失职罪","410":"第四百一十条 非法批准征收、征用、占用土地罪；非法低价出让国有土地使用权罪","411":"第四百一十一条 放纵走私罪","412":"第四百一十二条 商检徇私舞弊罪；商检失职罪","413":"第四百一十三条 动植物徇私舞弊罪；动植物检疫失职罪","414":"第四百一十四条 放纵制售伪劣商品犯罪行为罪","415":"第四百一十五条 办理偷越国（边）境人员出入境证件罪；放行偷越国（边）境人员罪","416":"第四百一十六条 不解救被拐卖、绑架妇女、儿童罪；阻碍解救被拐卖、绑架妇女儿童罪","417":"第四百一十七条 帮助犯罪分子逃避处罚罪","418":"第四百一十八条 招收公务员、学生徇私舞弊罪","419":"第四百一十九条 失职造成珍贵文物损毁、流失罪"}
const criminalLawChnOptionMap = swap(criminalLawOptionMap)

export const criminalLawOptions =
  Object.values(criminalLawOptionMap)

export const getLawChnName = (law) => {
  return lawNameMap[law]
}

export const getLawName = (law) => {
  return lawChnNameMap[law]
}

export const getCriminalLawChnNumber = (number) => {
  return criminalLawOptionMap[number]
}

export const getCriminalLawNumber = (number) => {
  return criminalLawChnOptionMap[number]
}

export const lawIcon = 'https://mmbiz.qpic.cn/mmbiz_png/6fKEyhdZU90051UhswXRjkOshzDYNqY8lfLugm1vhWlOXZ6HVia3rFPJibhVAdPaNwlaN39FVtOcibVCImf2AMIdw/0?wx_fmt=png'

export const homePageOptions = {
  '刑法': [
    {
      title:'刑法',
      url: '/pages/criminalLaw/index',
      type: '刑法',
      sub:'2021年3月1日',
      hasExplanation: true
    },
    {
      title:'刑法相关解释、规定',
      url: '/pages/criminalComplement/index',
      type: '刑法'
    },
    // {
    //   title: '刑事执行检察',
    //   url: '/pages/criminalExecution/index',
    //   type: '刑法',
    // },
    {
      title: '行政—刑事衔接',
      url: '/pages/adminCriminalLink/index',
      type: '刑法'
    },
    {
      title: '刑事诉讼法',
      url: '/pages/litigationLaw/index',
      type: '刑法',
      sub:'2018年10月26日',
      hasExplanation: true
    },
    {
      title: otherLawNameMap['criminal-litigation-explanation'],
      url: '/pages/otherLaw/index?law=criminal-litigation-explanation',
      sub:'2021年3月1日',
      type: '刑法'
    },
    // {
    //   title: '(最高法)适用刑事诉讼法的解释',
    //   url: '/pages/litigationExplanation/index',
    //   type: '刑法'
    // },
    {
      title: otherLawNameMap['litigation-regulation'],
      url: '/pages/otherLaw/index?law=litigation-regulation',
      sub:'2019年12月30日',
      type: '刑法'
    },
    {
      title: otherLawNameMap['police-regulation'],
      url: '/pages/otherLaw/index?law=police-regulation',
      sub:'2020年07月20日',
      type: '刑法'
    },
    {
      title: otherLawNameMap['police-law'],
      url: '/pages/otherLaw/index?law=police-law',
      sub:'2012年10月26日',
      type: '刑法',

    },
    {
      title: otherLawNameMap['police-enforce-detail'],
      url: '/pages/otherLaw/index?law=police-enforce-detail',
      sub:'2016年7月5日',
      type: '刑法',

    },
    {
      title: otherLawNameMap['anti-terrorism-law'],
      url: '/pages/otherLaw/index?law=anti-terrorism-law',
      sub:'2018年4月27日',
      type: '刑法',

    },
    {
      title: otherLawNameMap['anti-drug-law'],
      url: '/pages/otherLaw/index?law=anti-drug-law',
      sub:'2008年6月1日',
      type: '刑法',
      hasExplanation: true
    },
    {
      title: '刑事审判参考',
      url: '/pages/consultant/index',
      type: '刑法'
    },
    {
      title: '裁判文书',
      url: '/pages/judgement/index',
      type: '刑法'
    }
  ],
  '民法典': [
    {
      title: '民法典',
      url: '/pages/civilLaw/index',
      sub:'2021年1月1日',
      type: '民法典',
      hasExplanation: true
    },
    {
      title: '民法典相关司法解释',
      url: '/pages/civilLawExplaination/index',
      type: '民法典'
    },
    {
      title: '民事诉讼法',
      url: '/pages/otherLaw/index?law=civil-law-regulation',
      sub:'2022年1月1日',
      type: '民法典',
      hasExplanation: true
    },
    {
      title: otherLawNameMap['civil-litigation-explanation-2022-04-10'],
      url: '/pages/otherLaw/index?law=civil-litigation-explanation-2022-04-10',
      sub:'2022年04月10日',
      type: '民法典'
    },
    {
      title: '裁判文书',
      url: '/pages/judgement/index',
      type: '民法典',
      redirect: () => {
        Taro.navigateToMiniProgram({
          appId: 'wxa7f48cf2a65948d7',
          path: '/pages/index/index'
        });
      }
    },
    {
      title: otherLawNameMap['labor-law'],
      url: '/pages/otherLaw/index?law=labor-law',
      sub:'2018年12月29日',
      type: '民法典',

      // isHot: true
    },
    {
      title: otherLawNameMap['labor-contract-law'],
      url: '/pages/otherLaw/index?law=labor-contract-law',
      sub:'2013年7月1日',
      type: '民法典',
      hasExplanation: true
      // isHot: true
    },{
      title: otherLawNameMap['labor-conciliation'],
      url: '/pages/otherLaw/index?law=labor-conciliation',
      sub:'2008年5月1日',
      type: '民法典',
      hasExplanation: true
    },
    {
      title: otherLawNameMap['consumer-right-protect-law'],
      url: '/pages/otherLaw/index?law=consumer-right-protect-law',
      sub:'2014年03月15日',
      type: '民法典',
      isNew: true,
      hasExplanation: true
    },{
      title: otherLawNameMap['medical-malpractice-regulation'],
      url: '/pages/otherLaw/index?law=medical-malpractice-regulation',
      sub:'2008年5月1日',
      type: '民法典',
      hasExplanation: true
    },
    {
      title: otherLawNameMap['company-law'],
      url: '/pages/otherLaw/index?law=company-law',
      sub:'2018年10月26日',
      type: '民法典',
      // isHot: true
    }
  ],
  '行政': [
    {
      title: otherLawNameMap['admin-litigation-law'],
      url: '/pages/otherLaw/index?law=admin-litigation-law',
      sub:'2017年7月1日',
      type: '行政',
      hasExplanation: true
    },
    {
      title: otherLawNameMap['admin-litigation-explaination'],
      url: '/pages/otherLaw/index?law=admin-litigation-explaination',
      sub:'2018年2月8日',
      type: '行政',
    },
    {
      title: otherLawNameMap['admin-force-law'],
      url: '/pages/otherLaw/index?law=admin-force-law',
      sub:'2012年1月1日',
      type: '行政',
      hasExplanation: true
    },
    {
      title: otherLawNameMap['admin-punish-law'],
      url: '/pages/otherLaw/index?law=admin-punish-law',
      sub:'2021年7月15日',
      type: '行政',
      hasExplanation: true
      // isHot: true
    },
    {
      title: otherLawNameMap['admin-reconsider-law'],
      url: '/pages/otherLaw/index?law=admin-reconsider-law',
      sub:'2017年9月1日',
      type: '行政',
      hasExplanation: true
      // isHot: true
    },
    {
      title: otherLawNameMap['admin-reconsider-regulation'],
      url: '/pages/otherLaw/index?law=admin-reconsider-regulation',
      sub:'2007年8月1日',
      type: '行政',

      // isHot: true
    },
    {
      title: otherLawNameMap['admin-allow-law'],
      url: '/pages/otherLaw/index?law=admin-allow-law',
      sub:'2019年4月23日',
      type: '行政',
      hasExplanation: true
      // isHot: true
    },
    {
      title: otherLawNameMap['public-order-admin-penalty-law'],
      url: '/pages/otherLaw/index?law=public-order-admin-penalty-law',
      sub:'2013年1月1日',
      type: '行政',
      hasExplanation: true
      // isHot: true
    },
    {
      title: otherLawNameMap['road-safe-law'],
      url: '/pages/otherLaw/index?law=road-safe-law',
      sub:'2021年4月29日',
      type: '行政',
      hasExplanation: true
    },
    {
      title: otherLawNameMap['road-safe-regulation'],
      url: '/pages/otherLaw/index?law=road-safe-regulation',
      sub:'2017年10月7日',
      type: '行政',

    },
    {
      title: otherLawNameMap['road-safe-violation-handling'],
      url: '/pages/otherLaw/index?law=road-safe-violation-handling',
      sub:'2020年5月1日',
      type: '行政',

    },
    {
      title: otherLawNameMap['police-admin-regulation'],
      url: '/pages/otherLaw/index?law=police-admin-regulation',
      sub:'2020年8月6日',
      type: '行政',

    },
    {
      title: otherLawNameMap['national-compensation'],
      url: '/pages/otherLaw/index?law=national-compensation',
      sub:'2013年1月1日',
      type: '行政',
      hasExplanation: true
    },
    {
      title: otherLawNameMap['exit-entry-law'],
      url: '/pages/otherLaw/index?law=exit-entry-law',
      sub:'2013年7月1日',
      type: '行政',
      hasExplanation: true
    },
    {
      title: otherLawNameMap['help-law'],
      url: '/pages/otherLaw/index?law=help-law',
      sub:'2022年1月1日',
      type: '行政',
    },
    {
      title: '人民检察院行政诉讼监督规则',
      url: '/pages/exampleDetail/index?type=admin-explanation&id=83cfc1ac61815808017bb81b641e2107',
      sub:'2021年9月1日',
      type: '行政',
      isNew: true
    },
    {
      title: '《人民检察院行政诉讼监督规则》的理解与适用',
      url: '/pages/exampleDetail/index?type=admin-explanation&id=150083c5618153f1000196501ef7dd25',
      sub:'2021年9月16日',
      type: '行政',
      isNew: true
    },
    {
      title: '公安部关于印发《公安机关对部分违反治安管理行为实施处罚的裁量指导意见》的通知',
      url: '/pages/exampleDetail/index?type=admin-explanation&id=8e170652617e95d301a5fafd24ddd9fe',
      sub:'2018年6月6日',
      type: '行政',
      isNew: true
    },
    {
      title: '公安部关于实施公安行政处罚裁量基准制度的指导意见',
      url: '/pages/exampleDetail/index?type=admin-explanation&id=8e170652617e95d301a5fafe4138dc35',
      sub:'2016年1月2日',
      type: '行政',
      isNew: true
    },
    {
      title: '娱乐场所管理条例',
      url: '/pages/exampleDetail/index?type=admin-explanation&id=8e17065261a2389f05600a320cab3ba2',
      sub:'2020年11月29日',
      type: '行政',
      isNew: true
    },
    {
      title: '娱乐场所治安管理办法',
      url: '/pages/exampleDetail/index?type=admin-explanation&id=8e17065261a23a6b05600a3303ad5a4a',
      sub:'2008年10月01日',
      type: '行政',
      isNew: true
    },
    {
      title: '行政相关法规',
      url: '/pages/adminComplement/index',
      type: '行政',
      isNew: true
    },
    {
      title: otherLawNameMap['fire-fighting'],
      url: '/pages/otherLaw/index?law=fire-fighting',
      sub:'2021年4月29日',
      type: '行政',
      isNew: true,
      hasExplanation: true
    },
  ],
  '公益':[{
    title: otherLawNameMap['public-interest-rule'],
    url: '/pages/otherLaw/index?law=public-interest-rule',
    sub:'2021年7月1日',
    type: '公益',
    isNew: true
  },{
    title: '《人民检察院公益诉讼办案规则》的理解与适用',
    url: '/pages/exampleDetail/index?type=complement&id=150083c5618153f10001964f2bc0c447',
    sub:'2021年7月1日',
    type: '公益',
    isNew: true
  }],
  '共有': [
    {
      title: '指导/典型/公报案例',
      url: '/pages/examples/index',
      type: '共有',
      isUpdated: true
    },
    {
      title: '地方法律法规',
      url: '/pages/localLaw/index',
      type: '共有',
      isNew: true
    },
    {
      title: '检察文书',
      url: '/pages/procuratorateDoc/index',
      type: '共有',
      isNew: true
    }
  ]
}

export const exampleOptions = [
  {
    title: '刑事审判参考',
    url: '/pages/consultant/index',
    type: '刑法'
  },
  {
    title: '刑事裁判文书',
    url: '/pages/judgement/index',
    type: '刑法'
  },
  {
    title: '民事裁判文书',
    url: '/pages/judgement/index',
    type: '民法典',
    redirect: () => {
      Taro.navigateToMiniProgram({
        appId: 'wxa7f48cf2a65948d7',
        path: '/pages/index/index'
      });
    }
  },
  {
  title: '指导/典型/公报案例',
  url: '/pages/examples/index',
  type: '共有',
  isUpdated: true
},
  {
    title: '地方法律法规',
    url: '/pages/localLaw/index',
    type: '共有',
    isNew: true
  },
  {
    title: '检察文书',
    url: '/pages/procuratorateDoc/index',
    type: '共有',
    isNew: true
  }]

export const searchHomePageOptions = (searchValue) => {
  if (isEmpty(searchValue)) {
    return []
  }
  return flattenDeep(Object.values(homePageOptions))
    .filter(item => item.title.indexOf(searchValue) !== -1)
}

export const noTitleExampleTypes = {
  'faxin-law-detail': 'faxin-law',
  'local-law-detail': 'local-law',
  'civilLawExample': 'civil-law-link-example-detail',
}

export const getFirstLine = text => {
  return text.split('\n').filter(line => line.trim() && line.trim().length > 0)[0]
}
