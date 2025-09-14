# Rust 中 let 模式匹配

在 Rust 中可以使用 `if let`、`while let` 和 `let else` 来进行模式匹配。

## if let

`if let` 语句允许你在条件语句中进行模式匹配，并在匹配成功时执行相应的代码块。

```rust
let some_option = Some(5);
if let Some(x) = some_option {
    println!("Matched with value: {}", x);
} else {
    println!("No match");
}
```

在上面的例子中，如果 `some_option` 和 `Some(x)` 匹配，则会打印匹配的值，否则打印 "No match"。

`if let` 用于想匹配一种模式，忽略其他模式或者把其余模式归为一类的场景。其中 `else` 可以省略。

## while let

`while let` 语句允许你在循环中进行模式匹配，并在匹配成功时执行相应的代码块。

```rust
let mut stack = vec![1, 2, 3];
while let Some(top) = stack.pop() {
    println!("Popped: {}", top);
}
```

在上面的例子中，`while let` 会持续弹出栈顶元素并打印，直到栈为空。`while let` 类似于正常的 `while` 循环，里面也可以使用 `break`、`continue` 等控制流语句。

使用 `loop` + `if let` 也可以实现类似的功能：

```rust
let mut stack = vec![1, 2, 3];
loop {
    if let Some(top) = stack.pop() {
        println!("Popped: {}", top);
    } else {
        break;
    }
}
```

## let else

`let else` 语句允许你在变量绑定时进行模式匹配，并在匹配失败时执行 `else` 块中的代码。`else` 块中的代码必须是一个终止表达式，比如 `return`、`break` 或 `panic!`。

```rust
let some_option = Some(5);
let Some(x) = some_option else {
    panic!("No match");
};
println!("Matched with value: {}", x);
```

在上面的例子中，如果 `some_option` 和 `Some(x)` 匹配，则会继续执行后续代码，否则会调用 `panic!` 宏终止程序。

`let else` 相比于 `if let`、`while let` 的好处是，它匹配的变量具有更大的作用域，可以在后续代码中使用。
