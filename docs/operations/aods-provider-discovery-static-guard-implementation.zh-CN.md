# AODS provider discovery static guard implementation

日期：2026-05-13
范围：U-732 到 U-741
状态：完成

## 本轮结论

上一轮 final semantic candidate decisions 复审通过，无需返工。本轮按 source-first 规则落地 provider discovery 最小静态记录：只声明 provider discovery 元数据、证据引用和非执行边界，不做 provider lookup、auth exchange、network probing、provider ranking、fallback execution 或 adapter call。

## 实现清单

| 任务 | 结果 | 证据 |
|---|---|---|
| U-732 Provider discovery source-first preflight | 确认插入 `shift-ops-adapter-capability`，字段采用 provider discovery 草案最小集 | 本文 / source diff |
| U-733 Provider discovery positive source-first candidate | 在 `examples/compiled-pilot-source/authoring.json` 新增 `adapter-provider-discovery` section 和 `adapter-provider-discovery-table` artifact | `npm run compile:pilot` |
| U-734 Provider discovery generated output review | 生成差异只扩展 compiled pilot 的 README / manifest summary / adapter module | git diff review |
| U-735 Provider discovery missing evidence negative fixture | focused regression 复制 compiled pilot 并清空 `evidence_refs` | `route-validate-regression.test.mjs` |
| U-736 Provider evidence validator issue shape | 新增 deterministic rule `runtime-protocol-provider-evidence` 和 remediation | `lib/validate.mjs` |
| U-737 Provider discovery focused regression | 覆盖正例、缺 evidence 负例、network_enabled 负例 | focused test 5 tests pass |
| U-738 Provider discovery non-execution assertion | 新增 `runtime-protocol-provider-network-disabled`，要求 `network_allowed=false` | focused test / validate:compiled-pilot |
| U-739 Provider discovery docs wording after fixture | 只新增 operations 记录；暂不改 README quickstart | 本文 |
| U-740 Provider discovery package boundary after implementation | package surface 不变，仍不进 packaged docs sample / quickstart | package surface check entry_count=61 |
| U-741 Provider discovery `#64` progress sync after implementation | 已追加静态前置进展评论，不声明 runtime | `https://github.com/emosamastudio/aods/issues/64#issuecomment-4442371004` |

## 新增静态记录

Provider discovery table 字段：

| 字段 | 当前含义 |
|---|---|
| `provider_discovery_id` | 静态发现声明的稳定 id |
| `provider_id` | 被声明的 provider 身份，不从网络发现 |
| `capability_id` | 对应 capability |
| `discovery_source` | 当前为 `fixture`，表示静态证据来源 |
| `transport_scope` | 当前为 `none`，不打开网络边界 |
| `freshness_posture` | 当前为 `current` |
| `evidence_refs` | 静态证据锚点，不能为空 |
| `network_allowed` | 当前必须为 `false` |

## 验证规则

| Rule | Level | 触发条件 | Remediation action |
|---|---|---|---|
| `runtime-protocol-provider-evidence` | L2 | provider discovery row 缺 `evidence_refs` | `add-provider-discovery-evidence` |
| `runtime-protocol-provider-network-disabled` | L2 | provider discovery row 的 `network_allowed` 不是 `false` | `disable-provider-discovery-network` |

## 非目标

1. 不做 live provider lookup。
2. 不做 auth exchange。
3. 不探测 endpoint。
4. 不做 provider ranking。
5. 不执行 fallback。
6. 不调用 adapter。
7. 不进入 conformance suite。
8. 不扩大 package adoption surface。

## 验证

| 验证项 | 结果 |
|---|---|
| `npm run compile:pilot` | 通过 |
| `node --test benchmarks/aods-eval-lab/test/route-validate-regression.test.mjs` | 通过，5 tests |
| `npm run validate:compiled-pilot` | 通过，modules=11, sections=23, artifacts=27 |
| route query smoke | 通过，`runtime protocol provider discovery` 命中 `shift-ops-adapter-capability` 且 skipped=8 |
| GitHub sync | 已评论 `#64`：`https://github.com/emosamastudio/aods/issues/64#issuecomment-4442371004` |
| docs link check | 通过；markdown_files=211, missing_links=0 |
| package surface check | 通过；entry_count=61 |
| release hygiene | 通过；包含 docs links、security scan、package surface、package install smoke、generated clean、focused tests、validate:all |

## 下一轮建议

下一轮默认 U-742 到 U-751：进入 projection guidance coverage audit、missing guidance 负例设计、validator issue shape、focused regression、route/docs/package/conformance/public sync 决策和 retrospective。
