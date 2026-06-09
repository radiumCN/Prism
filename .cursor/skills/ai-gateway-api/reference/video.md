# 视频生成 / 编辑

几乎全是异步「提交 + 轮询」。鉴权 `Authorization: Bearer <API_KEY>`。每家提交返回的 task_id 字段名与查询端点不同，回查 swagger。

## Kling（`/kling/*`）
| 提交 | 查询 |
|------|------|
| `POST /kling/v1/videos/text2video` 文生视频 | `GET /kling/v1/videos/text2video/{id}` |
| `POST /kling/v1/videos/image2video` 图生视频 | `GET /kling/v1/videos/image2video/{id}` |
| `POST /kling/v1/videos/multi-image2video` 多图参考 | `GET .../multi-image2video/{id}` |
| `POST /kling/v1/videos/video-extend` 视频延长 | `GET .../video-extend/{id}` |
| `POST /kling/v1/videos/effects` 特效 | `GET .../effects/{id}` |
| `POST /kling/v1/videos/lip-sync` / `advanced-lip-sync` 对口型 | `GET .../advanced-lip-sync/{id}` |
| `POST /kling/v1/videos/omni-video` / `multi-elements` / `motion-control` / `avatar/image2video` 数字人 | 各自 `/{id}` |
| `POST /kling/v1/videos/{image-recognize,identify-face}` 识别 | 同步 |
| 通用免费查询 | `GET /kling/v1/{action}/{action2}/{task_id}` |

`text2video` 关键字段：`model_name`(枚举 kling-v1/v1-6/v2-master/v2-1-master/v2-5-turbo/v3)、`prompt`*、`negative_prompt`、`cfg_scale`、`mode`(std/pro)、`duration`、`multi_shot`/`multi_prompt`、`camera_control`、`sound`。

## Vidu（`/ent/v2/*`）
`POST /ent/v2/{text2video,img2video,reference2video,start-end2video,reference2image,text2audio,audio-tts}`，统一 `GET /ent/v2/tasks/{id}/creations` 取结果。

## 海螺 Hailuo（`/openapi/v2/*`）
`POST /openapi/v2/video/{text,img,transition,lip_sync,extend,sound_effect,fusion,restyle,swap,multi_transition,mimic,modify}/generate`；状态 `GET /openapi/v2/video/result/{video_id}`；音色 `GET /openapi/v2/video/lip_sync/tts_list`；上传 `POST /openapi/v2/{image,media}/upload`。

## 其他服务商
| 提交 | 查询 |
|------|------|
| `POST /luma/generations`（含 `/extend`） | `GET /luma/generations/{task_id}`、`GET /luma/tasks` 批量 |
| `POST /runwayml/v1/image_to_video` | `GET /runwayml/v1/tasks/{task_id}` |
| `POST /jimeng/submit/videos` 即梦 | `GET /jimeng/fetch/{task_id}` |
| `POST /minimax/v1/video_generation` 首尾帧 | `GET /minimax/v1/query/video_generation` |
| `POST /volc/v1/contents/generations/tasks` seedance | `GET /volc/v1/contents/generations/tasks/{task_id}` |
| `POST /api/v3/contents/generations/tasks` 豆包2.0 | `GET /api/v3/contents/generations/tasks/{id}` |
| `POST /vidu-native/video/generations` | `GET /vidu-native/video/generations/{task_id}` |
| `POST /alibailian/api/v1/services/aigc/video-generation/video-synthesis` 阿里百炼 | `GET /alibailian/api/v1/tasks/{task_id}` |
| `POST /tencent-vod/v1/{aigc-video,template-effect}` 腾讯VOD | 见 swagger |

| `POST /tencent-vod/v1/{aigc-video,template-effect}` 腾讯VOD | `GET /tencent-vod/v1/query/{task_id}` |
| `POST /alibailian/.../video-generation/video-synthesis` happyhorse | `GET /alibailian/api/v1/tasks/{task_id}` |
| `POST /alibailian/.../multimodal-generation/generation` 多模态合成 | 同上 |

## Veo / Sora / OpenAI 视频
- Veo：`POST /v1/video/generations`、`POST /v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning`、fal-ai `/fal-ai/veo3*`。
- omni：`POST /v1/video/create`（生成）→ `GET /v1/video/query`（查询结果）。
- Sora/OpenAI 视频：`POST /v1/videos`（创建/图生）、`GET /v1/videos/{id}`（查询）、`GET /v1/videos/{id}/content`（下载）、`POST /v1/videos/{id}/remix`（编辑）、`POST /v1/videos/characters`、`POST /sora/v1/characters`（角色）、`POST /v1/video/extend`（扩展）。
