# Prism

> 统一 AI 能力的私有化部署平台

Prism 是一个面向团队和个人的私有化 AI 接入平台。通过统一的供应商管理与模型配置，将 OpenAI、Anthropic、Google Gemini 等多家大模型服务整合为一致的接口，支持多账户隔离、对话、图像生成、视频生成、Skill 提示词模板以及基于 MCP 协议的外部工具调用。

---

## 功能特性

| 功能 | 说明 |
|---|---|
| 多模型对话 | 支持 OpenAI、Anthropic Claude、Google Gemini，SSE 流式输出 |
| AI 绘图 | 集成 DALL-E、Gemini Imagen，支持尺寸、风格等参数 |
| 视频生成 | 接入主流视频生成 API，支持分辨率、时长等参数 |
| Skill 系统 | 可配置系统提示词模板，一键切换 AI 角色与场景 |
| MCP 工具调用 | 支持 Model Context Protocol，连接外部数据库、搜索等工具 |
| 多账户隔离 | 供应商、模型、Skill、MCP 配置严格按账号隔离 |
| 对象存储 | 支持腾讯云 COS / 阿里云 OSS，自动转存 base64 生成结果 |
| 用户管理 | 管理员可查看 / 启禁用账号、调整角色 |
| 用户反馈 | 用户可提交反馈（含截图），管理员可回复并处理 |

---

## 技术栈

**后端**

- Go 1.21+ · Gin · GORM · PostgreSQL · Redis
- JWT 鉴权 · AES 加密 · SSE 流式输出
- MCP Protocol (Streamable HTTP)
- 腾讯云 COS SDK · 阿里云 OSS SDK

**前端**

- Next.js 15 · React 19 · TypeScript
- Ant Design 5 · @ant-design/x · Zustand

---

## 目录结构

```
model-client/
├── server/               # Go 后端
│   ├── internal/
│   │   ├── adapter/      # AI 适配器（OpenAI / Claude / Gemini）
│   │   ├── config/       # 配置加载
│   │   ├── database/     # DB 连接与迁移
│   │   ├── dto/          # 请求/响应数据结构
│   │   ├── handler/      # HTTP 处理器
│   │   ├── middleware/   # 鉴权中间件
│   │   ├── model/        # GORM 数据模型
│   │   ├── repository/   # 数据库操作层
│   │   ├── router/       # 路由注册
│   │   ├── service/      # 业务逻辑
│   │   ├── storage/      # OSS 存储层
│   │   ├── utils/        # 工具函数
│   │   └── version/      # 版本信息
│   ├── seed/             # 初始数据种子
│   ├── main.go
│   ├── go.mod
│   └── .env
├── web/                  # Next.js 前端
│   ├── src/
│   │   ├── app/          # 页面路由
│   │   ├── components/   # 公共组件
│   │   ├── lib/          # API 工具
│   │   ├── store/        # Zustand 状态
│   │   └── types/        # TypeScript 类型
│   ├── package.json
│   └── next.config.ts
├── VERSION               # 版本号唯一来源
├── Makefile
├── build.sh
├── build.ps1
└── README.md
```

---

## 快速开始

### 环境要求

| 依赖 | 版本要求 |
|---|---|
| Go | >= 1.21 |
| Node.js | >= 20 |
| PostgreSQL | >= 14 |
| Redis | >= 6（可选） |

### 1. 克隆仓库

```bash
git clone https://github.com/radiumCN/Prism.git
cd Prism
```

### 2. 配置环境变量

```bash
cp server/.env.example server/.env
```

编辑 server/.env：

```env
SERVER_PORT=8080
SERVER_MODE=debug

DATABASE_DSN=host=localhost user=postgres password=postgres dbname=prism port=5432 sslmode=disable

REDIS_ADDR=localhost:6379
REDIS_PASSWORD=

JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRY=15
JWT_REFRESH_EXPIRY=7

AES_KEY=your-32-byte-aes-key-here!!!!!!

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=your-smtp-password

CORS_ORIGINS=http://localhost:3000
```

### 3. 启动后端

```bash
cd server
go run ./main.go
```

首次启动自动建表并创建管理员账号，随机密码打印在日志中。

### 4. 启动前端

```bash
cd web
npm install
npm run dev
```

访问 http://localhost:3000

---

## 生产部署

### 编译构建

Linux / macOS：

```bash
./build.sh              # 使用 VERSION 文件版本
./build.sh 1.2.0        # 指定版本
./build.sh 1.2.0 --release   # 构建 + 打 git tag
```

Windows：

```powershell
.\build.ps1
.\build.ps1 1.2.0
.\build.ps1 -ServerOnly
```

产物输出至 dist/ 目录。

### 部署后端

```bash
scp dist/prism-server user@server:/opt/prism/
scp server/.env       user@server:/opt/prism/
```

建议用 systemd 管理进程：

```ini
[Unit]
Description=Prism Server
After=network.target postgresql.service

[Service]
Type=simple
WorkingDirectory=/opt/prism
ExecStart=/opt/prism/prism-server
Restart=on-failure
EnvironmentFile=/opt/prism/.env

[Install]
WantedBy=multi-user.target
```

### 部署前端

```bash
cd web && npm run build && npm start
# 或
pm2 start npm --name prism-web -- start
```

---

## 版本管理

版本号由根目录 VERSION 文件统一管理。

发布流程：

```bash
echo "1.2.0" > VERSION
./build.sh 1.2.0 --release
```

版本信息通过 GET /api/version 对外暴露（无需鉴权），在关于页面显示。

---

## API 说明

所有接口以 /api 为前缀，鉴权接口需请求头：Authorization: Bearer <token>

| 分类 | 前缀 | 说明 |
|---|---|---|
| 认证 | /api/auth/* | 注册、登录、刷新 Token |
| 用户 | /api/user/* | 个人信息、OSS 配置 |
| 供应商 | /api/providers/* | 供应商 CRUD |
| 模型 | /api/models/* | 模型 CRUD |
| Skill | /api/skills/* | Skill CRUD |
| MCP | /api/mcp-servers/* | MCP Server CRUD |
| 对话 | /api/conversations/* | 会话与流式消息 |
| 生图 | /api/images/* | 图像生成 |
| 视频 | /api/videos/* | 视频生成 |
| 上传 | /api/upload | 图片上传 |
| 反馈 | /api/feedback/* | 用户反馈 |
| 版本 | /api/version | 版本信息（公开） |
| 管理 | /api/admin/* | 系统管理 |

---

## 管理员账号

首次启动种子脚本自动创建管理员账号，随机密码打印在服务端启动日志中。**生产环境请立即修改密码。**

---

## License

[MIT](LICENSE)