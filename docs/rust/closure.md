# Rust 中闭包

> 闭包是一种匿名函数，它可以赋值给变量也可以作为参数传递给其它函数，不同于函数的是，它允许捕获调用者作用域中的值

```rust
fn main() {
   let x = 1;
   let sum = |y| x + y;

    assert_eq!(3, sum(2));
}
```

## 闭包的类型推导

Rust 是静态类型语言，所有的变量都具有类型。不过得益于 Rust 强大的类型推导能力，我们经常可以省略类型的定义，但是通过对变量的使用，让 Rust 编译器自己推导出正确的类型，当 Rust 无法推导正确的类型时我们再手动标注。

而在 Rust 中定义函数时，必须手动指定参数和返回值的类型。这是因为函数并不一定立即使用，Rust 当然就无从推导。

对于闭包来说，由于闭包通常会立即使用，Rust 可以通过上下文推导出闭包的参数和返回值类型，因此闭包的参数和返回值类型可以省略，当然也可以标注。

下面展示了同一个功能的函数和闭包实现形式：

```rust
fn  add_one_v1   (x: u32) -> u32 { x + 1 }
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;
```

## 三种类型的闭包

Rust 中的闭包有三种类型，分别是 `Fn`、`FnMut` 和 `FnOnce`，它们的区别在于对捕获变量的使用方式不同。

- `Fn`：表示闭包不会修改捕获的变量，可以多次调用。类似于不可变借用（`&T`）。
- `FnMut`：表示闭包可能会修改捕获的变量，可以多次调用。类似于可变借用（`&mut T`）。
- `FnOnce`：表示闭包会消耗捕获的变量，只能调用一次。类似于获取所有权（`T`）。

下面代码展示了三种闭包类型的区别：

```rust
fn main() {
    let mut str = String::from("hello");
    let x = || str.len();
    let x = || str.push_str(" world");
    let x = || str;
}
```

## 闭包作为函数参数

闭包可以作为函数的参数传递，函数参数需要指定闭包的类型（`Fn`、`FnMut` 或 `FnOnce`）。下面是一个接受闭包作为参数的例子：

```rust
fn apply<F>(f: F) -> i32
where
    F: Fn(i32) -> i32,
{
    f(2)
}

fn main() {
    let result = apply(|x| x + 1);
    assert_eq!(result, 3);
}
```

上面代码中定义了一个 `apply` 函数，它接受一个闭包 `f` 作为参数，并调用该闭包。参数 `f` 的类型通过泛型约束指定为 `Fn(i32) -> i32`，表示 `f` 是一个接受 `i32` 参数并返回 `i32` 的 `Fn` 类型的闭包。

## 闭包作为返回值

闭包也可以作为函数的返回值，返回值类型需要使用 `impl Trait` 语法来指定闭包的类型。下面是一个返回闭包的例子：

```rust
fn make_adder(x: i32) -> impl Fn(i32) -> i32 {
    move |y| x + y
}

fn main() {
    let add_one = make_adder(1);
    assert_eq!(add_one(2), 3);
}
```

`impl Trait` 的返回方式有一个缺陷，就是只能返回同样的类型，下面代码，虽然相个闭包长的一样，但是**就算签名一样的闭包，类型也是不同的**，所以就不能用 `impl Trait` 的方式返回：

```rust
fn factory(x:i32) -> impl Fn(i32) -> i32 {

    let num = 5;

    if x > 1{
        move |x| x + num
    } else {
        move |x| x - num
    }
}
```

可以使用 `Box<dyn Trait>` 的方式来返回不同类型的闭包：

```rust
fn factory(x:i32) -> Box<dyn Fn(i32) -> i32> {
    let num = 5;

    if x > 1{
        Box::new(move |x| x + num)
    } else {
        Box::new(move |x| x - num)
    }
}
```

## 参考

- [闭包 Closure](https://course.rs/advance/functional-programing/closure.html)
