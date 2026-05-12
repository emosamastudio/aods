# AODS Implementation Evidence Hygiene

状态：U-077 已完成
日期：2026-05-08
适用范围：implementation evidence stale/current posture 的 deterministic validator hygiene

## 目标

U-077 继续代码漂移主线。目标不是执行 evidence command，也不是判断测试是否真实通过，而是让 AODS 对已声明的 implementation evidence 姿态给出更明确、可机器读取、可审查的信号。

## 本轮结果

| 项 | 结果 |
|---|---|
| reality summary | `validate --reality` 的 `topology` 现在输出 `current_evidence`、`planned_evidence`、`stale_evidence`、`blocked_evidence` |
| stale evidence finding | `implementation-evidence-stale` 继续作为 L3 warning 输出，并补齐标准 remediation：`refresh-evidence/warning` |
| current evidence hygiene | `current` implementation 如果有 evidence 但没有任何 `status=current` evidence anchor，会输出 `implementation-current-evidence-missing` L3 warning |
| command execution | validator 仍不执行 `module.meta.implementation.evidence[].command` |

## 验收标准

| 标准 | 状态 | 证据 |
|---|---|---|
| stale/current evidence 有 deterministic summary 或 finding | 通过 | `topology.current_evidence/planned_evidence/stale_evidence/blocked_evidence` 与两类 L3 warning |
| focused regression 覆盖 stale evidence posture | 通过 | `reality validation summarizes stale and current implementation evidence posture` |
| repo-level validation 通过 | 通过 | `npm run validate:all` |
| 不执行 evidence command | 通过 | 本轮只新增声明式计数和 warning；未引入 command runner |

## 非目标

1. 不执行测试、CI、fixture 或 manual-review command。
2. 不把 stale evidence 自动判定为行为失败。
3. 不引入 fingerprint drift gate、remote clone/fetch、LLM judge 或跨仓库扫描器。
4. 不改变 manifest evidence_summary 的既有 shape；本轮只扩 `validate --reality` topology summary。

## 后续

下一步优先 U-078：capability compatibility metadata deterministic gates。`#41` 仍保持 open，因为 full negotiation handshake、discovery、auth、fallback ranking 都不是本轮范围。
