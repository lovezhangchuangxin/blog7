# Rust 中的 Deref 和 Drop trait

前面我们介绍了 Rust 中的智能指针 `Box`，它实现了 `Deref` 和 `Drop` 两个重要的 trait。本文将深入探讨这两个 trait 的作用和使用场景。

## Deref Trait

`Deref` trait 的基本定义如下：

```rust
pub trait Deref {
    type Target: ?Sized;

    fn deref(&self) -> &Self::Target;
}
```

可以看到，`Deref` trait 只有一个方法 `deref`，它返回一个对 `Target` 这个关联类型的引用。我们可以通过实现 `Deref` trait 来让自定义类型像引用一样使用。

```rust
use std::ops::Deref;

struct MyBox<T>(T);
impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.0
    }
}

fn main() {
    let x = 5;
    let y = MyBox(x);

    assert_eq!(5, x);
    assert_eq!(5, *y); // 使用解引用操作符
}
```

在这个例子中，`y` 是一个自定义的结构体类型，而 `*` 是解引用操作符。为什么 `*y` 能够工作呢？这是因为我们为 `MyBox` 实现了 `Deref` trait，当**我们使用 `*` 操作符时，Rust 会自动调用 `deref` 方法**。

即 `*y` 相当于 `*(y.deref())`，而 `y.deref()` 返回的是对 `T` 的引用，所以最终我们得到了 `5`。

### 隐式 Deref 转换

当函数或者方法的参数类型是引用类型时，我们可以通过 `&` 来触发隐式的 `Deref` 转换。

```rust
fn hello(name: &str) {
    println!("Hello, {}!", name);
}

fn main() {
    let m = MyBox(String::from("Rust"));
    hello(&m); // 隐式调用了 m.deref()
}
```

在上面的例子中，`hello` 函数的参数类型是 `&str`，而我们传入的是 `&MyBox<String>`。Rust 会自动调用 `m.deref()`，将其转换为 `&String`，然后再通过 `Deref` trait 将 `&String` 转换为 `&str`。

可以看到，隐式的 `Deref` 转换是可以连续进行的。

### 引用归一化

Rust 中已经为所有类型的引用实现了 `Deref` trait，因此我们可以把多重 `&` 归一化为单一的 `&`。

```rust
impl<T: ?Sized> Deref for &T {
    type Target = T;

    fn deref(&self) -> &T {
        *self
    }
}
```

可以看到，所有的引用类型 `&T` 都实现了 `Deref` trait，并且 `deref` 方法返回的是对 `T` 的引用。所有当我们有多重引用时，其中一个引用用于触发 `Deref` 转换，转换之后就少了一个引用，由于可以连续转换，最终就归一化为单一的引用。

### 三种 Deref 转换

上面的例子中都是 `&T` 转换为 `&U`，实际上 Rust 还支持 `&mut T` 转换为 `&mut U` 和 `&mut T` 转换为 `&U`。

- 当 `T: Deref<Target=U>`，可以将 `&T` 转换成 `&U`，也就是我们之前看到的例子
- 当 `T: DerefMut<Target=U>`，可以将 `&mut T` 转换成 `&mut U`
- 当 `T: Deref<Target=U>`，可以将 `&mut T` 转换成 `&U`

## Drop Trait

`Drop` trait 的基本定义如下：

```rust
pub trait Drop {
    fn drop(&mut self);
}
```

`Drop` trait 只有一个方法 `drop`，它在值离开作用域时被调用，用于释放资源。Rust 会自动为所有类型实现 `Drop` trait，包括内置类型和自定义类型。当然你也可以为自定义类型覆盖默认的实现。

### Drop trait 的顺序

```rust
struct HasDrop1;
struct HasDrop2;
impl Drop for HasDrop1 {
    fn drop(&mut self) {
        println!("Dropping HasDrop1!");
    }
}
impl Drop for HasDrop2 {
    fn drop(&mut self) {
        println!("Dropping HasDrop2!");
    }
}
struct HasTwoDrops {
    one: HasDrop1,
    two: HasDrop2,
}
impl Drop for HasTwoDrops {
    fn drop(&mut self) {
        println!("Dropping HasTwoDrops!");
    }
}

struct Foo;

impl Drop for Foo {
    fn drop(&mut self) {
        println!("Dropping Foo!")
    }
}

fn main() {
    let _x = HasTwoDrops {
        two: HasDrop2,
        one: HasDrop1,
    };
    let _foo = Foo;
    println!("Running!");
}
```

输出：

```
Running!
Dropping Foo!
Dropping HasTwoDrops!
Dropping HasDrop1!
Dropping HasDrop2!
```

从上面这个例子中可以看到，`Drop` trait 的调用顺序是：

- 变量级别，后定义的变量先 drop
- 结构体级别，先 drop 结构体，然后顺序 drop 其中的字段

### 手动调用 drop

Rust 不允许我们手动调用 `drop` 方法，因为这会导致双重释放的问题。如果我们真的需要手动释放资源，可以使用标准库中的 `std::mem::drop` 函数。

```rust
use std::mem::drop;

fn main() {
    let s = String::from("hello");
    drop(s); // 手动释放 s
    // println!("{}", s); // 这里会报错，因为 s 已经被释放了
}
```

`std::mem::drop` 函数的原理非常简单，它的代码如下：

```rust
pub fn drop<T>(_x: T) {}
```

可以看到，`drop` 函数的函数体中居然没有任何代码！`drop` 仅仅只是获取了传入的值的所有权，然后函数结束时这个值就会因为离开作用域而被释放。

### 和 Copy 互斥

`Drop` trait 和 `Copy` trait 是互斥的。也就是说，如果一个类型实现了 `Drop` trait，那么它就不能实现 `Copy` trait，反之亦然。

## 参考

- [Deref 解引用](https://course.rs/advance/smart-pointer/deref.html)
- [Drop 释放资源](https://course.rs/advance/smart-pointer/drop.html)
