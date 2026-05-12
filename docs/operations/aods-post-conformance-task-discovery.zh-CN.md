# AODS post-conformance task discovery

状态：U-231 到 U-240 已完成
日期：2026-05-13
范围：上一轮质量复审、任务池扩展、公开状态只读复审、conformance schema / non-execution hardening、route sanity、coverage snapshot；不 merge、不 release、不 bump version、不创建 tag、不发布 npm、不关闭 issue、不抓外网、不新增 CI。

## 结论

上一轮提交 `e145b35` 复审通过：本地和远端一致，`npm run release:hygiene` 通过，PR `#63` ready 且 merge clean，GitHub 仍识别 20 个 close-on-merge issues。本轮在任务池清空后新增 U-231 到 U-270，并完成前 10 项。

## 本轮完成项

| 任务 | 结果 | 证据 |
|---|---|---|
| U-231 | 重新发现 post-conformance 后续任务池 | 本文件、task ledger U-241 到 U-270 |
| U-232 | 公开 issue 覆盖只读刷新 | open issues 仍为 24；其中 20 个由 PR close refs 覆盖，`#13/#41/#59/#60` deferred |
| U-233 | PR 状态只读刷新 | PR `#63` ready、merge clean、199 changed files、20 close refs、0 reviews |
| U-234 | conformance manifest/report schema 回归 | focused fixture test 新增 schema validation |
| U-235 | conformance manifest unknown property rejection | runner 对额外字段报 `conformance-manifest-property` |
| U-236 | conformance non-execution invariant extension | command-shaped property 被拒绝，marker file 未创建 |
| U-237 | route query sanity for drift/lifecycle terminology | `route --query "code drift lifecycle start begin task"` 返回 boot / surface governance / stable contract authority |
| U-238 | fixture / conformance coverage snapshot | fixture smoke 14 cases；conformance 4 cases、2 expected failures |
| U-239 | release hygiene rerun after hardening | `npm run release:hygiene` 通过 |
| U-240 | handoff / operations navigation sync | docs README、operations README、handoff、progress、round log 已同步 |

## 新任务池分段

| 阶段 | 任务 | 目标 |
|---|---|---|
| S29 | U-241 到 U-250 | 发布前 conformance / release closeout hardening |
| S30 | U-251 到 U-260 | package install、CI triage、terminology drift 和 glossary enforcement boundary |
| S31 | U-261 到 U-270 | conformance expansion、generated hygiene、skill release、post-merge / release execution readiness |

## 验证摘要

| 命令 | 结果 |
|---|---|
| `npm run release:hygiene` | pass |
| `node --test benchmarks/aods-eval-lab/test/fixture-conventions.test.mjs` | pass；10/10 |
| `npm run conformance:compiled-pilot -- --json` | pass；4 cases / 2 expected failures |
| `node ./bin/aods.mjs route . --query "code drift lifecycle start begin task" --json` | pass；route authority sanity 可解释 |

## 非目标

1. 不执行 PR merge、issue close、tag、GitHub Release、npm publish。
2. 不把 conformance runner 扩展成 arbitrary command executor。
3. 不新增 telemetry store、dashboard、remote fetch 或 cross-corpus resolver。
4. 不把 terminology drift 交给自然语言猜测；后续只做可验证边界和 fixture。
