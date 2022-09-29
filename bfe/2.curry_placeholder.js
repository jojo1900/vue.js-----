function curry(fn) {
  return function curried(...args) {
    const gotEnoughArgs = !args.includes('_') && args.length >= fn.length;
    if (gotEnoughArgs) {
      return fn.apply(this, args);
    } else {
      return function (...args2) {
        const argsTransform = [];
        args.forEach((arg) => {
          if (arg === '_') {
            argsTransform.push(args2.shift());
          } else {
            argsTransform.push(arg);
          }
        });
        return curried.apply(this, argsTransform.concat(args2));
      };
    }
  };
}

const join = (a, b, c) => {
  return `${a}_${b}_${c}`;
};

const curriedJoin = curry(join);

const res = curriedJoin('_', '_', '_', '_')('_', 2, '_')('_', 3)(1); // '1_2_3'

console.log(res);
