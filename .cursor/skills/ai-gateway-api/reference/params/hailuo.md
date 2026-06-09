# 海螺 Hailuo (/openapi/v2) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## GET `/openapi/v2/image/result/{image_id}`
_图片结果查询接口_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| image_id | path | 是 | string |  |
| API-KEY | header | 否 | string |  |

## POST `/openapi/v2/image/template/generate`
_图片模版生成接口_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `img_ids` | array | 是 |  |
| `template_id` | integer | 是 |  |

示例：
```json
{
  "img_ids": [
    0
  ],
  "template_id": 384631857552768
}
```

## POST `/openapi/v2/image/upload`
_上传图片_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | string | 否 | 重要提示：上传图片时，必须使用携带本地图片文件路径的 form-data 格式，目前不支持通过 URL 上传图片。 |
| `image_url` | string | 否 | 支持url 上传. 只传 image or image_url即可. 只支持一下格式/mime-type: "image/jpeg","image/jpg","image/png","image/webp" |

## POST `/openapi/v2/media/upload`
_上传资源(视频/音频)_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | string | 否 | file or file_url 二选一 |
| `file_url` | string | 否 | 可以使用url 上传资源. 支持以下mime-type/ 后缀 "video/mp4": "mp4", "video/mov": "mov", "video/webm": "webm", "video/quicktime": "mov" "audio/mpeg": "mp3", "audio/wav": "wav",… |

## POST `/openapi/v2/video/extend/generate`
_生成延长(Extend)视频_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `source_video_id` | integer | 否 | 必传source_video_id 或 video_media_id |
| `video_media_id` | integer | 否 | 必传source_video_id 或 video_media_id |
| `prompt` | string | 是 | 2048 Characters 以内 |
| `quality` | string | 是 | "360p","540p","720p","1080p" |
| `duration` | integer | 是 | 视频生成时长 v.3.5/v4/v4.5 : 5/8 (v3.5 1080p 无法使用 8) v5 : 5/8 v5.5 : 5/8/10 (1080p 无法使用 10) |
| `model` | string | 是 | 模型 "v3.5","v4","v4.5","v5",“v5.5“,"v6" |
| `motion_mode` | string | 否 | "normal","fast". "fast" 不支持 8s, "v5" 不支持此字段 |
| `water_mark` | boolean | 是 |  |
| `style` | string | 否 | 风格，可选："anime"、"3d_animation"、"day"、"cyberpunk"、"comic"，如非必要可不传 |
| `seed` | integer | 否 |  |

示例：
```json
{
  "source_video_id": 123123,
  "prompt": "across the universe",
  "seed": 123123,
  "quality": "540p",
  "duration": 8,
  "model": "v5",
  "motion_mode": "normal",
  "water_mark": false
}
```

## POST `/openapi/v2/video/fusion/generate`
_多主体(多参考)生成视频_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image_references` | array | 是 | 图像引用数组（1–3 项），包含“主体”或“背景” v4.5/v5 : 最多3张 v5.5/v5.6/v6 : 最多7张 |
| `image_references[].type` | string | 否 | "subject" or "background" |
| `image_references[].img_id` | integer | 是 | img_id 来自上传图片接口 |
| `image_references[].ref_name` | string | 否 | 可针对图片指定名字, 用来更精准效果. 只允许~30byte (utf-8 )文字 |
| `prompt` | string | 是 | 使用 @ref_name 精确描述场景 1. @ref_name 后必须有空格，如 @cat plays 2. prompt 中引用的名称必须与 image_references 中的 ref_name 完全一致 |
| `model` | string | 是 | "v4.5","v5","v5.5","v5.6",,"v6", "c1" |
| `duration` | integer | 是 | 视频生成时长 v4.5 : 5/8 (v3.5 1080p 无法使用 8) v5 : 5/8 v5.5/5.6 : 5/8/10 (1080p 无法使用 10) |
| `quality` | string | 是 | "360p","540p","720p","1080p" |
| `aspect_ratio` | string | 是 | 1.基础提供 "16:9","9.16","4:3","3:4","1:1" 画幅比 2.v6, c1 额外支持 "2:3","3:2","21:9" |
| `generate_audio_switch` | boolean | 否 | 支持v5.6,v6, c1 / 控制开关Audio. true: Audio on , false: Audio off |
| `seed` | integer | 否 |  |

示例：
```json
{
  "image_references": [
    {
      "type": "subject",
      "img_id": 0,
      "ref_name": "dog"
    },
    {
      "type": "background",
      "img_id": 0,
      "ref_name": "room"
    }
  ],
  "prompt": "@dog plays at @room",
  "model": "v5.6",
  "duration": 5,
  "quality": "720p",
  "aspect_ratio": "16:9",
  "seed": 123456789
}
```

## POST `/openapi/v2/video/img/generate`
_生成视频模版_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `duration` | integer | 是 | 传5即可, 实际duration 按照模版时长生成 |
| `prompt` | string | 是 | 模版不识别prompt, 传空即可 |
| `img_id` | integer | 是 | 单图模版时使用 |
| `img_ids` | array | 否 | 多图模版时使用 ex) "img_ids ":[0,0] |
| `model` | string | 是 | 传任何模型即可, 模版与模型不相关 |
| `template_id` | integer | 是 | 模版ID |
| `quality` | string | 是 | "360p","540p","720p","1080p" |
| `sound_effect_switch` | boolean | 否 | true时, 会有背景音乐 |

示例：
```json
"{\r\n    \"duration\": 5,\r\n    \"img_id\": 1,\r\n    \"model\": \"v6\",\r\n    \"template_id\": 0,\r\n    \"prompt\": \"string\",\r\n    \"quality\": \"720p\",\r\n    //\"sound_effect_switch\":true\r\n}"
```

## POST `/openapi/v2/video/lip_sync/generate`
_生成对口型(Lipsync)视频_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `video_media_id` | integer | 否 | 必传 source_video_id 或 video_media_id 通过pixverse 生成的视频 |
| `source_media_id` | integer | 否 | 必传 source_video_id 或 video_media_id. 通过用户上传的视频 |
| `audio_media_id` | integer | 否 | 必传audio_media_id 或 lip_sync_tts_speaker_id + lip_sync_tts_conent. 使用用户上传的音频 |
| `lip_sync_tts_speaker_id` | string | 否 | 必传audio_media_id 或 lip_sync_tts_speaker_id + lip_sync_tts_conent. 使用我们的TTS 服务. 通过接口获取TTS 音色. |
| `lip_sync_tts_content` | string | 否 | 必传audio_media_id 或 lip_sync_tts_speaker_id + lip_sync_tts_conent 使用我们的TTS 服务 |

示例：
```json
{
  "video_media_id": 0,
  "lip_sync_tts_speaker_id": "auto",
  "lip_sync_tts_content": "hello this is harry, where are you from?"
}
```

## GET `/openapi/v2/video/lip_sync/tts_list`
_获取TTS 音色_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| page_num | query | 是 | string |  |
| page_size | query | 是 | string |  |
| API-KEY | header | 否 | string |  |

## POST `/openapi/v2/video/mask/selection`
_主体替换(Swap) Mask 生成_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `video_media_id` | integer | 否 | 通过接口上传的视频 media_id,必传source_video_id 或 video_media_id |
| `source_video_id` | integer | 否 | 通过拍我API 生成的video_id, 必传source_video_id 或 video_media_id 编码需要为 h.264/h.265 |
| `keyframe_id` | integer | 否 | 从1 到最后视频帧. 如果不提供默认为1 |

示例：
```json
{
  "source_video_id": 0,
  "keyframe_id": 1
}
```

## POST `/openapi/v2/video/mimic/generate`
_动作模仿(Mimic) 视频生成_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `video_media_id` | integer | 否 | 通过接口上传的视频 media_id,必传source_video_id 或 video_media_id |
| `source_video_id` | integer | 否 | 通过拍我API 生成的video_id, 必传source_video_id 或 video_media_id |
| `img_id` | integer | 是 | 上传图片后获取的img_id |
| `quality` | string | 是 | "360p","540p","720p","1080p" |

示例：
```json
{
  "video_media_id": 0,
  "img_id": 0,
  "quality": "360p"
}
```

## POST `/openapi/v2/video/modify/generate`
_视频编辑(Modify) 生成视频_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `video_media_id` | integer | 否 | 通过接口上传的视频 media_id,必传source_video_id 或 video_media_id |
| `source_video_id` | string | 是 | 通过拍我AI 生成的视频video_id,必传source_video_id 或 video_media_id |
| `prompt` | string | 是 | 如果 Prompt 中使用了 mask，请使用 @selection0、@selection1；如果使用参考图片，请使用 @img0、@img1 , 支持 5000字符 |
| `img_ids` | array | 否 | 通过上传接口获取的img_id, 最多支持3个 |
| `mask_ids` | array | 否 | 通过swap-mask接口获取的mask_id, 最多支持3个 |
| `keyframe_ids` | integer | 否 | 指定使用视频中的哪一帧进行替换(编辑) |
| `quality` | string | 是 | "360p","540p","720p" |

示例：
```json
{
  "video_media_id": 1234,
  "prompt": "@selection0 subject is swapped with @img0",
  "img_ids": [
    123
  ],
  "mask_ids": [
    "3847593904"
  ],
  "keyframe_ids": 1,
  "quality": "540p"
}
```

## POST `/openapi/v2/video/multi_transition/generate`
_多帧(Multi-transition) 视频生成_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `multi_transition` | array | 是 | 1. multi_transition 必须是一个包含 2 到 7 个元素的数组。2 . multi_transition 中的每个元素应包含：img_id（必填，整数）、duration（必填，整数，最后一个元素可选）、prompt（可选，字符串）。 |
| `multi_transition[].img_id` | integer | 是 |  |
| `multi_transition[].duration` | integer | 是 |  |
| `multi_transition[].prompt` | string | 否 |  |
| `model` | string | 是 | "v3.5","v4","v4.5","v5" |
| `quality` | string | 是 | "360p","540p","720p","1080p" |

示例：
```json
{
  "multi_transition": [
    {
      "img_id": 0,
      "duration": 3,
      "prompt": ""
    },
    {
      "img_id": 0,
      "duration": 3,
      "prompt": ""
    },
    {
      "img_id": 0,
      "duration": 3,
      "prompt": ""
    },
    {
      "img_id": 0,
      "duration": 3,
      "prompt": ""
    },
    {
      "img_id": 0,
      "duration": 0,
      "prompt": ""
    }
  ],
  "model": "v5",
  "quality": "360p",
  "motion_mode": "normal"
}
```

## POST `/openapi/v2/video/restyle/generate`
_重绘视频生成视频_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `source_video_id` | integer | 否 | 用户用拍我API 生成过的视频, 必传source_video_id 或 video_media_id |
| `video_media_id` | integer | 否 | 用户上传的视频,必传source_video_id 或 video_media_id |
| `restyle_id` | integer | 否 | 从重绘效果列表获取的ID, restyle_id 或restyle_prompt 需要填写 |
| `restyle_prompt` | string | 否 | 支持提示词替换风格, restyle_id 或restyle_prompt 需要填写 5000 字符以内 |
| `seed` | integer | 否 |  |

示例：
```json
{
  "source_video_id": 0,
  "restyle_id": 0,
  "seed": 0
}
```

## GET `/openapi/v2/video/result/{video_id}`
_获取视频状态_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| video_id | path | 是 | string |  |
| API-KEY | header | 是 | string |  |

## POST `/openapi/v2/video/sound_effect/generate`
_音效生成(sound_effect)接口_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `source_video_id` | integer | 否 | 必传source_video_id 或 video_media_id |
| `video_media_id` | integer | 否 | 必传source_video_id 或 video_media_id |
| `original_sound_switch` | boolean | 否 | 控制是否播放背景音乐。必须为布尔值。 |
| `sound_effect_content` | string | 否 | 可选。如果未提供，则会生成随机音效。 |

示例：
```json
{
  "source_video_id": 343252978602905,
  "original_sound_switch": true,
  "sound_effect_content": ""
}
```

## POST `/openapi/v2/video/swap/generate`
_主体替换(Swap) 视频生成_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `video_media_id` | integer | 否 | 通过接口上传的视频 media_id,必传source_video_id 或 video_media_id |
| `source_video_id` | integer | 否 | 通过拍我API 生成的video_id, 必传source_video_id 或 video_media_id |
| `keyframe_id` | integer | 是 | 从1 到最后视频帧. 如果不提供默认为1 |
| `mask_id` | string | 是 |  |
| `img_id` | integer | 是 |  |
| `quality` | string | 是 |  |

示例：
```json
{
  "source_video_id": 0,
  "keyframe_id": 1,
  "mask_id": "0",
  "img_id": 0,
  "quality": "360p"
}
```

## POST `/openapi/v2/video/text/generate`
_生成文生视频_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `aspect_ratio` | string | 是 | 1. 基础提供 "16:9","9.16","4:3","3:4","1:1" 画幅比 2. v6,c1 支持 "16:9","9.16","4:3","3:4","1:1","2:3","3:2","21:9" |
| `duration` | integer | 是 | 视频生成时长 视频生成时长 v.3.5/v4/v4.5 : 5/8 (v3.5 1080p 无法使用 8) v5 : 5/8 v5.5/5.6 : 5/8/10 (1080p 无法使用 10) v6/c1 : 1~15 任意时长 |
| `model` | string | 是 | 模型 "v3.5","v4","v4.5", "v5","v5.5","v5.6","v6","c1" |
| `motion_mode` | string | 否 | "normal","fast". "fast" 不支持 8s, "v5" 以上版本不支持此字段 |
| `camera_movement` | string | 否 | 可以在文/图生视频添加运镜(支持v4,v4.5版本) 支持参数: "horizontal_left","horizontal_right","vertical_up","vertical_down", "zoom_in","zoom_out","crane_up", "quickly_zoom_in","quickly… |
| `prompt` | string | 是 | 5000 Characters 以内 |
| `quality` | string | 是 | "360p","540p","720p","1080p" |
| `template_id` | integer | 否 | 模版(特效)ID , 使用之前需要激活 |
| `generate_audio_switch` | boolean | 否 | 支持 v5.5,v5.6,v6,c1 / 控制开关Audio. true: Audio on , false: Audio off |
| `generate_multi_clip_switch` | boolean | 否 | 支持:v5.5,v6 控制单镜头, 多镜头 true: 多镜头 , false: 单镜头/ |
| `sound_effect_switch` | boolean | 否 | v5 以下 or 有template_id时可使用. true, false 如果想一起使用sound_effect 请传为true |
| `sound_effect_content` | string | 否 | v5 以下 or 有template_id时可使用.可输入想要的音效, 如果不填写会根据视频内容生成音效 |
| `lip_sync_tts_switch` | boolean | 否 | true, false 如果想一起使用对口型 请传为true |
| `lip_sync_tts_content` | string | 否 | ~140Chracters (UTF-8). 可输入想要的tts 内容 |
| `lip_sync_tts_speaker_id` | string | 否 | 获取TTS 音色后的id |
| `seed` | integer | 否 | 可传随机数 0 - 2147483647 |

示例：
```json
{
  "aspect_ratio": "16:9",
  "duration": 5,
  "model": "v6",
  "motion_mode": "normal",
  "prompt": "string",
  "quality": "540p",
  "seed": 0
}
```

## POST `/openapi/v2/video/transition/generate`
_首尾帧生成视频_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| API-KEY | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `duration` | integer | 是 | 视频生成时长 v.3.5/v4/v4.5 : 5/8 (v3.5 1080p 无法使用 8) v5 : 5/8 v5.5/v5.6 : 5/8/10 (1080p 无法使用 10) v6/c1 : 1~15 |
| `first_frame_img` | integer | 是 | 上传图片后获取的img_id |
| `last_frame_img` | integer | 是 | 上传图片后获取的img_id |
| `model` | string | 是 | 模型 "v3.5","v4","v4.5", "v5","v5.5","v5.6","v6","c1" |
| `motion_mode` | string | 否 | "normal","fast". "fast" 不支持 8s, "v5" 不支持此字段 |
| `prompt` | string | 是 | 2048 Characters 以内 |
| `quality` | string | 是 | "360p","540p","720p","1080p" |
| `generate_audio_switch` | boolean | 否 | 支持 v5.5, v5.6, v6,c1 使用 / 控制开关Audio. true: Audio on , false: Audio off |
| `sound_effect_switch` | boolean | 否 | v5 以下 or 有template_id时可使用.true, false 如果想一起使用sound_effect 请传为true |
| `sound_effect_content` | string | 否 | 可输入想要的音效, 如果不填写会根据视频内容生成音效 |
| `lip_sync_tts_switch` | boolean | 否 | true, false 如果想一起使用对口型 请传为true |
| `lip_sync_tts_content` | string | 否 | ~140Chracters (UTF-8). 可输入想要的tts 内容 可适用范围 : "v3.5","v4","v4.5","v5" |
| `lip_sync_tts_speaker_id` | string | 否 | 获取TTS 音色后的id 可适用范围 : "v3.5","v4","v4.5","v5" |
| `seed` | integer | 否 | 可传随机数 0 - 2147483647 |

示例：
```json
{
  "prompt": "trasnfrom into character",
  "model": "v4.5",
  "duration": 5,
  "quality": "540p",
  "motion_mode": "normal",
  "seed": 937433858,
  "first_frame_img": 0,
  "last_frame_img": 0
}
```
