# Route Touch Route Stale Path Audit

任务：U-131
状态：已完成
日期：2026-05-12

## 目标

审查 `boot_by_touch` 中 stale path、unregistered path 和 unexpected fallback。当前不重排 authority。

## 当前状态

`manifest.json` 当前有 16 条 touch route，覆盖：

- root manifest / README
- `spec/*.json`
- `schema/*.json`
- CLI entrypoint
- validator、scaffold、route、hook runtime
- pre-commit hook

## 样本结果

| touch | intent | strategy | 判断 |
|---|---|---|---|
| `schema/module.schema.json` | write | touch-route | 正确命中 `schema/*.json` |
| `docs/operations/aods-task-ledger.zh-CN.md` | read | default-bootstrap | 可接受 fallback，但不是专门 docs route |

## 结论

未发现现有 touch route 的 stale path 或 unresolved module。主要缺口是 operations docs 没有专门 touch route，导致 docs 维护只能回退到 boot sequence 和 task ledger 规则。考虑到 operations docs 属于项目治理面，不是根语义面，本轮只记录，不新增 route。

## 后续建议

如果后续 docs 维护频率继续升高，可新增 `docs/operations/*.md` 的 read/write touch route，加载 `spec-boot-protocol`、`spec-validation` 和 `spec-surface-governance`，但这会把项目治理文档更强地纳入语义路由，需要单独评估。

## 非目标

- 不重排 boot sequence。
- 不新增 docs touch route。
- 不改变 route fallback 行为。
