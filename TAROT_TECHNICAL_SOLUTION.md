# 3D 塔罗牌应用项目技术方案

## 1. 项目总体架构设计与模块划分
本项目采用前后端分离架构，结合 3D 渲染技术与智能解牌算法，整体划分为四层：
- **前端 3D 渲染层**：负责 3D 场景构建、模型加载、光影渲染、相机控制及用户交互反馈。
- **API 服务层**：处理业务逻辑、用户认证、抽牌会话管理，并提供网关路由与协议转换。
- **数据层**：持久化存储用户信息、历史记录、塔罗牌元数据及系统配置，辅以内存数据库进行高频缓存。
- **算法层**：独立的服务或模块，负责基于加密安全伪随机数生成器（CSPRNG）的抽牌算法、正逆位概率控制、牌阵组合语义匹配与解读模板生成。

**模块划分**：
- `Tarot-Core-Engine`：抽牌与解牌核心算法库。
- `Tarot-3D-Client`：前端用户界面与 WebGL 渲染引擎。
- `Tarot-API-Gateway`：后端业务接口与 WebSocket 推送服务。
- `Tarot-Admin-Panel`：后台管理（牌意配置、用户管理、监控大盘）。

---

## 2. 前端技术选型细节与 3D 实现步骤
**技术选型**：
- **3D 引擎**：Three.js (r150+) 配合 React Three Fiber (R3F)，提供声明式 3D 开发体验。
- **WebGL 兼容性方案**：检测 WebGL2 支持情况，若不支持则降级为 Canvas 2D CSS 3D 翻转效果；使用 `WebGLRenderer.capabilities` 进行硬件检测。
- **响应式布局**：Tailwind CSS + CSS Modules，实现移动端优先（Mobile-First）的自适应布局。
- **动画库**：GSAP（复杂时序动画） + Framer Motion（UI 转场与基础交互）。
- **状态管理**：Zustand（轻量级、无样板代码，适合管理 3D 与 UI 共享状态）。
- **PWA 配置**：Vite PWA Plugin，配置 `manifest.json` 与 Service Worker 实现离线缓存与桌面安装。

**3D 塔罗牌阵立体展示实现步骤**：
1. **模型加载**：使用 `useGLTF` 加载经过 Draco 压缩的低模塔罗牌模型，复用 Geometry 与 Material 降低内存占用。
2. **光照设置**：主光源使用 `DirectionalLight` 投射柔和阴影，辅以 `AmbientLight` 保证暗部细节，增加 `PointLight` 在牌阵中央营造神秘氛围。
3. **相机控制**：使用 `OrbitControls`，限制 `minPolarAngle` 和 `maxPolarAngle` 防止穿模，限制缩放范围，确保视角聚焦于牌阵。
4. **牌阵排列算法**：根据所选牌阵（如凯尔特十字），预定义各卡牌的 `(x, y, z)` 坐标与 `Euler` 旋转角，入场时使用 GSAP 进行平滑插值过渡（Stagger 动画）。
5. **交互事件绑定**：通过 R3F 的 `onClick` 和 `onPointerOver` 封装底层 Raycaster，实现卡牌悬停高亮（OutlinePass 后期处理）与点击翻转事件。

---

## 3. 后端技术选型细节
**技术选型**：
- **框架对比与选择**：
  - Node.js (NestJS)：TypeScript 全栈优势，高并发 IO 性能好，适合 WebSocket 实时推送。
  - Python (FastAPI)：异步支持极佳，自动生成 OpenAPI 文档，极易集成 NLP 或深度学习解牌算法。
  - **最终决定**：采用 **Python FastAPI** 作为核心 API 框架，兼顾高并发与后续 AI 算法的无缝接入。
- **接口规范**：核心抽牌/解牌使用 **RESTful**，历史记录与复杂关联查询使用 **GraphQL**。
- **部署方案**：使用 Uvicorn (ASGI) + Gunicorn 作为进程管理器，提供高并发异步处理能力。
- **数据库选型**：PostgreSQL（存储用户与关系数据，JSONB 字段存储动态牌阵配置） + Redis（缓存解牌模板与会话防抖）。
- **环境隔离**：基于 Docker 容器化，划分 `dev`、`staging`、`prod` 环境，使用 `.env` 与 AWS Parameter Store/阿里云 KMS 管理密钥。
- **CI/CD 流水线**：GitHub Actions 触发 -> 静态代码扫描 (SonarQube) -> 单元测试 -> 构建 Docker 镜像 -> 推送至 Harbor/ECR -> 触发 ArgoCD 或直接部署至 Kubernetes 集群。

---

## 4. 22 张大阿尔卡那牌数据结构规范与 JSON Schema
**数据规范**：
包含唯一 ID、中英文牌名、编号、正逆位关键词、象征符号、牌面描述、多维度释义（情感/事业/财富）、综合建议、图片 URL 及版权信息。

**JSON Schema 定义**：
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "string", "description": "唯一标识，如 arcana_0" },
    "name_zh": { "type": "string", "description": "中文牌名，如 愚者" },
    "name_en": { "type": "string", "description": "英文牌名，如 The Fool" },
    "number": { "type": "integer", "minimum": 0, "maximum": 21 },
    "keywords": {
      "type": "object",
      "properties": {
        "upright": { "type": "array", "items": { "type": "string" } },
        "reversed": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["upright", "reversed"]
    },
    "symbols": { "type": "array", "items": { "type": "string" } },
    "description": { "type": "string" },
    "meanings": {
      "type": "object",
      "properties": {
        "love": { "type": "string" },
        "career": { "type": "string" },
        "wealth": { "type": "string" }
      },
      "required": ["love", "career", "wealth"]
    },
    "advice": { "type": "string" },
    "image_url": { "type": "string", "format": "uri" },
    "copyright": { "type": "string" }
  },
  "required": ["id", "name_zh", "name_en", "number", "keywords", "meanings", "advice", "image_url"]
}
```

---

## 5. 牌阵解读算法设计
- **随机抽牌种子策略**：采用操作系统级熵源（Python `secrets` 模块），避免使用可预测的伪随机（如 `random`），确保玄学应用的“随机纯粹性”。
- **正逆位概率控制**：默认 50/50，可通过配置文件动态调整（如某些牌阵设定 70% 正位概率）。
- **牌阵类型配置**：定义牌阵图谱（Graph），节点代表卡牌位置及含义（如“过去”、“现在”、“未来”）。
- **单牌权重计算**：基于卡牌在牌阵中的位置赋予权重（核心位置权重 1.5，辅助位置 0.8）。
- **组合语义匹配**：维护一个“牌组反应字典”（如“塔”+“死神”触发剧变语义），通过规则引擎提取组合特征。
- **解读模板渲染**：使用 Jinja2 模板引擎，结合单牌释义、组合语义及用户问题领域（如问感情，则只抽取 `meanings.love`），动态生成解读文案。
- **缓存策略**：对于不带个性化问题且抽到相同组合的牌阵，结果通过 Redis 缓存（TTL 24小时）。
- **可解释性日志**：记录随机数种子、抽牌时间戳、触发的语义组合规则至 ELK 堆栈，便于后期算法调优与客诉排查。

---

## 6. 交互流程原型
1. **问题输入校验**：前端对用户输入问题进行长度（5-100字）与敏感词校验。
2. **抽取触发防抖**：点击“开始洗牌”后禁用按钮 3 秒，防止连续点击触发多次 API 请求。
3. **抽牌动画时序**：洗牌动画（1.5s） -> 牌堆展开（1s） -> 等待用户点击选中 N 张牌 -> 选定后飞入对应牌阵位置。
4. **单牌翻转 3D 效果**：点击牌背，触发基于 Y 轴的 180 度翻转动画（GSAP Tween），同时配合光效扫过牌面。
5. **解读区域渐进式加载**：卡牌翻开后，下方解读文本呈现打字机效果（Typewriter effect）渐进式出现。
6. **语音播报可选开关**：接入 Web Speech API，提供合成语音朗读解牌结果功能。
7. **历史记录本地存储**：抽牌结果同步存入 IndexedDB / LocalStorage，支持离线回看。
8. **分享卡片生成**：使用 `html2canvas` 截取 3D Canvas 与解读文本区域，生成带有专属二维码的精美海报图。

---

## 7. 前后端整合步骤
- **跨域配置**：后端配置 CORS 策略，严格限制 `Allow-Origins` 为前端生产域名及开发 `localhost`。
- **HTTPS 证书**：使用 Nginx + Certbot 自动签发并续签 Let's Encrypt 证书，强制 HTTP 跳转 HTTPS。
- **WebSocket 实时推送**：建立 Socket 连接，后端在洗牌/解牌高耗时任务完成时，向前端推送事件进度（如 `shuffle_done`, `interpretation_ready`）。
- **前端部署**：Vite 构建产物部署至 Vercel 或 Nginx 静态目录。
- **CDN 缓存策略**：对 3D 模型（.gltf, .bin）、纹理贴图配置长达 1 年的强缓存（Cache-Control: max-age=31536000），文件名带 Hash。API 请求配置 no-cache。
- **灰度发布方案**：利用 Nginx 或 API 网关的流量拆分功能，按用户 Header 或 Cookie 比例（如 10%）将请求路由至新版本服务。

---

## 8. 功能测试计划
- **单元测试**：使用 Jest (前端) 和 Pytest (后端)，要求核心逻辑（算法、数据流）覆盖率 ≥ 85%。
- **随机性检验**：编写 Python 脚本模拟 10 万次抽牌，进行卡方检验（Chi-square test），验证每张牌及正逆位出现的概率是否符合均匀分布（p-value > 0.05）。
- **语义一致性评审**：人工抽测 50 组常见牌阵，由领域专家评估算法生成的解牌文案是否通顺、逻辑是否自洽。
- **3D 渲染性能基准**：在 Chrome DevTools Performance 面板测试，主流中端手机需稳定在 60 FPS，Draw Calls 控制在 50 以内。
- **Lighthouse 评分**：目标 Performance, Accessibility, Best Practices, SEO 均 ≥ 90。
- **无障碍访问**：满足 WCAG AA 级别，为 3D Canvas 提供 `aria-label` 替代文本，支持键盘 `Tab` 键导航。
- **安全渗透测试**：使用 OWASP ZAP 扫描，修复 SQL 注入、XSS、CSRF 等 TOP 10 漏洞。

---

## 9. 性能与体验优化方向
- **WebGL 内存监控**：监听路由切换，及时调用 `geometry.dispose()` 和 `material.dispose()`，防止显存泄漏。
- **懒加载与分包**：使用 React `lazy` 和 `Suspense` 按需加载非核心组件；3D 资源使用分发式加载（先显示占位骨架屏）。
- **SSR/SSG 混合渲染**：若采用 Next.js，对塔罗牌科普百科页使用 SSG，对个人历史记录使用 SSR/CSR。
- **边缘函数降延迟**：将用户鉴权与基础防抖逻辑部署至 Edge Functions（如 Vercel Edge），降低 TTFB 延迟。
- **模型压缩**：使用 Draco 压缩算法将 `.gltf` 体积缩减 70% 以上，纹理使用 WebP/KTX2 格式。
- **国际化 (i18n)**：基于 `i18next` 提取所有解牌文案与 UI 文本，支持中英双语无缝切换。
- **个性化推荐**：基于用户历史提问标签，推荐适合的特定牌阵（如“近期频繁问感情，推荐维纳斯牌阵”）。
- **A/B 实验框架**：接入 PostHog 或自建 A/B 测试逻辑，验证不同翻牌动画时序对用户停留时长的影响。

---

## 10. 交付清单
1. **源码仓库**：前端、后端、算法模块的 Git 仓库（含完整 Commit 记录与 README）。
2. **API 文档**：基于 Swagger/Redoc 自动生成的在线交互式接口文档。
3. **3D 素材版权证明**：所有模型、贴图、UI 切图的开源协议说明或商业授权证书。
4. **测试报告**：包含单元测试覆盖率报告、卡方检验结果图表、性能基准测试报告。
5. **部署手册**：Docker Compose / K8s 部署脚本及详细的灾备恢复操作指南。
6. **运维监控**：Prometheus + Grafana 监控 Dashboard 配置文件（含 CPU、内存、API 响应时间大盘）。
7. **隐私合规**：符合 GDPR 及国内《个人信息保护法》的用户隐私声明与数据合规处理文档。
