# Rust 生命周期约束

在看 Rust 圣经的[认识生命周期](https://course.rs/basic/lifetime.html)一章时，发现了泛型生命周期参数能和泛型参数一样被约束，下面是一个例子：

```rust
impl<'a: 'b, 'b> ImportantExcerpt<'a> {
    fn announce_and_return_part(&'a self, announcement: &'b str) -> &'b str {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```

上面代码中，`'a: 'b` 表示生命周期 `'a` 必须至少和 `'b` 一样长。

'a 和 'b 都在同一个地方声明（如上），也可以分开声明但是通过 `where` 语法来约束：

```rust
impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part<'b>(&'a self, announcement: &'b str) -> &'b str
    where
        'a: 'b,
    {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```
