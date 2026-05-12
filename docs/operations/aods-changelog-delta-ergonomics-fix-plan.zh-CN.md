# Changelog Delta Ergonomics Fix Plan

任务：U-134
状态：已完成
日期：2026-05-12

## 目标

复审 `#13` 的 pain、schema options、migration risk 和 test plan，决定是否进入最小实现。

## Pain

原 300 字符硬限制能强迫简洁，但对 release notes 级别的变更摘要过紧。实际风险不是“不能写长文”，而是长一点的有效摘要会被 schema 直接拦截，导致维护者为了过 schema 牺牲可读性。

## Options

| 方案 | 优点 | 风险 | 判断 |
|---|---|---|---|
| 保持 300 hard limit | 简洁 | 继续卡 release workflow | 放弃 |
| 500 hard limit | 简单 | 可能让 delta 变散 | 可接受但需提醒 |
| 300 warning + 500 hard fail | 兼顾简洁和实用 | 需要 validator warning | 采用 |
| array / structured delta | 表达力强 | 扩成 changelog framework | 暂不做 |

## Test Plan

| case | 期望 |
|---|---|
| 350 字符 | 普通 compile pass，validate JSON 有 L3 warning/remediation |
| 350 字符 strict compile | fail，目标目录不写入 |
| 501 字符 | schema fail，message 显示 received length |

## 结论

采用 300 soft warning + 500 hard fail。这个方案足以缓解 `#13`，不把 changelog 变成独立框架。
