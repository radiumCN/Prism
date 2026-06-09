## Development Plan — ModelHub

**Task**: 构建 ModelHub AI 模型聚合平台，覆盖后端 Go/Gin API、数据库迁移、AI 适配器（OpenAI/Claude/Gemini）、前端 Next.js 对话/绘图/管理界面。

**相关技能与规则**：
- `karpathy-guidelines` — 最小化改动，先定义验证标准，逐步推进，避免过度抽象
- `x-components` — 使用 Bubble.List / Sender / Conversations / XProvider 构建对话 UI
- `x-chat-provider` — 自定义 Chat Provider 将后端 SSE 流式接口适配为 Ant Design X 标准格式
- `use-x-chat` — 使用 useXChat + useXConversations 管理消息与多会话状态
- `frontend-design` — 玻璃风格（backdrop-filter blur + 半透明卡片）+ Ant Design ConfigProvider 主题配置

**约束**：
- 后端：Go 1.21+，Gin，postgresql，golang-migrate，bcrypt 密码，AES 加密 API Key，JWT 双 token
- 前端：Next.js 14 App Router，@ant-design/x v2，@ant-design/x-sdk v2，TypeScript，Tailwind CSS 辅助样式
- 认证：Access Token 15min，Refresh Token 7 天，admin role 单独校验
- 流式：后端 SSE（Gin c.Stream），前端自定义 Chat Provider 对接

---

## 计划步骤与状态

| # | 步骤 | 状态 | 验证 |
|---|------|------|------|
| 1 | 后端：Go 模块初始化 + 目录结构 + Gin 基础框架 | ✅ 完成 | `go build ./...` 无错 |
| 2 | 后端：PostgreSQL 迁移文件（7 张表） | ✅ 完成 | 迁移文件存在于 migrations/ |
| 3 | 后端：启动自动迁移 + 种子数据（admin + settings） | ✅ 完成 | 服务启动日志打印 admin 密码 |
| 4 | 后端：JWT 认证模块（注册/登录/刷新）| ✅ 完成 | POST /api/auth/login 返回 token |
| 5 | 后端：模型管理 CRUD（管理员接口） | ✅ 完成 | CRUD providers + models |
| 6 | 后端：AI 适配器 + SSE 流式对话接口 | ✅ 完成 | POST /api/conversations/:id/messages stream=true |
| 7 | 前端：Next.js 初始化 + 玻璃风格主题 + XProvider | ✅ 完成 | `npm run dev` 正常运行 |
| 8 | 前端：对话界面（Conversations + Bubble.List + Sender + useXChat）| ✅ 完成 | 流式消息实时渲染 |
| 9 | 后端：绘图/视频 API | ✅ 完成 | POST /api/images/generate 返回图片 URL |
| 10 | 前端：绘图/视频界面 + 管理后台 | ✅ 完成 | 管理界面可切换模型开关 |
| 11 | 收尾：CORS/限流/安全加固 | 待完善 | 生产部署前需加强 |
