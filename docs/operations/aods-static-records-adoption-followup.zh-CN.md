# AODS static records / adoption follow-up

日期：2026-05-13
范围：U-612 到 U-621

## 结论

本轮完成静态记录下一步、benchmark 生成摘要、发布包清单、公开文档密度和 fresh install adoption smoke 复核。

关键结果：

1. event correction 与 remote adapter mismatch 已有静态回归基础，下一步不急于扩大 schema；优先补 adoption / docs 边界。
2. workflow transition 与 policy decision 仍不够成熟，不应进入 fixture 或 validator。
3. benchmark executive summary 存在 post-release stale assessed version，已用 `npm run benchmark:summary` 从生成器刷新到 `0.9.0`。
4. fresh repo 从 `v0.9.0` 安装、compile、strict validate、route 均通过。

## 上轮质量复审

| 检查 | 结果 | 说明 |
|---|---|---|
| Git state | 通过 | `main` 与 `origin/main` 对齐，工作树仅 `MEMORY.md` 未跟踪 |
| Latest commit | 通过 | 最新提交为 `1a39f61 Document code drift validator hardening review` |
| Task ledger | 通过 | 当前默认任务为 U-612 到 U-621 |
| 返工项 | 无 | 上轮成果合格，直接进入本轮 |

## U-612 event correction static record next-slice review

已有覆盖：

- compiled pilot event correction graph；
- static correction target check；
- static supersession cycle check；
- source-first README no event store / no replay wording。

Decision：不新增 event store / replay / projection runtime；下一步如果继续推进，只补更窄的静态 invariant，例如 projection guidance required，而不是扩大 runtime surface。

## U-613 remote adapter mismatch static protocol next-slice

已有覆盖：

- adapter capability compatibility matrix；
- provider capability mismatch row；
- unsupported reason、fallback posture、degraded behavior、consumer action；
- `#64` 将 runtime/protocol negotiation 拆出为后续，不混入 metadata-first baseline。

Decision：继续 protocol-record-only。下一步如果推进，应先补 provider discovery / auth boundary / probing posture 的静态记录样例，不执行 adapter。

## U-614 workflow transition fixture entry criteria

当前不足：

- workflow transition static record 尚未进入 source-first example；
- guard refs、receipt refs、failure action 还没有稳定 artifact shape；
- 直接写 fixture 容易暗示 scheduler / workflow engine 已存在。

Decision：不进入 fixture。先定义静态 transition record shape，再考虑负例。

## U-615 policy decision fixture entry criteria

当前不足：

- policy decision static record 尚未进入 source-first example；
- actor / target / decision / evidence / audit 的字段边界仍是设计稿；
- 直接做 validator rule 容易变成 prose scanner 或暗示 policy engine。

Decision：不进入 fixture。先定义静态 decision record shape，再考虑负例。

## U-616 static records README consolidation decision

当前公开 README 已经很长：

| 文件 | 行数 |
|---|---:|
| `README.md` | 641 |
| `README.zh-CN.md` | 639 |

Decision：暂不把 static records 再塞进公开 README。后续如果需要公开采用说明，应新增短文档并从 README 链接，而不是继续扩长主 README。

## U-617 benchmark generated summary source audit after release

发现问题：`benchmarks/aods-eval-lab/reports/executive-summary-report.md` 的 assessed version 仍是 `0.7.0`，与当前 release `0.9.0` 不一致。

修复：运行 `npm run benchmark:summary`，由 `benchmarks/aods-eval-lab/src/summary.mjs` 重新生成：

- `benchmarks/aods-eval-lab/generated/results/benchmark-summary-results.json`
- `benchmarks/aods-eval-lab/generated/results/executive-summary-results.json`
- `benchmarks/aods-eval-lab/reports/benchmark-summary-report.md`
- `benchmarks/aods-eval-lab/reports/executive-summary-report.md`

结果：executive summary assessed version 更新为 `0.9.0`。生成器也刷新了 summary timestamp 与 previous-run window，这属于生成器当前行为。

## U-618 benchmark hosted cost language refresh decision

当前 hosted language 仍准确：

- hosted evidence 是 supplemental runtime evidence；
- hosted-vs-local inflation 主要集中在 tool-loop traffic；
- exact hosted loop decomposition 被明确标为 repeat-sensitive；
- successful hosted runs 为 3。

Decision：不改 README 文案。后续只有新增 hosted run 或改变 attribution logic 时再刷新。

## U-619 benchmark package artifact inventory sample update

`npm pack --dry-run --json` 当前结果：

| 字段 | 值 |
|---|---:|
| package | `aods@0.9.0` |
| entryCount | 61 |
| size | 224323 |
| unpackedSize | 1145320 |

Decision：本轮在 operations 记录 inventory snapshot，不新增 public sample。package surface allowlist 仍由 `npm run package:check-surface` 作为 gate。

## U-620 public docs density audit after v0.9

公开 README 已接近 640 行，继续追加长章节会降低采用效率。

Decision：

- 不在本轮拆分 README；
- 后续 troubleshooting / static records / failure-mode 内容应优先放入 `docs/` 或短专题，再从 README 链接；
- benchmark sync 区块仍只能从生成器维护。

## U-621 source-first adoption quickstart rerun from fresh repo

在全新临时目录中执行：

```sh
npm install --save-dev git+https://github.com/emosamastudio/aods.git#v0.9.0
./node_modules/.bin/aods compile ./node_modules/aods/examples/compiled-pilot-source/authoring.json ./compiled-pilot --force --strict --json
./node_modules/.bin/aods validate ./compiled-pilot --strict --json
./node_modules/.bin/aods route ./compiled-pilot --query "resource cleanup task lifecycle start" --intent read --stage orientation --json
```

结果：

| 检查 | 结果 |
|---|---|
| installed package version | `0.9.0` |
| compile status | `ok` |
| validate status | `pass` |
| route strategy | `query-route` |
| selected modules | `shift-ops-resource-surface`, `shift-ops-root`, `shift-ops-capsule` |

## 本轮验证

| 命令 | 结果 |
|---|---|
| `npm pack --dry-run --json` | pass，`aods@0.9.0`，61 entries |
| `npm run benchmark:summary` | pass，修复 executive summary assessed version |
| fresh repo install / compile / validate / route | pass |
| `wc -l README.md README.zh-CN.md docs/operations/README.md docs/README.md` | README density recorded |

## 下一步

下一轮默认 U-622 到 U-631：

1. 从 release source 验证 compiled-corpus adoption smoke；
2. 整理外部采用失败模式；
3. 判断 README troubleshooting 是否新增；
4. 审查 release branch/tag cleanup；
5. 判断 local MEMORY 是否压缩；
6. 判断 v0.9.1 / v0.10.0 命名和下一 owner go/no-go。
