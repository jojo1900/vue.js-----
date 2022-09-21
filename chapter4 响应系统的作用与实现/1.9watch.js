// 1.9本节主要解决以下问题
// 实现computed属性和lazy特性

// 1.computed属性

let activeEffect;

let effectStack = [];
let effectFnMap = new Map();

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
  debugger;
  const effectFns = effectFnMap[target][key];
  const effectFnsToTun = new Set();

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
  function effectFn() {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    const res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  }

  effectFn.deps = [];
  effectFn.options = options;

  if (!options.lazy) {
    effectFn();
  } else {
    return effectFn;
  }
}

function computed(getter) {
  const effectFn = effect(getter, {
    lazy: true,
  });
  const obj = {
    get value() {
      return effectFn();
    },
  };
  return obj.value;
}

// 应用

const foo = reactive({ a: 1, b: 2 });

let computedData = computed(() => {
  return foo.a + foo.b;
});

console.log(computedData);

foo.a = 3;

console.log(computedData);
