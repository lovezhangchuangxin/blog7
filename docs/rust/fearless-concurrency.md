# Rust 无畏并发

## 使用线程同时运行代码

Rust 可以将程序拆分成多个线程，并同时运行多个线程。由于无法保证不同线程的执行顺序，因此会有如下问题：

- 竞态条件（Race conditions），多个线程以不一致的顺序访问数据或资源
- 死锁（Deadlocks），两个线程相互等待对方，这会阻止两者继续运行
- 只会发生在特定情况且难以稳定重现和修复的 bug

Rust 标准库使用 _1:1_ 模型的线程实现，一个语言级别的线程对应一个系统线程。

### 使用 spawn 创建线程

使用 `std::thread::spawn` 方法传入一个闭包来创建线程，闭包中代码将在新线程运行。

```rust
use std::thread;
use std::time::Duration;

fn main() {
    thread::spawn(|| {
        for i in 10..20 {
            println!("hi number {i} from the spawned thread!");
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {i} from the main thread!");
        thread::sleep(Duration::from_millis(1));
    }
}
```

输出：

```
hi number 1 from the main thread!
hi number 10 from the spawned thread!
hi number 2 from the main thread!
hi number 11 from the spawned thread!
hi number 3 from the main thread!
hi number 12 from the spawned thread!
hi number 4 from the main thread!
hi number 13 from the spawned thread!
hi number 14 from the spawned thread!
```

上面代码中，`thread::spawn` 方法会创建一个新的线程，而 `thread::sleep` 方法会暂停当前线程，从而使其他线程执行。最先打印主线程的 1，随后主线程休眠，子线程打印 10，子线程休眠，主线程打印 2...，当主线程结束的时候，所有的子线程也会结束，所以上面子线程的代码并没有执行完。

### 使用 join 阻塞线程

`thread::spawn` 方法会返回一个 `JoinHandle<T>`，该对象表示新创建的线程。我们可以使用它的 `join` 方法来等待线程结束，并获取返回值 T。

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 10..20 {
            println!("hi number {i} from the spawned thread!");
            thread::sleep(Duration::from_millis(1));
        }
        42
    });

    for i in 1..5 {
        println!("hi number {i} from the main thread!");
        thread::sleep(Duration::from_millis(1));
    }

    let out = handle.join().unwrap();
    println!("out: {out}");
}
```

输出：

```
hi number 1 from the main thread!
hi number 10 from the spawned thread!
hi number 2 from the main thread!
hi number 11 from the spawned thread!
hi number 3 from the main thread!
hi number 12 from the spawned thread!
hi number 4 from the main thread!
hi number 13 from the spawned thread!
hi number 14 from the spawned thread!
hi number 15 from the spawned thread!
hi number 16 from the spawned thread!
hi number 17 from the spawned thread!
hi number 18 from the spawned thread!
hi number 19 from the spawned thread!
out: 42
```

上面代码中，子线程会返回 42，因此 `thread::spawn` 方法会返回一个 `JoinHandle<i32>`，该对象关联新创建的线程。我们可以使用它的 `join` 方法来等待线程结束（阻塞当前线程），并获取返回值。这样子线程就不会因为主线程结束而结束，避免代码还没执行完。

### 使用 move 捕获变量

闭包默认根据变量的使用方式来决定捕获变量的不可变引用、可变引用还是所有权。为了强制让创建线程的闭包捕获变量的所有权，可以使用 `move` 关键字。这将会把闭包捕获的变量的所有权从当前线程移动到新创建的线程中。

为什么新线程中的闭包需要捕获变量的所有权？试想一下假如只捕获了某个变量的引用，由于 Rust 必须保证引用总是有效的，这实际上是做不到的，变量的所有者可能会提前 drop 导致引用无效。

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        println!("Here's a vector: {v:?}");
    });

    // drop(v);

    handle.join().unwrap();
}
```

上面代码必须使用 `move` 将变量 `v` 移动到新线程中。否则闭包默认捕获引用，而引用并不能总是保证有效，比如下面通过`drop` 提前释放了变量！

## 使用消息传递在线程间传递数据

Rust 通过 `std::sync::mpsc` 模块提供了信道的实现，可用于将数据从一个线程传递到另一个线程。

消息传递基于信道，信道有发送端（transmitter）和接收端（receiver）两个部分。数据可以从发送端发送到接收端。两端任何一端被丢弃则信道被关闭。

`mpsc` 是多生产者、单消费者（multiple producers, single consumer）的缩写。也就是说可以有多个发送端对应一个接收端。

### 创建信道

通过 `std::sync::mpsc::channel` 创建信道，返回一个元组，元组中的第一个元素是发送端，第二个元素是接收端。`tx` 和 `rx` 通常作为发送端（transmitter）和 接收端（receiver）的传统缩写

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
    });

    let received = rx.recv().unwrap();
    println!("Got: {received}");
}
```

创建信道之后，发送端（transmitter）和接收端（receiver）都可以通过 `send` 和 `recv` 方法来发送和接收数据。

`send` 和 `recv` 方法返回 Result 类型，因为不一定能成功。如果接收端关闭了则发送端无法发送数据，而发送端关闭了接收端无法接受数据，即信道被关闭时继续调 `send` 或 `recv` 方法会返回错误。

`recv` 方法会阻塞当前线程，直到接收到数据。可以使用 `try_recv` 方法来尝试接收数据而不阻塞当前线，`try_recv` 一样返回 Result 类型，错误类型有 `TryRecvError::Empty` 表示没有收到数据、`TryRecvError::Disconnected` 表示发送端关闭。

```rust
use std::sync::mpsc::{self, TryRecvError};
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        thread::sleep(Duration::from_secs(2)); // 模拟一些工作
        tx.send(String::from("Hello from another thread!")).unwrap();
    });

    loop {
        match rx.try_recv() {
            Ok(received) => {
                println!("Got: {received}");
                break;
            }
            Err(TryRecvError::Empty) => {
                println!("No message yet, doing other work...");
                thread::sleep(Duration::from_millis(500));
            }
            Err(TryRecvError::Disconnected) => {
                println!("The sender was disconnected!");
                break;
            }
        }
    }
    println!("Main thread is done!");
}
```

输出：

```
No message yet, doing other work...
No message yet, doing other work...
No message yet, doing other work...
No message yet, doing other work...
Got: Hello from another thread!
Main thread is done!
```

### 发送多个值

```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    for received in rx {
        println!("Got: {received}");
    }
}
```

我们可以把 `recv` 当作一个迭代器来使用，这样就不用手动处理接收数据的逻辑。可以看到每秒打印一次，迭代器会自动等待下一次数据。

### 通过克隆发送端来创建多个生产者

```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    let tx1 = tx.clone();
    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx1.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    thread::spawn(move || {
        let vals = vec![
            String::from("more"),
            String::from("messages"),
            String::from("for"),
            String::from("you"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    for received in rx {
        println!("Got: {received}");
    }
}
```

上面代码中通过 `tx.clone()` 创建了多个发送端，每个发送端都可以发送数据。接收端能接收到所有发送端的数据。

## 互斥器实现同一时刻只允许一个线程访问数据

Rust 通过 `std::sync::Mutex` 实现互斥器，它可以保证同一时刻只有一个线程访问数据。

为了访问互斥器中的数据，需要使用 `lock` 方法获取锁，锁会返回一个 `MutexGuard` 智能指针，实现了 `Deref` trait 和 `Drop` trait，因此我们可以轻易访问互斥器内部的数据，同时也不需要手动释放锁，`MutexGuard` 智能指针会在离开作用域时自动释放锁。

```rust
use std::sync::Mutex;

fn main() {
    let m = Mutex::new(5);

    {
        let mut num = m.lock().unwrap();
        *num = 6;
    }

    println!("m = {m:?}");
}
```

上面代码中，`m` 是一个互斥器，`lock` 方法获取锁，由于不一定能获取成功（比如某个持有锁的线程 panic 了，这会导致其他线程永远获取不到锁，所以返回 Err），`lock` 方法返回 Result 类型，其成功的值是一个 `MutexGuard` 智能指针。`*num` 等价于 `*(num.deref_mut())`。

### 在多个线程间共享 `Mutex<T>`

多个线程可以通过 `Arc<Mutex<T>>` 来共享数据。`Arc` 让多个线程都拥有 `Mutex<T>` 的所有权。

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

输出：

```
Result: 10
```

## 参考

- [无畏并发](https://kaisery.github.io/trpl-zh-cn/ch16-00-concurrency.html)
