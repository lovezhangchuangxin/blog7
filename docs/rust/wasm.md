# Rust Wasm

Wasm（WebAssembly）不必多说，我们可以将 Rust 代码编译成 Wasm。

需要用到的工具：

- `wasm-pack`
- `wasm-bindgen`
- `wasm-bindgen-cli`，最好装一下这个

## 入门

下面是一个康威生命游戏的例子。

先创建一个 Rust 库项目：

```bash
cargo new --lib wasm-test
```

然后设置 `cargo.toml` 的 lib 配置：

```toml
[lib]
crate-type = ["cdylib"]
```

然后在 `src/lib.rs` 中编写 Rust 代码：

```rust
use std::fmt;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
}

impl Universe {
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx] as u8;
            }
        }
        count
    }
}

#[wasm_bindgen]
impl Universe {
    pub fn tick(&mut self) {
        let mut next = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];
                let live_neighbors = self.live_neighbor_count(row, col);

                let next_cell = match (cell, live_neighbors) {
                    // Rule 1: Any live cell with fewer than two live neighbours
                    // dies, as if caused by underpopulation.
                    (Cell::Alive, x) if x < 2 => Cell::Dead,
                    // Rule 2: Any live cell with two or three live neighbours
                    // lives on to the next generation.
                    (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                    // Rule 3: Any live cell with more than three live
                    // neighbours dies, as if by overpopulation.
                    (Cell::Alive, x) if x > 3 => Cell::Dead,
                    // Rule 4: Any dead cell with exactly three live neighbours
                    // becomes a live cell, as if by reproduction.
                    (Cell::Dead, 3) => Cell::Alive,
                    // All other cells remain in the same state.
                    (otherwise, _) => otherwise,
                };

                next[idx] = next_cell;
            }
        }

        self.cells = next;
    }

    pub fn new() -> Universe {
        let width = 64;
        let height = 64;

        let cells = (0..width * height)
            .map(|i| {
                if i % 2 == 0 || i % 7 == 0 {
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect();

        Universe {
            width,
            height,
            cells,
        }
    }

    pub fn reset(&mut self) {
        for i in 0..self.width * self.height {
            self.cells[i as usize] = if i % 2 == 0 || i % 7 == 0 {
                Cell::Alive
            } else {
                Cell::Dead
            };
        }
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }

    pub fn render(&self) -> String {
        self.to_string()
    }
}

impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }

        Ok(())
    }
}
```

然后用 `wasm-pack` 编译：

```bash
wasm-pack build --target web
```

在 pkg 目录下创建一个 index.html 文件：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Conway's Game of Life</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: #f0f0f0;
        font-family: Arial, sans-serif;
      }

      h1 {
        margin-bottom: 10px;
      }

      #game-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      #game-of-life-canvas {
        border: 1px solid #000;
        background-color: white;
      }

      #controls {
        margin-top: 20px;
      }

      button {
        padding: 10px 20px;
        margin: 0 10px;
        font-size: 16px;
        cursor: pointer;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
      }

      button:hover {
        background-color: #45a049;
      }

      button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
    </style>
  </head>
  <body>
    <h1>Conway's Game of Life</h1>
    <div id="game-container">
      <canvas id="game-of-life-canvas"></canvas>
      <div id="controls">
        <button id="play-pause">⏸ Pause</button>
        <button id="reset">🔄 Reset</button>
        <button id="tick">⏭ Tick</button>
      </div>
    </div>

    <script type="module">
      import init, { Universe, Cell } from "./wasm_test.js";

      const CELL_SIZE = 10;
      const GRID_COLOR = "#CCCCCC";
      const DEAD_COLOR = "#FFFFFF";
      const ALIVE_COLOR = "#000000";

      // Initialize the WebAssembly module
      const wasm = await init();

      const universe = Universe.new();
      const width = universe.width();
      const height = universe.height();

      const canvas = document.getElementById("game-of-life-canvas");
      canvas.height = (CELL_SIZE + 1) * height + 1;
      canvas.width = (CELL_SIZE + 1) * width + 1;

      const ctx = canvas.getContext("2d");

      let animationId = null;
      let isPlaying = true;

      const playPauseButton = document.getElementById("play-pause");
      playPauseButton.addEventListener("click", () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
          play();
          playPauseButton.textContent = "⏸ Pause";
        } else {
          pause();
          playPauseButton.textContent = "▶ Play";
        }
      });

      const resetButton = document.getElementById("reset");
      resetButton.addEventListener("click", () => {
        // 调用universe的reset方法来重置游戏
        universe.reset();
        drawGrid();
        drawCells();
      });

      const tickButton = document.getElementById("tick");
      tickButton.addEventListener("click", () => {
        universe.tick();
        drawGrid();
        drawCells();
      });

      const drawGrid = () => {
        ctx.beginPath();
        ctx.strokeStyle = GRID_COLOR;

        // Vertical lines
        for (let i = 0; i <= width; i++) {
          ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
          ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
        }

        // Horizontal lines
        for (let j = 0; j <= height; j++) {
          ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
          ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
        }

        ctx.stroke();
      };

      const getIndex = (row, column) => {
        return row * width + column;
      };

      const drawCells = () => {
        const cellsPtr = universe.cells();
        const cells = new Uint8Array(
          wasm.memory.buffer,
          cellsPtr,
          width * height
        );

        ctx.beginPath();

        for (let row = 0; row < height; row++) {
          for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);

            ctx.fillStyle =
              cells[idx] === Cell.Alive ? ALIVE_COLOR : DEAD_COLOR;

            ctx.fillRect(
              col * (CELL_SIZE + 1) + 1,
              row * (CELL_SIZE + 1) + 1,
              CELL_SIZE,
              CELL_SIZE
            );
          }
        }

        ctx.stroke();
      };

      const play = () => {
        animationId = requestAnimationFrame(() => {
          universe.tick();
          drawGrid();
          drawCells();
          if (isPlaying) {
            play();
          }
        });
      };

      const pause = () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      };

      // Initial draw
      drawGrid();
      drawCells();

      // Start the game
      play();
    </script>
  </body>
</html>
```

运行 index.html 文件，可以使用 VSCode 的 Live Server 扩展来运行。
或者使用 `python -m http.server` 命令来运行。

## 参考

- [The `wasm-bindgen` Guide](https://wasm-bindgen.github.io/wasm-bindgen/introduction.html)
- [Rust 🦀 and WebAssembly](https://rustwasm.github.io/docs/book/introduction.html)
