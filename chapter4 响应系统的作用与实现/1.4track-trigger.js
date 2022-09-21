// 本节将get和set内的逻辑分别封装位track和trigger函数。
// 逻辑更加清晰

let activeEffect;
let effectFnMap = new Map();

// 依赖收集
function track(target, key) {
  if (!effectFnMap[target]) {
    effectFnMap[target] = new Map();
  }
  if (!effectFnMap[target][key]) {
    effectFnMap[target][key] = new Set();
  }
  const set = effectFnMap[target][key];

  if (!set.has(activeEffect)) {
    set.add(activeEffect);
  }
}

// 响应式数据发生变化时，触发副作用函数重新执行
function trigger(target, key) {
  const effectFns = effectFnMap[target][key];
  effectFns &&
    effectFns.forEach((fn) => {
      fn();
    });
}

// 封装一个函数，负责将传入的对象变为响应式数据。
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

// 封装一个effect函数,用来包装副作用函数
function effect(fn) {
  activeEffect = fn;
  fn();
}

// 应用

const data = {
  a: 1,
};

const reactiveData = reactive(data);

effect(() => {
  console.log(reactiveData.a);
});

setTimeout(() => {
  reactiveData.a = 2;
}, 1000);
