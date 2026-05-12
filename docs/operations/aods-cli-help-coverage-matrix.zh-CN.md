# CLI Help Coverage Matrix

任务：U-123
状态：已完成
日期：2026-05-12

## 目标

建立 CLI help coverage matrix，并补齐会报错的子命令帮助输出。当前不重写 CLI parser。

## Coverage Matrix

| 命令 | `--help` 状态 | 本轮处理 |
|---|---|---|
| `aods --help` | pass | 已有全局 help |
| `aods validate --help` | pass | 新增子命令 help |
| `aods route --help` | pass | 已有 help |
| `aods hook --help` | pass | 新增子命令 help |
| `aods upgrade --help` | pass | 新增子命令 help |
| `aods compile --help` | pass | 新增子命令 help |
| `aods fixture --help` | pass | 已有 help |
| `aods scaffold --help` | pass | 新增子命令 help |

## Code Change

| 文件 | 变化 |
|---|---|
| `lib/validate.mjs` | `-h/--help` 输出 validate usage |
| `lib/hook.mjs` | `-h/--help` 和空参数输出 hook usage |
| `lib/upgrade.mjs` | `-h/--help` 输出 upgrade usage |
| `lib/compile.mjs` | `-h/--help` 输出 compile usage |
| `lib/scaffold.mjs` | `-h/--help` 和空参数输出 scaffold usage |
| `benchmarks/aods-eval-lab/test/scaffold.test.mjs` | focused regression 覆盖所有子命令 help |

## Validation

命令：

```bash
node --test benchmarks/aods-eval-lab/test/scaffold.test.mjs
```

结果：31/31 pass。

## 非目标

- 不重写 CLI parser。
- 不改变 route ranking。
- 不新增 verbose / compact mode。
- 不改变 validate / compile 的实际执行语义。
