function flat(arr, depth = 1) {
  if (depth === 0) {
    return arr;
  }

  let res = [];
  arr.forEach((item) => {
    if (Array.isArray(item)) {
      res.push(...flat(item, depth - 1));
    } else {
      res.push(item);
    }
  });
  return res;
}
const arr = [1, [2], [3, [4]]];

const res = flat(arr, 1);
console.log(res);
