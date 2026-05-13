# AODS code drift validator hardening review

日期：2026-05-13
范围：U-602 到 U-611

## 结论

本轮没有新增验证器实现。上一轮提出的两个高风险回归点已经在当前代码和测试中闭环：

| 风险 | 当前结论 | 证据 |
|---|---|---|
| duplicate implementation repo id | 已有 L2 validator coverage，不需要再补实现 | `implementation-repo-id-unique`、focused scaffold regression |
| stable contract metadata mirror | compiler / validator / source-first regression 已覆盖 redaction、contract、schema_versioning | `buildManifestRedaction`、`buildManifestContract`、`buildManifestSchemaVersioning`、focused scaffold regression |

更高价值的后续路线不是重复实现已有规则，而是继续推进静态记录和外部采用 smoke。

## U-602 duplicate implementation repo id regression review

`project_topology.implementation_repos[].id` 已经具备身份唯一性检查：

- validator：`lib/validate.mjs` 中 `implementation-repo-id-unique` 以 L2 issue 报告重复 id。
- spec：`spec/validation-rules.json` 已记录该规则。
- regression：`benchmarks/aods-eval-lab/test/scaffold.test.mjs` 覆盖 duplicate implementation repo ids。

Decision：不新增实现。

## U-603 contract metadata mirror regression audit

source-first compiler 已将稳定 contract metadata family 映射到 `manifest.modules[]`：

- `meta.redaction` -> manifest module redaction summary
- `meta.contract` -> manifest module contract summary
- `meta.schema_versioning` -> manifest module schema_versioning summary

validator 已覆盖 mirror required / mirror match / sensitive completeness / read-model freshness 等路径，source-first regression 已覆盖 compile 与 validate 两侧。

Decision：不新增实现。

## U-604 lifecycle alias terminology drift fixture revisit

`start` vs `begin` 这类错误可以通过结构化术语引用检测，但只在作者把术语绑定写入 `term_refs[]` 时成立。

当前可检测范围：

- canonical term：`task-lifecycle-start`
- alias：`begin`
- deprecated term：`task-begin`
- machine refs：必须使用 canonical term id，不能使用 alias。

当前不可检测范围：

- 自由正文里写错 `begin`，但没有 `term_refs[]` 绑定。
- 需要自然语言理解才能判断上下文的术语漂移。

Decision：保持结构化引用路线，不做全文 prose scanner。

## U-605 deprecated-term strict sample refresh

临时 smoke 将一个 source-first `term_refs[].term_id` 从 `task-lifecycle-start` 改为 `task-begin`，编译后运行 strict validate，结果为：

```json
{
  "status": "fail",
  "exit_status": 1,
  "warning_rules": [
    "term-ref-deprecated-stable"
  ]
}
```

这说明 deprecated term 先作为 warning 报告，在 strict gate 下会阻断发布。

Decision：暂不新增公开样例。当前 public docs 已说明 canonical refs，测试和 smoke 足以证明 strict behavior。

## U-606 route query coverage after structured term refs

根 corpus route query：

```sh
node ./bin/aods.mjs route . --query "structured term refs glossary alias deprecated lifecycle terminology start begin" --intent read --stage orientation --json
```

结果命中 `spec-validation` 与 `spec-authority-governance`，能把 glossary / alias / deprecated / lifecycle 路由到正确治理面。

compiled pilot route query：

```sh
node ./bin/aods.mjs route ./examples/compiled-pilot --query "task lifecycle start begin glossary alias deprecated term refs" --intent read --stage orientation --json
```

结果主要命中 root / capsule / readiness read-model。原因是 compiled pilot 示例以业务入口和 summary routing 为主，不承载完整规范术语治理语义。

Decision：根 corpus coverage 足够；compiled pilot 不为 glossary governance 建专门 route。

## U-607 evidence freshness post-release fixture gap audit

已有覆盖：

- time-bound implementation evidence missing review metadata；
- expired evidence warning；
- issue location envelope；
- public JSON sample：`docs/examples/validate-issue-location.sample.json`。

Gap：当前 freshness 仍更适合作为 validator regression 和 short sample，而不是 conformance case。conformance case 只有在外部消费者需要 expected-warning fixture 语义时再提升。

Decision：不新增 fixture。

## U-608 validation JSON issue contract stability audit

当前 JSON issue contract 的稳定字段包括：

- `level`
- `module_id`
- `sid`
- `location`
- `rule`
- `message`
- `path`
- rule-specific fields such as `evidence_id`
- `remediation` where available

`docs/examples/validate-issue-location.sample.json` 仍是合适的短 public sample。它保留 location / remediation shape，不把完整 validator report 扩成大样例。

Decision：不刷新 public sample。

## U-609 conformance report public sample refresh decision

`npm run conformance:compiled-pilot -- --json` 当前输出：

- suite status：`pass`
- cases：5
- expected failures：2
- issues：0

conformance report schema 和 report shape 已由 `fixture-conventions.test.mjs` 覆盖。当前 public README 已给出命令和 expected-failure 语义，不需要新增长 JSON 样例。

Decision：不刷新 public conformance sample。

## U-610 fixture smoke package boundary audit

验证结果：

- `npm run fixture:smoke -- --json`：15 fixtures，10 positive，5 negative，10 golden exports，status pass。
- `npm run package:check-surface -- --json`：entry_count=61，missing=[]，unexpected=[]。
- `npm run security:scan-placeholders -- --json`：scanned_files=992，hits=0。

Decision：fixture smoke inputs remain package-safe；无 secrets / unexpected package surface。

## U-611 migration dry-run helper promotion gate review

migration dry-run helper 当前只在 benchmark 侧存在：

- static report fixture；
- helper rejects executor-shaped fields；
- no CLI command；
- no database connection；
- no package adoption docs promotion。

`migration-dry-run-report.test.mjs` 通过，说明它仍是静态报告 helper，不是 migration executor。

Decision：继续隐藏在 benchmark-only 范围；不进入 package docs。

## 验证命令

| 命令 | 结果 |
|---|---|
| `node --test benchmarks/aods-eval-lab/test/scaffold.test.mjs benchmarks/aods-eval-lab/test/example-packs.test.mjs benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs benchmarks/aods-eval-lab/test/migration-dry-run-report.test.mjs` | pass，65 tests |
| `npm run fixture:smoke -- --json` | pass |
| `npm run conformance:compiled-pilot -- --json` | pass |
| `npm run package:check-surface -- --json` | pass |
| `npm run security:scan-placeholders -- --json` | pass |
| deprecated term strict temp smoke | pass，strict validate fails on `term-ref-deprecated-stable` |

## 下一步

下一轮应进入 U-612 到 U-621：

1. event correction static record next-slice review；
2. remote adapter mismatch static protocol next-slice；
3. workflow / policy fixture entry criteria；
4. static records README consolidation；
5. benchmark generated summary and hosted cost language audit；
6. source-first / compiled-corpus adoption smoke。
