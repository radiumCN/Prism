# Luma (/luma) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/luma/generations`
_提交生成视频任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `user_prompt` | string | 是 | 必传，用户输入的提示词/问题描述 |
| `expand_prompt` | boolean | 是 | 可选，提示词优化开关 |
| `loop` | boolean | 是 | 可选，是否循环使用参考图 |
| `image_url` | string | 是 | 可选，参考图片来源 |
| `image_end_url` | string | 是 | 可选，目标关键帧图片 |
| `notify_hook` | string | 是 | 可选，处理完成后的回调通知地址 |
| `resolution` | string | 是 | 720p或者1080p默认720p |
| `duration` | string | 是 | 时长只支持5s |
| `model_name` | string | 是 | ray-v1、 ray-v2 官方显示是 ray1.6 ray2 |

示例：
```json
{
  "user_prompt": "一阵风吹过树林，使女人的面纱微微飘动。",
  "model_name": "ray-v2",
  "duration": "5s",
  "resolution": "720p"
}
```

## GET `/luma/generations/{task_id}`
_查询单个任务_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| task_id | path | 是 | string | 任务id |

## POST `/luma/generations/{task_id}/extend`
_扩展视频_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| task_id | path | 是 | string | task id 为需要延长的视频任务id |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `user_prompt` | string | 是 | 必传，用户输入的提示词/问题描述，用于生成内容的主要输入 |
| `expand_prompt` | boolean | 是 | 可选，是否启用提示词优化功能 |
| `image_url` | string | 是 | 可选，参考图片URL或Base64编码 |
| `image_end_url` | string | 是 | 可选，关键帧图片URL或Base64编码 |
| `notify_hook` | string | 是 | 可选，回调通知地址 |

示例：
```json
{
  "user_prompt": "add cat",
  "expand_prompt": true
}
```

## POST `/luma/tasks`
_批量获取任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 使用的模型，可选，默认为 kling-image |
| `prompt` | string | 是 | 正向提示词，必需，描述你想要生成的图像内容，不能超过500个字符 |
| `negative_prompt` | string | 是 | 负向提示词，可选，描述你不想在图像中出现的元素，不能超过200个字符 |
| `image` | string | 是 | 参考图片，可选，支持 Base64 编码或图片 URL，支持 .jpg/.jpeg/.png 格式，大小不能超过 10MB |
| `image_fidelity` | number | 是 | 参考图片的影响强度，可选，取值范围：0-1，值越大，生成的图像越接近参考图片 |
| `n` | integer | 是 | 生成图片的数量，可选，取值范围：1-9 |
| `aspect_ratio` | string | 是 | 生成图片的纵横比，可选，可选值：16:9, 9:16, 1:1, 4:3, 3:4, 3:2, 2:3 |
| `callback_url` | string | 是 | 回调通知地址，可选，当任务状态发生变化时，系统会向这个地址发送通知 |

示例：
```json
{
  "ids": [
    "4665a07c-7641-4809-a133-10786201bb56"
  ]
}
```
