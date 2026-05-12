# Missing Reality Locator Remediation Plan

任务：U-107
状态：已完成
日期：2026-05-12

## 目标

定义 unresolved / unchecked implementation repo locator 的最小修复路线。修复路线只处理 locator 与本地 repo root 的关系，不自动拉取 sibling repo，也不猜测远端默认分支。

## 当前 Reality 摘要

| 项 | 当前值 |
|---|---:|
| linked modules | 8 |
| unlinked modules | 0 |
| checked paths | 0 |
| missing paths | 0 |
| evidence total | 14 |
| checked evidence locators | 0 |
| missing evidence locators | 0 |

当前 `unchecked_reason`：

| repo id | locator | reason |
|---|---|---|
| `shift-ops-control-plane` | `example/shift-ops-control-plane` | locator path does not exist under `--repo-root` |
| `shift-ops-worker` | `example/shift-ops-worker` | locator path does not exist under `--repo-root` |

## Remediation Order

| 步骤 | 动作 | 通过条件 |
|---|---|---|
| 1 | 确认 locator 类型：相对路径、远端 URL、描述性占位 | 类型明确，不混用 |
| 2 | 若应本地解析，准备包含实现仓库的 `--repo-root` | locator 在 repo root 下可解析 |
| 3 | 若是远端 URL，保留 unchecked，不尝试 fetch | report 明确 remote locator cannot be resolved |
| 4 | 若是描述性占位，改成明确相对路径或远端 URL | 不再让读者误以为已验证 |
| 5 | 跑 reality validation | checked paths / missing paths / unchecked reason 与预期一致 |
| 6 | 更新 evidence / acceptance report | 不隐藏 unresolved 状态 |

## 最小命令

```bash
node ./bin/aods.mjs validate ./examples/compiled-pilot --strict --reality --json
node ./bin/aods.mjs validate ./examples/compiled-pilot --strict --reality --repo-root <repo-root>
```

## 错误处理

| 现象 | 处理 |
|---|---|
| relative locator 不存在 | 不修 evidence；先修 `implementation_repos[].locator` 或准备正确 `--repo-root` |
| remote locator | 不算 missing path；保持 unchecked 并交给 owner 确认 |
| evidence locator missing | 修 evidence locator 或恢复实现仓库路径 |
| implementation path escaping repo root | 阻断；locator/path 必须收敛在 linked repo root 内 |

## 非目标

- 不拉取、clone、fetch、checkout sibling repo。
- 不把 unchecked 当作 pass evidence。
- 不把 remote URL 改成本地路径，除非 owner 明确给出本地 repo root 布局。
