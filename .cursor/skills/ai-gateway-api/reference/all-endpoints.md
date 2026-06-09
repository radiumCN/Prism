# 全部端点目录（自动生成）

> 由 `scripts/gen_catalog.py` 从 `默认模块.swagger.json` 生成，覆盖全部端点。
> swagger 更新后重跑：`python scripts/gen_catalog.py 默认模块.swagger.json reference/all-endpoints.md`
>
> 共 235 个 path，243 个操作。鉴权统一 `Authorization: Bearer <API_KEY>`；
> 令牌管理类额外需 `new-api-user` 头。精确参数请在 swagger 中检索对应 path。

## OpenAI 兼容 · 文本/嵌入/重排序（8）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/v1/chat/completions` | 文生音乐（Chat格式） |
| POST | `/v1/completions` | 创建完成 |
| POST | `/v1/embeddings` | 文本嵌入 [chat兼容格式] |
| POST | `/v1/messages` | 文本合成 |
| GET | `/v1/models` | 获取令牌支持模型 |
| POST | `/v1/rerank` | 重排序 |
| POST | `/v1/responses` | 创建函数调用 Copy |
| POST | `/v1/responses/compact` | gpt 上下文压缩 |

## OpenAI 兼容 · 音频（3）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/v1/audio/speech` | 创建语音 gpt-4o-mini-tts |
| POST | `/v1/audio/transcriptions` | 音频转文字 gpt-4o-transcribe |
| POST | `/v1/audio/translations` | 创建翻译 (不支持) |

## OpenAI 兼容 · 图片（2）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/v1/images/edits` | Flux编辑（OpenAI dall-e-3格式） |
| POST | `/v1/images/generations` | wan2.7-image-pro |

## OpenAI/Sora · 视频（10）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/sora/v1/characters` | 创建角色 |
| POST | `/v1/video/create` | omni 视频生成 |
| POST | `/v1/video/extend` | 扩展视频 |
| POST | `/v1/video/generations` | 视频生成 veo-3.1-generate-preview |
| GET | `/v1/video/query` | 查询结果 |
| POST | `/v1/videos` | openai 创建视频，图生 |
| POST | `/v1/videos/characters` | 创建一个来自上传视频的角色 |
| GET | `/v1/videos/{id}` | openai 查询任务 |
| GET | `/v1/videos/{id}/content` | openai 下载视频 |
| POST | `/v1/videos/{id}/remix` | openai 编辑视频 |

## Gemini 原生 (/v1beta)（15）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent` | 图片编辑 |
| POST | `/v1beta/models/gemini-2.5-flash-image:generateContent` | 图片生成 gemini-2.5-flash-image 控制宽高比 |
| POST | `/v1beta/models/gemini-2.5-flash-preview-tts:generateContent` | TTS 文本转语音 |
| POST | `/v1beta/models/gemini-2.5-flash:generateContent` | google search |
| POST | `/v1beta/models/gemini-2.5-pro-preview-tts:generateContent` | gemini-tts文本转语音 |
| POST | `/v1beta/models/gemini-2.5-pro:generateContent` | 视频理解-url [原生格式]  开发中 |
| POST | `/v1beta/models/gemini-2.5-pro:streamGenerateContent` | 文本生成+思考-流 |
| POST | `/v1beta/models/gemini-3-pro-image-preview:generateContent` | 图片生成 gemini-3-pro-image-preview 控制宽高比 +清晰度 |
| POST | `/v1beta/models/gemini-3-pro-preview:generateContent` | 文本生成 gemini-3-pro-preview:generateContent |
| POST | `/v1beta/models/gemini-3-pro-preview:streamGenerateContent` | 文本生成-流 |
| POST | `/v1beta/models/gemini-embedding-001:embedContent` | 文本嵌入 |
| POST | `/v1beta/models/imagen-4.0-generate-001:predict` | Imagen 4 开发中 |
| POST | `/v1beta/models/imagen-4.0-ultra-generate-001:predict` | Imagen 生成图片 |
| POST | `/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning` | 视频生成 veo-3.1-fast-generate-preview |
| POST | `/v1beta/models/{modeName}:generateContent` | 图片生成 |

## Midjourney (/mj)（9）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/mj/submit/action` | 执行Action动作 |
| POST | `/mj/submit/blend` | 提交Blend任务 |
| POST | `/mj/submit/describe` | 提交Describe任务 |
| POST | `/mj/submit/imagine` | 提交Imagine任务 |
| POST | `/mj/submit/modal` | 提交Modal |
| POST | `/mj/submit/upload-discord-images` | 上传图片 |
| GET | `/mj/task/1743326750223591/fetch` | 根据任务ID 查询任务状态 |
| POST | `/mj/task/list-by-condition` | 根据ID列表查询任务 |
| GET | `/mj/task/{id}/image-seed` | 获取任务图片的seed |

## Ideogram (/ideogram)（9）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/ideogram/describe` | Describe（描述） |
| POST | `/ideogram/generate` | ideogram（文生图） |
| POST | `/ideogram/remix` | Remix（混合图） |
| POST | `/ideogram/upscale` | Upscale（放大高清） |
| POST | `/ideogram/v1/ideogram-v3/edit` | Generate 3.0（图片编辑）Edit |
| POST | `/ideogram/v1/ideogram-v3/generate` | Generate 3.0（文生图）Generate |
| POST | `/ideogram/v1/ideogram-v3/reframe` | Generate 3.0（图片重构）Reframe |
| POST | `/ideogram/v1/ideogram-v3/remix` | Generate 3.0（图片重制）Remix |
| POST | `/ideogram/v1/ideogram-v3/replace-background` | Generate 3.0（替换背景） Replace Background |

## fal-ai (/fal-ai)（28）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/fal-ai/bytedance/seedream/v4/edit` | /fal-ai/bytedance/seedream/v4/edit |
| POST | `/fal-ai/bytedance/seedream/v4/text-to-image` | /fal-ai/bytedance/seedream/v4/text-to-image |
| POST | `/fal-ai/flux-1/dev` | /fal-ai/flux-1/dev |
| POST | `/fal-ai/flux-1/dev/image-to-image` | /fal-ai/flux-1/dev/image-to-image |
| POST | `/fal-ai/flux-1/dev/redux` | /fal-ai/flux-1/dev/redux |
| POST | `/fal-ai/flux-1/schnell/redux` | /fal-ai/flux-1/schnell/redux |
| POST | `/fal-ai/flux-lora` | /fal-ai/flux-lora |
| POST | `/fal-ai/flux-lora/image-to-image` | /fal-ai/flux-lora/image-to-image |
| POST | `/fal-ai/flux-lora/inpainting` | /fal-ai/flux-lora/inpainting |
| POST | `/fal-ai/flux-pro/kontext` | /fal-ai/flux-pro/kontext |
| POST | `/fal-ai/flux-pro/kontext/max` | /fal-ai/flux-pro/kontext/max |
| POST | `/fal-ai/flux-pro/kontext/max/multi` | /fal-ai/flux-pro/kontext/max/multi |
| POST | `/fal-ai/flux-pro/kontext/text-to-image` | /fal-ai/flux-pro/kontext/text-to-image |
| POST | `/fal-ai/imagen4/preview` | /fal-ai/imagen4/preview |
| POST | `/fal-ai/kling-video/v2.5-turbo/pro/image-to-video` | /fal-ai/kling-video/v2.5-turbo/pro/image-to-video |
| POST | `/fal-ai/kling-video/v2.5-turbo/pro/text-to-video` | /fal-ai/kling-video/v2.5-turbo/pro/text-to-video |
| POST | `/fal-ai/nano-banana` | /fal-ai/nano-banana 文生图 |
| POST | `/fal-ai/nano-banana/edit` | /fal-ai/nano-banana/edit 图片编辑 |
| POST | `/fal-ai/qwen-image-edit-lora` | /fal-ai/qwen-image-edit-lora |
| POST | `/fal-ai/qwen-image-edit-plus` | /fal-ai/qwen-image-edit-plus |
| POST | `/fal-ai/veo3` | /fal-ai/veo3 |
| POST | `/fal-ai/veo3/fast` | /fal-ai/veo3/fast |
| POST | `/fal-ai/veo3/fast/image-to-video` | /fal-ai/veo3/fast/image-to-video |
| POST | `/fal-ai/veo3/image-to-video` | /fal-ai/veo3/image-to-video |
| GET | `/fal-ai/veo3/requests/{request_id}` | /fal-ai/veo3/requests/{request_id} |
| POST | `/fal-ai/vidu/reference-to-image` | /fal-ai/vidu/reference-to-image |
| POST | `/fal-ai/wan/v2.2-a14b/image-to-image` | /fal-ai/wan/v2.2-a14b/image-to-image |
| GET | `/fal-ai/{model_name}/requests/{request_id}` | 获取请求结果 |

## Replicate (/replicate)（21）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/replicate/v1/models/black-forest-labs/flux-1.1-pro-ultra/predictions` | 创建任务 black-forest-labs/flux-1.1-pro-ultra |
| POST | `/replicate/v1/models/black-forest-labs/flux-fill-dev/predictions` | 创建任务 black-forest-labs/flux-fill-dev |
| POST | `/replicate/v1/models/black-forest-labs/flux-fill-pro/predictions` | 创建任务 black-forest-labs/flux-fill-pro |
| POST | `/replicate/v1/models/black-forest-labs/flux-kontext-dev/predictions` | 创建任务 black-forest-labs/flux-kontext-dev |
| POST | `/replicate/v1/models/black-forest-labs/flux-kontext-max/predictions` | 创建任务 black-forest-labs/flux-kontext-max |
| POST | `/replicate/v1/models/black-forest-labs/flux-kontext-pro/predictions` | 创建任务 black-forest-labs/flux-kontext-pro |
| POST | `/replicate/v1/models/bytedance/seedream-4/predictions` | 创建任务 bytedance/seedream-4 |
| POST | `/replicate/v1/models/flux-kontext-apps/multi-image-kontext-max/predictions` | 创建任务 flux-kontext-apps/multi-image-kontext-max |
| POST | `/replicate/v1/models/flux-kontext-apps/multi-image-kontext-pro/predictions` | 创建任务 flux-kontext-apps/multi-image-kontext-pro |
| POST | `/replicate/v1/models/google/imagen-4-fast/predictions` | 创建任务 google/imagen-4-fast |
| POST | `/replicate/v1/models/google/imagen-4-ultra/predictions` | 创建任务 google/imagen-4-ultra |
| POST | `/replicate/v1/models/google/imagen-4/predictions` | 创建任务 google/imagen-4 |
| POST | `/replicate/v1/models/ideogram-ai/ideogram-v2-turbo/predictions` | 创建任务 ideogram-ai/ideogram-v2-turbo |
| POST | `/replicate/v1/models/minimax/video-01-live/predictions` | 创建任务 minimax/video-01-live |
| POST | `/replicate/v1/models/minimax/video-01/predictions` | 创建任务 minimax/video-01 |
| POST | `/replicate/v1/models/prunaai/vace-14b/predictions` | 创建任务 prunaai/vace-14b |
| POST | `/replicate/v1/models/recraft-ai/recraft-v3-svg/predictions` | 创建任务 recraft-ai/recraft-v3-svg |
| POST | `/replicate/v1/models/recraft-ai/recraft-v3/predictions` | 创建任务 recraft-ai/recraft-v3 |
| POST | `/replicate/v1/models/riffusion/riffusion/predictions` | 创建任务 riffusion/riffusion |
| POST | `/replicate/v1/predictions` | 创建任务 lucataco/remove-bg |
| GET | `/replicate/v1/predictions/{任务id}` | 查询任务 |

## Kling (/kling)（51）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/kling/v1/audio/text-to-audio` | 文生音效 |
| GET | `/kling/v1/audio/text-to-audio/{id}` | 查询任务（单个） |
| POST | `/kling/v1/audio/tts` | 语音合成 |
| POST | `/kling/v1/audio/video-to-audio` | 视频生音效 |
| GET | `/kling/v1/audio/video-to-audio/{id}` | 查询任务（单个） |
| POST | `/kling/v1/general/advanced-custom-elements` | 主体（新版本） |
| GET | `/kling/v1/general/advanced-custom-elements/{task_id}` | 查询自定义主体（单个新版本） |
| GET | `/kling/v1/general/advanced-presets-elements` | 查询官方主体（列表新版本） |
| POST | `/kling/v1/general/custom-elements` | 主体(旧) |
| POST | `/kling/v1/general/custom-voices` | 自定义音色 |
| GET | `/kling/v1/general/custom-voices/{id}` | 查询自定义音色（单个） |
| POST | `/kling/v1/general/delete-elements` | 删除自定义主体（新版本） |
| POST | `/kling/v1/general/delete-voices` | 删除自定义音色 |
| GET | `/kling/v1/general/presets-voices` | 查询官方音色 |
| POST | `/kling/v1/images/editing/expand` | 扩图 |
| GET | `/kling/v1/images/editing/expand/{id}` | 查询任务（单个） |
| POST | `/kling/v1/images/generations` | 图像生成 |
| GET | `/kling/v1/images/generations/{id}` | 查询任务（单个） |
| POST | `/kling/v1/images/kolors-virtual-try-on` | 虚拟试穿 |
| POST | `/kling/v1/images/multi-image2image` | 多图参考生图 |
| GET | `/kling/v1/images/multi-image2image/{id}` | 查询任务（单个） |
| POST | `/kling/v1/images/omni-image` | Omni-Image |
| GET | `/kling/v1/images/omni-image/{id}` | 查询任务（单个） |
| POST | `/kling/v1/videos/advanced-lip-sync` | 对口型 |
| GET | `/kling/v1/videos/advanced-lip-sync/{id}` | 查询任务（单个） |
| POST | `/kling/v1/videos/avatar/image2video` | 数字人 |
| GET | `/kling/v1/videos/avatar/image2video/{id}` | 查询任务（单个） |
| POST | `/kling/v1/videos/effects` | 视频特效 |
| GET | `/kling/v1/videos/effects/{id}` | 查询任务（单个） |
| POST | `/kling/v1/videos/identify-face` | 人脸识别 |
| POST | `/kling/v1/videos/image-recognize` | 图像识别 |
| POST | `/kling/v1/videos/image2video` | 图生视频 |
| GET | `/kling/v1/videos/image2video/{id}` | 查询任务（单个） |
| POST | `/kling/v1/videos/lip-sync` | 对口型 |
| POST | `/kling/v1/videos/motion-control` | 动作控制 |
| GET | `/kling/v1/videos/motion-control/{id}` | 查询任务（单个） |
| POST | `/kling/v1/videos/multi-elements` | 多模态视频 |
| POST | `/kling/v1/videos/multi-elements/add-selection` | 增加视频选区 |
| POST | `/kling/v1/videos/multi-elements/delete-selection` | 删减视频选区 |
| POST | `/kling/v1/videos/multi-elements/init-selection` | 初始化待编辑视频 |
| POST | `/kling/v1/videos/multi-elements/preview-selection` | 预览已选区视频 |
| GET | `/kling/v1/videos/multi-elements/{id}` | 查询任务（单个） |
| POST | `/kling/v1/videos/multi-image2video` | 多图参考生视频 |
| GET | `/kling/v1/videos/multi-image2video/{id}` | 查询任务（单个） |
| POST | `/kling/v1/videos/omni-video` | Omni-Video |
| GET | `/kling/v1/videos/omni-video/{id}` | 查询任务（单个） |
| POST | `/kling/v1/videos/text2video` | 文生视频 |
| GET | `/kling/v1/videos/text2video/{id}` | 查询任务（单个） |
| POST | `/kling/v1/videos/video-extend` | 视频延长 |
| GET | `/kling/v1/videos/video-extend/{id}` | 查询任务（单个） |
| GET | `/kling/v1/{action}/{action2}/{task_id}` | 查询任务(免费) |

## Luma (/luma)（4）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/luma/generations` | 提交生成视频任务 |
| GET | `/luma/generations/{task_id}` | 查询单个任务 |
| POST | `/luma/generations/{task_id}/extend` | 扩展视频 |
| POST | `/luma/tasks` | 批量获取任务 |

## Runway (/runwayml)（2）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/runwayml/v1/image_to_video` | 提交视频生成任务 |
| GET | `/runwayml/v1/tasks/{task_id}` | 查询视频任务(免费) |

## 即梦 Jimeng (/jimeng)（2）

| Method | Path | 说明 |
|--------|------|------|
| GET | `/jimeng/fetch/{task_id}` | 查询视频任务(免费) |
| POST | `/jimeng/submit/videos` | 提交视频生成任务 |

## 海螺 Hailuo (/openapi/v2)（19）

| Method | Path | 说明 |
|--------|------|------|
| GET | `/openapi/v2/image/result/{image_id}` | 图片结果查询接口 |
| POST | `/openapi/v2/image/template/generate` | 图片模版生成接口 |
| POST | `/openapi/v2/image/upload` | 上传图片 |
| POST | `/openapi/v2/media/upload` | 上传资源(视频/音频) |
| POST | `/openapi/v2/video/extend/generate` | 生成延长(Extend)视频 |
| POST | `/openapi/v2/video/fusion/generate` | 多主体(多参考)生成视频 |
| POST | `/openapi/v2/video/img/generate` | 生成视频模版 |
| POST | `/openapi/v2/video/lip_sync/generate` | 生成对口型(Lipsync)视频 |
| GET | `/openapi/v2/video/lip_sync/tts_list` | 获取TTS 音色 |
| POST | `/openapi/v2/video/mask/selection` | 主体替换(Swap) Mask 生成 |
| POST | `/openapi/v2/video/mimic/generate` | 动作模仿(Mimic) 视频生成 |
| POST | `/openapi/v2/video/modify/generate` | 视频编辑(Modify) 生成视频 |
| POST | `/openapi/v2/video/multi_transition/generate` | 多帧(Multi-transition) 视频生成 |
| POST | `/openapi/v2/video/restyle/generate` | 重绘视频生成视频 |
| GET | `/openapi/v2/video/result/{video_id}` | 获取视频状态 |
| POST | `/openapi/v2/video/sound_effect/generate` | 音效生成(sound_effect)接口 |
| POST | `/openapi/v2/video/swap/generate` | 主体替换(Swap) 视频生成 |
| POST | `/openapi/v2/video/text/generate` | 生成文生视频 |
| POST | `/openapi/v2/video/transition/generate` | 首尾帧生成视频 |

## MiniMax (/minimax)（9）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/minimax/v1/files` | 上传示例音频 |
| GET | `/minimax/v1/files/retrieve` | 检索(用于视频下载,异步音频下载) |
| GET | `/minimax/v1/query/t2a_async_query_v2` | 查询语音生成任务状态 |
| GET | `/minimax/v1/query/video_generation` | 查询视频生成任务状态 |
| POST | `/minimax/v1/t2a_async_v2` | 创建异步语音合成任务 V2 |
| POST | `/minimax/v1/t2a_v2` | 同步语音合成 V2 |
| POST | `/minimax/v1/video_generation` | 首尾帧生成视频 |
| POST | `/minimax/v1/voice_clone` | 音色快速复刻 |
| POST | `/minimax/v1/voice_design` | 音色设计 |

## Suno (/suno)（7）

| Method | Path | 说明 |
|--------|------|------|
| GET | `/suno/fetch/{task_id}` | 查询单个任务（主用） |
| POST | `/suno/submit/concat` | 生成歌曲(拼接歌曲) |
| POST | `/suno/submit/lyrics` | 生成歌词 |
| POST | `/suno/submit/music` | 生成歌曲(集成) |
| POST | `/suno/submit/persona` | 创建歌手风格(Persona) |
| POST | `/suno/submit/upsample-tags` | 提升音乐风格 |
| POST | `/suno/uploads/audio` | 上传参考音频 |

## Vidu (/ent/v2, /vidu-native)（10）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/ent/v2/audio-tts` | 语音合成 |
| POST | `/ent/v2/img2video` | 创建图生视频任务 |
| POST | `/ent/v2/reference2image` | 创建图片生成任务 |
| POST | `/ent/v2/reference2video` | 创建参考生视频任务（非主体调用） |
| POST | `/ent/v2/start-end2video` | 创建首尾帧生视频任务 |
| GET | `/ent/v2/tasks/{id}/creations` | 获取请求结果 |
| POST | `/ent/v2/text2audio` | 创建文生音频任务 |
| POST | `/ent/v2/text2video` | 创建文生视频任务 |
| POST | `/vidu-native/video/generations` | 创建视频 |
| GET | `/vidu-native/video/generations/{task_id}` | 查询任务 |

## 豆包/火山 Volc (/volc, /api/v3)（6）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/v3/contents/generations/tasks` | 创建视频生成任务 API（doubao-2.0) |
| GET | `/api/v3/contents/generations/tasks` | doubao-2.0 查询视频生成任务列表 |
| GET | `/api/v3/contents/generations/tasks/{id}` | doubao-2.0 查询视频生成任务 API |
| POST | `/volc/v1/contents/generations/tasks` | seedance-1-5-pro |
| GET | `/volc/v1/contents/generations/tasks` | 查询视频生成任务列表-搜索多个任务 ID |
| GET | `/volc/v1/contents/generations/tasks/{task_id}` | 查询单个任务 |

## 阿里百炼 (/alibailian)（3）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/alibailian/api/v1/services/aigc/multimodal-generation/generation` | 语音合成 Copy |
| POST | `/alibailian/api/v1/services/aigc/video-generation/video-synthesis` | happyhorse-1.0-video-edit |
| GET | `/alibailian/api/v1/tasks/{task_id}` | 视频查询 |

## 腾讯云 VOD (/tencent-vod)（4）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/tencent-vod/v1/aigc-image` | 创建任务 |
| POST | `/tencent-vod/v1/aigc-video` | 创建任务 |
| GET | `/tencent-vod/v1/query/{task_id}` | 获取请求结果 |
| POST | `/tencent-vod/v1/template-effect` | 特效模板创建任务 |

## 数字人 (/v1/private-avatar, /v1/real-avatar)（12）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/v1/private-avatar/assets` | ⑥  上传素材 |
| POST | `/v1/private-avatar/assets/list` | ⑦  查询素材列表 |
| GET | `/v1/private-avatar/assets/{id}` | ⑧  查询素材状态 |
| PATCH | `/v1/private-avatar/assets/{id}` | ⑨  更新素材 |
| DELETE | `/v1/private-avatar/assets/{id}` | ⑩  删除素材 |
| POST | `/v1/private-avatar/groups` | ①  创建素材组 |
| POST | `/v1/private-avatar/groups/list` | ②  查询素材组列表 |
| GET | `/v1/private-avatar/groups/{id}` | ③  查询单个素材组 |
| PATCH | `/v1/private-avatar/groups/{id}` | ④  更新素材组 |
| DELETE | `/v1/private-avatar/groups/{id}` | ⑤  删除素材组 |
| POST | `/v1/real-avatar/auth/session` | ⑪  生成真人认证链接 |
| POST | `/v1/real-avatar/groups/from-token` | ⑫  BytedToken 换取 GroupId |

## 令牌/账号/额度 (/api)（9）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/token/` | 新增令牌 |
| GET | `/api/token/` | 获取令牌列表 |
| PUT | `/api/token/` | 修改令牌 |
| DELETE | `/api/token/194804/` | 删除令牌 |
| PUT | `/api/token/batch` | 批量修改令牌 |
| GET | `/api/token/search` | 搜索令牌 |
| POST | `/api/upload` | 上传图片到图床 |
| GET | `/api/usage/token/` | 获取令牌使用情况 |
| GET | `/api/user/self` | 获取账号信息 |
