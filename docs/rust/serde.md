# serde

Rust 中可以使用 `serde` 这个库来实现序列化和反序列化。比如 Rust 数据类型和 json、toml、yaml 等格式之间的转换。

`serde` 库提供了 `Serialize` 和 `Deserialize` 两个 trait，分别用于序列化和反序列化。这两个 trait 也可以通过 `#[derive]` 宏来自动实现。

`serde` 是基本库，用于为 Rust 数据类型定义序列化和反序列化接口。而具体地序列化和反序列化实现，则需要使用 `serde_json`、`serde_yaml`、`serde_toml` 等库。

```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct Person {
    name: String,
    age: u32,
}

fn main() {
    let person = Person {
        name: "Alice".to_string(),
        age: 20,
    };
    let json = serde_json::to_string(&person).unwrap();
    println!("{}", json);
    let pretty_json = serde_json::to_string_pretty(&person).unwrap();
    println!("{}", pretty_json);
    let person_from_json: Person = serde_json::from_str(&json).unwrap();
    println!("{:?}", person_from_json);
}
```

上面代码中，通过 `#[derive(Serialize, Deserialize)]` 宏，自动实现了 `Person` 结构体的序列化和反序列化接口。然后通过 `serde_json::to_string` 将 `Person` 结构体序列化为 JSON 字符串。通过 `serde_json::from_str` 将 JSON 字符串反序列化为 `Person` 结构体。通过 `serde_json::to_string_pretty` 可以将 JSON 输出为美化的格式。
