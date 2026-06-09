# Suno (/suno) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## GET `/suno/fetch/{task_id}`
_查询单个任务（主用）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| task_id | path | 是 | string | 任务id |

## POST `/suno/submit/concat`
_生成歌曲(拼接歌曲)_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `clip_id` | string | 是 | 续写返回的 clipId |

示例：
```json
{
  "clip_id": "4b2300c2-f200-4011-8f80-e3401da28c4f"
}
```

## POST `/suno/submit/lyrics`
_生成歌词_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 歌词主题/关键词 |

示例：
```json
{
  "prompt": "my love"
}
```

## POST `/suno/submit/music`
_生成歌曲(集成)_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `gpt_description_prompt` | string | 否 | 灵感模式：用自然语言描述想要的音乐风格/主题（与 prompt 二选一，优先灵感） |
| `prompt` | string | 否 | 自定义模式：新歌歌词；续写/补段/重制/混搭等也常用。task=remaster 时上游必填 |
| `tags` | string | 否 | 风格标签，逗号分隔，如 "pop, piano, emotional"。可空 |
| `title` | string | 否 | 歌曲标题 |
| `mv` | string | 否 | 模型版本；不传默认 chirp-v5。task=artist_consistency 时仅建议 chirp-v3-5-tau 或 chirp-v4-tau |
| `make_instrumental` | boolean | 否 | 是否生成纯音乐（无人声） |
| `continue_clip_id` | string | 否 | 续写/补段用的源 clip ID。须为已生成歌曲的 clip_id（从 GET /suno/fetch/:id 结果获取），非 task_id |
| `continue_at` | number | 否 | 从源音频第几秒开始续写（配合 continue_clip_id） |
| `task_id` | string | 否 | 关联原任务 ID，用于渠道路由（可选） |
| `task` | string | 否 | 特殊任务类型；不传则为普通生成（灵感/自定义/纯音乐） 枚举: extend, upload_extend, infill, fixed_infill, infill_intro, infill_outro, cover_infill, cover_extend, artist_infill, artist_consi… |
| `persona_id` | string | 否 | Persona ID。仅 task=artist_consistency 时必填。须先 POST /suno/submit/persona 创建成功后从 fetch 结果获取；无固定枚举，不可手写假 UUID。Persona 与创建账号绑定，不可跨账号复用创建步骤。 |
| `artist_clip_id` | string | 否 | 源曲 clip_id（步骤 A 生成音乐后从 fetch 结果取得）。task=artist_consistency 时必填，且应与创建 Persona 时使用的 root_clip_id 为同一首源曲。须为系统内已生成 clip，非 uploader 临时 ID。 |
| `metadata_params` |  | 否 |  |
| `metadata` | object | 否 | 扩展字段；可通过 metadata.task 或 metadata.metadata_params 传参（与顶层二选一即可） |
| `metadata.task` | string | 否 |  |
| `metadata.metadata_params` |  | 否 |  |
| `metadata.metadataParams` |  | 否 |  |

示例：
```json
{
  "gpt_description_prompt": "一首轻快的爵士钢琴曲，适合咖啡厅背景",
  "mv": "chirp-v4"
}
```

## POST `/suno/submit/persona`
_创建歌手风格(Persona)_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `root_clip_id` | string | 是 | 源歌曲 clipId；也可用 clip_id |
| `vocal_start_s` | integer | 是 | 人声片段起始秒 |
| `vocal_end_s` | integer | 是 | 人声片段结束秒，须大于 start |
| `user_input_styles` | string | 是 | 风格描述；可改用 tags |

示例：
```json
{
  "root_clip_id": "518d910f-a6b7-43fc-9f65-c9f116f3f8a3",
  "vocal_start_s": 10,
  "vocal_end_s": 30,
  "user_input_styles": "pop,female voice"
}
```

## POST `/suno/submit/upsample-tags`
_提升音乐风格_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `original_tags` | string | 是 | 原始风格描述 |

示例：
```json
{
  "original_tags": "深度浩室，情感，旋律"
}
```

## POST `/suno/uploads/audio`
_上传参考音频_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | string | 是 | 公网可访问 mp3，必填 |
| `name` | string | 是 | 显示名，可空 |
| `timeout` | integer | 是 | 超时秒数，默认 90 |

示例：
```json
{
  "url": "https://cdn1.suno.ai/363675c6-cf6d-4904-8702-00d272edb42d.mp3",
  "name": "参考音频",
  "timeout": 90
}
```
