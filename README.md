# ModelHub

> 统一 AI 能力的私有化部署平台

ModelHub 是一个面向团队和个人的私有化 AI 接入平台。通过统一的供应商管理与模型配置，将 OpenAI、Anthropic、Google Gemini 等多家大模型服务整合为一致的接口，支持多账户隔离、对话、图像生成、视频生成、Skill 提示词模板以及基于 MCP 协议的外部工具调用。

---

## 功能特性

| 功能 | 说明 |
|---|---|
| 💬 多模型对话 | 支持 OpenAI、Anthropic Claude、Google Gemini，SSE 流式输出 |
| 🎨 AI 绘图 | 集成 DALL-E、Gemini Imagen，支持尺寸、风格等参数 |
| 🎬 视频生成 | 接入主流视频生成 API，支持分辨率、时长等参数 |
| 🧩 Skill 系统 | 可配置系统提示词模板，一键切换 AI 角色与场景 |
| 🔧 MCP 工具调用 | 支持 Model Context Protocol，连接外部数据库、搜索等工具 |
| 👥 多账户隔离 | 供应商、模型、Skill、MCP 配置严格按账号隔离 |
| ☁️ 对象存储 | 支持腾讯云 COS / 阿里云 OSS，自动转存 base64 生成结果 |
| 📋 用户管理 | 管理员可查看 / 启禁用账号、调整角色 |
| 💌 用户反馈 | 用户可提交反馈（含截图），管理员可回复并处理 |

---

## 技术栈

**后端**

- Go 1.26 · Gin · GORM · PostgreSQL · Redis
- JWT 鉴权 · AES 加密 · SSE 流式输出
- MCP Protocol (Streamable HTTP)
- 腾讯云 COS SDK · 阿里云 OSS SDK

**前端**

- Next.js 16 · React 19 · TypeScript
- Ant Design 6 · @ant-design/x · Zustand

---

## 目录结构

```
model-client/
├── server/               # Go 后端
│   ├── internal/
│   │   ├── adapter/      # AI 适配器（OpenAI / Claude / Gemini / Happyhorse）
│   │   ├── config/       # 配置加载
│   │   ├── database/     # DB 连接与迁移
│   │   ├── dto/          # 请求 / 响应数据结构
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
│   └── .env              # 环境变量（不提交到 git）
├── web/                  # Next.js 前端
│   ├── src/
│   │   ├── app/          # 页面路由
│   │   ├── components/   # 公共组件
│   │   ├── lib/          # API 工具
│   │   ├── store/        # Zustand 状态
│   │   └── types/        # TypeScript 类型
│   ├── package.json
│   └── next.config.ts
├── VERSION               # 当前版本号（单一来源）
├── Makefile              # Linux/macOS 构建
├── build.sh              # Linux 构建脚本
├── build.ps1             # Windows PowerShell 构建脚本
└── README.md
```

---

## 快速开始

### 环境要求

| 依赖 | 版本要求 |
|---|---|
| Go | ≥ 1.21 |
| Node.js | ≥ 20 |
| PostgreSQL | ≥ 14 |
| Redis | ≥ 6（可选，验证码功能需要） |

### 1. 克隆仓库

```bash
git clone <repository-url>
cd model-client
```

### 2. 配置后端环境变量

```bash
cp server/.env.example server/.env
```

编辑 `server/.env`：

```env
# 服务器
SERVER_PORT=8080
SERVER_MODE=debug          # debug | release

# 数据库
DATABASE_DSN=host=localhost user=postgres password=postgres dbname=modelhub port=5432 sslmode=disable

# Redis（可选）
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=

# JWT（生产环境请替换为强随机字符串）
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRY=15        # 分钟
JWT_REFRESH_EXPIRY=7        # 天

# AES 加密密钥（必须恰好 32 字节）
AES_KEY=your-32-byte-aes-key-here!!!!!!

# SMTP（邮箱验证码，可选）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=your-smtp-password

# 跨域（逗号分隔）
CORS_ORIGINS=http://localhost:3000
```

### 3. 启动后端（开发模式）

```bash
cd server
go run ./main.go
```

首次启动会自动创建数据库表，并通过种子脚本创建默认管理员账号（见 `server/seed/seed.go`）。

### 4. 启动前端（开发模式）

```bash
cd web
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

---

## 生产部署

### 编译构建

**Linux / macOS：**

```bash
# 使用 VERSION 文件中的版本
./build.sh

# 指定版本号
./build.sh 1.2.0

# 指定版本 + 打 git tag
./build.sh 1.2.0 --release

# 只编译后端
./build.sh 1.2.0 --server-only
```

**Windows：**

```powershell
# 编译后端 + 前端
.\build.ps1

# 指定版本号
.\build.ps1 1.2.0

# 只编译后端
.\build.ps1 -ServerOnly
```

构建产物输出到 `dist/` 目录：

```
dist/
├── modelhub-server                      # Go 后端二进制
└── modelhub-<version>-linux-amd64.tar.gz  # 打包发行包
```

### 部署后端

```bash
# 上传二进制和 .env 到服务器
scp dist/modelhub-server user@server:/opt/modelhub/
scp server/.env          user@server:/opt/modelhub/

# 启动
ssh user@server
cd /opt/modelhub
./modelhub-server
```

建议使用 `systemd` 管理进程：

```ini
# /etc/systemd/system/modelhub.service
[Unit]
Description=ModelHub Server
After=network.target postgresql.service

[Service]
Type=simple
WorkingDirectory=/opt/modelhub
ExecStart=/opt/modelhub/modelhub-server
Restart=on-failure
RestartSec=5s
EnvironmentFile=/opt/modelhub/.env

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable modelhub
systemctl start modelhub
systemctl status modelhub
```

### 部署前端

```bash
# 将 web/.next 和 web/public 上传到服务器，用 PM2 运行
cd web
npm run build
npm start               # 或使用 PM2

# PM2 方式
pm2 start npm --name modelhub-web -- start
```

---

## 版本管理

版本号统一由项目根目录的 `VERSION` 文件管理。

### 发布新版本

```bash
# 1. 修改 VERSION 文件
echo "1.2.0" > VERSION

# 2. 编译并打 tag
./build.sh 1.2.0 --release
```

### 版本信息注入原理

后端通过 Go `ldflags` 在编译时注入：

```bash
go build -ldflags="\
  -X modelhub/server/internal/version.Version=1.2.0 \
  -X modelhub/server/internal/version.GitCommit=$(git rev-parse --short HEAD) \
  -X modelhub/server/internal/version.BuildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -o dist/modelhub-server ./main.go
```

前端通过 `next.config.ts` 在构建时从 `package.json` 读取版本号注入环境变量。

版本信息通过 `GET /api/version` 接口对外暴露（无需鉴权），并在关于页面展示。

---

## API 说明

所有接口均以 `/api` 为前缀，需登录的接口请求头携带：

```
Authorization: Bearer <access_token>
```

| 分类 | 接口前缀 | 说明 |
|---|---|---|
| 认证 | `/api/auth/*` | 注册、登录、刷新 Token |
| 用户 | `/api/user/*` | 个人信息、OSS 配置 |
| 供应商 | `/api/providers/*` | 供应商 CRUD（按用户隔离） |
| 模型 | `/api/models/*` | 模型 CRUD（按用户隔离） |
| Skill | `/api/skills/*` | Skill CRUD（按用户隔离） |
| MCP | `/api/mcp-servers/*` | MCP Server CRUD（按用户隔离） |
| 对话 | `/api/conversations/*` | 会话管理与流式消息 |
| 生图 | `/api/images/*` | 图像生成与历史 |
| 视频 | `/api/videos/*` | 视频生成与历史 |
| 文件 | `/api/upload` | 图片上传 |
| 反馈 | `/api/feedback/*` | 用户反馈提交与查看 |
| 版本 | `/api/version` | 版本信息（公开） |
| 管理员 | `/api/admin/*` | 系统设置、用户管理、反馈管理 |

---

## 管理员账号

首次启动时种子脚本自动创建管理员账号，默认凭据见 `server/seed/seed.go`。  
**生产环境请登录后立即修改密码。**

---

## License

MIT
