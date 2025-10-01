# Nodejs 中使用 ts-node 执行 TypeScript 文件

在 Nodejs 中如果想直接执行 TypeScript 文件，可以使用 `ts-node` 这个工具。

```bash
npm install -g ts-node typescript
```

安装完成后，就可以直接使用 `ts-node` 来执行 TypeScript 文件了。

```bash
ts-node your-script.ts
```

当然，安装在项目本地，然后在 `package.json` 的 `scripts` 中配置命令也是可以的。

```bash
npm install -D ts-node typescript
```

```json
{
  "scripts": {
    "start": "ts-node your-script.ts"
  }
}
```

```bash
npm run start
```

## 原理

使用 `ts-node` 来执行 TypeScript 文件，依然会将 TypeScript 代码先编译成 JavaScript 代码，然后再执行。只不过编译出来的 JavaScript 代码是临时存放在内存中的，而不会写入到磁盘文件中。

`ts-node` 并不会监听文件的变化，因此每次修改 TypeScript 文件后，都需要重新执行 `ts-node your-script.ts` 命令。

## 开发

在开发过程中，如果不想每次修改文件后都重新执行命令，可以使用 `ts-node-dev` 这个工具，它会监听文件的变化并自动重启。

```bash
npm install -g ts-node-dev typescript
```

```bash
ts-node-dev your-script.ts
```

用法基本和 `ts-node` 一致，也可以在本地安装后在 `package.json` 的 `scripts` 中配置命令。

## 别名

我们知道在 `tsconfig.json` 中可以配置路径别名：

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

然后在代码中就可以使用别名来引用模块：

```typescript
import { myFunction } from "@/utils/myFunction";
// 相当于 import { myFunction } from "src/utils/myFunction";
```

但是， `ts-node` 或者 `ts-node-dev` 默认并不支持这种路径别名的解析，会报找不到模块的错误。

要解决这个问题，可以安装 `tsconfig-paths` 这个包：

```bash
npm install tsconfig-paths -g
```

然后在执行 `ts-node` 或者 `ts-node-dev` 时，添加 `-r tsconfig-paths/register` 参数：

```bash
ts-node -r tsconfig-paths/register your-script.ts
```

## 参考

- [ts-node](https://github.com/TypeStrong/ts-node)
- [ts-node-dev](https://github.com/wclr/ts-node-dev)
