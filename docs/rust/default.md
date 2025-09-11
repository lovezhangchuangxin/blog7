# Rust 中的 Default trait

Rust 中的 `Default` trait 用于为类型提供一个默认值。实现了 `Default` trait 的类型可以通过调用 `Default::default()` 方法来获取其默认值。

## 定义

```rust
pub trait Default: Sized {
    fn default() -> Self;
}
```

> 实现了 Sized trait 的类型, 在编译期可以确定内存大小.

Rust 里的基础数据类型都实现了 `Default` trait。它们的默认值如下：

- `bool`：`false`
- `char`：`'\x00'`（空字符）
- 整数类型（如 `i32`, `u32` 等）：`0`
- 浮点数类型（如 `f32`, `f64`）：`0.0`
- `String`：空字符串 `""`
- `Vec<T>`：空向量 `vec![]`
- `Option<T>`：`None`

## 结构体实现 Default

对于自定义的结构体，如果其所有字段都实现了 `Default` trait，那么可以通过 `#[derive(Default)]` 自动为结构体实现 `Default` trait。

```rust
#[derive(Default)]
struct MyStruct {
    a: i32,
    b: String,
}
```

也可以手动实现 `Default` trait：

```rust
struct MyStruct {
    a: i32,
    b: String,
}

impl Default for MyStruct {
    fn default() -> Self {
        MyStruct {
            a: 42,
            b: String::from("Hello"),
        }
    }
}

fn main() {
    let instance: MyStruct = Default::default();
    println!("a: {}, b: {}", instance.a, instance.b); // 输出: a: 42, b: Hello
}
```

`Default` trait 的用法很有意思，当调用 `Default::default()` 时，编译器会根据上下文推断出具体的类型。

对于实现了 `Default` trait 的结构体，可以使用 `..Default::default()` 语法来初始化结构体的部分字段，而其他字段则使用默认值：

````rust
#[derive(Default)]
struct MyStruct {
    a: i32,
    b: String,
    c: bool,
}

fn main() {
    let instance = MyStruct {
        a: 10,
        ..Default::default() // b 和 c 使用默认值
    };
    println!("a: {}, b: {}, c: {}", instance.a, instance.b, instance.c); // 输出: a: 10, b: , c: false
}
```

## 枚举类型实现 Default

对于枚举类, 可以通过 `#[default]` 标签属性来指定哪个值是默认的

```rust
#[derive(Default)]
enum MyEnum {
    #[default]
    VariantA,
    VariantB,
}
````

也可以手动实现 `Default` trait：

```rust
enum MyEnum {
    VariantA,
    VariantB,
}

impl Default for MyEnum {
    fn default() -> Self {
        MyEnum::VariantA
    }
}
```

## 参考

- [Sized 与 ?Sized](https://rust.biofan.org/common-traits/sized.html)
- [Default trait](https://rust.biofan.org/common-traits/default.html)
- [Trait std::default::Default](https://rustwiki.org/zh-CN/std/default/trait.Default.html)

```

```

```

```
