let activeEffect;
let effectFnMap = new Map();

// 封装一个函数，负责将传入的对象变为响应式数据。
function reactive(obj) {
  const proxyObj = new Proxy(obj, {
    get(target, key) {
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

      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      const effectFns = effectFnMap[target][key];
      effectFns &&
        effectFns.forEach((fn) => {
          fn();
        });
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
