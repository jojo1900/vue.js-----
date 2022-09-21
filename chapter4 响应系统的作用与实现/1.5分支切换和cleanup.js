// 1.5本节主要解决以下问题
// 一个副作用函数可能依赖了多个响应式数据，在某些条件下才会依赖
// 比如，一个函数在条件1下，只依赖data1，在条件2下只依赖data2，所以，如果当前条件问条件1成立，条件2不成立，那么，就只有当data1发生改变时，才执行该副作用函数。
// 解决办法是，在每次执行副作用函数之前，把它从响应式数据的依赖集合中删除。
// 所以需要建立一个联系，即副作用函数需要存储依赖了哪些响应式数据。
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

// 响应式数据发生变化时，触发副作用函数重新执行
function trigger(target, key) {
  const effectFns = effectFnMap[target][key];
  const effectFnsToTun = new Set(effectFns);
  effectFns &&
    effectFnsToTun.forEach((fn) => {
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

// 每次执行副作用函数之前，把当前的副作用函数从依赖集合中删除掉
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps = [];
}

function effect(fn) {
  function effectFn() {
    cleanup(effectFn);
    activeEffect = effectFn;
    // 解决effect嵌套的问题
    effectStack.push(effectFn);
    fn();
    effectStack.pop();
    // activeEffect恢复
    activeEffect = effectStack[effectStack.length - 1];
  }
  effectFn.deps = [];
  effectFn();
}

// 应用

const reactiveCondition = reactive({ flag: true });

const data = {
  a: 'a1',
  b: 'b1',
};

const reactiveData = reactive(data);

effect(() => {
  if (reactiveCondition.flag) {
    console.log(reactiveData.a);
  }
  if (!reactiveCondition.flag) {
    console.log(reactiveData.b);
  }
});

reactiveCondition.flag = false;

setTimeout(() => {
  reactiveData.a = 'a2';
}, 1000);

setTimeout(() => {
  reactiveData.b = 'b2';
});
