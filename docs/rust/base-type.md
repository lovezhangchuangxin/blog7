# Rust 中的基本类型

Rust 每个值都有一个确定的类型，大体上可以分为两类：基本类型（scalar types）和复合类型（compound types）。

基本类型有：

- 整数类型（integer types）：`i8`、`i16`、`i32`、`i64`、`i128`、`isize`（有符号整数）；`u8`、`u16`、`u32`、`u64`、`u128`、`usize`（无符号整数）。
- 浮点数类型（floating-point types）：`f32`、`f64`。
- 布尔类型（boolean type）：`bool`，值为 `true` 或 `false`。
- 字符类型（character type）：`char`，表示单个 Unicode 字符。
- 单元类型（unit type）：`()`，表示没有值的类型，类似于其他语言中的 `void`。

得益于 Rust 强大的类型推导能力，我们经常可以省略类型的定义，但有时候也需要手动标注类型。比如：

```rust
let guess = "42".parse().expect("Not a number!");
```

上面例子中，`parse` 方法可以解析成多种类型，Rust 无法推导出具体类型，因此需要手动标注：

```rust
let guess: u32 = "42".parse().expect("Not a number!");
// 或者是
// let guess = "42".parse::<u32>().expect("Not a number!");
```

## 整数类型

Rust 支持多种整数类型，分为有符号整数和无符号整数两大类，默认是 `i32`。

- 有符号整数：`i8`、`i16`、`i32`、`i64`、`i128`、`isize`，可以表示负数和正数。
- 无符号整数：`u8`、`u16`、`u32`、`u64`、`u128`、`usize`，只能表示非负数。

`isize` 和 `usize` 类型的大小依赖于目标平台的指针大小（32 位平台为 4 字节，64 位平台为 8 字节），通常用于索引集合。

```rust
let x: i32 = -42;
let y: u32 = 42;
```

可以在整数字面量后面加上类型后缀来指定类型，为了便于区分，数字字面量和类型后缀之间可以加 `_`，实际上，任意数字之间都可以加 `_`：

```rust
let x1 = 42u32; // u32 类型
let x2 = 42i64; // i64 类型
let x3 = 1_000_000; // 1000000
let x4 = 1_000_000_u32; // 1000000
```

可以使用 `size_of::<T>` 函数来查看类型的字节大小：

```rust
println!("size of i32: {}", std::mem::size_of::<i32>()); // 输出 4
// sizeof 已经包含在 prelude 中，无需引入 std::mem
println!("size of u64: {}", size_of::<u64>());
```

可以使用 `size_of_val(&T)` 函数来查看值的字节大小：

```rust
let x = 123_isize;
println!("size of x: {}", size_of_val(&x)); // 输出 8 (在 64 位平台)
```

不同进制表示同其他语言类似：

| 进制     | 前缀 | 示例     |
| -------- | ---- | -------- |
| 二进制   | `0b` | `0b1010` |
| 八进制   | `0o` | `0o52`   |
| 十进制   | 无   | `42`     |
| 十六进制 | `0x` | `0x2A`   |

整数的运算和 C 语言类似，注意 `/` 是整数除法，结果向零取整：

```rust
let a = 7;
let b = 3;
println!("a + b = {}", a + b); // 10
println!("a - b = {}", a - b); // 4
println!("a * b = {}", a * b); // 21
println!("a / b = {}", a / b); // 2
println!("a % b = {}", a % b); // 1
```

### 整数溢出

在 Debug 模式下，整数溢出会导致程序 panic；在 Release 模式下，整数溢出会发生环绕（wrapping），即超出最大值后从最小值重新开始。

要显式处理可能的溢出，可以使用标准库针对原始数字类型提供的这些方法：

- 使用 `wrapping_*` 方法在所有模式下都按照补码循环溢出规则处理，例如 `wrapping_add`
- 如果使用 `checked_*` 方法时发生溢出，则返回 None 值
- 使用 `overflowing_*` 方法返回该值和一个指示是否存在溢出的布尔值
- 使用 `saturating_*` 方法，可以限定计算后的结果不超过目标类型的最大值或低于最小值。

```rust
fn main() {
    let a : u8 = 255;
    let b = a.wrapping_add(20);
    println!("{}", b);  // 19
}
```

### 位运算

Rust 支持常见的位运算符：

| 运算符  | 说明                                                     |
| ------- | -------------------------------------------------------- |
| & 位与  | 相同位置均为 1 时则为 1，否则为 0                        |
| \| 位或 | 相同位置只要有 1 时则为 1，否则为 0                      |
| ^ 异或  | 相同位置不相同则为 1，相同则为 0                         |
| ! 位非  | 把位中的 0 和 1 相互取反，即 0 置为 1，1 置为 0          |
| << 左移 | 所有位向左移动指定位数，右位补 0                         |
| >> 右移 | 所有位向右移动指定位数，带符号移动（正数补 0，负数补 1） |

对于移位运算，Rust 会检查它是否超出该整型的位数范围，如果超出，则会报错 overflow。

```rust
fn main() {
   let a: u8 = 255;
   let b = a>>7; // ok
   let b = a<<7; // ok
   let b = a>>8; // overflow
   let b = a<<8; // overflow
}
```

## 浮点数类型

Rust 支持两种浮点数类型：`f32`（32 位单精度）和 `f64`（64 位双精度）。默认情况是 `f64`。

```rust
let x = 2.0; // f64
let y: f32 = 3.0; // f32
```

注意，浮点数并不能进行精确比较，浮点数实现了 `PartialEq` trait 而不是 `Eq` trait。不能用于 `HashMap` 的 Key。

### NaN

浮点数类型遵循 IEEE-754 标准，支持特殊值 NaN（Not a Number）。NaN 代表未定义或不可表示的值，例如 0 除以 0。

可以使用 `is_nan` 方法来检查一个浮点数是否为 NaN。
NaN 不能用于比较操作，任何与 NaN 的比较（包括与自身的比较）都会返回 false。

```rust
let x: f64 = 0.0 / 0.0;
println!("x is NaN: {}", x.is_nan()); // 输出 true
println!("x == x: {}", x == x); // 输出 false
```

## 布尔类型

Rust 的布尔类型是 `bool`，只有两个可能的值：`true` 和 `false`。

```rust
let t: bool = true;
let f: bool = false;
```

布尔类型通常用于条件判断和控制流。

```rust
if t {
    println!("It's true!");
} else {
    println!("It's false!");
}
```

## 字符类型

Rust 的字符类型是 `char`，表示单个 Unicode 字符，占用 4 个字节（32 位）。可以表示任何 Unicode 标准中的字符。

```rust
let c: char = 'A';
let heart_eyed_cat = '😻';
let z = 'ℤ';
let g = '国';
println!("Characters: {}, {}, {}, {}", c, heart_eyed_cat, z, g);
println!(
    "Sizes: {}, {}, {}, {}",
    size_of_val(&c),
    size_of_val(&heart_eyed_cat),
    size_of_val(&z),
    size_of_val(&g)
); // 输出 4, 4, 4, 4
```

## 单元类型

单元类型是 `()`，表示没有值的类型，类似于其他语言中的 `void`。单元类型只有一个值，也就是 `()` 本身。

```rust
let unit: () = ();
```

单元类型通常用于函数没有返回值的情况，或者作为泛型参数的占位符。

```rust
fn do_nothing() -> () {
    // 这个函数什么都不做
}
let result = do_nothing();
println!("Result: {:?}", result); // 输出 Result: ()
```
