// 1.8本节主要解决以下问题
// 实现副作用函数的可调度机制，让副作用函数的执行更加灵活

let activeEffect;

let effectStack = [];
let effectFnMap = new Map();

// 依赖收集
function track(target, key) {
  if (!activeEffect) {
    return;
  }

  if (!effectFnMap[target]) {
    effectFnMap[target] = new Map();
  }

  if (!effectFnMap[target][key]) {
    effectFnMap[target][key] = new Set();
  }

  const set = effectFnMap[target][key];

  set.add(activeEffect);
  activeEffect.deps.push(set);
}

function trigger(target, key) {
  const effectFns = effectFnMap[target][key];
  const effectFnsToTun = new Set();

  // 如果effectFn === activeEffect，那么跳过 ，不执行
  effectFns.forEach((effectFn) => {
    if (effectFn !== activeEffect) {
      effectFnsToTun.add(effectFn);
    }
  });
  effectFns &&
    effectFnsToTun.forEach((fn) => {
      const { scheduler } = fn.options;
      if (scheduler) {
        scheduler(fn);
      } else {
        fn();
      }
    });
}

function reactive(obj) {
  const proxyObj = new Proxy(obj, {
    get(target, key) {
      track(target, key);
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      trigger(target, key);
      return true;
    },
  });

  return proxyObj;
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps = [];
}

function effect(fn, options) {
  options = options || {};
  function effectFn() {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  }
  effectFn.deps = [];
  effectFn.options = options;
  effectFn();
}

// 应用，忽略中间状态，只log最终状态
const foo = reactive({ a: 1 });

const jobQueue = new Set();
const p = Promise.resolve();

let isFlushing = false;

function flushJob() {
  if (isFlushing) return;
  isFlushing = true;
  p.then(() => {
    jobQueue.forEach((job) => {
      job();
    });
  }).finally(() => {
    isFlushing = false;
  });
}
const scheduler = (effectFn) => {
  jobQueue.add(effectFn);
  flushJob();
};
effect(
  () => {
    console.log(foo.a);
  },
  { scheduler }
);

foo.a++;
foo.a++;
foo.a++;
