---
order: 2
---

# 迭代器 Iterator

迭代器是 Rust 中用于遍历集合（如数组、向量、哈希表等）的一种抽象。它们提供了一种统一的方式来访问集合中的元素，而不需要暴露集合的底层结构。集合本身并不是迭代器，但它们可以通过一些方法创建迭代器。

## Iterator

`Iterator` 是一个 trait，定义了迭代器的行为。它包含一个核心方法 `next`，用于获取迭代器的下一个元素。`next` 方法返回一个 `Option<T>` 类型，其中 `T` 是迭代器中元素的类型。如果有下一个元素，返回 `Some(element)`；如果没有更多元素，返回 `None`。

```rust
trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

在 `Iterator` trait 中，`type Item;` 定义了迭代器中元素的类型。这个关联类型允许不同的迭代器实现返回不同类型的元素。
`Iterator` 的实现者会定义 `Item` 的具体类型，并实现 `next` 方法来返回该类型的元素。

比如：

```rust
struct Counter {
    count: u32,
}

impl Iterator for Counter {
    type Item = u32;  // 这个迭代器产生 u32 类型的值

    fn next(&mut self) -> Option<Self::Item> {
        // 实现...
    }
}
```

`Iterator` trait 还提供了许多默认实现的方法，如 `map`、`filter`、`collect` 等，这些方法基于 `next` 方法实现，可以链式调用，方便地对迭代器进行各种操作。

## 三种创建迭代器的方法

有三种常见的方法可以从集合中创建迭代器：

- `iter()`：返回一个不可变引用的迭代器，允许你遍历集合中的元素，但不能修改它们。
- `iter_mut()`：返回一个可变引用的迭代器，允许你遍历集合中的元素并修改它们。
- `into_iter()`：消耗集合并返回一个拥有所有权的迭代器，允许你遍历并获取集合中的元素的所有权。

Rust 中的 `for` 循环实际上是迭代器的语法糖。

```rust
let v1 = vec![1, 2, 3];
// 调用了 v1.into_iter()
for val in v1 {
    println!("{}", val);
}

let v2 = vec![1, 2, 3];
// 调用了 v2.iter()
for val in &v2 {
    println!("{}", val);
}

let mut v3 = vec![1, 2, 3];
// 调用了 v3.iter_mut()
for val in &mut v3 {
    *val += 1;
}
println!("{:?}", v3); // 输出 [2, 3, 4]
```

## Laziness

迭代器是惰性的，这意味着它们不会立即执行任何操作，直到你调用一个消费方法（如 `collect`、`sum`、`for_each` 等）来获取结果。惰性求值允许你构建复杂的迭代器链，而不会产生中间集合，从而提高性能。

```rust
let v = vec![1, 2, 3];
let sum: i32 = v.iter().map(|x| x + 1).sum();
println!("{}", sum); // 输出 7
```

## 迭代器方法

`Iterator` trait 提供了许多有用的方法来操作迭代器。大体分为两类：

- 迭代器消费器：这类方法会消耗迭代器并返回一个具体的值或集合。例如：
  - `collect`：将迭代器的元素收集到一个集合中（如 `Vec`、`HashMap` 等）。
  - `fold`：对迭代器中的元素进行累积操作，返回一个单一的值。类似 js 中的 `reduce`。
  - `count`：返回迭代器中元素的数量。
  - `find`：查找第一个满足条件的元素。
  - `position`：返回第一个满足条件的元素的索引。
  - `all`：检查所有元素是否满足某个条件。
  - `any`：检查是否有任何元素满足某个条件。
  - `sum`：计算迭代器中所有元素的和。
  - `product`：计算迭代器中所有元素的积。
  - `for_each`：对每个元素执行一个闭包。
- 迭代器适配器：这类方法会返回一个新的迭代器，允许你对原始迭代器进行转换或过滤。例如：
  - `map`：对每个元素应用一个函数，返回一个新的迭代器。
  - `filter`：根据一个条件过滤元素，返回一个新的迭代器。
  - `take`：获取前 n 个元素，返回一个新的迭代器。
  - `skip`：跳过前 n 个元素，返回一个新的迭代器。
  - `enumerate`：返回一个包含元素索引和元素值的迭代器。

下面是一些常用的迭代器方法示例：

**collect**：收集到集合

```rust
let v: Vec<i32> = (1..5).collect();
let set: HashSet<i32> = vec![1, 2, 2, 3].into_iter().collect();
```

**fold**：累积操作

```rust
let sum = (1..=10).fold(0, |acc, x| acc + x); // 55
let product = (1..=5).fold(1, |acc, x| acc * x); // 120
```

**count**：计数

```rust
let count = (1..=10).count(); // 10
```

**find**：查找元素

```rust
let v = vec![1, 2, 3, 4, 5];
if let Some(x) = v.iter().find(|&&x| x > 3) {
    println!("Found: {}", x); // 输出 Found: 4
}
```

**position**：查找索引

```rust
let v = vec![1, 2, 3, 4, 5];
if let Some(index) = v.iter().position(|&x| x == 3) {
    println!("Index: {}", index); // 输出 Index: 2
}
```

**for_each**：对每个元素执行操作

```rust
let v = vec![1, 2, 3];
v.iter().for_each(|&x| println!("{}", x));
```

**map**：映射转换

```rust
let v = vec![1, 2, 3];
let v2: Vec<i32> = v.iter().map(|&x| x * 2).collect(); // [2, 4, 6]
```

**filter**：过滤元素

```rust
let v = vec![1, 2, 3, 4, 5];
let even: Vec<i32> = v.iter().filter(|&&x| x % 2 == 0).cloned().collect(); // [2, 4]
```

**take**：获取前 n 个元素

```rust
let v = vec![1, 2, 3, 4, 5];
let first_three: Vec<i32> = v.iter().take(3).cloned().collect(); // [1, 2, 3]
```

**skip**：跳过前 n 个元素

```rust
let v = vec![1, 2, 3, 4, 5];
let without_first_two: Vec<i32> = v.iter().skip(2).cloned().collect(); // [3, 4, 5]
```

**enumerate**：索引和值

```rust
let v = vec!['a', 'b', 'c'];
for (index, value) in v.iter().enumerate() {
    println!("Index: {}, Value: {}", index, value);
}
```
