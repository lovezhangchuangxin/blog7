# 一些变量绑定的例子

下面就是一些可能会有混淆的例子，不过工作中一般用不上。

## 例子 1 连续赋值

```js
let a = (b = {});
a.c = a = 1;
console.log(a, b); // 1, { c: 1 }
```

我们知道连续赋值是从右到左的，乍一看上面的例子可能会觉得不对。毕竟先执行 `a = 1`，然后 `a.c = 1`，但是 `a` 已经变成了数字 `1`，给 `1` 添加的 `c` 属性赋值是什么鬼？

实际上，赋值确实是从右到左的，但是要赋值的对象 `a.c` 在赋值之前就已经确定好了。上面的代码等价于：

```js
let a = (b = {});
let temp = a; // 先把 a 的值保存下来
a = 1; // 然后把 a 赋值为 1
temp.c = 1; // 最后给原来的 a（也就是 temp） 添加 c 属性
console.log(a, b); // 1, { c: 1 }
```

## 例子 2 forEach

forEach 函数的作用很简单，遍历数组的每一项并执行回调函数，那假如回调函数中修改了数组呢？会发生什么？

```js
let arr = [1, 2, 3];
arr.forEach((item, index) => {
  console.log(item);
  arr.push(item);
});
console.log(arr); // [1, 2, 3, 1, 2, 3]
```

上面代码中，在每次遍历时都往数组中添加了一个元素，最后会遍历几次？会发生死循环吗？

作为对比，我们把 `forEach` 换成 `for...of`：

```js
let arr = [1, 2, 3];
for (let item of arr) {
  console.log(item);
  arr.push(item);
}
```

可以看到，`for...of` 会一直遍历下去，因为它能够感知到数组的变化，而 `forEach` 则不会。`forEach` 在开始遍历时就确定了要遍历的元素个数，所以只会遍历三次。

自己简单实现一个 `forEach`：

```js
Array.prototype.myForEach = function (callback) {
  const len = this.length; // 先把长度保存下来
  // 可以看到，要遍历多少次是提前确定好的，后续数组的变化不会影响遍历次数
  for (let i = 0; i < len; i++) {
    callback(this[i], i, this);
  }
};
```

## 例子 3 ESM 导入

使用 ESM 模块化语法来导入导出时，导入的变量是只读的，不能被重新赋值。

下面代码中，`foo.js` 中导出了变量 `a`，在 `main.js` 中导入后尝试修改 `a` 的值，会报错：`TypeError: Assignment to constant variable.`

::: code-group

```js [main.js]
import { a } from "./foo.js";
a = 2; // TypeError: Assignment to constant variable.
```

```js [foo.js]
export let a = 1;
```

:::

而在 CommonJS 中，导入的变量是可以被重新赋值的：

::: code-group

```js [main.js]
let { a } = require("./foo.js");
a = 2; // 可以成功赋值
console.log(a); // 2
```

```js [foo.js]
exports.a = 1;
```

:::
