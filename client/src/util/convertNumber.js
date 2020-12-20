//https://www.jb51.net/article/86391.htm

const chnNumChar = ["零","一","二","三","四","五","六","七","八","九"];
const chnUnitSection = ["","万","亿","万亿","亿亿"];
const chnUnitChar = ["","十","百","千"];

function SectionToChinese(section){
  var strIns = '', chnStr = '';
  var unitPos = 0;
  var zero = true;
  while(section > 0){
    var v = section % 10;
    if(v === 0){
      if(!zero){
        zero = true;
        chnStr = chnNumChar[v] + chnStr;
      }
    }else{
      zero = false;
      strIns = chnNumChar[v];
      strIns += chnUnitChar[unitPos];
      chnStr = strIns + chnStr;
    }
    unitPos++;
    section = Math.floor(section / 10);
  }
  return chnStr;
}

function convert(num){
  var unitPos = 0;
  var strIns = '', chnStr = '';
  var needZero = false;

  if(num === 0){
    return chnNumChar[0];
  }

  while(num > 0){
    var section = num % 10000;
    if(needZero){
      chnStr = chnNumChar[0] + chnStr;
    }
    strIns = SectionToChinese(section);
    strIns += (section !== 0) ? chnUnitSection[unitPos] : chnUnitSection[0];
    chnStr = strIns + chnStr;
    needZero = (section < 1000) && (section > 0);
    num = Math.floor(num / 10000);
    unitPos++;
  }

  return chnStr;
}

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

export function convertNumberToChinese(num) {
  if(isNumber(num)) {
    if (num >= 10 && num <= 19) {
      let n = convert(num);
      return `第${n.substring(1, n.length)}条`;
    }
    return `第${convert(num)}条`;
  }
  return num;
}
