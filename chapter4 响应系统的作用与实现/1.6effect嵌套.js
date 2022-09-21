// 1.6本节主要解决以下问题
// effect嵌套时，activeEffect可能会丢失（被内部的effect函数改变了），所以需要一个栈来保存当前副作用函数activeEffect
// 在每次fn执行之前，先把当前副作用函数push到栈，执行之后，栈.pop,同时把当前副作用函数恢复为栈顶。
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
    //activeEffect恢复
    activeEffect = effectStack[effectStack.length - 1];
  }
  effectFn.deps = [];
  effectFn();
}

// 应用

const data = {
  a: 'a1',
  b: 'b1',
};

const reactiveData = reactive(data);

effect(() => {
  effect(() => {
    console.log(reactiveData.b);
  });
  console.log(reactiveData.a);
});

// b2会log两次，是正常的
setTimeout(() => {
  reactiveData.a = 'a2';
}, 1000);

setTimeout(() => {
  reactiveData.b = 'b2';
});
