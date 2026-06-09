# OpenAI/Sora · 视频 · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/sora/v1/characters`
_创建角色_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | string | 否 | 视频中包含需要创建的角色 ,url 和from_task 二选一 |
| `timestamps` | string | 是 | 单位秒，例如 ‘1,2’ 是指视频的1～2秒中出现的角色，注意范围差值最大 3 秒最小 1 秒 |
| `from_task` | string | 否 | 可以根据已经生成的任务 id，来创建角色 |

示例：
```json
{
  "timestamps": "1,3",
  "from_task": "video_e50c76ca-21d4-40e9-8485-e4ead2d37133"
}
```

## POST `/v1/video/create`
_omni 视频生成_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称（示例：omni-flash、omni-flash-edit） |
| `prompt` | string | 是 | 视频内容描述 |
| `type` | integer | 否 | 生成类型：1=文生视频, 2=首尾帧, 3=垫图参考, 4=Omni-Flash 视频编辑 枚举: 1, 2, 3, 4 |
| `aspect_ratio` | string | 否 | 画幅比例 枚举: 16:9, 9:16 |
| `images` | array | 否 | 图片 URL 数组（type=2 需 1-2 张，type=3 需 1-3 张） |
| `enable_upsample` | boolean | 否 | 升级到 1080p（部分 4K 模型有效） |
| `enable_sample` | boolean | 否 | Omni-Flash 系列切换 1080p（4K 模型忽略） |
| `input_reference` | string | 否 | Omni-Flash edit 参考视频（JSON 场景传 URL 或 dataURI） |
| `seconds` | string | 否 | 视频时长（秒），示例："8" |
| `size` | string | 否 | 自定义尺寸，宽比高长为16：9，高比宽长为9：16，aspect_ratio生效时，该参数无效 |

示例：
```json
{
  "model": "omni-flash",
  "prompt": "hello world"
}
```

## POST `/v1/video/extend`
_扩展视频_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名字 如：grok-video-3 |
| `prompt` | string | 是 | 提示词 |
| `task_id` | string | 是 | 扩展视频任务ID |
| `aspect_ratio` | string | 否 | 可选为 2:3, 3:2, 1:1,按照需要扩展视频的尺寸来 |
| `size` | string | 否 | 720P或者1080P |
| `start_time` | integer | 是 | 开始时间 |
| `upscale` | boolean | 否 |  |

示例：
```json
{
  "model": "grok-video-3",
  "prompt": "play with another white cat",
  "task_id": "grok:7fd641dc-437f-44c3-97a2-e3778e0e10fb",
  "size": "1080p",
  "start_time": 3,
  "upscale": false
}
```

## POST `/v1/video/generations`
_视频生成 veo-3.1-generate-preview_

_请求体无显式字段定义，见 swagger 示例。_

示例：
```json
{
  "model": "veo-3.1-fast-generate-preview",
  "prompt": "A close up of two people staring at a cryptic drawing on a wall",
  "metadata": {
    "aspectRatio": "16:9",
    "durationSeconds": 6
  }
}
```

## GET `/v1/video/query`
_查询结果_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | query | 否 | string |  |
| model | query | 否 | string | 模型名 |

## POST `/v1/videos`
_openai 创建视频，图生_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称 |
| `prompt` | string | 是 | 提示词 |
| `seconds` | number | 否 | 时长 6s / 10s |
| `input_reference` | string | 否 | 图片 url |
| `size` | string | 否 | 16:9 , 9:16 |

## POST `/v1/videos/characters`
_创建一个来自上传视频的角色_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 定义角色名称。 最大长度80 最小长度1 |
| `video` | string | 是 | 用于创建角色的视频文件。目前角色上传时，2 到 4 秒的短片段效果最佳 16：9 或 9：16，分辨率为 720p 到 1080p。角色源视频在匹配要求输出的画面比例时效果最佳。如果宽高比不同，角色可能会显得拉伸或变形。一个视频最多可包含两个角色。 |

## GET `/v1/videos/{id}`
_openai 查询任务_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |
| X-Forwarded-Host | header | 否 | string |  |

_请求体无显式字段定义，见 swagger 示例。_

## GET `/v1/videos/{id}/content`
_openai 下载视频_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |
| X-Forwarded-Host | header | 否 | string |  |

_请求体无显式字段定义，见 swagger 示例。_

## POST `/v1/videos/{id}/remix`
_openai 编辑视频_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 |  |

示例：
```json
{
  "prompt": "画面更精细一些",
  "size": "1280x720"
}
```
