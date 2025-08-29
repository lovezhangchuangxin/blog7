# var、let、const 区别

## 作用域

**var 是全局作用域（不在任何函数中声明的 var）或者函数作用域，而 let 和 const 是块级作用域。**

```js
{
  var a = 1;
  let b = 2;
  const c = 3;
}

console.log(a); // 1
console.log(b); // ReferenceError: b is not defined
console.log(c); // ReferenceError: c is not defined
```

函数作用域听起来似乎没有大不了的，但是你能见到这种诡异的代码：

```js
if (true) {
  var test = true; // 使用 "var" 而不是 "let"
}

alert(test); // true，变量在 if 结束后仍存在
```

var 会穿透了 if，for 等代码块。这是因为在早期的 JavaScript 中，块没有词法环境，而 var 就是这个时期的代表之一。

## 变量提升

**`var`、`let`、`const` 声明的变量都会被提升到其作用域的顶部**。但是 `let` 和 `const` 的提升行为与 `var` 不同。

注意，_变量提升_ 只是变量的定义被提升了，而赋值操作并没有提升。

```js
function sayHi() {
  phrase = "Hello";
  alert(phrase); // 正常弹出 Hello
  var phrase;
}
sayHi();
```

和下面的代码等价：

```js
function sayHi() {
  var phrase;
  phrase = "Hello";
  alert(phrase);
}
sayHi();
```

## 暂时性死区（TDZ，Temporal Dead Zone）

**`let` 和 `const` 虽然也有变量提升，但是由于暂时性死区的存在，它们不能在声明之前使用。**

```js
const x = 1;
{
  console.log(x); // ReferenceError
  const x = 2;
}
```

上面例子中，假如 `const` 没有变量提升，那么 `console.log(x)` 应该获取的是外层的 `x`，结果却是 `ReferenceError`。说明 `x` 有变量提升，但是又访问不到，**即 `let` 和 `const` 声明的变量在声明之前不能使用的区域，就称之为暂时性死区。**

`var` 没有暂时性死区。

::: details 官方原话

> let and const declarations define variables that are scoped to the running execution context’s LexicalEnvironment. The variables are created when their containing Lexical Environment is instantiated but may not be accessed in any way until the variable’s LexicalBinding is evaluated. A variable defined by a LexicalBinding with an Initializer is assigned the value of its Initializer’s AssignmentExpression when the LexicalBinding is evaluated, not when the variable is created. If a LexicalBinding in a let declaration does not have an Initializer the variable is assigned the value undefined when the LexicalBinding is evaluated.

:::

## 重复声明

**var 允许重复声明同一个变量，而 let 和 const 不允许。**

```js
let user;
let user; // SyntaxError: 'user' has already been declared
```

使用 var，我们可以重复声明一个变量，不管多少次都行。如果我们对一个已经声明的变量使用 var，这条新的声明语句会被忽略：

```js
var user = "Pete";

var user = "John"; // 这个 "var" 无效（因为变量已经声明过了）
// ……不会触发错误

alert(user); // John
```

## let 和 const 的区别

**let 和 const 的区别在于，const 声明的变量不能被修改，而 let 声明的变量可以被修改。**

```js
let a = 1;
a = 2;
console.log(a); // 2

const b = 1;
b = 2; // TypeError: Assignment to constant variable.
```
