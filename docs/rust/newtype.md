# Rust 中的 newtype

所谓 newtype，是指用一个元组结构体（tuple struct）来包裹一个类型，从而创建一个新的类型。newtype 的主要作用是：

- 为包裹的类型取一个更有意义的名字，添加额外的语义。
- 隐藏内部实现细节。
- 为外部类型实现外部特征。

## 更好的可读性及类型异化

```rust
use std::ops::Add;
use std::fmt;

struct Meters(u32);
impl fmt::Display for Meters {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "目标地点距离你{}米", self.0)
    }
}

impl Add for Meters {
    type Output = Self;

    fn add(self, other: Meters) -> Self {
        Self(self.0 + other.0)
    }
}
fn main() {
    let d = calculate_distance(Meters(10), Meters(20));
    println!("{}", d);
}

fn calculate_distance(d1: Meters, d2: Meters) -> Meters {
    d1 + d2
}
```

上面例子中，`Meters` 这个 newtype 让代码更具可读性，并且避免了与其他 `u32` 类型混淆。

比如 `calculate_distance` 函数只能接受 `Meters` 类型的参数，而不能传入 `struct Centimeters(u32)` 这样类型的参数，即便它们的内部类型相同，它们也是不同的类型。

## 隐藏实现细节

```rust
struct Meters(u32);

fn main() {
    let i: u32 = 2;
    assert_eq!(i.pow(2), 4);

    let n = Meters(i);
    // 下面的代码将报错，因为`Meters`类型上没有`pow`方法
    // assert_eq!(n.pow(2), 4);
}
```

上面例子中，`Meters` 类型隐藏了 `u32` 的所有方法，防止误用。（实际上依然可以通过 `n.0.pow(2)`）。

## 为外部类型实现外部特征

Rust 中类型实现特征有孤儿规则的限制，即不能外部类型实现外部特征。而使用 newtype 可以绕过这个限制。

```rust
use std::fmt;

struct Wrapper(Vec<String>);

impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec![String::from("hello"), String::from("world")]);
    println!("w = {}", w);
}
```

上面例子中，`Wrapper` 是一个 newtype，它为 `Vec<String>` 实现了 `Display` 特征，而 `Vec` 和 `Display` 都是外部类型。

## 类型别名

Rust 中使用 `type` 关键字可以创建类型别名（type alias），它和 newtype 不同，类型别名只是为一个类型取了一个新的名字，二者在编译后是相同的类型。

```rust
type Meters = u32;

let x: u32 = 5;
let y: Meters = 5;

println!("x + y = {}", x + y);
```

那么取类型别名有什么用呢？一方面可以增加类型的可读性，另一方面可以减小样板代码。

类型别名还可以结合泛型来简化复杂类型的书写：

```rust
type Result<T> = std::result::Result<T, std::io::Error>;
fn read_file(path: &str) -> Result<String> {
    std::fs::read_to_string(path)
}
```
