# AODS Public Issue Close-On-Merge Audit

状态：U-098 已完成
日期：2026-05-12
范围：PR body close-on-merge issue 与本地覆盖矩阵审查；不提前关闭 issue

## 结论

PR `#63` 的 close-on-merge 列表与此前 public sync 目标一致。本轮没有关闭任何 issue。当前 PR 仍为 draft，所有 covered issue 仍保持 open，等待 PR merge 后由 GitHub 自动关闭。

## PR Body Audit

| 类别 | PR body 当前声明 | 本轮判断 |
|---|---|---|
| Close-on-merge | `#33/#35/#37/#38/#39/#43/#44/#45/#46/#47/#48/#49/#50/#51/#52/#54/#55/#56/#57/#58` | 与本地覆盖矩阵一致 |
| Deferred refs | `#41/#59/#60/#13` | 保持 open 正确 |
| Release position | no new release; package dry-run still `aods-0.7.0.tgz` | 与当前 version / release gate 一致 |
| Validation block | release self-check、pack dry-run、validate、diff hygiene | 需要随本轮新证据后续更新 PR body，但本轮不直接改 PR |

## Covered Issue Matrix

| Issue | 覆盖理由 | Merge 后动作 |
|---|---|---|
| `#33` | command / receipt / event triad boundary and examples | auto-close |
| `#35` | read-model freshness / watermark plus example and evidence hygiene | auto-close |
| `#37` | lifecycle state-machine metadata boundary | auto-close |
| `#38` | decision provenance and citation refs | auto-close |
| `#39` | correction / supersession boundary and event example | auto-close |
| `#43` - `#52` | remediation、risk、audit、exposure、known-gap、fixture、acceptance、authority、dependency、migration boundaries | auto-close |
| `#54` - `#58` | docs density、sync quality、canonical examples、glossary、external citation coverage | auto-close |

## Deferred Issue Matrix

| Issue | 保持 open 原因 | 后续路线 |
|---|---|---|
| `#41` | full capability handshake / discovery / auth / fallback ranking 未实现 | later adapter protocol planning |
| `#59` | full observability runtime / dashboard 未实现 | validation/routing observability follow-up |
| `#60` | umbrella roadmap tracker | roadmap remains open |
| `#13` | changelog.delta ergonomics 有效但不阻塞 release | U-134 / U-135 |

## Decision

Close-on-merge audit pass。不得在 PR merge 前手动关闭 covered issues；不得把 deferred issues 加入 close list。
