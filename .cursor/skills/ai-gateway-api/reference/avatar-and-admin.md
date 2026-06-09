# 数字人 + 令牌/账号管理

## 数字人（`/v1/private-avatar/*`、`/v1/real-avatar/*`）
鉴权 `Authorization: Bearer <API_KEY>`。带圈号①②…的 summary 提示推荐调用顺序。

### 虚拟人像 · 素材组 / 素材
| 步骤 | 端点 |
|------|------|
| ① 创建素材组 | `POST /v1/private-avatar/groups` |
| ② 查询素材组列表 | `POST /v1/private-avatar/groups/list` |
| ③ 查询单个素材组 | `GET /v1/private-avatar/groups/{id}` |
| ④ 更新素材组 | `PATCH /v1/private-avatar/groups/{id}` |
| ⑤ 删除素材组 | `DELETE /v1/private-avatar/groups/{id}` |
| ⑥ 上传素材 | `POST /v1/private-avatar/assets` |
| ⑦ 查询素材列表 | `POST /v1/private-avatar/assets/list` |
| ⑧ 查询素材状态 | `GET /v1/private-avatar/assets/{id}` |
| ⑨ 更新素材 | `PATCH /v1/private-avatar/assets/{id}` |
| ⑩ 删除素材 | `DELETE /v1/private-avatar/assets/{id}` |

### 真人人像 · 认证
| 步骤 | 端点 |
|------|------|
| ⑪ 生成真人认证链接 | `POST /v1/real-avatar/auth/session` |
| ⑫ BytedToken 换 GroupId | `POST /v1/real-avatar/groups/from-token` |

典型流程：创建素材组 → 上传素材 → 轮询素材状态 → 真人认证（如需）。

## 令牌 / 账号 / 额度（`/api/*`）

> 与业务接口鉴权不同：需请求头 `new-api-user: <用户ID>`，且 `Authorization` 用**系统令牌**。

| 端点 | 说明 |
|------|------|
| `GET /api/token/` | 获取令牌列表 |
| `POST /api/token/` | 新增令牌（`name`、`remain_quota`(50w=1刀)、`expired_time`(秒,-1 不限)、`unlimited_quota`、`model_limits_enabled`） |
| `PUT /api/token/` | 修改令牌 |
| `PUT /api/token/batch` | 批量修改 |
| `GET /api/token/search` | 搜索令牌 |
| `DELETE /api/token/{id}/` | 删除令牌 |
| `GET /api/user/self` | 获取账号信息 |
| `GET /api/usage/token/` | 获取令牌使用情况 |

## 通用工具
| 端点 | 说明 |
|------|------|
| `GET /v1/models` | 当前 key 支持的模型列表（Bearer 业务 key） |
| `POST /api/upload` | 上传图片到图床，拿可用 URL（用于各家 `image_url` 入参） |
