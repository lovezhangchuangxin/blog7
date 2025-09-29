# TypeScript 中 satisfies 的使用

TypeScript 4.9 引入了 `satisfies` 操作符，用于在类型检查时确保一个表达式符合特定的类型约束，而不会改变该表达式的实际类型。

## 官方例子

下面的例子来自 TypeScript 官方文档，展示了 `satisfies` 的用法。

我们想要定义一个调色板对象 `palette`，其中每个属性可以是一个字符串或一个 RGB 元组。我们希望在不丢失具体类型信息的情况下，确保 `palette` 符合预期的类型结构。

```typescript
// Each property can be a string or an RGB tuple.
const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  bleu: [0, 0, 255],
  //  ^^^^ sacrebleu - we've made a typo!
};
// We want to be able to use string methods on 'green'...
const greenNormalized = palette.green.toUpperCase();
```

上面代码中，我们希望在写入 `palette` 对象时，ts 能提示字段的名称，当你写错字段名称或者字段的值的类型不对时，ts 能报错。

```typescript
type Colors = "red" | "green" | "blue";
type RGB = [red: number, green: number, blue: number];
const palette: Record<Colors, string | RGB> = {
  red: [255, 0, 0],
  green: "#00ff00",
  bleu: [0, 0, 255],
  //  ~~~~ The typo is now correctly detected
};
// But we now have an undesirable error here - 'palette.green' "could" be of type RGB and
// property 'toUpperCase' does not exist on type 'string | RGB'.
const greenNormalized = palette.green.toUpperCase();
```

现在我们对 `palette` 添加了类型注解，但是 `palette.green` 的类型变成了 `string | RGB`，导致我们无法直接调用 `toUpperCase` 方法。

使用 `satisfies` 可以解决这个问题：

```typescript
type Colors = "red" | "green" | "blue";
type RGB = [red: number, green: number, blue: number];
const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  bleu: [0, 0, 255],
  //  ~~~~ The typo is now caught!
} satisfies Record<Colors, string | RGB>;
// toUpperCase() method is still accessible!
const greenNormalized = palette.green.toUpperCase();
```

通过使用 `satisfies`，我们确保了 `palette` 对象符合 `Record<Colors, string | RGB>` 的类型约束，同时保留了每个属性的具体类型信息，使得我们可以直接调用 `toUpperCase` 方法。

## 总结

`satisfies` 的作用：

- 确保值符合特定的类型定义
- 同时保留值的具体类型信息
