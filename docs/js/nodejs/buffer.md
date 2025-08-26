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

Node.js 诞生之初 JavaScript 本身还没有操作二进制数据的能力，因此引入了 `Buffer` 类来填补这个空白。`Buffer` 允许开发者以更高效的方式处理二进制数据，比如在网络通信和文件 I/O 等场景中。

> 后来 JavaScript 中也逐渐引入了一些原生的 API 来支持二进制数据的处理，比如 `ArrayBuffer` 和 `TypedArray` 等，`Buffer` 于是被改写为继承自 `Uint8Array`。
