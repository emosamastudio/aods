# AODS Route Discoverability Review

状态：U-070 已完成
日期：2026-05-08
范围：复盘 `#9/#10/#17` 与当前 routing warnings；不削弱 strict gate

## 结论

`#9/#10/#17` 的原始问题已在 v0.7 最小实现中关闭：paired invariant normalization、capsule-shorter diagnostics、large corpus empty `boot_by_touch` advisory、README route guidance、scaffold authoring touch/pair 支持都已经存在。当前 root corpus strict validation 没有 route / boot warnings。

仍有一个低风险 discoverability 残留：`aods route --help` 当前返回 `Unknown route arg: --help`，而顶层 usage 里已经列出 route 参数。这不影响语义正确性，但会增加 CLI 自发现成本。建议新增 U-076，单独补 route 子命令 help / smoke test。

## GitHub issue 状态

| Issue | 状态 | 本地结果 | 判断 |
|---|---|---|---|
| `#9` brittle invariant duplication | CLOSED | U-018 已做 normalized invariant comparison，保留 claim-diff 高信号约束 | 无需重开 |
| `#10` capsule warning diagnostics | CLOSED | U-017 已输出 capsule / target approximate token counts 并去重 target | 无需重开 |
| `#17` empty `boot_by_touch` discoverability | CLOSED | U-016 已增加 10+ module empty route L3 warning；README 和 scaffold 也已有 route / touch guidance | 无需重开 |

## 本地审查证据

| 检查 | 结果 | 说明 |
|---|---|---|
| root `boot_by_touch` | 已配置 | `manifest.json` 包含 manifest、README、spec、schema、bin、lib、hook 等 file-scoped routes |
| strict validation | 通过且 warnings=0 | `node ./bin/aods.mjs validate . --strict --json` 显示 L1-L4 pass |
| touch route smoke | 通过 | `node ./bin/aods.mjs route . --touch lib/route.mjs --intent write --json` 选择 `spec-boot-protocol`、`spec-surface-governance`、`spec-validation` |
| query route smoke | 通过 | `boot_by_touch route discoverability warnings` 可路由到 validation / boot protocol / authority governance |
| route help | 残留缺口 | `node ./bin/aods.mjs route --help` 返回 unknown arg，缺少 subcommand-local help |

## 新增任务建议

| 任务 ID | 优先级 | 任务 | 验收标准 |
|---|---|---|---|
| U-076 | P2 | 增加 route 子命令 help / discoverability smoke test | `node ./bin/aods.mjs route --help` 或等价入口输出 route 用法；focused CLI regression 覆盖；不改变 route ranking |

## 非目标

1. 不改变 route ranking。
2. 不削弱 empty `boot_by_touch` advisory。
3. 不把 route CLI 改成完整交互式向导。
4. 不重开已关闭的 `#9/#10/#17`。
