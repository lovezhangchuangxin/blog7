# DST

Rust 中绝大部分类型都是固定大小的，但也有一些类型在编译时大小未知，这些类型被称为动态大小类型（DST，Dynamically Sized Types）。或者称为不定长类型（unsized），和定长类型（sized）相对。

## DST 示例

```rust
let s: str = "hello"; // DST
let s: [i32] = [1, 2, 3]; // DST
```

上面例子中，`str` 和 `[i32]` 都是 DST 类型，因为它们的大小在编译时未知。`str` 类型的字符串字面量在内存中是以 `&str` 的形式存在的，`&str` 包含一个指向字符串数据的指针和字符串的长度信息，因此 `&str` 是一个定长类型。而 `[i32]` 是一个切片类型，它表示一段连续的 `i32` 数组，但它本身并不包含数组的长度信息，因此 `[i32]` 也是一个 DST 类型。

**Rust 中的 DST 类型只能通过引用（如 `&str`）或智能指针（如 `Box<str>`）来使用，不能直接创建 DST 类型的变量。**

## trait object

再举一个动态类型的例子，即特征对象（trait object），它是通过 `dyn Trait` 语法来表示的。

```rust
trait Animal {
    fn speak(&self);
}

struct Dog;
impl Animal for Dog {
    fn speak(&self) {
        println!("Woof!");
    }
}

struct Cat;
impl Animal for Cat {
    fn speak(&self) {
        println!("Meow!");
    }
}

fn make_animal(animal_type: &str) -> Box<dyn Animal> {
    match animal_type {
        "dog" => Box::new(Dog),
        "cat" => Box::new(Cat),
        _ => panic!("Unknown animal type"),
    }
}

fn main() {
    let my_pet = make_animal("dog");
    my_pet.speak(); // 输出 "Woof!"
}
```

特征对象即实现了某个特征的对象，这样的对象可能是有很多的，比如上面的 `Dog` 和 `Cat`，它们都实现了 `Animal` 特征，但它们的具体类型不同。对于 `dyn Animal` 这个类型来说，它的大小在编译时是未知的，因此它是一个 DST 类型。但是我们可以通过 `Box<dyn Animal>` 来使用它，因为 `Box` 是一个智能指针，它包含了指向实际数据的指针和一些元数据（如 vtable 指针），`Box<dyn Animal>` 本身是一个定长类型。

## Sized 特征

Sized 特征是 Rust 中的一个内置特征，它用于标记类型是否在编译时具有已知大小。所有在编译时大小已知的类型都实现了 `Sized` 特征，而动态大小类型（DST）则不实现该特征。

当我们使用泛型时，默认泛型参数会被隐式地约束为实现了 `Sized` 特征的类型：

```rust
fn generic<T>(t: T) {
    // --snip--
}
```

编译器会帮我们隐式地添加一个 `T: Sized` 的约束：

```rust
fn generic<T: Sized>(t: T) {
    // --snip--
}
```

你也可以在泛型中使用 `?Sized` 语法来表示泛型参数可以是动态大小类型：

```rust
fn generic<T: ?Sized>(t: &T) {
    // --snip--
}
```

注意，当使用 `?Sized` 约束时，泛型参数 `T` 必须通过引用或智能指针来传递，因为 DST 不能直接作为函数参数传递。

## 参考

- [Sized 和不定长类型 DST](https://course.rs/advance/into-types/sized.html)
