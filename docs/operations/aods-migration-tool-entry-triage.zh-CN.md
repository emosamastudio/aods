# AODS Migration Tool Entry Contract Triage

状态：U-090 已完成
日期：2026-05-12
范围：migration tool 的 entry contract；不实现 migration executor

## 结论

Migration tool 当前不具备实现条件。AODS 已有 deprecation / migration vocabulary、authority hierarchy 和 dependency ordering，但还缺 source/target authority、mapping contract、dry-run report、rollback posture、destructive approval 和 fixture evidence。

## 已有权威输入

| 输入 | 当前作用 |
|---|---|
| Deprecation / migration format | 描述 replacement、affected versions、removal version、migration guidance |
| Authority hierarchy | 描述 canonical、derived、alias、conflict 和 migration posture |
| Dependency ordering | 描述 dependency impact、blocks、derives_from、consumes / emits |
| Validation severity / remediation | 描述 drift finding 和 remediation action vocabulary |
| Fixture / golden conventions | 提供 dry-run report 和 expected diff 的基础约束 |

## Entry Contract 必须补齐

| 领域 | 必填问题 | 失败姿态 |
|---|---|---|
| Source / target authority | 迁移源和目标是否都能解析到 checked-in authority | 无 authority 时禁止执行 |
| Mapping | field、command、event、artifact、export 的 mapping 是否可审查 | mapping 不完整时只输出 plan |
| Dry-run report | affected files/surfaces、diff summary、risk、manual steps、warnings | 无 dry-run 时禁止 write |
| Rollback | reversible / irreversible steps、rollback owner、backup posture | irreversible 未审批时禁止执行 |
| Destructive approval | 删除、重命名、语义收缩、数据转换的 approval receipt | 无 approval receipt 时 blocked |
| Validation gate | migration 前后必须跑的 validate / fixture / package gate | gate 未通过时不得 close |
| Fixture set | safe mapping、missing target、destructive change、rollback unavailable、golden dry-run | fixture 不足时不得 PoC |

## Non-Goals

1. 不实现 automatic migration executor。
2. 不改 consumer code。
3. 不做 stored data transform。
4. 不提供 runtime compatibility shim。
5. 不自动接受 destructive diff。

## PoC 进入条件

Migration tool PoC 只有在以下条件同时满足后才可进入 U-155：

1. 至少一个 migration case 有 source/target authority 和完整 mapping。
2. dry-run report 能列出 affected surface、risk、manual steps 和 validation gate。
3. destructive / irreversible negative fixtures 可阻断未审批执行。
4. public docs 明确 PoC 不代表自动迁移框架。
