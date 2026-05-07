# AODS 代码漂移路线

状态：下一阶段设计路线
日期：2026-05-07

## 结论

代码漂移在 AODS 后续规划内，而且应该成为 AODS 区别于普通文档格式的核心能力之一。但推进方式必须是 authority-first：先让规范声明、实现位置、证据 artifacts 和验证结果形成闭环，再逐步进入行为一致性检测。

下一步不做全量代码扫描器，也不让 LLM 直接判定代码是否符合规范。下一步做 `implementation evidence` 最小切片：让 AODS 能表达“这个 stable surface 的实现证据在哪里、由什么命令或 artifact 证明、什么时候算过期、validator 能否看到它”。

## 要解决的问题

| 漂移类型 | 问题 | AODS 处理方式 |
|---|---|---|
| Topology drift | 规范说有实现仓库或路径，但实际不可解析、不可检查或不存在 | 现有 `project_topology`、module `implementation`、`validate --reality` 继续硬化 |
| Contract drift | 规范声明 redaction / contract / schema versioning，但实现证据缺失 | 下一步引入 implementation evidence |
| Evidence drift | 曾经有测试或 CI 证明，但证据过期、路径迁移或命令失效 | 下一步定义 freshness / checked_at / expected_signal |
| Behavioral drift | 实现行为偏离规范意图，但路径和测试仍存在 | 后续通过 conformance fixtures / golden cases / scenario benchmark 推进 |

## 当前基础

| 能力 | 当前状态 |
|---|---|
| Root topology | 已通过 `project_topology.implementation_repos[]` 表达 design repo 和 implementation repo |
| Module implementation linkage | 已通过 module `meta.implementation` / manifest summary 表达 `repo_id`、`paths`、`status`、`authority_surface`、`pr_refs` |
| Reality summary | `validate --reality` 已能输出 linked / unlinked / checked / missing / unchecked reason |
| Stable contract metadata | redaction、contract、schema_versioning 已有 schema / manifest mirror / validator gate |
| Source-first regression | 接手 review fix 已覆盖 stable metadata compile mirror 和 duplicate implementation repo id |

## 下一最小切片：implementation evidence

### 目标

让每个需要被验证的 stable / implementation-linked module 能声明一组证据，不依赖读者猜测“代码是不是已经满足规范”。

### 建议数据模型

| 字段 | 含义 | 最小约束 |
|---|---|---|
| `id` | evidence 本地标识 | module 内唯一 |
| `kind` | 证据类型 | `test`、`ci-check`、`fixture`、`exported-symbol`、`file-contract`、`manual-review` |
| `locator` | 证据位置 | repo-relative path、CI check name、symbol name 或 fixture path |
| `command` | 可选本地验证命令 | 默认只记录，不由 validator 任意执行 |
| `expected_signal` | 证据通过时应出现的信号 | exit code、test name、artifact exists、snapshot match |
| `freshness_policy` | 何时算过期 | `none`、`on-schema-change`、`on-contract-change`、`time-bound` |
| `status` | 当前证据状态 | `planned`、`current`、`stale`、`blocked` |
| `authority_surface` | 哪个规范段落拥有该证据声明 | 必填，避免游离证据 |

### Validator 最小规则

| 规则 | 级别 | 触发 |
|---|---|---|
| `implementation-evidence-required` | L2 | stable / adapter-facing / implementation-linked module 没有任何 evidence |
| `implementation-evidence-locator-exists` | L2 | `kind=test/fixture/file-contract` 且 locator 对应路径不存在 |
| `implementation-evidence-authority-surface-required` | L2 | evidence 没有 owner surface |
| `implementation-evidence-stale` | L3 或 L2 | evidence status 为 `stale`；是否阻断由 gate policy 决定 |
| `implementation-evidence-command-not-run` | L3 | evidence 有 command，但当前 validate 没有执行命令，仅提示它是 declared evidence |

## 推进顺序

| 顺序 | 任务 | 文件面 | 验收标准 |
|---:|---|---|---|
| 1 | 写 design boundary | `spec/stable-surface-contracts.json`、`spec/validation-rules.json` | 明确 evidence 是声明和可见性机制，不是任意代码执行器 |
| 2 | 加 schema | `schema/module.schema.json`、必要时 `schema/manifest.schema.json` | module meta 可声明 evidence；manifest summary 只保留计数 / status summary，避免 bootstrap 过重 |
| 3 | 加 validator | `lib/validate.mjs` | reality mode 能报告 modules with / without evidence、missing evidence locator、stale evidence |
| 4 | 加 source-first compile | `schema/authoring.schema.json`、`lib/compile.mjs`、`lib/corpus-helpers.mjs` | authoring source 能编译 evidence summary |
| 5 | 加 focused tests | `benchmarks/aods-eval-lab/test/scaffold.test.mjs` | negative tests 覆盖 missing evidence、missing locator、stale evidence |
| 6 | 更新 pilot example | `examples/compiled-pilot-source/authoring.json`、`examples/compiled-pilot/**` | 至少一个 module 展示 current evidence，一个 module 展示 planned / unchecked evidence |

## 非目标

- 不默认 clone 或 fetch 外部 repo。
- 不默认执行任意 evidence command。
- 不把 LLM 判断作为唯一证据。
- 不在 v0.8 最小切片中做完整 semantic behavior oracle。
- 不把 Polaris implementation 当作 AODS 必须绑定的唯一现实来源。

## 与 Polaris 的边界

AODS 可以定义代码漂移的规范语言和验证门禁；Polaris 可以选择把这些门禁接入自己的系统。但 AODS 的下一步目标是让任何项目都能声明 implementation evidence，而不是只为 Polaris 写专用集成。

## 完成后的价值

1. AODS 不只描述“应该是什么”，还描述“凭什么相信实现还跟得上”。
2. `validate --reality` 从 path existence 进入 evidence visibility。
3. GitHub issue `#43` remediation workflow、`#49` acceptance criteria、`#48` fixtures/golden export 后续可以接上同一条路线。
4. 未来行为漂移检测有稳定入口，不需要从一开始就设计庞大的代码理解系统。
