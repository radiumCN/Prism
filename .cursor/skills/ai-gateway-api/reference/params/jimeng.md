# 即梦 Jimeng (/jimeng) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## GET `/jimeng/fetch/{task_id}`
_查询视频任务(免费)_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| task_id | path | 是 | string | 任务id |

## POST `/jimeng/submit/videos`
_提交视频生成任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 提示词 |
| `image_url` | string | 是 | 图生视频需要传此参数 |
| `duration` | integer | 是 | 视频时长 枚举值 5, 10 |
| `aspect_ratio` | string | 是 | 视频尺寸 枚举值 "1:1", "21:9", "16:9", "9:16", "4:3", "3:4" |
| `cfg_scale` | integer | 是 |  |

示例：
```json
{
  "prompt": "一只小猪在高速公路上快乐的奔跑",
  "duration": 5,
  "aspect_ratio": "21:9",
  "cfg_scale": 0.5
}
```
