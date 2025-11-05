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

## 应用

`Cow` 可以用于处理字符串，避免不必要的拷贝。比如函数的返回值可能是引用也可能拥有数据，这时候可以用 `Cow` 包一下。

```rust
use std::borrow::Cow;

// 如果输入已经是大写，返回引用；否则创建新的大写字符串
fn to_uppercase<'a>(s: &'a str) -> Cow<'a, str> {
    if s.chars().all(|c| c.is_uppercase()) {
        Cow::Borrowed(s)  // 无需分配新内存
    } else {
        Cow::Owned(s.to_uppercase())  // 需要时创建新字符串
    }
}

fn main() {
    let already_upper = "HELLO";
    let need_upper = "hello";

    let result1 = to_uppercase(already_upper);
    let result2 = to_uppercase(need_upper);

    println!("{}", result1); // HELLO (无克隆)
    println!("{}", result2); // HELLO (有克隆)
}
```

`Cow` 还可以处理配置数据，使用默认值的引用而不总是拷贝。

```rust
use std::borrow::Cow;

struct Config<'a> {
    name: Cow<'a, str>,
    values: Cow<'a, [i32]>,
}

impl<'a> Config<'a> {
    fn new() -> Self {
        Config {
            name: Cow::Borrowed("default"),  // 使用静态字符串，无需分配
            values: Cow::Borrowed(&[]),      // 使用空数组引用
        }
    }

    fn with_name(mut self, name: &'a str) -> Self {
        self.name = Cow::Borrowed(name);
        self
    }

    fn with_custom_name(mut self, name: String) -> Self {
        self.name = Cow::Owned(name);  // 拥有字符串的所有权
        self
    }
}
```

还可以实现缓存，如果缓存中有数据则返回引用，否则计算并缓存，返回计算值的克隆。

```rust
use std::borrow::Cow;
use std::collections::HashMap;

struct Cache<'a> {
    data: HashMap<String, Cow<'a, str>>,
}

impl<'a> Cache<'a> {
    fn new() -> Self {
        Cache { data: HashMap::new() }
    }

    fn get_or_compute(&mut self, key: &str) -> Cow<'a, str> {
        if let Some(cached) = self.data.get(key) {
            // 返回缓存数据的引用
            Cow::Borrowed(cached)
        } else {
            // 计算新值并存储
            let computed = format!("computed_{}", key);
            self.data.insert(key.to_string(), Cow::Owned(computed.clone()));
            Cow::Owned(computed)
        }
    }
}
```

## 参考

- [Cow](https://doc.rust-lang.org/std/borrow/enum.Cow.html)
