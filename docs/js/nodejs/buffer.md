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

## `buffer.buffer`

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

## Buffer 转字符串

使用 `buffer.toString()` 方法可以将 Buffer 转换为字符串。

方法声明：`buf.toString([encoding[, start[, end]]])`

- encoding `<string>` 要使用的字符编码。 默认值: 'utf8'。
- start `<integer>` 开始解码的字节偏移量。 默认值: 0。
- end `<integer>` 停止解码的字节偏移量（不包括在内）。 默认值: buf.length.

注意如果指定了 start 和 end，其范围需要是有效的可正确解码的字节范围，否则可能会出现乱码。

```js
const buf = Buffer.from("Hello, World!", "utf8");
console.log(buf.toString()); // Hello, World!
console.log(buf.toString("base64")); // SGVsbG8sIFdvcmxkIQ==

const buf2 = Buffer.from("你好", "utf8");
console.log(buf2.toString()); // 你好
// 字节范围不对有乱码
console.log(buf2.toString("utf8", 0, 1)); // �
```

## Buffer 读数据

buffer 是类数组，可以直接通过下标 `buffer[index]` 来读写数据：

```js
const buf = Buffer.from("Hello, World!", "utf8");
console.log(buf[0]); // 72
buf[0] = 74;
console.log(buf.toString()); // Jello, World!
```

此外，buffer 还提供了一系列的方法用于读取数据，包括：

- `buffer.readUInt8(offset)`：读取一个无符号 8 位整数。
- `buffer.readUInt16LE(offset)`：读取一个无符号 16 位整数（小端）。
- `buffer.readUInt16BE(offset)`：读取一个无符号 16 位整数（大端）。
- `buffer.readUInt32LE(offset)`：读取一个无符号 32 位整数（小端）。
- `buffer.readUInt32BE(offset)`：读取一个无符号 32 位整数（大端）。
- `buffer.readBigUInt64LE(offset)`：读取一个无符号 64 位整数（小端）。
- `buffer.readBigUInt64BE(offset)`：读取一个无符号 64 位整数（大端）。
- `buffer.readInt8(offset)`：读取一个有符号 8 位整数。
- `buffer.readInt16LE(offset)`：读取一个有符号 16 位整数（小端）。
- `buffer.readInt16BE(offset)`：读取一个有符号 16 位整数（大端）。
- `buffer.readInt32LE(offset)`：读取一个有符号 32 位整数（小端）。
- `buffer.readInt32BE(offset)`：读取一个有符号 32 位整数（大端）。
- `buffer.readBigInt64LE(offset)`：读取一个有符号 64 位整数（小端）。
- `buffer.readBigInt64BE(offset)`：读取一个有符号 64 位整数（大端）。
- `buffer.readFloatLE(offset)`：读取一个 32 位浮点数（小端）。
- `buffer.readFloatBE(offset)`：读取一个 32 位浮点数（大端）。
- `buffer.readDoubleLE(offset)`：读取一个 64 位浮点数（小端）。
- `buffer.readDoubleBE(offset)`：读取一个 64 位浮点数（大端）。

另外还有一些方法可以用于指定要读取的字节数（1 <= byteLength <= 6）：

- `buffer.readIntBE(offset, byteLength)`：读取一个指定字节数的有符号整数（大端）。
- `buffer.readUIntBE(offset, byteLength)`：读取一个指定字节数的无符号整数（大端）。
- `buffer.readIntLE(offset, byteLength)`：读取一个指定字节数的有符号整数（小端）。
- `buffer.readUIntLE(offset, byteLength)`：读取一个指定字节数的无符号整数（小端）。

下面举几个例子：

```js
const buf = Buffer.from([-1, 5]);

console.log(buf.readInt8(0)); // -1
console.log(buf.readUInt8(0)); // 255
console.log(buf.readInt16BE(0)); // -251
console.log(buf.readUInt16BE(0)); // 65285
console.log(buf.readIntBE(0, 1)); // -1
console.log(buf.readUIntBE(0, 1)); // 255
```

## Buffer 写数据

可以直接通过下标 `buffer[index]` 在指定字节位置写入数据：

```js
const buf = Buffer.from("Hello, World!", "utf8");
buf[0] = 74;
console.log(buf.toString()); // Jello, World!
```

`buffer.write` 可以写入字符串数据，方法声明：

`buffer.write(string[, offset[, length]][, encoding])`

- string `<string>` 要写入 buf 的字符串。
- offset `<integer>` 开始写入 string 之前要跳过的字节数。 默认值: 0。
- length `<integer>` 要写入的最大字节数（写入的字节数不会超过 buf.length - offset）。 默认值: buf.length - offset。
- encoding `<string>` string 的字符编码。 默认值: 'utf8'。
- 返回: `<integer>` 写入的字节数。

```js
const buf = Buffer.from("Hello, World!", "utf8");
buf.write("Hi", 0, 2);
console.log(buf.toString()); // Hillo, World!
```

此外，buffer 还提供了一系列的方法用于写入数据：

- `buffer.writeUInt8(value, offset)`：写入一个无符号 8 位整数。
- `buffer.writeUInt16LE(value, offset)`：写入一个无符号 16 位整数（小端）。
- `buffer.writeUInt16BE(value, offset)`：写入一个无符号 16 位整数（大端）。
- `buffer.writeUInt32LE(value, offset)`：写入一个无符号 32 位整数（小端）。
- `buffer.writeUInt32BE(value, offset)`：写入一个无符号 32 位整数（大端）。
- `buffer.writeBigUInt64LE(value, offset)`：写入一个无符号 64 位整数（小端）。
- `buffer.writeBigUInt64BE(value, offset)`：写入一个无符号 64 位整数（大端）。
- `buffer.writeInt8(value, offset)`：写入一个有符号 8 位整数。
- `buffer.writeInt16LE(value, offset)`：写入一个有符号 16 位整数（小端）。
- `buffer.writeInt16BE(value, offset)`：写入一个有符号 16 位整数（大端）。
- `buffer.writeInt32LE(value, offset)`：写入一个有符号 32 位整数（小端）。
- `buffer.writeInt32BE(value, offset)`：写入一个有符号 32 位整数（大端）。
- `buffer.writeBigInt64LE(value, offset)`：写入一个有符号 64 位整数（小端）。
- `buffer.writeBigInt64BE(value, offset)`：写入一个有符号 64 位整数（大端）。
- `buffer.writeFloatLE(value, offset)`：写入一个 32 位浮点数（小端）。
- `buffer.writeFloatBE(value, offset)`：写入一个 32 位浮点数（大端）。
- `buffer.writeDoubleLE(value, offset)`：写入一个 64 位浮点数（小端）。
- `buffer.writeDoubleBE(value, offset)`：写入一个 64 位浮点数（大端）。
- `buffer.writeIntBE(value, offset, byteLength)`：写入一个指定字节数的有符号整数（大端）。
- `buffer.writeUIntBE(value, offset, byteLength)`：写入一个指定字节数的无符号整数（大端）。
- `buffer.writeIntLE(value, offset, byteLength)`：写入一个指定字节数的有符号整数（小端）。
- `buffer.writeUIntLE(value, offset, byteLength)`：写入一个指定字节数的无符号整数（小端）。

这些方法用于同上文 buffer 读取数据的方法的用法，只不过多了第一个参数，即要写入的值。

```js
const buf = Buffer.alloc(4);
buf.writeInt32LE(42, 0);
console.log(buf.readInt32LE(0)); // 42
```

## Buffer 合并

可以合并多个 Buffer 对象，生成一个新的 Buffer 对象：

`Buffer.concat(list[, totalLength])`

- `list` `<Buffer[]>` | `<Uint8Array[]>` 要连接的 Buffer 或 Uint8Array 实例的列表。
- `totalLength` `<integer>` 连接时 `list` 中 Buffer 实例的总长度。
- 返回: `<Buffer>`

如果未提供 `totalLength`，则从 `list` 中的 `Buffer` 实例通过相加其长度来计算。如果 `totalLength` 为 0，则返回长度为 0 的 Buffer。

如果提供了 `totalLength`，则将其强制为无符号整数。如果 `list` 中 Buffer 的组合长度超过 `totalLength`，则结果截断为 `totalLength`。

```js
const buf1 = Buffer.from("Hello, ");
const buf2 = Buffer.from("World!");
const buf3 = Buffer.concat([buf1, buf2]);
console.log(buf3.toString()); // Hello, World!
```

## Buffer 比较

可以使用 `Buffer` 的静态方法 `Buffer.compare(buf1, buf2)` 方法比较两个 Buffer 对象。

- 返回: `<number>` 如果 `buf1` 小于 `buf2`，则返回 -1；如果 `buf1` 等于 `buf2`，则返回 0；如果 `buf1` 大于 `buf2`，则返回 1。

比较是按照字节逐个比较的方式进行的。

```js
const buf1 = Buffer.from("Hello");
const buf2 = Buffer.from("World");
const buf3 = Buffer.from("Hello");

console.log(Buffer.compare(buf1, buf2)); // -1
console.log(Buffer.compare(buf1, buf3)); // 0
console.log(Buffer.compare(buf2, buf1)); // 1
```

还可以使用实例方法 `buf.compare(target[, targetStart[, targetEnd[, sourceStart[, sourceEnd]]]])` 来比较当前 buffer 与另一个 buffer。

- target `<Buffer>` | `<Uint8Array>` 用于比较 buf 的 Buffer 或 Uint8Array。
- targetStart `<integer>` target 内开始比较的偏移量。 默认值: 0。
- targetEnd `<integer>` target 中结束比较（不包括）的偏移量。 默认值: target.length。
- sourceStart `<integer>` buf 内开始比较的偏移量。 默认值: 0。
- sourceEnd `<integer>` buf 中结束比较（不包括）的偏移量。 默认值: buf.length.
- 返回值同 `Buffer.compare`

```js
const buf1 = Buffer.from("Hello");
const buf2 = Buffer.from("World");
const buf3 = Buffer.from("Hello");

console.log(buf1.compare(buf2)); // -1
console.log(buf1.compare(buf3)); // 0
console.log(buf2.compare(buf1)); // 1
```

如果想直接判断两个 Buffer 是否相等，可以使用 `buf.equals(otherBuffer)` 方法。

```js
const buf1 = Buffer.from("Hello");
const buf2 = Buffer.from("World");
const buf3 = Buffer.from("Hello");

console.log(buf1.equals(buf2)); // false
console.log(buf1.equals(buf3)); // true
```

## Buffer 复制

使用 `buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])` 可以将数据从 `buf` 的区域复制到 `target` 的区域，即使 `target` 内存区域与 `buf` 重叠。

- target `<Buffer>` | `<Uint8Array>` 要复制到的 Buffer 或 Uint8Array。
- targetStart `<integer>` target 内开始写入的偏移量。 默认值: 0。
- sourceStart `<integer>` buf 内开始复制的偏移量。 默认值: 0。
- sourceEnd `<integer>` buf 内停止复制的偏移量（不包括）。 默认值: buf.length.
- 返回: `<integer>` 复制的字节数。

```js
const buf1 = Buffer.from("Hello");
const buf2 = Buffer.from("World");
const buf3 = Buffer.alloc(10);

buf1.copy(buf3, 0, 0, buf1.length);
buf2.copy(buf3, 5, 0, buf2.length);

console.log(buf3.toString()); // HelloWorld
```

## Buffer 裁剪

可以使用 `buf.subarray([start[, end]])` 方法裁剪 Buffer。

- start `<integer>` 新的 Buffer 将开始的位置。 默认值: 0。
- end `<integer>` 新的 Buffer 将结束的位置（不包括在内）。 默认值: buf.length.
- 返回新的 Buffer`，**其引用与原始缓冲区相同的内存**，但由 `start`和`end` 索引进行偏移和裁剪。

该方法继承自 TypedArray.prototype.subarray()。

```js
const buf = Buffer.from("Hello, World!");
const sliced = buf.subarray(0, 5);
console.log(sliced.toString()); // Hello
buf[0] = 0x68;
console.log(sliced.toString()); // hello
```

## Buffer 迭代

`Buffer` 实现了 `Symbol.iterator` 接口，可以使用 `for...of` 循环进行迭代。

```js
const buf = Buffer.from("Hello");
for (const val of buf) {
  console.log(val);
}
```

此外，类似于数组，`Buffer` 实例也具有 `keys`、`values` 和 `entries` 方法，可以用于获取迭代器。

```js
const buf = Buffer.from("Hello");
for (const key of buf.keys()) {
  console.log(key);
}
for (const val of buf.values()) {
  console.log(val);
}
for (const [index, val] of buf.entries()) {
  console.log(index, val);
}
```

## 参考

- [nodejs 中文网](https://nodejs.cn/api-v18/buffer.html#buffer)
- [nodejs 官网](https://nodejs.org/docs/latest/api/buffer.html)
- [Node.js 中的 Buffer 模块](https://heptaluan.github.io/2019/09/22/Node/07/#ArrayBuffer)
- [Node.js 中的缓冲区（Buffer）究竟是什么？](https://cnodejs.org/topic/5d3a81619969a529571d759e)
- [面试官：说说对 Node 中的 Buffer 的理解？应用场景？](https://vue3js.cn/interview/NodeJS/Buffer.html#%E4%B8%80%E3%80%81%E6%98%AF%E4%BB%80%E4%B9%88)
- [字节序探析：大端与小端的比较](https://www.ruanyifeng.com/blog/2022/06/endianness-analysis.html)
