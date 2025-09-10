# Rust 中的多行字符串字面量

在 Rust 中创建多行字符串字面量有多种方式：

- 使用 `\` 续行符
- 使用 `r#"` 原始字符串字面量
- 使用 `concat!` 宏
- 使用 `include_str!` 宏

## 使用 `\` 续行符

可以在行尾使用反斜杠 `\` 来续行：

```rust
let multi_line_str = "这是一个多行字符串，\
    它可以跨越多行，\
    但不会包含换行符。";
println!("{}", multi_line_str); // 输出：这是一个多行字符串，它可以跨越多行，但不会包含换行符。
```

## 使用 `r#"` 原始字符串字面量

原始字符串字面量允许你直接包含换行符和其他特殊字符：

```rust
let raw_str = r#"这是一个多行字符串，
    可以直接包含换行符，
    并且不需要转义特殊字符。"#;
println!("{}", raw_str);
// 输出：
// 这是一个多行字符串，
//     可以直接包含换行符，
//     并且不需要转义特殊字符。
```

注意，`#"` 是分隔符，可以有一个或者多个，当字符串中包含 `"#` 时，可以增加 `#` 的数量来避免冲突。

```rust
let raw_str_with_hash = r##"这是一个包含 "# 的字符串。"##;
println!("{}", raw_str_with_hash); // 输出：这是一个包含 "# 的字符串。
```

## 使用 `concat!` 宏

`concat!` 宏可以将多个字符串字面量连接成一个：

```rust
let concatenated_str = concat!(
    "这是一个多行字符串，\n",
    "它可以跨越多行，\n",
    "并且包含换行符。"
);
println!("{}", concatenated_str);
// 输出：
// 这是一个多行字符串，
// 它可以跨越多行，
// 并且包含换行符。
```

## 使用 `include_str!` 宏

`include_str!` 宏可以将外部文件的内容作为字符串包含进来：

```rust
// 文件路径可以是相对路径或绝对路径
let file_content = include_str!("path/to/your/file.txt");
println!("{}", file_content);
```
