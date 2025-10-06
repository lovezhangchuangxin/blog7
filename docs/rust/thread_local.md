# Rust 中常量、静态变量和 thread_local

Rust 中具有静态生命周期的包括常量、静态变量和 thread_local。从用法上看，常量适用于不能修改的数据，静态变量可以修改，而 thread_local 线程局部变量则用于线程之间独立的变量。

## 常量

使用 `const` 关键字定义常量。

```rust
const MAX_POINTS: i32 = 100_000;

fn main() {
    println!("MAX_POINTS: {}", MAX_POINTS);
}
```

常量的一些注意事项：

- 定义常量时必须指定类型和值
- 常量的值只能是常量表达式，或者说编译时就能计算出来的值
- 常量命名一般是全部大写，单词间用下划线连接
- 常量不能修改，也不能重复定义
- 常量可以在任何作用域内定义，其生命周期是整个程序（'static 生命周期）
- 常量编译时编译器会尽可能将其内联到代码中，不同地方对同一常量的引用不能保证引用到同一地址

## 静态变量

使用 `static` 关键字定义静态变量。

静态变量和常量的一些特点类似，区别在于：

- 静态变量可以通过 `unsafe` 修改
- 静态变量不会被内联，在整个程序中，静态变量只有一个实例，所有的引用都会指向同一个地址
- 存储在静态变量中的值必须要实现 Sync trait

```rust
static mut REQUEST_RECV: usize = 0;
fn main() {
   unsafe {
        REQUEST_RECV += 1;
        assert_eq!(REQUEST_RECV, 1);
   }
}
```

## thread_local

使用 `thread_local!` 宏定义线程局部变量。这意味着不同的线程访问到的变量是隔离的。

`thread_local` 宏中，使用 `static` 来定义线程局部变量，表示具有静态生命周期，并且线程内部使用 `with` 方法访问变量。

```rust
use std::cell::RefCell;
use std::thread;

thread_local!(static FOO: RefCell<u32> = RefCell::new(1));

FOO.with(|f| {
    assert_eq!(*f.borrow(), 1);
    *f.borrow_mut() = 2;
});

// 每个线程开始时都会拿到线程局部变量的FOO的初始值
let t = thread::spawn(move|| {
    FOO.with(|f| {
        assert_eq!(*f.borrow(), 1);
        *f.borrow_mut() = 3;
    });
});

// 等待线程完成
t.join().unwrap();

// 尽管子线程中修改为了3，我们在这里依然拥有main线程中的局部值：2
FOO.with(|f| {
    assert_eq!(*f.borrow(), 2);
});
```

## 参考

- [全局变量](https://course.rs/advance/global-variable.html)
- [线程局部变量 thread-local-variable](https://course.rs/advance/concurrency-with-threads/thread.html?highlight=thread_local#%E7%BA%BF%E7%A8%8B%E5%B1%80%E9%83%A8%E5%8F%98%E9%87%8Fthread-local-variable)
