# AODS Event Store And Replay Entry Contract Triage

状态：U-087 已完成
日期：2026-05-12
范围：event store / replay 的 entry contract；不实现 event store

## 结论

Event store / replay 当前不具备实现条件。AODS 已有 append-only event、correction、supersession、retraction 和 projection guidance 的 metadata boundary，但还缺 event identity、ordering、retention、replay scope、consumer contract 和 fixture evidence。

## 已有权威输入

| 输入 | 当前作用 |
|---|---|
| Append-only event surface | 描述事件形状和不可变语义 |
| Correction / supersession / retraction | 描述错误修正、替代和撤回方式 |
| Projection guidance | 描述 read-model 如何消费 event / correction |
| Dependency ordering | 描述 emits / consumes / derives_from |
| Fixture / golden conventions | 提供 event fixture 与 golden projection 的基础规则 |

## Entry Contract 必须补齐

| 领域 | 必填问题 | 失败姿态 |
|---|---|---|
| Event identity | event id、stream id、producer id、schema version 如何定义 | identity 不完整时禁止 replay |
| Ordering | ordering key、same-stream order、cross-stream order 是否有保证 | 未声明时不得声称全局有序 |
| Retention | retention period、archival、redaction、tombstone 策略 | retention 不明时不得承诺可重放 |
| Replay scope | replay 是 per stream、per projection、per corpus 还是 diagnostic only | scope 不明时只允许人工审查 |
| Correction semantics | correction、supersession、retraction 如何影响 projection | 未声明时不得自动修正 read-model |
| Idempotency | replay 是否可重复、duplicate event 怎么处理 | 不完整时必须输出 warning |
| Consumer contract | consumer 如何声明 last processed event、watermark、stale posture | 无 consumer state 时不得自动推进 |
| Fixture set | ordered event、out-of-order、duplicate、correction、retraction、projection golden | fixture 不足时不得 PoC |

## Non-Goals

1. 不实现 event store。
2. 不实现 replay executor、event bus、projection runner 或 durable queue。
3. 不承诺 exactly-once delivery、global ordering 或 transactional projection。
4. 不把 correction metadata 当作自动数据修复。
5. 不迁移历史数据。

## PoC 进入条件

Event store / replay PoC 只有在以下条件同时满足后才可进入 U-152：

1. 至少一个 event surface 明确 event identity、ordering key、retention 和 replay scope。
2. correction / supersession / retraction 对 projection 的影响有 golden fixture。
3. duplicate / out-of-order / missing correction target 有 negative fixtures。
4. public docs 明确 PoC 不等于 durable event platform。
