# 图片生成 / 编辑

混合同步与异步。异步用「提交 + 轮询」（见 SKILL.md）。鉴权 `Authorization: Bearer <API_KEY>`。

## OpenAI 兼容（多为同步）
| 端点 | 说明 |
|------|------|
| `POST /v1/images/generations` | 文生图（如 `wan2.7-image-pro`、dall-e 风格） |
| `POST /v1/images/edits` | 图片编辑（Flux / dall-e-3 格式） |

## Gemini 图片（`/v1beta/models/*:generateContent`）
| 端点 | 说明 |
|------|------|
| `.../gemini-2.5-flash-image:generateContent` | 文生图，控制宽高比 |
| `.../gemini-3-pro-image-preview:generateContent` | 文生图，控宽高比 + 清晰度 |
| `.../gemini-2.0-flash-exp-image-generation:generateContent` | 图片编辑 |
| `.../{modeName}:generateContent` | 通用图片生成（模型名作路径参数） |
| `.../imagen-4.0-ultra-generate-001:predict`、`.../imagen-4.0-generate-001:predict` | Imagen 生成 |

## Midjourney（`/mj/*`，异步）
| 端点 | 说明 |
|------|------|
| `POST /mj/submit/imagine` | 提交 Imagine（`prompt`*、`botType`=MID_JOURNEY/NIJI_JOURNEY、`base64Array` 垫图、`notifyHook` 回调） |
| `POST /mj/submit/action` | 执行 U/V/Reroll 等动作 |
| `POST /mj/submit/blend` / `describe` / `modal` | 混图 / 反推 / Modal |
| `POST /mj/submit/upload-discord-images` | 上传图片 |
| `GET /mj/task/{id}/fetch` | 查询任务状态（提交返回的 `result` 即 task_id） |
| `POST /mj/task/list-by-condition` | 批量按 ID 查询 |
| `GET /mj/task/{id}/image-seed` | 取图片 seed |

提交响应：`{code:1, result:"<task_id>", ...}`。

## Ideogram（`/ideogram/*`）
`POST /ideogram/v1/ideogram-v3/{generate|edit|remix|reframe|replace-background}`，以及旧版 `/ideogram/{generate|remix|upscale|describe}`。

## fal-ai 图片（`/fal-ai/*`，异步）
文生图/编辑，如 `POST /fal-ai/nano-banana`、`/fal-ai/nano-banana/edit`、`/fal-ai/flux-1/dev`、`/fal-ai/flux-pro/kontext`、`/fal-ai/bytedance/seedream/v4/{text-to-image,edit}`、`/fal-ai/qwen-image-edit-plus`、`/fal-ai/imagen4/preview` 等。提交返回 `request_id` + `status_url`，用 `GET /fal-ai/{model_name}/requests/{request_id}` 取结果。常见字段：`prompt`*、`image_urls`、`image_size{width,height}`、`num_images`。

## Replicate 图片（`/replicate/*`，异步）
`POST /replicate/v1/models/<owner>/<model>/predictions`（如 `black-forest-labs/flux-kontext-pro`、`google/imagen-4`、`recraft-ai/recraft-v3`、`bytedance/seedream-4`、`ideogram-ai/ideogram-v2-turbo`），或通用 `POST /replicate/v1/predictions`。用 `GET /replicate/v1/predictions/{id}` 查询。

## 其他
| 端点 | 说明 |
|------|------|
| `POST /tencent-vod/v1/aigc-image` | 腾讯云 VOD AIGC 文生图（异步） |
| `POST /openapi/v2/image/template/generate` | 海螺图片模版生成；`GET /openapi/v2/image/result/{image_id}` 查询 |
| `POST /kling/v1/images/generations` | Kling 图像生成；查询 `GET .../generations/{id}` |
| `POST /kling/v1/images/{multi-image2image,omni-image,editing/expand}` | Kling 多图参考 / Omni / 扩图 |
