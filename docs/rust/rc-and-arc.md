# Rc 和 Arc

Rust 的所有权机制限制了一个值只能有一个所有者，但是某些情况下我们需要让数据拥有多个所有者，比如：

- 多个线程同时访问数据
- 图结构中多个边共享一个节点

Rust 提供了两种数据结构 `Rc` 和 `Arc` 来解决这个问题。`Rc` 表示 `Reference Counted`，即引用计数。`Arc` 表示 `Atomic Reference Counted`，即原子引用计数。`Rc` 适用于单线程，`Arc` 适用于多线程（单线程也能用，但是性能开销大）。

## Rc`<T>`

`Rc<T>` 是一种引用计数智能指针，它可以让数据拥有多个所有者。所谓引用计数，就是当数据被多个所有者共享时，会自动增加和减少引用计数，当引用计数为 0 时，数据将被释放。

同其他智能指针如 `Box` 一样，`Rc` 通过关联函数 `new` 来创建引用计数智能指针。

```rust
use std::rc::Rc;
fn main() {
    let a = Rc::new(String::from("hello, world"));
    let b = Rc::clone(&a);

    assert_eq!(2, Rc::strong_count(&a));
    assert_eq!(Rc::strong_count(&a), Rc::strong_count(&b))
}
```

上面代码中，我们先通过 `Rc::new` 创建了一个 `Rc<String>`，然后通过 `Rc::clone` 创建了一个新的 `Rc<String>`，并赋值给变量 `b`。a, b 都拥有对底层数据的所有权，使用 `Rc::strong_count` 可以查看引用计数的数量。

注意 `clone` 并不会克隆底层数据，而仅仅是克隆了智能指针并增加了引用计数，因此性能很好。

## 不可变引用

`Rc<T>` 实际上是指向底层数据的不可变的引用，因此无法通过它来修改数据，`Arc<T>` 也是这样。这样符合 Rust 的借用规则，即不能同时有多个可变引用。

## Arc`<T>`

`Arc<T>` 适用于多线程，`Arc` 是 `Atomic Reference Counted`，即原子引用计数。`Arc` 通过原子操作来保证并发安全，因此 `Arc` 可以在多线程中使用。

`Arc<T>` 拥有和 `Rc<T>` 一样的 API，只不过 `Arc<T>` 是多线程安全的。

```rust
use std::sync::Arc;
use std::thread;

fn main() {
    let s = Arc::new(String::from("多线程漫游者"));
    for _ in 0..10 {
        let s = Arc::clone(&s);
        let handle = thread::spawn(move || {
           println!("{}", s)
        });
    }
}
```

## `Weak<T>`

`Weak<T>` 是 `Rc<T>` 的弱引用，它可以通过 `upgrade` 方法转化为 `Option<Rc<T>>`。而 `Rc<T>` 可以通过 `downgrade` 方法可以转化为 `Weak<T>`。

弱引用不保证引用关系依然存在。

比如有 a、b 节点，假设 a -> b，b -> a，如果都用 `Rc` 会造成循环引用，导致内存泄漏。这时候其中一个可以使用 `Weak` 来引用另一个，弱引用并不会增加强引用计数，因此另一个节点离开作用域时就会被释放，从而打破了循环引用。

`Weak` 和 `Rc` 的对比：

| Weak                                        | Rc                                      |
| ------------------------------------------- | --------------------------------------- |
| 不计数                                      | 引用计数                                |
| 不拥有所有权                                | 拥有值的所有权                          |
| 不阻止值被释放(drop)                        | 所有权计数归零，才能 drop               |
| 引用的值存在返回 Some，不存在返回 None      | 引用的值必定存在                        |
| 通过 upgrade 取到 Option<Rc<T>>，然后再取值 | 通过 Deref 自动解引用，取值无需任何操作 |

```rust
use std::rc::Rc;
fn main() {
    // 创建Rc，持有一个值5
    let five = Rc::new(5);

    // 通过Rc，创建一个Weak指针
    let weak_five = Rc::downgrade(&five);

    // Weak引用的资源依然存在，取到值5
    let strong_five: Option<Rc<_>> = weak_five.upgrade();
    assert_eq!(*strong_five.unwrap(), 5);

    // 手动释放资源`five`
    drop(five);

    // Weak引用的资源已不存在，因此返回None
    let strong_five: Option<Rc<_>> = weak_five.upgrade();
    assert_eq!(strong_five, None);
}
```

## 参考

- [Rc 与 Arc](https://course.rs/advance/smart-pointer/rc-arc.html)
- [Weak 与循环引用](https://course.rs/advance/circle-self-ref/circle-reference.html)
