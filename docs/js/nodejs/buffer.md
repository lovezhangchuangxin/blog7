---
order: 2
---

# Node.js Buffer 学习

## Buffer 概述

`Buffer` 是 Node.js 中用于处理二进制数据的类，表示**固定长度的字节序列**。它可以存储原始数据并提供了一些方法来操作这些数据。`Buffer` 的主要特点包括：

- `Buffer` 是 Node.js API，不能在浏览器中使用
- 高效地处理二进制字节数据，`Buffer` 中的每个元素占一个字节
- 支持多种编码格式，包括 UTF-8、ASCII、Base64 等，字符串和 `Buffer` 可以相互转换
- 提供了丰富的 API 来操作数据

Node.js 诞生之初 JavaScript 本身还没有操作二进制数据的能力，因此引入了 `Buffer` 类来填补这个空白。`Buffer` 允许开发者以更高效的方式处理二进制数据，比如在网络通信、文件 I/O、图像处理、文件压缩等场景中。

> 虽然 Buffer 类在全局作用域内可用，但仍然建议通过 import 或 require 语句显式地引用它。

::: tip
后来 JavaScript 中也逐渐引入了一些原生的 API 来支持二进制数据的处理，比如 `ArrayBuffer` 和 `TypedArray` 等，`Buffer` 于是被改写为继承自 `Uint8Array`。
:::

## Buffer 简单使用

在正式介绍 `Buffer` 的各个知识点之前，先看一些使用 `Buffer` 的简单例子，直观上感受 `Buffer` 的作用：

第一个例子是将标准输入流中的数据写入文件：

<<< @/.vitepress/examples/js/nodejs/buffer/stdinToFile.js

第二个例子是将图片文件转换为 Base64 格式，并嵌入到 HTML 中：

<<< @/.vitepress/examples/js/nodejs/buffer/tranformPic.js

## 创建 Buffer

下面介绍创建 `Buffer` 的几种方法：

1. **使用 Buffer.from() 方法**

方法声明：

- `Buffer.from(string[, encoding])`
- `Buffer.from(array)`
- `Buffer.from(arrayBuffer[, byteOffset[, length]])`
- `Buffer.from(buffer)`
- `Buffer.from(object[, offsetOrEncoding[, length]])`

```js
// 使用字符串创建 Buffer，可以指定字符串的编码
const buf1 = Buffer.from("Hello, World!", "utf8");

// 使用数字数组创建 Buffer，数字范围是 0-255，超出的话会 % 256
const buf2 = Buffer.from([1, 2, 3]);

// 使用 ArrayBuffer 创建 Buffer，Buffer 将作为 arrayBuffer 的视图
// 而不会复制底层内存，可以指定字节偏移 byteOffset 和长度 length
const arr = new Uint8Array([1, 2, 3, 4, 5]);
const buf3 = Buffer.from(arr.buffer, 1, 3); // <Buffer 02 03 04>
arr[1] = 100; // buf3 也会改变：<Buffer 64 03 04>

// 复制另一个 buffer 的内存
const buf4 = Buffer.from(buf3);

// 使用对象创建 Buffer，对象要实现 Symbol.toPrimitive 或者 valueOf
const obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === "string") {
      return "Hello, World!";
    }
    return 42;
  },
};
// 本质是调用了 obj[Symbol.toPrimitive]("string") 将对象转换字符串再来创建 buffer
const buf5 = Buffer.from(obj);
```

2. **使用 Buffer.alloc() 方法**

方法声明：`Buffer.alloc(size[, fill[, encoding]])`

创建指定字节大小的 `Buffer`，可以填充数字或者字符串，填充字符串时可以指定编码。

```js
// 创建一个长度为 10 的 Buffer，初始值为 0
const buf1 = Buffer.alloc(10);
// 初始值为 1
const buf2 = Buffer.alloc(10, 1);
// 初始值为 "Hello, World!"，默认编码为 utf8
const buf3 = Buffer.alloc(20, "Hello, World!");
// 指定其他编码
const buf4 = Buffer.alloc(20, "Hello, World!", "base64");
```

3. **使用 Buffer.allocUnsafe() 方法**

方法声明：`Buffer.allocUnsafe(size)`

创建一个长度为 `size` 的 Buffer，未初始化，可能包含旧数据。

```js
// 可能包含旧数据
const buf = Buffer.allocUnsafe(10);
```

## `Buffer.buffer`

前面说过 `Buffer` 其实是类型化数组，继承自 `Uint8Array`，因此可以通过 `buffer.buffer` 访问底层的 `ArrayBuffer`。

注意，`Buffer` 是 `ArrayBuffer` 的视图，并不一定包含 `ArrayBuffer` 的全部范围。范围必须是有效的字节范围。

- `buffer.buffer` 表示底层的 ArrayBuffer。
- `buffer.byteOffset` 表示 buffer 在底层 ArrayBuffer 中的偏移量。
- `buffer.byteLength` 表示 buffer 的字节数。
- `buffer.length` 表示 buffer 的元素个数。
- `buffer.BYTES_PER_ELEMENT` 表示 buffer 中每个元素占用的字节数。

由于 `Buffer` 表示的是一个字节序列，因此 `Buffer.length` 和 `Buffer.byteLength` 的值是相同的。

```js
const arr = new Uint8Array([1, 2, 3, 4, 5]);
const buf = Buffer.from(arr.buffer, 1, 2);
console.log(buf.byteOffset); // 1
console.log(buf.byteLength); // 2
console.log(buf.length); // 2
console.log(buf.BYTES_PER_ELEMENT); // 1
```

## Buffer 写数据

## 参考

- [nodejs 中文网](https://nodejs.cn/api-v18/buffer.html#buffer)
- [nodejs 官网](https://nodejs.org/docs/latest/api/buffer.html)
- [Node.js 中的 Buffer 模块](https://heptaluan.github.io/2019/09/22/Node/07/#ArrayBuffer)
- [Node.js 中的缓冲区（Buffer）究竟是什么？](https://cnodejs.org/topic/5d3a81619969a529571d759e)
- [面试官：说说对 Node 中的 Buffer 的理解？应用场景？](https://vue3js.cn/interview/NodeJS/Buffer.html#%E4%B8%80%E3%80%81%E6%98%AF%E4%BB%80%E4%B9%88)
- [字节序探析：大端与小端的比较](https://www.ruanyifeng.com/blog/2022/06/endianness-analysis.html)
