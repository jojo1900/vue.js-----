// 1.什么是响应式数据
// 数据改变后，会重新执行对应的副作用函数的数据。

// 2.什么是副作用函数
// 会改变本函数作用域外的变量的函数。

const bucket = new Set();

const data = {
  a: 'hello',
};

const proxyData = new Proxy(data, {
  get(target, key) {
    bucket.add(effect);
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    bucket.forEach((func) => {
      func();
    });
    return true;
  },
});

function effect() {
  document.body.innerText = proxyData.a;
}

effect();
setTimeout(() => {
  proxyData.a = 'world';
}, 2000);
