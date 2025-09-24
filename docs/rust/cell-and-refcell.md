# Cell 和 RefCell

在 Rust 中，`Cell` 和 `RefCell` 是两种用于在运行时实现内部可变性的智能指针类型。它们允许你在不可变引用的情况下修改数据，这在某些情况下非常有用。

## Cell

`Cell<T>` 适用于 `T` 实现了 `Copy` trait 的类型。它提供了一个简单的接口来获取和设置值。

```rust
use std::cell::Cell;

struct Person {
    name: String,
    age: Cell<u32>,
}

fn main() {
    let person = Person {
        name: String::from("Alice"),
        age: Cell::new(30),
    };

    // 读取 age 字段
    println!("Initial age: {}", person.age.get());

    // 修改 age 字段
    person.age.set(31);
    println!("Updated age: {}", person.age.get());
}
```

可以看到，虽然 `person` 是不可变的，但我们仍然可以通过 `Cell` 来修改 `age` 字段。

那为什么不直接使用可变的 `person` 呢？

一方面，确实存在某些场景，我们只能拿到不可变的变量或者引用，但又需要修改其中的某些字段。

另一方面，`Cell` 也能让我们实现局部可变。在 Rust 中，变量可变则所有的字段都可变，而变量不可变则所有字段都不可变。使用 `Cell`，我们可以让某些字段在不可变的情况下依然可变。

注意：`Cell` 只能用于实现了 `Copy` trait 的类型。因此不涉及借用检查。不会让 `RefCell` 那样可能因为不满足借用规则而在运行时 panic。

## RefCell

`RefCell<T>` 适用于所有类型的 `T`，它通过借用检查在运行时确保借用规则被遵守。`RefCell` 提供了 `borrow` 和 `borrow_mut` 方法，分别用于获取不可变和可变引用。

```rust
use std::cell::RefCell;

struct Person {
    name: RefCell<String>,
    age: u32,
}

fn main() {
    let p = Person {
        name: RefCell::new(String::from("Alice")),
        age: 30,
    };

    p.name.borrow_mut().push_str(" Smith");
    println!("Name: {}, Age: {}", p.name.borrow(), p.age);
}
```

上面例子中，我们使用 `RefCell` 来包装 `name` 字段，这样即使 `p` 是不可变的，我们仍然可以修改 `name`。

`RefCell` 可以通过 `borrow_mut` 方法获取可变引用，从而对数据进行修改。而 `borrow` 方法则用于获取不可变引用。

`RefCell` 会将借用规则的检查从编译时推迟到运行时，如果在运行时违反了借用规则，程序依然会 panic。

```rust
use std::cell::RefCell;

struct Person {
    name: RefCell<String>,
    age: u32,
}

fn main() {
    let p = Person {
        name: RefCell::new(String::from("Alice")),
        age: 30,
    };

    let name = p.name.borrow_mut();
    let name2 = p.name.borrow_mut(); // 这里会引发 panic
    println!("Name: {}, Age: {}", name, p.age);
}
```

上面代码中，我们尝试同时获取两个可变引用，这显然违反了借用规则，因此程序会在运行时 panic。

回顾一下借用规则：

- 任何时刻，只能有一个可变引用，或者任意数量的不可变引用。
- 引用必须总是有效的。

由于 `RefCell` 拥有数据的所有权，引用自然总是有效的。因此只需要关心是否有多个可变引用或者不可变引用和可变引用共存的情况。

## 总结

无论是 `Cell` 还是 `RefCell`，它们都提供了一种在不可变上下文中修改数据的方式。前者适用于实现了 `Copy` trait 的类型，后者适用于所有类型。

修改不可变变量的数据看似危险，但是由于运行时会执行借用检查，依然可以满足 Rust 的借用规则，避免了数据竞争等问题。
