# Cow

Rust 中的 `Cow` 是一个智能指针，全称是 `Clone on Write`，意为“写时克隆”。它可以封装并提供对借用数据的不可变访问，并在需要可变的或所有权时懒惰地克隆数据。

`Cow` 是一个枚举类型，定义了两种变体：

- `Borrowed`：表示借用数据
- `Owned`：表示拥有数据

```rust
enum Cow<'a, B>
where
    B: 'a + ToOwned + ?Sized,
{
    Borrowed(&'a B),
    Owned(<B as ToOwned>::Owned),
}
```

官方例子：

```rust
use std::borrow::Cow;

fn abs_all(input: &mut Cow<'_, [i32]>) {
    for i in 0..input.len() {
        let v = input[i];
        if v < 0 {
            // 如果尚未拥有，则克隆到 vector 中。
            input.to_mut()[i] = -v;
        }
    }
}

// 因为 `input` 不需要可变的，所以不会发生克隆。
let slice = [0, 1, 2];
let mut input = Cow::from(&slice[..]);
abs_all(&mut input);

// 发生克隆是因为需要对 `input` 进行可变的。
let slice = [-1, 0, 1];
let mut input = Cow::from(&slice[..]);
abs_all(&mut input);

// 因为 `input` 已被拥有，所以不会发生克隆。
let mut input = Cow::from(vec![-1, 0, 1]);
abs_all(&mut input);
```

可以看到，只有在需要使用可变引用且没有所有权时，才会发生克隆。

## `is_borrowed`

`is_borrowed` 方法用于检查 `Cow` 是否是借用数据。

```rust
fn is_borrowed(&self) -> bool {
    matches!(self, Cow::Borrowed(_))
}
```

## `is_owned`

`is_owned` 方法用于检查 `Cow` 是否是拥有数据。

```rust
fn is_owned(&self) -> bool {
    matches!(self, Cow::Owned(_))
}
```

## `to_mut`

`to_mut` 方法用于获取数据的可变引用。如果数据尚未拥有，则克隆数据，并将 `Cow` 转换为 `Owned` 变体。

```rust
use std::borrow::Cow;

let mut cow = Cow::Borrowed("foo");
cow.to_mut().make_ascii_uppercase();

assert_eq!(
  cow,
  Cow::Owned(String::from("FOO")) as Cow<'_, str>
);
```

## `into_owned`

`into_owned` 方法用于提取 `Cow` 中的数据。如果数据尚未拥有，则克隆数据。之后 `Cow` 不能再被使用（失去了所有权）。

在 `Cow::Borrowed` 上调用 `into_owned` 会返回借用数据的克隆:

```rust
let cow = Cow::Borrowed("foo");
let owned = cow.into_owned();

assert_eq!(owned, String::from("foo"));
```

在 `Cow::Owned` 上调用 `into_owned` 会返回拥有所有权的数据。 数据被移出 `Cow` 而不被克隆。

```rust
let cow = Cow::Owned(String::from("foo"));
let owned = cow.into_owned();

assert_eq!(owned, String::from("foo"));
```

## 参考

- [Cow](https://doc.rust-lang.org/std/borrow/enum.Cow.html)
