# PartialEq 和 Eq

`PartialEq` 和 `Eq` 是 Rust 中用于比较两个值的 trait。它们都定义在 `std::cmp` 模块中。

`PartialEq` 用于定义部分相等关系，它不要求自反性在所有情况下都成立。

`PartialEq` 的基本定义：

```rust
pub trait PartialEq<Rhs = Self>
where
    Rhs: ?Sized,
{
    fn eq(&self, other: &Rhs) -> bool;

    // 有默认实现
    fn ne(&self, other: &Rhs) -> bool {
        !self.eq(other)
    }
}
```

可以看到 `PartialEq` 有两个方法，其中 `eq` 方法必须实现，而 `ne` 方法则使用 `!self.eq(other)` 来默认实现。`eq` 用于判断和另一个值是否想等，另一个值默认是 `Self` 类型，但也可以是其他类型。

```rust
#[derive(Debug)]
struct Person {
    name: String,
    age: u32,
}

impl PartialEq for Person {
    fn eq(&self, other: &Person) -> bool {
        self.name == other.name && self.age == other.age
    }
}

impl PartialEq<u32> for Person {
    fn eq(&self, other: &u32) -> bool {
        self.age == *other
    }
}

impl Eq for Person {}

fn main() {
    let p1 = Person {
        name: "Alice".to_string(),
        age: 18,
    };
    let p2 = Person {
        name: "Bob".to_string(),
        age: 18,
    };
    assert_ne!(p1, p2);
    assert_eq!(p1, 18);
}
```

比如上面代码中，`Person` 除了可以和自己比较，也可以和 `u32` 比较。

`PartialEq` 允许某些值不能和自身比较，比如浮点数的 `NaN` 值。而 `Eq` 则要求所有值都具有自反性，即 `a == a` 必须成立。

`Eq` 是 `PartialEq` 的标记 trait（marker trait），它没有任何额外的方法：

```rust
pub trait Eq: PartialEq<Self> {}
```

可以使用 `#[derive]` 来自动实现 `PartialEq`、`Eq` trait：

```rust
#[derive(PartialEq, Eq)]  // 通常一起派生
struct IntegerPoint {
    x: i32,
    y: i32,
}

let point = IntegerPoint { x: 1, y: 2 };
println!("{}", point == point); // true - 满足自反性
```

简而言之， 如果类型的所有值都可以安全地相互比较（满足自反性），就应该同时实现 `PartialEq` 和 `Eq`。如果存在像 `NaN` 这样的特殊情况，就只实现 `PartialEq`。
