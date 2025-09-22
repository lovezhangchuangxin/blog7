# Rust 中的 Box 智能指针

`Box` 是 Rust 标准库中提供的一种智能指针，用于在堆上分配内存。它允许你将数据存储在堆上，而不是栈上，从而实现更灵活的内存管理。

`Box` 是 Rust 中最常用的智能指针之一，适用于以下场景：

- **大数据结构**：当数据结构较大时，将其存储在堆上可以避免栈溢出。
- **递归类型**：递归类型（如链表、树等）需要使用 `Box` 来打破无限大小的问题。
- **动态大小类型**：当你需要存储动态大小类型（如 trait 对象）时，`Box` 是一个常用的选择。

## 创建 Box

```rust
let a = Box::new(5);
println!("a = {}", a);

// 下面这一行代码会报错
// let b = a + 1
```

在上面的例子中，`Box::new(5)` 创建了一个包含整数 `5` 的 `Box`，并将其存储在堆上。变量 `b` 是一个指向堆上数据的智能指针。

这里之所以可以直接打印 `b`，是因为 `Box` 实现了 `Deref` trait，可以像引用一样使用。最后一行代码报错则是因为在表达式中需要手动使用 `*` 来显示解引用 `Box`。

`Box` 实现了 `Drop` trait，当 `Box` 离开作用域时，`Box` 以及堆上的内存会被自动释放。

## 递归类型

递归类型是指在类型定义中引用自身的类型。由于 Rust 需要在编译时知道类型的大小，递归类型必须通过 `Box` 或其他智能指针来打破无限大小的问题。（使用引用也可以，但是我们希望获取所有权）

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}
```

## 动态大小类型

动态大小类型（DST）是指在编译时大小未知的类型，例如 trait 对象和切片。由于 Rust 需要在编译时知道类型的大小，动态大小类型必须通过 `Box` 或其他智能指针来存储。

```rust
trait Draw {
    fn draw(&self);
}

struct Button {
    id: u32,
}
impl Draw for Button {
    fn draw(&self) {
        println!("这是屏幕上第{}号按钮", self.id)
    }
}

struct Select {
    id: u32,
}

impl Draw for Select {
    fn draw(&self) {
        println!("这个选择框贼难用{}", self.id)
    }
}

fn main() {
    let elems: Vec<Box<dyn Draw>> = vec![Box::new(Button { id: 1 }), Box::new(Select { id: 2 })];

    for e in elems {
        e.draw()
    }
}
```

在上面的例子中，`Box<dyn Draw>` 是一个指向实现了 `Draw` trait 的类型的智能指针。由于 `Draw` 是一个 trait，编译器无法在编译时确定其大小，因此必须使用 `Box` 来存储。

## Box::leak

`Box::leak` 方法可以将一个 `Box` 转换为一个 `'static` 生命周期的引用。这样做会**泄漏**堆内存，因为内存不会被自动释放，必须手动管理。

```rust
fn main() {
   let s = gen_static_str();
   println!("{}", s);
}

fn gen_static_str() -> &'static str{
    let mut s = String::new();
    s.push_str("hello, world");

    Box::leak(s.into_boxed_str())
}
```

在上面的例子中，`gen_static_str` 函数创建了一个 `String`，然后将其转换为一个 `Box<str>`，最后使用 `Box::leak` 将其转换为一个 `'static` 生命周期的字符串切片。由于使用了 `Box::leak`，堆内存不会被释放，因此需要谨慎使用，以避免内存泄漏。
