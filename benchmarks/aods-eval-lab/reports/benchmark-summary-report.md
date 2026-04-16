# Benchmark summary

## Run window

- Current evaluation: **2026-04-16T05:11:16.486Z**
- Previous evaluation: **2026-04-16T04:14:34.533Z**

## Metric delta table

| Category | Metric | Current | Previous | Delta vs previous | Reading |
| --- | --- | --- | --- | --- | --- |
| objective | Lifecycle phase coverage | 100.0% | 100.0% | +0.0 pts | flat |
| objective | Fact preservation rate | 100.0% | 100.0% | +0.0 pts | flat |
| objective | AODS exact corpus bytes | 68543 bytes | 68543 bytes | +0 bytes | flat |
| objective | Objective touch-route hit rate | 100.0% | 100.0% | +0.0 pts | flat |
| objective | Objective median loaded bytes | 14022 bytes | 14022 bytes | +0 bytes | flat |
| objective | Objective median prompt-envelope bytes | 15555 bytes | 15555 bytes | +0 bytes | flat |
| objective | Built-in drift recall | 100.0% | 100.0% | +0.0 pts | flat |
| objective | Built-in false-positive rate | 0.0% | 0.0% | +0.0 pts | flat |
| supplemental | External sample corpus count | 3 | 3 | +0 | flat |
| supplemental | External sample scenario count | 17 | 17 | +0 | flat |
| supplemental | Task stage coverage | 100.0% | 100.0% | +0.0 pts | flat |
| supplemental | Runtime request-body bytes | n/a | n/a | n/a | no prior baseline |
| advisory | Exploratory query precision | 83.3% | 83.3% | +0.0 pts | flat |

## Interpretation

- Objective metrics should be read as the main regression gate.
- Supplemental metrics are real-runtime or profile-specific signals that add realism but are not yet universal scoreboard entries.
- Advisory metrics help guide optimization, but they should not override objective regressions.
