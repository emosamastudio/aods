# AODS Adoption Ergonomics Hardening

日期：2026-05-13
回合：R-2026-05-13-46
范围：U-632 到 U-641

## 上轮质量复审

| 检查 | 结论 | 证据 |
|---|---|---|
| Git 状态 | 通过 | `main` 与 `origin/main` 对齐；仅 `MEMORY.md` 本地未跟踪 |
| 最新提交 | 通过 | `bb98572 Record adoption closeout and next task pool` |
| 台账指针 | 通过 | 当前默认任务为 U-632 到 U-641 |
| 返工需要 | 无 | 上轮 adoption closeout / next pool 成果可继续承接 |

## 本轮完成

| 任务 | 决策 / 结果 | 证据 |
|---|---|---|
| U-632 README troubleshooting short page implementation | 不扩写主 README；新增短 troubleshooting 页并从中英文 README 链接 | `docs/adoption-troubleshooting.md` |
| U-633 External adoption quickstart doc split | source-first 与 compiled-corpus adoption 拆到独立短页 | `docs/adoption-quickstart.md` |
| U-634 Compiled corpus smoke package sample docs | 记录 package 内 compiled-pilot validate / route 最小样例 | `docs/adoption-quickstart.md` |
| U-635 Release source archive validation script decision | 本轮不新增脚本；保留人工 release-tag/source smoke 路径，后续 U-679 再评估自动化 | 本文 |
| U-636 CLI version ergonomics review | 新增 `aods --version`、`aods -v`、`aods version`，帮助采用者快速确认安装版本 | `bin/aods.mjs` / focused regression |
| U-637 npm publish criteria packet refresh | npm publish 仍不执行；前置条件为 owner 明确授权、npm token、dry-run、install smoke、rollback packet | 本文 |
| U-638 Installed skill refresh owner action packet | installed skill 更新保持 owner action；不自动覆盖本机已安装 skill | 本文 |
| U-639 Docs examples package inclusion revisit | `docs/examples/` 继续不进入 npm package；package surface 仍为 allowlist 管控 | `npm run package:check-surface -- --json` |
| U-640 Conformance public sample minimal doc decision | 不新增完整 JSON 样例；quickstart 只保留最小命令，避免公开文档膨胀 | `docs/adoption-quickstart.md` |
| U-641 Compiled-corpus validation troubleshooting sample | 补 normal validation 与 reality validation 的区别和命令 | `docs/adoption-troubleshooting.md` |

## 发布 / 本地动作边界

| 动作 | 本轮结论 | 理由 |
|---|---|---|
| npm publish | 不执行 | 当前 release 仍以 GitHub tag install 为权威路径；npm publish 需要独立 owner gate |
| release archive validation script | 不新增 | 已有 release-tag/source smoke 记录；脚本化收益留到 U-679 统一评估 |
| installed skill overwrite | 不执行 | repo skill 与 installed skill 同步属于本地 owner action，不在仓库提交中修改用户安装态 |
| package docs expansion | 不扩大 | adoption docs 面向仓库/README 链接；npm package surface 不因操作文档扩张 |

## 验证记录

| 验证项 | 命令 | 结果 |
|---|---|---|
| CLI version + scaffold regression | `node ./bin/aods.mjs --version && node ./bin/aods.mjs version && node --test benchmarks/aods-eval-lab/test/scaffold.test.mjs` | 通过 |
| Docs links | `npm run docs:check-links -- --json` | 通过 |
| Package surface | `npm run package:check-surface -- --json` | 通过 |

## 后续建议

下一轮默认进入 U-642 到 U-651：provider discovery、auth boundary、probing posture、provider selection、fallback policy、adapter handshake、`#64` status decision、runtime/protocol negative fixture sort、package boundary 和 schema gate decision。仍坚持 static-record-first，不做 live discovery、auth exchange、provider calls、adapter execution 或 fallback executor。
