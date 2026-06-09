---
name: ai-gateway-api
description: >-
  调用聚合 AI 网关（new-api 风格中转站）的指南，覆盖 OpenAI 兼容接口、Gemini 原生、Midjourney、
  Ideogram、Flux、fal-ai、Replicate、Kling、Luma、Runway、Veo、Vidu、海螺、豆包、Suno、
  MiniMax 等服务商的文本/图片/视频/音频/数字人生成与令牌管理。当用户要基于本仓库的
  `默认模块.swagger.json` 调用该网关、生成图片/视频/音频/语音、提交并轮询异步任务，
  或管理令牌/查询额度时使用。
---

# AI 聚合网关 API（new-api 风格中转站）

本仓库的 `默认模块.swagger.json`（约 3.4 万行，235 个 path / 243 个操作）是一个聚合 AI 网关，把众多服务商收敛到一个域名下，统一用 Bearer 鉴权。**该文件是最终权威来源**；本技能在它之上提供通用约定、调用范式、「能力 → 端点」路由，以及**从 swagger 抽取的全量端点索引与参数字段文档**。

> **完整端点索引（全部 243 个操作，按服务商分组）见 [reference/all-endpoints.md](reference/all-endpoints.md)**，由 `scripts/gen_catalog.py` 从 swagger 自动生成。要确认「某能力有没有对应接口」，先查这份索引。
>
> **全部端点的参数字段**（路径/查询/请求体字段，含嵌套、类型、必填、枚举、示例）已按服务商拆分到 `reference/params/`，索引见 [reference/params/README.md](reference/params/README.md)，由 `scripts/gen_params.py` 自动生成。要拼某个接口的请求体，先读对应 `params/<服务商>.md`。下面分类 reference 只对重点接口补充说明。

## 通用约定

- **Base URL**：swagger 的 `servers` 为空，需自行填写中转站域名。统一用占位符 `{BASE_URL}`，推荐用环境变量 `AI_GATEWAY_BASE_URL`。完整地址 = `{BASE_URL}` + swagger 中的 path。
- **鉴权**：所有业务接口都用 `Authorization: Bearer <API_KEY>`（推荐环境变量 `AI_GATEWAY_API_KEY`）。JSON 接口加 `Content-Type: application/json`。
- **令牌管理接口例外**：`/api/token/*`、`/api/user/self`、`/api/usage/*` 额外需要请求头 `new-api-user: <用户ID>`，且 `Authorization` 用的是系统令牌而非业务 key。详见 [reference/avatar-and-admin.md](reference/avatar-and-admin.md)。
- **OpenAI 兼容**：`/v1/*` 系列与 OpenAI 行为一致，可直接用 openai SDK，把 `base_url` 指到 `{BASE_URL}/v1`、`api_key` 设为业务 key 即可。
- **绝不**把真实 key 或域名写进生成的代码/文件，一律用占位符或读环境变量。

## 两种调用范式

### 1. 同步返回
请求即返回结果（如 `/v1/chat/completions`、`/v1/images/generations`、`/minimax/v1/t2a_v2`）。`stream: true` 时按 SSE 流式返回。

### 2. 异步「提交 + 轮询」
多数图片/视频/音乐重任务是异步的：

```
1. POST 提交任务  → 返回 task_id（字段名可能是 result / id / task_id / request_id）
2. GET 查询任务   → 轮询直到 status 为成功/失败（命名各家不同：SUCCESS / completed / Succeed ...）
3. 从成功响应里取结果 URL（图片/视频/音频链接）
```

提交端点与查询端点是配对的，例如：
- Midjourney：`POST /mj/submit/imagine` → `GET /mj/task/{id}/fetch`
- Kling：`POST /kling/v1/videos/text2video` → `GET /kling/v1/videos/text2video/{id}`
- Suno：`POST /suno/submit/music` → `GET /suno/fetch/{task_id}`
- MiniMax 异步音频：`POST /minimax/v1/t2a_async_v2` → `GET /minimax/v1/query/t2a_async_query_v2` → `POST /minimax/v1/files/retrieve` 下载
- fal-ai：`POST /fal-ai/{model}` → `GET /fal-ai/{model_name}/requests/{request_id}`
- Replicate：`POST /replicate/v1/.../predictions` → `GET /replicate/v1/predictions/{id}`

轮询请设合理间隔（如 3–10s）与超时上限，不要无限快轮。

## 查询某个端点的参数（三层）

1. **参数字段表**：先读 `reference/params/<服务商>.md`，里面有该端点的路径/查询参数与请求体字段（展平 + 类型 + 必填 + 枚举 + 示例），覆盖全部 243 个操作，足够拼出请求。
2. **重点说明**：分类 reference（如 [reference/video.md](reference/video.md)）补充调用顺序、配对查询端点等。
3. **原始 swagger**：需要响应结构、超长说明或字段表里被截断的内容时，在 `默认模块.swagger.json` 里检索该 path（Grep 定位行号后 Read）。例如检索 `"/kling/v1/videos/text2video"` 看完整 `requestBody`/`responses`。

> 参数文档与端点索引都由脚本生成。swagger 更新后重跑刷新：
> ```bash
> python scripts/gen_catalog.py 默认模块.swagger.json reference/all-endpoints.md
> python scripts/gen_params.py  默认模块.swagger.json reference/params
> ```

## 能力 → 端点路由表

先按下表定位类别，再读对应 reference 文件拿端点清单与示例，最后回查 swagger 取精确字段。**全量清单始终以 [reference/all-endpoints.md](reference/all-endpoints.md) 为准。**

| 能力 | 代表端点 | 详见 |
|------|----------|------|
| 对话/文本/函数调用/补全 | `/v1/chat/completions`、`/v1/responses`、`/v1/completions`、Gemini `/v1beta/models/*:generateContent` | [reference/text-and-embeddings.md](reference/text-and-embeddings.md) |
| 文本嵌入/重排序 | `/v1/embeddings`、`/v1/rerank`、`/v1beta/models/gemini-embedding-001:embedContent` | [reference/text-and-embeddings.md](reference/text-and-embeddings.md) |
| 文生图/图片编辑 | `/v1/images/generations`、`/v1/images/edits`、`/mj/*`、`/ideogram/*`、`/fal-ai/*`、`/replicate/*`、Gemini 图片 | [reference/image.md](reference/image.md) |
| 文/图生视频、视频编辑 | `/kling/*`、`/luma/*`、`/runwayml/*`、`/jimeng/*`、Veo、`/ent/v2/*`(Vidu)、`/openapi/v2/*`(海螺)、豆包/Volc、Sora `/v1/videos/*` | [reference/video.md](reference/video.md) |
| 语音合成/克隆/音乐/转写 | `/minimax/v1/*`、`/suno/*`、`/v1/audio/*`、`/kling/v1/audio/*` | [reference/audio.md](reference/audio.md) |
| 数字人（虚拟/真人素材） | `/v1/private-avatar/*`、`/v1/real-avatar/*` | [reference/avatar-and-admin.md](reference/avatar-and-admin.md) |
| 令牌/账号/额度管理 | `/api/token/*`、`/api/user/self`、`/api/usage/*`、`/v1/models`、`/api/upload` | [reference/avatar-and-admin.md](reference/avatar-and-admin.md) |

## 最小可用示例

```bash
curl "{BASE_URL}/v1/chat/completions" \
  -H "Authorization: Bearer ${AI_GATEWAY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "你好"}],
    "stream": false
  }'
```

```python
from openai import OpenAI
import os

client = OpenAI(
    base_url=f"{os.environ['AI_GATEWAY_BASE_URL']}/v1",
    api_key=os.environ["AI_GATEWAY_API_KEY"],
)
resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
```

## 易错点

- 提交异步任务后**必须轮询**才能拿到结果 URL，提交响应里只有 task_id。
- 不同服务商的字段命名差异大（`model` vs `model_name`、`image` vs `image_urls` vs `base64Array`），务必回查对应 path。
- 部分模型名带版本/日期（如 `kling-v2-5-turbo`、`veo-3.1-fast-generate-preview`），照 swagger 的 `enum`/`example` 填写。
- 令牌管理接口与业务接口的鉴权头不同，别混用。
