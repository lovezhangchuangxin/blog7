---
order: 4
---

# 记某次的 JavaScript 性能优化

今天尝试优化了一下图表库项目的代码，分析了一下性能瓶颈，发现有一些可以优化的点，记录一下。

1. 私有属性优化
2. map 插入优化

## 私有属性优化

项目中大量使用 ES2022 的私有属性语法，使用 `#` 定义私有属性和方法。虽然私有属性和普通属性在性能上没有太大差异，但是由于我们的编译目标是 ES2015，Babel 会将私有属性编译成弱引用（WeakMap）来实现私有属性的功能，在涉及大量创建对象时，性能会有明显的下降。

比如下面的带有私有属性的代码：

```javascript
class A {
  #a = 1;
}
```

会被 [Babel](https://babeljs.io/repl) 编译成类似下面的代码：

```javascript
function _classPrivateFieldInitSpec(e, t, a) {
  _checkPrivateRedeclaration(e, t), t.set(e, a);
}
function _checkPrivateRedeclaration(e, t) {
  if (t.has(e))
    throw new TypeError(
      "Cannot initialize the same private elements twice on an object"
    );
}
var _a = /*#__PURE__*/ new WeakMap();
class A {
  constructor() {
    _classPrivateFieldInitSpec(this, _a, 1);
  }
}
```

使用 `benchmark.js` 对比一下性能会发现私有属性转译后的性能远低于原生私有属性的性能：

:::details benchmark.js 测试代码

```javascript
const Benchmark = require("benchmark");

class A {
  #a = 1;
}

function _classPrivateFieldInitSpec(e, t, a) {
  _checkPrivateRedeclaration(e, t), t.set(e, a);
}
function _checkPrivateRedeclaration(e, t) {
  if (t.has(e))
    throw new TypeError(
      "Cannot initialize the same private elements twice on an object"
    );
}
var _a = /*#__PURE__*/ new WeakMap();
class A2 {
  constructor() {
    _classPrivateFieldInitSpec(this, _a, 1);
  }
}

// 创建一个新的基准测试套件
const suite = new Benchmark.Suite();

// 添加测试
suite
  .add("原生私有字段 (A)", function () {
    new A();
  })
  .add("私有字段转译 (A2)", function () {
    new A2();
  })
  // 添加完成事件监听器
  .on("cycle", function (event) {
    console.log(String(event.target));
  })
  .on("complete", function () {
    console.log("最快的方法是 " + this.filter("fastest").map("name"));
    const fastest = this.filter("fastest").map("hz")[0];
    const slowest = this.filter("slowest").map("hz")[0];
    const diff = ((fastest / slowest - 1) * 100).toFixed(2);
    console.log(`最快的比最慢的快 ${diff}%`);
  })
  // 运行基准测试
  .run({ async: true });
```

:::

测试结果：

```cmd
原生私有字段 (A) x 653,224,619 ops/sec ±1.87% (88 runs sampled)
私有字段转译 (A2) x 7,096,004 ops/sec ±2.95% (61 runs sampled)
最快的方法是 原生私有字段 (A)
最快的比最慢的快 9105.53%
```

当类中私有属性增加时，性能差距会更大。

**解决方法**：

1. 提高编译目标到 ES2022 或更高版本，使用原生私有属性，避免转译。

   如果使用 vite 打包，可以在 `vite.config.js` 中配置：

   ```javascript
   import { defineConfig } from "vite";

   export default defineConfig({
     build: {
       target: "es2022",
     },
   });
   ```

2. 使用 ts 的 `private` 关键字，但是编译后会变成普通属性。

   同时可以在命名时加下划线 `_` 来表示私有属性，尽量避免编译后不小心被外部访问或修改。

## Map 插入优化

项目中为了根据数据的 `id` 来快速查找数据，使用了 `Map` 来存储数据，`key` 是数据的 `id`，`value` 是数据对象。

测试发现，`Map` 插入数据的性能和 `key` 以及 `value` 都有关系。value 越大，插入性能越差。但是我们一般不会对 value 做处理，因为 value 一般是业务数据，无法改变。所以优化重点放在 `key` 上。

经过测试发现，**在 chrome 浏览器环境下，`key` 使用数字字符串时，插入性能最好，使用数字次之，使用普通字符串性能最差。**

下面是测试代码：

:::details benchmark.js 测试代码

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script>
      /**
       * 测试函数执行时间
       */
      function testFunctionExecutionTime(fn, count = 10000) {
        const start = performance.now();
        Array.from({ length: count }).forEach((_, i) => fn(i));
        const end = performance.now();
        console.log(
          `Function ${fn.name} executed in ${end - start} milliseconds`
        );
      }

      class Node {}
      const map = new Map();
      const map2 = new Map();
      const map3 = new Map();

      testFunctionExecutionTime(function a(i) {
        const name = i;
        map.set(name, new Node());
      }, 5000000);

      testFunctionExecutionTime(function b(i) {
        const name = "" + i;
        map2.set(name, new Node());
      }, 5000000);

      testFunctionExecutionTime(function c(i) {
        const name = "a" + i;
        map3.set(name, new Node());
      }, 5000000);
    </script>
  </body>
</html>
```

:::

测试结果：

```
Function a executed in 670.0999999940395 milliseconds
Function b executed in 744.5999999940395 milliseconds
Function c executed in 1924.4000000059605 milliseconds
```

可以看到，使用数字字符串作为 key 的插入性能是最好的。

**在 Node.js 环境下则稍有不同，性能：数字 > 数字字符串 > 普通字符串。**

不管怎么说，在大数据量场景需要严格考虑性能时，数字或者数字字符串作为 key 是更优的选择。

之外，使用 `{}` 代替 `Map` 作为数据存储结构，性能也会更好一些。

## a + b < a

在某些情况下，a、b 两行代码在一起的执行时间比单独只执行 a 可能更快。

下面代码中，`node.js` 文件中导出了一个 `Node` 类，该类做了什么并不重要，我们仅仅只是刻意把它写得很复杂。`utils.js` 中导出了一个测试函数执行时间的工具函数。在 `index.js` 中，我们写了两个测试用例，**第二个比第一个多了一行代码 `children2.push(node);`，但是第二个的执行时间反而更短！**。

即便分别测试这两个函数的执行时间，结果依然是第二个更快。why？我暂时还没想明白。

::: code-group

```js{16} [index.js]
const { Node } = require("./node");
const { testFunctionExecutionTime } = require("./utils");

const map1 = new Map();
const map2 = new Map();
const children2 = [];

testFunctionExecutionTime(function a(i) {
  const node = new Node(`Node ${i}`);
  map1.set(node.name, node);
}, 500000);

testFunctionExecutionTime(function ab(i) {
  const node = new Node(`Node ${i}`);
  map2.set(node.name, node);
  children2.push(node);
}, 500000);
```

```js [node.js]
class Node {
  // 基本属性
  name; // 节点名称
  id; // 唯一标识符
  type; // 节点类型
  data; // 节点存储的数据
  meta; // 元数据对象
  position; // 节点位置坐标 {x, y}
  size; // 节点大小 {width, height}
  state; // 节点状态（active, disabled, hidden等）
  style; // 节点样式
  timestamp; // 创建/更新时间戳

  // 关系属性
  parent; // 父节点引用
  children; // 子节点数组
  siblings; // 同级节点的缓存引用
  depth; // 在树中的深度
  path; // 从根到当前节点的路径

  /**
   * 创建一个新节点
   * @param {string} name 节点名称
   * @param {Object} options 节点配置选项
   */
  constructor(name, options = {}) {
    this.name = name;
    // this.id = options.id || this._generateId();
    // this.type = options.type || "default";
    // this.data = options.data || {};
    // this.meta = options.meta || {};
    // this.position = options.position || { x: 0, y: 0 };
    // this.size = options.size || { width: 100, height: 50 };
    // this.state = options.state || "active";
    // this.style = options.style || {};
    // this.timestamp = Date.now();

    // // 初始化关系属性
    // this.parent = null;
    // this.children = [];
    // this.siblings = [];
    // this.depth = 0;
    // this.path = [];
  }

  /**
   * 生成唯一ID
   * @private
   * @returns {string} 唯一ID
   */
  _generateId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * 添加子节点
   * @param {Node} child 要添加的子节点
   * @returns {Node} 当前节点以支持链式调用
   */
  addChild(child) {
    if (!(child instanceof Node)) {
      throw new Error("Child must be an instance of Node");
    }

    if (child.parent) {
      child.parent.removeChild(child);
    }

    child.parent = this;
    child.depth = this.depth + 1;
    child.path = [...this.path, this.id];

    this.children.push(child);
    this._updateChildrenSiblings();

    return this;
  }

  /**
   * 批量添加多个子节点
   * @param {Array<Node>} children 子节点数组
   * @returns {Node} 当前节点以支持链式调用
   */
  addChildren(children) {
    if (!Array.isArray(children)) {
      throw new Error("Children must be an array");
    }

    children.forEach((child) => this.addChild(child));
    return this;
  }

  /**
   * 从当前节点移除子节点
   * @param {Node|string} childOrId 要移除的子节点或子节点ID
   * @returns {Node|null} 被移除的节点或null（如果未找到）
   */
  removeChild(childOrId) {
    const childId = childOrId instanceof Node ? childOrId.id : childOrId;
    const index = this.children.findIndex((child) => child.id === childId);

    if (index === -1) return null;

    const child = this.children[index];
    this.children.splice(index, 1);

    child.parent = null;
    child.depth = 0;
    child.path = [];

    this._updateChildrenSiblings();

    return child;
  }

  /**
   * 移除所有子节点
   * @returns {Array<Node>} 被移除的子节点数组
   */
  removeAllChildren() {
    const removedChildren = [...this.children];

    this.children.forEach((child) => {
      child.parent = null;
      child.depth = 0;
      child.path = [];
    });

    this.children = [];
    return removedChildren;
  }

  /**
   * 更新所有子节点的兄弟节点引用
   * @private
   */
  _updateChildrenSiblings() {
    if (this.children.length <= 1) {
      if (this.children.length === 1) {
        this.children[0].siblings = [];
      }
      return;
    }

    this.children.forEach((child, index) => {
      child.siblings = [
        ...this.children.slice(0, index),
        ...this.children.slice(index + 1),
      ];
    });
  }

  /**
   * 查找指定ID的子节点（包括深层子节点）
   * @param {string} id 要查找的节点ID
   * @returns {Node|null} 找到的节点或null
   */
  findNodeById(id) {
    if (this.id === id) return this;

    for (const child of this.children) {
      const found = child.findNodeById(id);
      if (found) return found;
    }

    return null;
  }

  /**
   * 根据名称查找节点（包括深层子节点）
   * @param {string} name 要查找的节点名称
   * @returns {Array<Node>} 符合条件的节点数组
   */
  findNodesByName(name) {
    const result = [];

    if (this.name === name) {
      result.push(this);
    }

    for (const child of this.children) {
      result.push(...child.findNodesByName(name));
    }

    return result;
  }

  /**
   * 根据类型查找节点
   * @param {string} type 节点类型
   * @returns {Array<Node>} 符合条件的节点数组
   */
  findNodesByType(type) {
    const result = [];

    if (this.type === type) {
      result.push(this);
    }

    for (const child of this.children) {
      result.push(...child.findNodesByType(type));
    }

    return result;
  }

  /**
   * 根据自定义条件查找节点
   * @param {Function} predicate 断言函数，接收节点参数，返回布尔值
   * @returns {Array<Node>} 符合条件的节点数组
   */
  findNodes(predicate) {
    const result = [];

    if (predicate(this)) {
      result.push(this);
    }

    for (const child of this.children) {
      result.push(...child.findNodes(predicate));
    }

    return result;
  }

  /**
   * 遍历节点树并执行回调
   * @param {Function} callback 要执行的回调函数，接收当前节点和深度作为参数
   * @param {number} [depth=0] 当前深度，内部使用
   */
  traverse(callback, depth = 0) {
    callback(this, depth);

    for (const child of this.children) {
      child.traverse(callback, depth + 1);
    }
  }

  /**
   * 更新节点数据
   * @param {Object} newData 要更新的数据对象
   * @returns {Node} 当前节点以支持链式调用
   */
  updateData(newData) {
    this.data = { ...this.data, ...newData };
    this.timestamp = Date.now();
    return this;
  }

  /**
   * 更新节点元数据
   * @param {Object} newMeta 要更新的元数据对象
   * @returns {Node} 当前节点以支持链式调用
   */
  updateMeta(newMeta) {
    this.meta = { ...this.meta, ...newMeta };
    return this;
  }

  /**
   * 更新节点位置
   * @param {number} x X坐标
   * @param {number} y Y坐标
   * @returns {Node} 当前节点以支持链式调用
   */
  move(x, y) {
    this.position = { x, y };
    return this;
  }

  /**
   * 更新节点大小
   * @param {number} width 宽度
   * @param {number} height 高度
   * @returns {Node} 当前节点以支持链式调用
   */
  resize(width, height) {
    this.size = { width, height };
    return this;
  }

  /**
   * 更改节点状态
   * @param {string} newState 新状态
   * @returns {Node} 当前节点以支持链式调用
   */
  setState(newState) {
    this.state = newState;
    return this;
  }

  /**
   * 获取根节点
   * @returns {Node} 根节点
   */
  getRoot() {
    let current = this;
    while (current.parent) {
      current = current.parent;
    }
    return current;
  }

  /**
   * 获取节点的所有叶子节点
   * @returns {Array<Node>} 叶子节点数组
   */
  getLeaves() {
    if (this.children.length === 0) {
      return [this];
    }

    let leaves = [];
    for (const child of this.children) {
      leaves = [...leaves, ...child.getLeaves()];
    }

    return leaves;
  }

  /**
   * 获取节点的所有祖先节点
   * @returns {Array<Node>} 祖先节点数组，从父节点到根节点
   */
  getAncestors() {
    const ancestors = [];
    let current = this.parent;

    while (current) {
      ancestors.push(current);
      current = current.parent;
    }

    return ancestors;
  }

  /**
   * 获取节点的所有后代节点
   * @returns {Array<Node>} 后代节点数组
   */
  getDescendants() {
    let descendants = [];

    for (const child of this.children) {
      descendants.push(child);
      descendants = [...descendants, ...child.getDescendants()];
    }

    return descendants;
  }

  /**
   * 将节点转换为JSON对象（不包括循环引用）
   * @param {boolean} [includeChildren=true] 是否包含子节点
   * @returns {Object} JSON对象
   */
  toJSON(includeChildren = true) {
    const json = {
      id: this.id,
      name: this.name,
      type: this.type,
      data: this.data,
      meta: this.meta,
      position: this.position,
      size: this.size,
      state: this.state,
      style: this.style,
      timestamp: this.timestamp,
      depth: this.depth,
      path: this.path,
    };

    if (includeChildren && this.children.length > 0) {
      json.children = this.children.map((child) => child.toJSON(true));
    }

    return json;
  }

  /**
   * 从JSON对象创建节点树
   * @param {Object} json JSON对象
   * @returns {Node} 创建的节点
   */
  static fromJSON(json) {
    const node = new Node(json.name, {
      id: json.id,
      type: json.type,
      data: json.data,
      meta: json.meta,
      position: json.position,
      size: json.size,
      state: json.state,
      style: json.style,
    });

    if (json.children && Array.isArray(json.children)) {
      json.children.forEach((childJson) => {
        const childNode = Node.fromJSON(childJson);
        node.addChild(childNode);
      });
    }

    return node;
  }

  /**
   * 克隆节点（包括所有子节点）
   * @param {boolean} [deep=true] 是否深度克隆（包括子节点）
   * @returns {Node} 克隆的节点
   */
  clone(deep = true) {
    const clonedNode = new Node(this.name, {
      id: this._generateId(), // 生成新的ID
      type: this.type,
      data: JSON.parse(JSON.stringify(this.data)),
      meta: JSON.parse(JSON.stringify(this.meta)),
      position: { ...this.position },
      size: { ...this.size },
      state: this.state,
      style: { ...this.style },
    });

    if (deep && this.children.length > 0) {
      this.children.forEach((child) => {
        const clonedChild = child.clone(true);
        clonedNode.addChild(clonedChild);
      });
    }

    return clonedNode;
  }

  /**
   * 比较两个节点是否相等
   * @param {Node} other 要比较的另一个节点
   * @param {boolean} [compareChildren=false] 是否比较子节点
   * @returns {boolean} 是否相等
   */
  equals(other, compareChildren = false) {
    if (!(other instanceof Node)) return false;

    const basicEquals =
      this.id === other.id &&
      this.name === other.name &&
      this.type === other.type &&
      JSON.stringify(this.data) === JSON.stringify(other.data) &&
      JSON.stringify(this.position) === JSON.stringify(other.position) &&
      JSON.stringify(this.size) === JSON.stringify(other.size);

    if (!basicEquals) return false;

    if (compareChildren) {
      if (this.children.length !== other.children.length) return false;

      for (let i = 0; i < this.children.length; i++) {
        if (!this.children[i].equals(other.children[i], true)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 计算节点的总子节点数（包括深层子节点）
   * @returns {number} 子节点总数
   */
  getDescendantCount() {
    let count = this.children.length;

    for (const child of this.children) {
      count += child.getDescendantCount();
    }

    return count;
  }
}

module.exports = { Node };
```

```js [utils.js]
/**
 * 测试函数执行时间
 */
function testFunctionExecutionTime(fn, count = 10000) {
  const start = performance.now();
  Array.from({ length: count }).forEach((_, i) => fn(i));
  const end = performance.now();
  console.log(`Function ${fn.name} executed in ${end - start} milliseconds`);
}

module.exports = {
  testFunctionExecutionTime,
};
```

:::
