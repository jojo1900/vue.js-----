// 1.7本节主要解决以下问题
//如果一个函数，既修改响应式数据，也访问响应式数据，那么会造成无限递归，最终栈溢出报错。foo += 1
//要解决这个问题，需要在trigger函数中增加逻辑，如果要执行的函数 === 当前副作用函数，那么跳过。

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
      fn();
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

function effect(fn) {
  function effectFn() {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    fn();
    effectStack.pop();
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
