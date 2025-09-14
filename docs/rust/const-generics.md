# Rust 中 const 泛型

Rust 的 const 泛型允许你定义针对值的泛型，从而实现更灵活和高效的代码。它在数组、结构体和枚举等类型中尤为有用。

## 基本用法

```rust
struct ArrayWrapper<T, const N: usize> {
    data: [T; N],
}
fn main() {
    let array: ArrayWrapper<i32, 5> = ArrayWrapper { data: [1, 2, 3, 4, 5] };
    println!("{:?}", array.data);
}
```

在上面的例子中，`ArrayWrapper` 结构体使用了一个类型参数 `T` 和一个 const 泛型参数 `N`，表示数组的元素类型和数组的长度。这样你可以创建不同长度的数组包装器。

## const fn

Rust 还支持 `const fn`，允许你定义在**编译时就能计算的函数**。这些函数可以在常量表达式中使用。

```rust
const fn add_one(x: i32) -> i32 {
    x + 1
}

fn main() {
    const VALUE: i32 = add_one(5);
    println!("VALUE: {}", VALUE); // 输出 VALUE: 6
}
```

## 结合 `const` 泛型和 `const fn`

将 const fn 与 const 泛型 结合，可以实现更加灵活和高效的代码设计。例如，创建一个固定大小的缓冲区结构，其中缓冲区大小由编译期计算确定：

```rust
struct Buffer<const N: usize> {
    data: [u8; N],
}

const fn compute_buffer_size(factor: usize) -> usize {
    factor * 1024
}

fn main() {
    const SIZE: usize = compute_buffer_size(4);
    let buffer = Buffer::<SIZE> {
        data: [0; SIZE],
    };
    println!("Buffer size: {} bytes", buffer.data.len());
}
```

## 场景

- **数组和集合**：使用 const 泛型定义固定大小的数组和集合类型。
- **编译时计算**：使用 const fn 进行编译时计算，提高性能。

## 参考

- [泛型 Generics](https://course.rs/basic/trait/generic.html)
