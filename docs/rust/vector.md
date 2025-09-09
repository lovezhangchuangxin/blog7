---
order: 4
---

# Rust 中的 Vector

在 Rust 中，我们可以使用数组来存储一组相同类型的值。然而，数组的长度是固定的，这意味着我们在编译时就必须知道数组的大小。如果我们需要一个可以动态增长或缩小的集合，我们可以使用 `Vector`。

数组和 `Vector` 的区别：

| 特性       | 数组   | Vector |
| ---------- | ------ | ------ |
| 大小       | 固定   | 动态   |
| 内存位置   | 栈     | 堆     |
| 实现的特质 | Copy   | Drop   |
| 添加元素   | 不支持 | 支持   |
| 删除元素   | 不支持 | 支持   |

## 创建 Vector

我们可以使用 `Vec::new` 函数创建一个空的 `Vector`，或者使用 `vec!` 宏来创建一个包含初始值的 `Vector`。

```rust
// 可以不用指定类型，编译器会根据下面添加的数据类型推断出 Vector 的类型
let mut v: Vec<i32> = Vec::new();
v.push(1);
v.push(2);
v.push(3);

let v = vec![1, 2, 3, 4, 5];
println!("{:?}", v);
```

注意：`Vector` 没有实现 `Display` trait，但是实现了 `Debug` trait，因此我们不能直接使用 `{}` 来打印它，而是使用 `{:?}` 来打印调试信息。

当 `Vector` 需要存储的数据超过其当前容量时，它会自动分配更多的内存来容纳新数据。如果知道数据的长度，为了避免频繁的内存分配，可以使用 `Vec::with_capacity` 来创建一个具有指定容量的 `Vector`。使用 `capacity` 方法可以查看当前的容量。

```rust
let mut v: Vec<i32> = Vec::with_capacity(10);
v.push(1);
v.push(2);
println!("Vector: {:?}, Capacity: {}", v, v.capacity());
```

## 访问 Vector

我们可以使用索引或 `get` 方法来访问 `Vector` 中的元素。使用索引时，如果索引超出范围，程序会 panic；而使用 `get` 方法则会返回一个 `Option` 类型，安全性更高。

```rust
let v = vec![1, 2, 3];
let first = v[0]; // 使用索引访问，类型为 i32
let second = v.get(1); // 使用 get 方法访问，类型为 Option<&i32>
```

注意，直接使用索引访问，如果元素实现了 `Drop` trait，会导致所有权的转移，这时候可以使用引用：

```rust
let v = vec![String::from("hello"), String::from("world")];
let first = &v[0]; // 使用引用，避免所有权转移
println!("{}", first);
```

## 更新 Vector

我们可以使用索引来更新 `Vector` 中的元素：

```rust
let mut v = vec![1, 2, 3];
v[0] = 10; // 更新第一个元素
println!("{:?}", v); // 输出 [10, 2, 3]
```

除此之外还有一些方法可以更新 `Vector`：

**push**：在 `Vector` 末尾添加一个元素。

```rust
let mut v = vec![1, 2, 3];
v.push(4); // 添加元素 4
println!("{:?}", v); // 输出 [1, 2, 3, 4]
```

**pop**：移除并返回 `Vector` 末尾的元素。如果 `Vector` 为空，返回 `None`。

```rust
let mut v = vec![1, 2, 3];
if let Some(x) = v.pop() {
    println!("Popped: {}", x); // 输出 Popped: 3
}
println!("{:?}", v); // 输出 [1, 2]
```

**insert**：在指定位置插入一个元素，后面的元素会向后移动。越界会 panic。

```rust
let mut v = vec![1, 2, 3];
v.insert(1, 10); // 在索引 1 处插入元素 10
println!("{:?}", v); // 输出 [1, 10, 2, 3]
```

**remove**：移除并返回指定位置的元素，后面的元素会向前移动。越界会 panic。

```rust
let mut v = vec![1, 2, 3];
let x = v.remove(1); // 移除索引 1 处的元素
println!("Removed: {}", x); // 输出 Removed: 2
println!("{:?}", v); // 输出 [1, 3]
```

**clear**：清空 `Vector` 中的所有元素。

```rust
let mut v = vec![1, 2, 3];
v.clear(); // 清空 Vector
println!("{:?}", v); // 输出 []
```

**resize**：调整 `Vector` 的长度。如果新长度大于当前长度，使用指定的值填充新元素；如果新长度小于当前长度，截断多余的元素。

```rust
let mut v = vec![1, 2, 3];
v.resize(5, 0); // 扩展到长度 5，新增元素为 0
println!("{:?}", v); // 输出 [1, 2, 3, 0, 0]
v.resize(2, 0); // 缩短到长度 2
println!("{:?}", v); // 输出 [1, 2]
```

**append**：将另一个 `Vector` 的所有元素添加到当前 `Vector` 的末尾，另一个 `Vector` 会被清空。

```rust
let mut v1 = vec![1, 2, 3];
let mut v2 = vec![4, 5, 6];
v1.append(&mut v2); // 将 v2 的元素添加到 v1
println!("v1: {:?}, v2: {:?}", v1, v2); // 输出 v1: [1, 2, 3, 4, 5, 6], v2: []
```

**extend**：将一个可迭代对象的所有元素添加到 `Vector` 的末尾。

```rust
let mut v = vec![1, 2, 3];
v.extend(vec![4, 5, 6]); // 添加多个元素
println!("{:?}", v); // 输出 [1, 2, 3, 4, 5, 6]
```

## 遍历 Vector

`Vector` 实现了 `IntoIterator` trait，可以使用 `for` 循环来遍历其中的元素。

```rust
let v = vec![1, 2, 3];
for i in &v { // 使用引用，避免所有权转移
    println!("{}", i);
}
```

`Vector` 还提供了 `iter`、`iter_mut` 和 `into_iter` 方法来创建不同类型的迭代器，从而使用迭代器的方法：

- `iter`：返回一个不可变引用的迭代器，遍历时不会改变 `Vector` 的内容。
- `iter_mut`：返回一个可变引用的迭代器，允许在遍历时修改 `Vector` 的内容。
- `into_iter`：消耗 `Vector` 并返回一个拥有所有权的迭代器，遍历时可以获取元素的所有权。

```rust
let v = vec![1, 2, 3];
for i in v.iter() { // 不可变引用迭代器
    println!("{}", i);
}
let mut v = vec![1, 2, 3];
for i in v.iter_mut() { // 可变引用迭代器
    *i += 1; // 修改元素
}
println!("{:?}", v); // 输出 [2, 3, 4]
let v = vec![1, 2, 3];
for i in v.into_iter() { // 拥有所有权的迭代器
    println!("{}", i);
}
```

## Vector 常用方法

`Vector` 类型实现了许多有用的方法，下面列出一些常用的方法：

- **len**：返回 `Vector` 中元素的数量。

```rust
let v = vec![1, 2, 3];
println!("Length: {}", v.len()); // 输出 Length: 3
```

- **is_empty**：检查 `Vector` 是否为空。

```rust
let v: Vec<i32> = Vec::new();
println!("Is empty: {}", v.is_empty()); // 输出 Is empty: true
```

- **contains**：检查 `Vector` 是否包含某个元素。注意元素需要实现 `PartialEq` trait。

```rust
let v = vec![1, 2, 3];
println!("Contains 2: {}", v.contains(&2)); // 输出 Contains 2: true
```

- **sort**：对 `Vector` 中的元素进行排序。元素需要实现 `Ord` trait。

```rust
let mut v = vec![3, 1, 2];
v.sort(); // 排序
println!("{:?}", v); // 输出 [1, 2, 3]
```

- **reverse**：反转 `Vector` 中元素的顺序。

```rust
let mut v = vec![1, 2, 3];
v.reverse(); // 反转
println!("{:?}", v); // 输出 [3, 2, 1]
```

- **clone**：创建 `Vector` 的一个副本。元素需要实现 `Clone` trait。

```rust
let v = vec![1, 2, 3];
let v2 = v.clone(); // 克隆
println!("{:?}", v2); // 输出 [1, 2, 3]
```

## Vector 存储不同类型的元素

`Vector` 只能存储相同类型的元素。如果需要存储不同类型的元素，可以使用枚举（`enum`）来定义一个包含多种类型的枚举类型，然后创建一个存储该枚举类型的 `Vector`。

```rust
enum MyEnum {
    Int(i32),
    Float(f64),
}

let v = vec![
    MyEnum::Int(1),
    MyEnum::Float(2.0),
    MyEnum::Int(3),
];
for item in v {
    match item {
        MyEnum::Int(i) => println!("Int: {}", i),
        MyEnum::Float(f) => println!("Float: {}", f),
    }
}
```

## Vector Drop

当 `Vector` 超出作用域时，Rust 会自动调用其 `Drop` trait 的实现来释放内存。`Vector` 会递归地调用其元素的 `Drop` 实现，确保所有元素都被正确地释放。

```rust
struct A;

impl Drop for A {
    fn drop(&mut self) {
        println!("Dropping A");
    }
}

fn main() {
    {
        let _vec = vec![A, A, A];
    } // 这里会打印三次 "Dropping A"
}
```

**借用检查器确保了任何 vector 中内容的引用仅在 vector 本身有效时才可用。**

## 参考

- [使用 Vector 储存列表](https://kaisery.github.io/trpl-zh-cn/ch08-01-vectors.html)
- [动态数组 Vector](https://course.rs/basic/collections/vector.html)
- [Rust 的 Vector](https://www.cnblogs.com/muko-aoi/articles/18579009)
