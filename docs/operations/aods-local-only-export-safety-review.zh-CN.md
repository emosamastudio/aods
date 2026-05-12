# AODS Local-only Export Safety Review

任务：U-150
状态：已完成
日期：2026-05-12
范围：local-only / local-export surface 的公开误用风险和 guard；不实现 sandbox

## 目标

复核 local-only 与 local-export 的安全边界，避免本地专用 surface 因文档、示例、包产物或远程集成被误认为可公开读取、远程写入或 adapter-facing。

## 结论

local-only / local-export 当前适合作为静态 exposure class。升级到 remote-read、remote-write 或 adapter-facing 必须经过 U-145 checklist。当前不需要也不应实现 sandbox、automatic exposure upgrader、network broker 或 auth runtime。

## Safety Matrix

| exposure class | 允许表达 | 主要误用风险 | 必要 guard |
|---|---|---|---|
| `local-only` | 只允许本地 agent / repo 内消费 | 被公开文档或包产物误认为远程可读 | 写明 local-only reason、path scope、redaction floor、consumer guidance |
| `local-export` | 可导出为本地 artifact 或审查产物 | 导出内容被当成公开 API 或长期稳定快照 | 写明 export boundary、freshness、artifact owner、review gate |
| `remote-read` | 远程读取候选 | 未声明 auth/redaction/freshness 即公开 | 必须经过 upgrade checklist |
| `remote-write` | 远程写入候选 | 未声明 receipt/audit/rollback 即触发副作用 | 必须经过更高 gate，不默认允许 |
| `adapter-facing` | adapter 能力候选 | provider/consumer compatibility 不清导致误连 | 必须声明 capability compatibility 和 audit anchor |

## Misuse Scenarios

| 场景 | 风险 | 当前处理 |
|---|---|---|
| README 引用 local-only surface | 消费者误认为可远程接入 | README 只指向 canonical examples，不承诺 runtime API |
| package 包含 compiled-pilot | 示例被误认为生产配置 | package / install smoke 已保留示例定位，不发布 runtime gateway |
| local-export golden 文件被复用 | stale output 被当成事实源 | golden drift policy 要求人工接受，不自动更新 |
| adapter-facing 示例被扩成 gateway | 缺少 auth / failure / cost gate | U-145 checklist 和 U-154 decision gate 阻断 |

## Review Checklist

| 检查项 | local-only | local-export |
|---|---|---|
| authority surface | 必须指向 checked-in corpus | 必须指向 checked-in corpus 和 artifact owner |
| redaction | 声明 sensitive / redaction posture | 声明 export payload boundary |
| freshness | 声明本地状态或 snapshot 限制 | 声明 exported_at / source watermark |
| consumer guidance | 写明不能远程依赖 | 写明不能当长期 API |
| upgrade path | 只能走 U-145 checklist | 只能走 U-145 checklist |

## 非目标

- 不实现 sandbox。
- 不实现 automatic exposure upgrader。
- 不实现 remote gateway、auth runtime 或 network broker。
- 不把 local-export artifact 视为公开 API。
