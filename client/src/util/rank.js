// how many times does key exist in string
const getTimes = (str, searchValue) => {
  if (str && searchValue) {
    return str.split( new RegExp( searchValue, "gi" ) ).length-1
  }
  return 0;
}
// RANK BY SEARCH VALUE TIMES
export const rankBySearchValue = (list, property, searchValue) => {
  if( property && list && list.length > 1) {
    list.sort((obj1, obj2) => {
      if (obj1[property] && obj2[property]) {
        const time1 = getTimes(obj1[property], searchValue)
        const time2 = getTimes(obj2[property], searchValue)
        return time2/obj2[property].length - time1/obj1[property].length
      } else if (obj1[property]) {
        return 1;
      }
      return -1;
    })
  }

  return list;
};

// key is the obj key/property to rank
export const rank = (list, property, searchValue) => {
  if( property && list && list.length > 1) {
    list.sort((obj1, obj2) => {
      if (obj1[property] && obj2[property]) {
        return obj1[property].length - obj2[property].length
      } else if (obj1[property]) {
        return 1;
      }
      return -1;
    })
  }

  return list;
};


const getScore = (criminalLaw, searchValue) => {

}

export const rankCriminalList = (list, searchValue) => {
  if(list && list.length > 1) {
    list.sort((obj1, obj2) => {
      const tag1 = obj1.tag
      const tag2 = obj2.tag
      const text1 = obj1.text
      const text2 = obj2.text
      if (tag1 && tag2) {
        const index1 = tag1.indexOf(searchValue)
        const index2 = tag2.indexOf(searchValue)
        if (index1 !== -1 && index2 !== -1) {
          if (index1 < index2) {
            return -1;
          } else if (index1 > index2) {
            return 1;
          }
        } else if (index1 !== -1) {
          return -1
        } else if (index2 !== -1) {
          return 1
        }
      }
      const time1 = getTimes(text1, searchValue)
      const time2 = getTimes(text2, searchValue)
      return time2/text2.length - time1/text1.length
    })
  }

  return list;
};

