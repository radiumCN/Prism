# Runway (/runwayml) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/runwayml/v1/image_to_video`
_提交视频生成任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `promptImage` | string | 是 | 必填，HTTPS URL或数据URI，包含编码图像作为生成视频的第一帧 |
| `model` | string | 是 | 必填，指定使用的模型变体，可选值："gen4_turbo"或"gen3a_turbo" |
| `ratio` | string | 是 | 必填，输出视频分辨率，格式为"宽度:高度"，不同模型支持不同分辨率 |
| `seed` | integer | 是 | 可选，随机种子值(0-4294967295)，相同种子对相同请求产生相似结果 |
| `promptText` | string | 是 | 可选，字符串(≤1000字符)，详细描述期望在视频中出现的内容 |
| `duration` | integer | 是 | 可选，视频时长(秒)，可选值：5或10，默认为10 |

示例：
```json
{
  "promptImage": "https://www.bt.cn/bbs/template/qiao/style/image/btlogo.png",
  "model": "gen4_turbo",
  "promptText": "cat dance",
  "watermark": false,
  "duration": 5,
  "ratio": "1280:768"
}
```

## GET `/runwayml/v1/tasks/{task_id}`
_查询视频任务(免费)_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| task_id | path | 是 | string | 任务id |
