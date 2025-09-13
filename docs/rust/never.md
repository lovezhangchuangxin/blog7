# Rust 中的 never 类型

在 Rust 中，`never` 类型用 `!` 表示，表示一个永远不会有值的类型。它通常用于以下几种场景：

1. 函数返回类型：当一个函数永远不会返回时，可以将其返回类型标记为 `!`。例如，调用 `panic!` 宏的函数：

```rust
fn never_return() -> ! {
    panic!("This function never returns!");
}
```

2. 无限循环：当一个函数包含一个无限循环时，其返回类型也可以标记为 `!`：

```rust
fn infinite_loop() -> ! {
    loop {
        // 永远不会退出循环
    }
}
```

`!` 可以转为任何类型，因为它永远不会有值，所以在类型系统中它可以被视为所有类型的子类型。这使得 `!` 在某些情况下非常有用，例如在 `match` 语句中：

```rust
fn example(x: Option<i32>) -> i32 {
    match x {
        Some(value) => value,
        None => never_return(), // 这里调用了一个返回类型为 ! 的函数
    }
}
```

在上面的例子中，`never_return` 函数的返回类型是 `!`，但它可以被用作 `i32` 类型的返回值，因为它永远不会实际返回。
