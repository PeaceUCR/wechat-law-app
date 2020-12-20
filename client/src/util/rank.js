// key is the obj key to rank
export const rank = (list, key) => {
  if( key && list && list.length > 1) {
    list.sort((obj1, obj2) => {
      if (obj1[key] && obj2[key]) {
        return obj1[key].length - obj2[key].length
      } else if (obj1[key]) {
        return 1;
      }
      return -1;
    })
  }

  return list;
};
