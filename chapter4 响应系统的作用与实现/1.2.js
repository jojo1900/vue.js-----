// 封装一个函数effect，将参数变为响应式函数。

let effectFnMap = new Map();
let activeEffect;
function effect(fn) {
  //
  activeEffect = fn;
  fn();
}

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

      set.add(activeEffect);

      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      const effectFns = effectFnMap[target][key];
      console.log('fns', effectFns);
      effectFns &&
        effectFns.forEach((fn) => {
          fn();
        });
      return true;
    },
  });

  return proxyObj;
}
const data = {
  a: 'hello ',
};

const data2 = {
  b: 'jesse',
};

const proxyData1 = reactive(data);
const proxyData2 = reactive(data2);

function useData1() {
  const div = document.createElement('div');
  div.textContent = proxyData1.a;
  const body = document.body;
  body.appendChild(div);
}

function useData2() {
  const div = document.createElement('div');
  div.textContent = proxyData2.b;
  const body = document.body;
  body.appendChild(div);
}

effect(useData1);
effect(useData2);

setTimeout(() => {
  proxyData1.a = "it's jesse speaking ";
}, 1000);

setTimeout(() => {
  proxyData2.b = 'i like u ';
}, 1000);
