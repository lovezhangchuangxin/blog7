---
order: 3
---

# 为什么没有函数装饰器？

目前 JavaScript 中装饰器语法的[提案](https://github.com/tc39/proposal-decorators)处于 Stage 3，已经非常稳定，即将进入正式标准。但是，它只定义了装饰器在类中的使用。有关函数装饰器的提案还不成熟，其中一个原因在于**函数提升**。

## 函数提升

JavaScript 中使用 `function` 声明的函数会被提升到其所在作用域的顶部。这意味着在函数声明之前就可以调用该函数。

```js
foo();
function foo() {
  console.log("foo");
}
```

相当于：

```js
function foo() {
  console.log("foo");
}
foo();
```

## 函数提升带来的问题

假如装饰器会随着函数提升一起提升，那么装饰器函数必须在被装饰的函数之前定义，否则装饰器作用时装饰器还未定义：

```js
// work 和 log 同时提升，log 是未定义
@log
function work() {}

function log(fn) {
  return function (...args) {
    console.log("Calling function:", fn.name);
    return fn(...args);
  };
}
```

假如函数提升而装饰器不提升，那么在函数声明之前使用的函数将是未装饰的函数：

```js
work();

@log
function work() {}

function log(fn) {
  return function (...args) {
    console.log("Calling function:", fn.name);
    return fn(...args);
  };
}
```

经过函数提升后的结果是：

```js
function work() {}

function log(fn) {
  return function (...args) {
    console.log("Calling function:", fn.name);
    return fn(...args);
  };
}

// 此时 work 还没被装饰器作用
work();

work = log(work);
```

此外，假如装饰器函数使用函数表达式等变量形式创建，由于函数提升在变量提升之前，问题还会更加复杂。

综上，由于 JavaScript 语言中各种“提升”的特性，导致函数装饰器很难在各种正常的 js 写法中都完全生效。

## 高阶函数实现装饰器效果

虽然 Js 目前没有函数装饰器，但是可以通过高阶函数实现类似装饰器的效果。

```js
/**
 * 组合多个装饰器
 */
function compose(original, ...fns) {
  return fns.reduceRight((acc, fn) => fn(acc), original);
}

/**
 * 日志装饰器
 */
function log(fn) {
  return function (...args) {
    console.log("Calling function:", fn.name);
    return fn(...args);
  };
}

function log2(fn) {
  return function (...args) {
    console.log("Calling function:", fn.name);
    return fn(...args);
  };
}

work = compose(work, log, log2);
function work(a, b) {}

work(1, 2);
```

依然需要注意：

- 装饰器需要在被装饰的函数之前定义
- 在函数被装饰之后再使用该函数

## 参考

- [为什么装饰器不能用于函数？](https://www.bookstack.cn/read/es6-3rd/spilt.3.docs-decorator.md)
- [Allow decorators for functions as well](https://github.com/wycats/javascript-decorators/issues/4)
- [Allow decorating functions](https://github.com/tc39/proposal-decorators/issues/40#issuecomment-370010647)
- [Decorator lazy evaluation for function declaration](https://github.com/iddan/proposal-function-expression-decorators/issues/3)
