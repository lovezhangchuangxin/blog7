# JS 中 this 的指向

在 JavaScript 中，`this` 关键字的指向情况很多，非常杂乱。即使是经验丰富的开发者，有时候面对 `this` 也不得不谨慎行事，如履薄冰。下面介绍一些 `this` 指向的常见情况。

## 1. 全局环境中的 `this`

在非 ESM 模块中，浏览器的全局 `this` 指向全局对象 `window`。

```javascript
console.log(this === window); // true
```

在 commonjs 模块中，NodeJs 中的全局 `this` 指向 `module.exports`。

```javascript
console.log(this === module.exports); // true
console.log(this === exports); // true
```

在 ESM 模块中，浏览器的全局 `this` 指向 `undefined`。

```javascript
console.log(this === undefined); // true
```

在 ESM 模块中，NodeJs 中的全局 `this` 也指向 `undefined`。

```javascript
console.log(this === undefined); // true
```

关于 commonjs 和 ESM 的区别，可以参考网上其他文章。这里只提一下怎么复现上面例子的结果。html 的 script 使用 `type="module"` 属性来表示这是一个 ESM 模块：

nodejs 中，直接创建一个 `.mjs` 后缀的文件，nodejs 会把它当作 ESM 模块来处理。（也可以在 package.json 中设置 `"type": "module"`，这样所有 `.js` 文件都会被当作 ESM 模块来处理。）

## 2. 普通函数中的 `this`

这里指的普通函数，一方面是和箭头函数区分开来，另一方面是和对象的方法区分开来。
即，使用 `function` 关键字定义的函数，且不以 `.` 方式调用的函数。

非严格模式下，普通函数中的 `this` 指向全局对象。在浏览器中是 `window`，在 nodejs 中是 `global`。它们可以统一用 `globalThis` 来表示。

```javascript
function foo() {
  console.log(this === globalThis); // true
}
foo(); // globalThis 在浏览器中指向 window，nodejs 中指向 global
```

严格模式下，普通函数中的 `this` 指向 `undefined`。

```javascript
"use strict";
function foo() {
  console.log(this === undefined); // true
}
foo();
```

## 3. 方法中的 `this`

方法本质也是函数，只不过它是作为对象的属性来调用的。

一句话：**`.` 前面是谁，`this` 就指向谁。**

```javascript
const obj = {
  name: "obj",
  foo: function () {
    console.log(this === obj); // true
  },
};
obj.foo();
```

## 4. 箭头函数中的 `this`

箭头函数没有**自己**的 `this`，它的 `this` 是来自外层作用域的 `this`。

下面例子中，`arrow` 是箭头函数，它的 `this` 来自外界的 `this` 即 `foo` 函数的 `this`。

```javascript
const obj = {
  name: "obj",
  foo: function () {
    const arrow = () => {
      console.log(this === obj); // true
    };
    arrow();
  },
};
```

## 总结函数中的 `this`

下面总结上面 2、3、4 这几种情况中的 `this` 指向：

1. 箭头函数没有自己的 `this`，`this` 来自外层作用域。
2. 函数调用时，`this` 指向调用它的对象（即 `.` 前面的对象）。如果不是通过 `.` 调用的函数，则 `this` 指向全局对象（非严格模式）或 `undefined`（严格模式）。

## 构造函数中的 `this`

构造函数是通过 `new` 关键字调用的函数。构造函数中的 `this` 指向新创建的对象。

```javascript
function Person(name) {
  this.name = name;
}
const p = new Person("张三");
console.log(p.name); // 张三
```

当你使用 `new` 调用一个函数时，JavaScript 会做以下几件事：

1. 创建一个新对象。
2. 将新对象的原型指向构造函数的 `prototype` 属性。
3. **将构造函数内部的 `this` 指向这个新对象。**
4. 执行构造函数的代码。
5. 如果构造函数没有显式返回一个对象，则返回这个新对象。

相当于下面的代码（注意只是演示原理，不能直接执行）：

```javascript
function Person(name) {
  // 1. 创建一个新对象
  const obj = {};
  // 2. 将新对象的原型指向构造函数的 prototype 属性
  Object.setPrototypeOf(obj, Person.prototype);
  // 3. 将构造函数内部的 this 指向这个新对象
  this = obj;
  // 4. 执行构造函数的代码
  obj.name = name;
  // 5. 如果构造函数没有显式返回一个对象，则返回这个新对象
  return obj;
}
```

## 显式绑定 `this`

JavaScript 提供了 `call`、`apply` 和 `bind` 三个方法来显式地设置函数调用时的 `this`。

```javascript
function foo() {
  console.log(this.name);
}
const obj = { name: "obj" };
foo.call(obj); // obj
foo.apply(obj); // obj
const boundFoo = foo.bind(obj);
boundFoo(); // obj
```

`call` 和 `apply` 会立即调用函数，而 `bind` 会返回一个新的函数，可以稍后调用。

这三种方法只能改变非箭头函数中的 `this`，不能改变箭头函数中的 `this`。
