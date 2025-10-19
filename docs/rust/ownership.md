# Rust 所有权

今天发现变量的所有权在转移的时候可以修改新变量的可变性。

```rust
struct Person {
    name: String,
}

fn main() {
    let p = Person {
        name: "keqing".to_string(),
    };
    let mut p2 = p;
    p2.name = "ganyu".to_string();
    println!("{}", p2.name);
}
```

上面代码中，`p` 是不可变的，不能通过 `p` 来修改底层的 `name`，但是当 `p` 的所有权转移给 `p2` 时可以重新设置变量的可变性。
