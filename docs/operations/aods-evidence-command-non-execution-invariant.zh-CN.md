# Evidence Command Non-Execution Invariant

任务：U-110
状态：已完成
日期：2026-05-12

## 目标

确认 validate、reality validation、fixture smoke 都只检查声明和路径，不执行 evidence command、golden update command 或外部 CI 命令。

## 已落测试

新增测试：

```bash
node --test benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs
```

测试名：

```text
fixture smoke command never executes declared update commands
```

测试方式：构造一个临时 fixture manifest，把 `update_policy.commands[]` 和 `golden_exports[].update_command` 写成会生成 marker 文件的命令；运行 `aods fixture smoke --json` 后断言 marker 文件不存在。

## 当前代码边界

| 面 | 行为 |
|---|---|
| `validate` | 读取 JSON、做 schema / reference / posture 检查 |
| `validate --reality` | 对可解析 repo root 下的路径做 `exists` 检查 |
| implementation evidence locator | 只对 `test` / `fixture` / `file-contract` 做 path-like 检查 |
| `fixture smoke` | 检查 manifest 结构、input path、golden path |
| golden update command | 仅作为声明输出，不执行 |

## 必须保持的 invariant

1. validator 不调用 shell。
2. fixture smoke 不调用 shell。
3. evidence locator 不被解释为命令。
4. CI check 名称不触发 CI API。
5. URL locator 不触发 fetch。

## 回归风险

| 风险 | 防护 |
|---|---|
| conformance runner 未来想自动更新 golden | 必须新建命令，不得改变 `fixture smoke` 语义 |
| reality validation 未来想调用 CI | 必须另设 opt-in executor，不得默认执行 |
| update command 被误当 smoke 行为 | 当前测试会阻断 |

## 非目标

- 不引入 executor。
- 不实现 conformance runner。
- 不执行外部测试、CI、脚本或 fetch。
