# From 和 Into

Rust 中可以通过实现 `From` 和 `Into` trait 来实现类型转换。

## From tarit

我们来看 `From` trait 的定义：

```rust
pub trait From<T>: Sized {
    fn from(value: T) -> Self;
}
```

可以看到，`From` trait 接受一个泛型参数 `T`，并返回一个 `Self` 类型。一个类型实现了 `From<T>` trait，就表示它可以从类型 T 转换而来。

```rust
#[derive(Debug)]
struct Number {
    value: u32,
}

impl From<u32> for Number {
    fn from(value: u32) -> Self {
        Number { value }
    }
}

fn main() {
    let num = Number::from(30);
    println!("My number is {:?}", num);
}
```

上面例子中，`Number` 类型实现了 `From<u32>` trait，表示它可以从 `u32` 转换而来。

## Into trait

```rust
pub trait Into<T>: Sized {
    fn into(self) -> T;
}
```

和 `From` trait 相反，一个类型实现了 `Into<T>` trait，就表示它可以转换为类型 T。另外要注意，不同于 `from` 是一个关联函数，`into` 是一个方法。

```rust
#[derive(Debug)]
struct Number {
    value: u32,
}

impl Into<Number> for u32 {
    fn into(self) -> Number {
        Number { value: self }
    }
}

fn main() {
    let num: Number = 123.into();
    println!("My number is {:?}", num);
}
```

上面为 `u32` 类型实现了 `Into<Number>` trait，表示 `u32` 类型可以转换为 `Number` 类型。注意，由于可以为同一个类型实现多个 `Into<T>` trait，因此调用的时候需要指定转换的类型。

**类型 U 实现了 `From<T>`，那么 T 也自动实现了 `Into<U>`。**

```rust
impl<T, U> Into<U> for T
where
    U: From<T>,
{
    fn into(self) -> U {
        U::from(self)
    }
}
```

## TryFrom 和 TryInto

和 `From` 和 `Into` 类似，`TryFrom` 和 `TryInto` 也可以实现类型转换，但是它们返回的是 `Result` 类型。Ok 包含转换后的结果，Err 包含转换失败的错误信息。

```rust
#[derive(Debug, PartialEq)]
struct EvenNumber(i32);

impl TryFrom<i32> for EvenNumber {
    type Error = ();

    fn try_from(value: i32) -> Result<Self, Self::Error> {
        if value % 2 == 0 {
            Ok(EvenNumber(value))
        } else {
            Err(())
        }
    }
}

fn main() {
    // TryFrom
    assert_eq!(EvenNumber::try_from(8), Ok(EvenNumber(8)));
    assert_eq!(EvenNumber::try_from(5), Err(()));

    // TryInto
    let result: Result<EvenNumber, ()> = 8i32.try_into();
    assert_eq!(result, Ok(EvenNumber(8)));
    let result: Result<EvenNumber, ()> = 5i32.try_into();
    assert_eq!(result, Err(()));
}
```
