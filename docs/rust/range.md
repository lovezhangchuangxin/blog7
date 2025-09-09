---
order: 3
---

# Rust 中的范围表达式

在学习切片时候了解到了 `str[0..5]` 这种写法，0..5 就是一个范围表达式，表示从索引 0 到索引 5（不包含 5）的部分字符串。

Rust 中的范围表达式有多种形式：

| 范围表达式  | 类型                       | 表示的范围      |
| :---------- | :------------------------- | :-------------- |
| start..end  | std::ops::Range            | start ≤ x < end |
| start..     | std::ops::RangeFrom        | start ≤ x       |
| ..end       | std::ops::RangeTo          | x < end         |
| ..          | std::ops::RangeFull        | -               |
| start..=end | std::ops::RangeInclusive   | start ≤ x ≤ end |
| ..=end      | std::ops::RangeToInclusive | x ≤ end         |

范围表达式本质是各种 `Range` 实例的语法糖。如下面的两行代码是等价的：

```rust
let x = 0..5;
let y = std::ops::Range {start: 0, end: 5};
```

## 常见用法

各种 `Range` 都实现了 `Iterator` trait，可以用于切片、迭代器等场景。

### 切片

```rust
let s = "Hello, world!";
let hello = &s[0..5]; // "Hello"
let world = &s[7..];  // "world!"
```

### 迭代器

```rust
for i in 0..5 {
    println!("{}", i); // 输出 0, 1, 2, 3, 4
}
```

## 常见方法

`Range` 类型实现了 `Iterator` trait，因此可以使用迭代器的方法来操作范围。

下面列一些 `Range` 常用的方法：

**rev**：反转

```rust
for i in (1..=5).rev() {
    println!("{}", i); // 输出 5, 4, 3, 2, 1
}
```

**step_by**：设置步长

```rust
for i in (1..=5).step_by(2) {
    println!("{}", i); // 输出 1, 3, 5
}
```

**sum**：求和

```rust
let sum: i32 = (1..=5).sum(); // 计算 1 到 5 的总和
```

## 参考

- [范围(Range)表达式](https://rust-book.junmajinlong.com/ch4/02_range_expression.html)
- [在 Rust 中使用范围（Range）：从基本到进阶](https://www.cnblogs.com/muko-aoi/articles/18579831)
