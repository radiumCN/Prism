这是一个基于你需求定制的完整开发方案，覆盖项目架构、核心模块、数据库设计、接口定义、前后端交互与实施步骤。

---

## 一、项目概述

**模型聚合平台（ModelHub）** 旨在为用户提供统一入口，调用多个 AI 供应商的对话、绘图与视频生成能力。平台支持可控注册、多模型切换、后台管理，并采用前后端分离架构。

**核心能力：**
- 对话：OpenAI（含 Response API 模式）、Claude、Gemini
- 绘图：Gemini（可扩展其他供应商）
- 视频生成：通过适配器对接各供应商 API
- 管理：模型开关配置、供应商密钥管理、SMTP 邮件、开放注册控制

---

## 二、技术架构

### 2.1 技术选型
| 层级       | 技术栈                                     |
|------------|--------------------------------------------|
| 后端       | Go + Gin + PostgreSQL + Redis + golang-migrate |
| 前端       | Next.js + Ant Design (玻璃风格) + Ant Design X  |
| 认证       | JWT (Access + Refresh Token)               |
| 任务队列   | 异步视频生成可通过 Redis 队列 / Machinery |
| 对象存储   | 绘图/视频结果本地存储或 MinIO/OSS（可配置）|

### 2.2 系统架构图（逻辑）
```
用户浏览器  →  Nginx/Next.js (SSR)
                  ↓ API /api/*
          Go-Gin 后端服务
        ↙   ↓   ↘
PostgreSQL  Redis   AI供应商 (OpenAI / Claude / Gemini / 火山引擎 / 阿里等)
```

---

## 三、后端设计

### 3.1 目录结构
```
server/
├── cmd/
│   └── main.go               # 入口，启动服务，自动迁移+初始化
├── internal/
│   ├── config/               # 配置解析（环境变量或yaml）
│   ├── database/
│   │   ├── postgres.go       # 连接与迁移
│   │   └── migrate.go        # 调用golang-migrate，自动迁移
│   ├── model/                # GORM 模型定义
│   ├── repository/           # 数据访问层
│   ├── service/              # 业务逻辑层
│   ├── handler/              # Gin 路由处理
│   ├── middleware/           # JWT、CORS、限流、日志
│   ├── router/               # 路由注册
│   ├── adapter/              # AI 供应商适配器（统一接口）
│   ├── dto/                  # 请求/响应结构体
│   └── utils/                # 工具函数
├── migrations/               # golang-migrate 迁移文件
├── seed/                     # 初始化数据（管理员、默认设置）
└── go.mod / go.sum
```

### 3.2 数据库迁移与初始化
- 使用 `golang-migrate/migrate` 管理 SQL 迁移文件。
- 启动时执行：
  1. 连接数据库并自动运行所有 `up` 迁移。
  2. 检查系统设置表是否存在 `initialized` 标志。
  3. 若未初始化，插入默认系统设置、管理员账号，标记为已初始化。

**管理员账号示例：**
- 用户名: `admin`
- 密码: 随机生成并打印到日志（或环境变量注入），首次登录强制修改。

### 3.3 核心数据模型（PostgreSQL）
```sql
-- 用户表
users (id, username, email, password_hash, role, status, created_at, updated_at)
-- 角色：admin, user

-- 系统设置（单行配置表）
settings (key, value, updated_at)
-- 如：site_name, registration_open, smtp_host, smtp_port, smtp_user, smtp_pass, ...

-- AI 供应商配置
providers (id, name, api_key, base_url, status, created_at, updated_at)
-- name: openai, claude, gemini, qwen, volcengine 等

-- AI 模型配置
models (id, provider_id, model_name, display_name, type, max_tokens, supports_streaming, supports_vision, config_json, status)
-- type: chat, image, video
-- config_json: 额外参数如 temperature 默认值等

-- 对话会话
conversations (id, user_id, title, model_id, created_at, updated_at)

-- 消息记录
messages (id, conversation_id, role, content, image_urls, metadata, token_count, created_at)

-- 生成任务（绘图/视频）
generations (id, user_id, type, model_id, prompt, parameters, result_url, status, error_message, created_at, updated_at)
```

### 3.4 AI 供应商适配器模式
定义统一接口：
```go
type ChatAdapter interface {
    ChatCompletion(ctx context.Context, model string, messages []Message, options ChatOptions) (ChatResponse, error)
    ChatCompletionStream(ctx context.Context, model string, messages []Message, options ChatOptions) (<-chan ChatStreamChunk, error)
}

type ImageAdapter interface {
    GenerateImage(ctx context.Context, model string, prompt string, options ImageOptions) ([]string, error)
}

type VideoAdapter interface {
    GenerateVideo(ctx context.Context, model string, prompt string, options VideoOptions) (string, error)
}
```
为每个供应商实现上述接口（仅实现其支持的能力）。通过工厂方法根据 `provider_name` 获取适配器。

### 3.5 路由设计（部分）
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/user/profile
PUT    /api/user/profile

GET    /api/models              # 获取可用模型列表（带供应商信息）
POST   /api/conversations       # 新建会话
GET    /api/conversations       # 用户会话列表
GET    /api/conversations/:id   # 消息列表
POST   /api/conversations/:id/messages  # 发送消息（支持流式）
POST   /api/images/generate     # 生成图片（Gemini 等）
POST   /api/videos/generate     # 生成视频

# 管理接口（仅 admin）
GET/PUT /api/admin/settings
GET/POST/PUT/DELETE /api/admin/providers
GET/POST/PUT/DELETE /api/admin/models
```

### 3.6 JWT 认证与中间件
- 登录返回 `access_token`（短期，15min）与 `refresh_token`（长期，7天）。
- 中间件校验 token 并注入 `userID` 到上下文。
- 管理员接口额外检查 `role == admin`。

### 3.7 流式对话实现
- 后端使用 SSE（Server-Sent Events）返回流式数据，Gin 的 `c.Stream()` 方法配合适配器返回的 channel。
- 前端使用 `fetch` + `ReadableStream` 或 `EventSource` 接收并实时渲染（Ant Design X 的 `useXChat` 支持流式）。

---

## 四、前端设计

### 4.1 目录结构
```
web/
├── components/          # 公共组件
│   ├── Chat/
│   ├── ImageGenerator/
│   ├── VideoGenerator/
│   └── Layout/
├── pages/               # Next.js 路由
│   ├── index.tsx        # 登录/重定向
│   ├── chat/[[...id]].tsx
│   ├── image.tsx
│   ├── video.tsx
│   ├── settings/
│   └── admin/
├── hooks/               # 自定义 hooks（useChat, useAuth）
├── lib/                 # API 客户端封装、工具函数
├── store/               # 全局状态（Zustand 或 Context）
├── styles/              # 全局样式、Antd 主题定制
└── next.config.js
```

### 4.2 玻璃风格实现
- 利用 Ant Design 的 ConfigProvider 设置全局 token：圆角、透明背景、模糊效果。
- 自定义组件外层包裹 CSS `backdrop-filter: blur(10px); background: rgba(255,255,255,0.7);`
- 首页布局采用半透明卡片、渐变背景。

### 4.3 对话界面 (使用 Ant Design X)
- 使用 `XStream` 和 `useXChat` 处理流式消息。
- 左侧会话列表，右侧对话区，输入框支持粘贴图片。
- 顶部模型选择器（显示可用模型）。
- 支持多轮对话上下文管理。

### 4.4 绘图 / 视频生成
- 表单：输入提示词、选择模型（Gemini 等）、尺寸/风格等参数。
- 提交后显示任务进度（轮询或 WebSocket）。
- 结果展示为图片/视频画廊，可下载。

### 4.5 管理后台
- 模型设置：供应商列表、模型开关、api_key 录入。
- 基础设置：站点名称、注册开关。
- SMTP 设置：邮件服务配置（用于密码重置等，可按需扩展）。

---

## 五、关键业务流程

### 5.1 发送对话消息（流式）
1. 前端创建或使用已有 conversationId。
2. POST `/api/conversations/:id/messages`，body 包含 model, messages, stream=true。
3. 后端验证模型可用、查询供应商与 apikey，获取适配器，调用 `ChatCompletionStream`。
4. 流式数据通过 SSE 写回前端，同时将完整消息存入数据库。
5. 前端实时更新消息气泡。

### 5.2 绘图生成
1. 前端提交 POST `/api/images/generate`。
2. 后端校验用户配额（未来扩展），调用适配器 `GenerateImage`。
3. 同步等待结果（Gemini 较快）或异步返回任务 ID。
4. 将结果 URL 持久化到 `generations` 表，返回给前端展示。

### 5.3 视频生成（异步示例）
1. 提交生成任务，后端创建 `generations` 记录 status=processing。
2. 将任务投递到 Redis 队列（go-machinery）。
3. Worker 调用视频供应商 API，轮询至完成，更新结果 URL 和状态。
4. 前端通过轮询 `/api/generations/:id` 获取进度。

---

## 六、安全与配置

- 所有供应商 API Key 加密存储（AES）或使用 Vault。
- 用户密码 bcrypt 哈希。
- CORS 限制允许域名。
- 接口请求频率限制（基于 Redis），防止滥用。
- 环境变量配置敏感信息（数据库密码、JWT 密钥等）。

---

## 七、部署考虑

- 后端编译为二进制，Docker 化运行。
- PostgreSQL + Redis 使用容器或云服务。
- 前端 Next.js 可导出静态或部署到 Vercel / Docker。
- Nginx 反向代理后端 API 和前端静态资源。
- 迁移文件随镜像打包，启动时自动执行。

---

## 八、开发步骤建议

| 阶段 | 任务 |
|------|------|
| 1 | 项目初始化：Go 模块、Gin 框架、目录结构、迁移工具集成 |
| 2 | 数据库设计：创建迁移文件，完成 models/settings/providers 等表 |
| 3 | 启动自动迁移与种子数据（管理员账号、默认设置） |
| 4 | 用户认证模块：注册/登录/刷新 JWT |
| 5 | 模型管理接口：CRUD 供应商与模型（管理端） |
| 6 | AI 适配器实现：OpenAI、Claude、Gemini（对话） |
| 7 | 对话流式 API + 前端聊天界面 |
| 8 | 绘图/视频生成适配器与 API |
| 9 | 系统设置与个人中心 |
| 10 | 管理后台界面 |
| 11 | 测试、安全加固、文档与部署 |

---