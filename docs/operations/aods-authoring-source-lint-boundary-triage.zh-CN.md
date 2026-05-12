# Authoring Source Lint Boundary Triage

任务：U-133
状态：已完成
日期：2026-05-12

## 目标

明确 source-first authoring lint 的可验证字段、非目标和候选 tests。当前不实现 style linter。

## 可验证边界

| 类型 | 当前可验证方式 | 判断 |
|---|---|---|
| authoring schema shape | compile 前 AJV schema | 已有 |
| compiled corpus validity | compile 后 validate | 已有 |
| semantic mirrors | compile builder + validator | 已有 |
| AOP content quality | compiled module validate | 已有 |
| route / touch discoverability | route command + docs audit | 已有 |
| changelog length ergonomics | 本轮 soft warning + hard limit | 已落地 |

## 不做的 lint

- 不做自然语言 rewrite。
- 不做全仓 markdown style linter。
- 不做外部 URL 抓取。
- 不做跨仓代码扫描。
- 不把 source-first authoring 改成必须依赖 runtime。

## 后续候选

| 候选 | 进入条件 |
|---|---|
| source-only negative fixtures | 当 schema / compile 边界再次出现回归 |
| authoring docs dead-link checker | U-142 后再判断 |
| AOP density regression | U-140 后再判断 |

## 结论

authoring lint 应继续以 schema、compile、validate 三段门禁为主。本轮新增 changelog delta warning 属于 authoring 体验修复，但不扩成通用 style linter。
