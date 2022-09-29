//节流
function throttle(fn, duration) {
  let runningFlag = false;
  return function (...args) {
    if (runningFlag) {
      return;
    }
    runningFlag = true;

    setTimeout(() => {
      runningFlag = false;
    }, duration);

    return fn.apply(this, args);
  };
}

const fn = () => {
  console.log(11);
};

const tFn = throttle(fn, 1000);

setInterval(() => {
  tFn();
}, 10);
