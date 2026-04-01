# 开发说明（对照 `docs/prompt.md`）

本文对应需求文档中的：开发步骤、技术选型、关键模块逻辑、整合与测试思路及优化方向。

## 1. 开发步骤（建议顺序）

1. 搭建后端 Flask：抽牌无放回、正逆位随机、解读拼接；提供 `GET /api/cards`、`POST /api/draw`。
2. 搭建前端 Vite + React + TypeScript，配置 `/api` 代理到 Flask。
3. 实现 3D 仪式场景（React Three Fiber）：远景背板、粒子与轨道牌、中心牌阵、飞牌翻面与后处理光晕。
4. 实现落地页与结果页（HTML/CSS）：问题输入、牌阵选择、明显的主按钮；结果区**依次**展示各单牌解读再展示综合指引。
5. 联通前后端与错误处理；编写后端 `pytest`；前端 `npm run build` / `eslint` 通过。

## 2. 技术选型

| 层级 | 选型 | 说明 |
|------|------|------|
| 前端框架 | React 19 + Vite | 组件化 UI 与快速 HMR |
| 3D | Three.js + `@react-three/fiber` + `@react-three/drei` | 满足 prompt 中 Three.js 立体牌阵要求 |
| 动效 | GSAP | 飞牌与翻面时间轴 |
| 后处理 | `@react-three/postprocessing` | Bloom / 轻微色散与暗角，增强质感 |
| 后端 | Flask + flask-cors | 轻量 API，与 prompt 中 Python 建议一致 |
| 数据 | `major_arcana.json` | 22 张大阿尔卡那结构化存储 |

## 3. 关键模块逻辑

- **抽牌**（`backend/services/draw.py`）：`random.sample` 无放回；每张独立随机正/逆位；可选 `seed` 便于测试复现。
- **解读**（`backend/services/reading.py`）：按牌 id 取元数据，正逆位对应不同文案；综合指引由关键词去重与模板句生成。
- **前端流程**（`frontend/src/hooks/useDrawFlow.ts`）：`landing → ceremony → reveal → result`；进入仪式前 `POST /api/draw` 获取牌面与文案。
- **依次呈现**（`frontend/src/components/ui/ResultPanel.tsx`）：用定时器按序增加 `revealStep`，单牌区块与「综合指引」分段显现。

## 4. 整合与测试思路

- **本地联调**：终端 A 运行 `python app.py`（端口 5000），终端 B `npm run dev`（Vite 代理 `/api`）。
- **随机性**：`POST /api/draw` 带相同 `seed` 应得到相同牌序与正逆；`pytest` 中已覆盖。
- **解读内容**：断言 `per_card` 条数与请求牌数一致，且含 `interpretation` / `synthesis` 非空字段。
- **交互**：手动走查单牌与三牌流程；结果页观察单牌是否按序出现后再出现综合指引。

## 5. 优化方向

- 为每张牌提供统一尺寸的 PNG/SVG 牌面资源，替换当前切图 + Canvas 合成方案。
- 引入 Playwright 做关键路径 E2E（抽牌至结果页）。
- 生产环境使用 gunicorn/uwsgi 部署 Flask；前端 `npm run build` 静态资源由 CDN 或 Nginx 托管。
- 按需降低粒子数量或关闭部分后处理以适配低端移动设备。
