//https://www.jb51.net/article/86391.htm

const chnNumChar = ["零","一","二","三","四","五","六","七","八","九"];
const chnUnitSection = ["","万","亿","万亿","亿亿"];
const chnUnitChar = ["","十","百","千"];

function SectionToChinese(section){
  let strIns = '', chnStr = '';
  let unitPos = 0;
  let zero = true;
  while(section > 0){
    let v = section % 10;
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
  let unitPos = 0;
  let strIns = '', chnStr = '';
  let needZero = false;

  if(num === 0){
    return chnNumChar[0];
  }

  while(num > 0){
    let section = num % 10000;
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

export const isNumber = (n) => { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

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

function cnnumtonum(chnStr){
  let chnNumChar = {
    '零':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9
  };
  let chnNameValue = {
    '十':{value:10, secUnit:false},
    '百':{value:100, secUnit:false},
    '千':{value:1000, secUnit:false},
    '万':{value:10000, secUnit:true},
    '亿':{value:100000000, secUnit:true}
  };
  let rtn = 0;
  let section = 0;
  let number = 0;
  let secUnit = false;
  let str = chnStr.split('');
  for(let i = 0; i < str.length; i++){
    let num = chnNumChar[str[i]];
    if(typeof num !== 'undefined'){
      number = num;
      if(i === str.length - 1){
        section += number;
      }
    }else{
      let unit = chnNameValue[str[i]].value;
      secUnit = chnNameValue[str[i]].secUnit;
      if(secUnit){
        section = (section + number) * unit;
        rtn += section;
        section = 0;
      }else{
        section += (number * unit);
      }
      number = 0;
    }
  }
  let r = rtn + section;
  if(chnStr.indexOf('十') === 0) {
    r = r + 10;
  }
  return r;
}

export const getNumber = str => {
  return cnnumtonum(str.replace('第', '').replace('条', ''));
}
