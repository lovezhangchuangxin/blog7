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

3. 分支表达式：在 `match` 或 `if` 表达式中，如果某个分支永远不会返回值，可以使用 `!` 类型。例如：

```rust
fn example(x: i32) -> i32 {
    match x {
        0 => 0,
        1 => 1,
        _ => panic!("Unexpected value!"), // 这个分支永远不会返回值
    }
}
```
