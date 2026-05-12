# AODS conformance manifest / report proposal

状态：U-173、U-174 已完成
日期：2026-05-12
范围：从 fixture smoke 走向 conformance runner 的 schema proposal；不实现 runner

## 结论

conformance 的下一步不应直接写执行器。当前最小路线是先固定两个稳定契约：case manifest 描述要跑什么，report 描述跑完如何审查。fixture smoke 继续保持轻量路径检查，conformance runner 以后只消费明确声明的 case。

## Manifest v0 proposal

| 字段 | 说明 | 约束 |
|---|---|---|
| `aods_conformance_manifest_v` | manifest 版本 | 初始为 `0`，避免伪装稳定发布 |
| `suite_id` | suite 稳定标识 | kebab-case，供 report 引用 |
| `scope` | suite 目的 | 人可读，必须说明非目标 |
| `cases[]` | case 列表 | 每个 case 必须有 `id`、`kind`、`input`、`expected` |
| `cases[].kind` | case 类型 | `validate`、`compile`、`route`、`fixture-smoke` 起步 |
| `cases[].input` | 输入路径和参数 | 只允许 repo-local path 和声明式 CLI args |
| `cases[].expected` | 预期结果 | `status`、`rules`、`warnings`、`stdout_json_path` 等按 kind 裁剪 |
| `update_policy` | 更新门禁 | 继续采用 manual review gate |

## Report v0 proposal

| 字段 | 说明 |
|---|---|
| `action` | 固定为 conformance run |
| `status` | `pass`、`fail`、`warn` |
| `accepted` | 是否满足 gate |
| `suite` | suite id、manifest path、case count |
| `summary` | pass/fail/warn/skip/xfail、rule coverage、fixture coverage |
| `cases[]` | case id、kind、status、expected_status、matched_rules、missing_rules、unexpected_rules |
| `artifacts[]` | 只记录已生成/已读取的本地 artifact 路径和 review posture |
| `issues[]` | 机器可读 rule、level、case_id、message、remediation |

## Gate posture

1. `fail` case 出现 unexpected pass 是失败。
2. `pass` case 出现 unexpected rule 是失败。
3. `warn` case 不阻断普通 gate，但 strict gate 可阻断。
4. `skip` 必须有 reason；`xfail` 必须有 linked issue 或 task id。
5. report 不能证明语义正确，只证明声明的 conformance case 与工具输出一致。

## 非目标

1. 不执行 arbitrary command。
2. 不做 browser/runtime/e2e orchestration。
3. 不做 dashboard、database 或 telemetry store。
4. 不把 benchmark result 当作 conformance truth。
