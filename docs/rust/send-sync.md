# Send 和 Sync

Rust 中有 `Send` 和 `Sync` 两个标记 trait，Send 标记 trait 表示类型的所有权可以在线程间传递，Sync 标记 trait 表示类型的引用可以安全可以在多线程之间安全共享。

几乎所有的 Rust 类型都实现了 `Send` trait，不过有一些例外，比如 `Rc<T>`。

任何完全由 `Send` 类型组成的类型也会被自动标记为 `Send`。`Sync` 同理。

对于任意类型 `T`，如果 `&T`（`T` 的引用）是 `Send` 的话 `T` 就是 `Sync` 的。

`Mutex<T>` 是 `Sync` 的，`Rc<T>`、`Cell<T>`、`RefCell<T>` 都不是 `Sync` 的。
