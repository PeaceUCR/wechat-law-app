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
