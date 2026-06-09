# Midjourney (/mj) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/mj/submit/action`
_执行Action动作_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `chooseSameChannel` | boolean | 是 | 是否选择同一频道下的账号，默认只使用任务关联的账号 |
| `customId` | string | 否 | 动作标识 |
| `taskId` | string | 否 | 任务ID |
| `notifyHook` | string | 否 | 回调地址, 为空时使用全局notifyHook |
| `state` | string | 否 | 自定义参数 |

示例：
```json
{
  "chooseSameChannel": true,
  "customId": "MJ::JOB::upsample::2::3dbbd469-36af-4a0f-8f02-df6c579e7011",
  "taskId": "14001934816969359",
  "notifyHook": "",
  "state": ""
}
```

## POST `/mj/submit/blend`
_提交Blend任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `botType` | string | 是 | bot类型，mj(默认)或niji 枚举: NIJI_JOURNEY, MID_JOURNEY |
| `base64Array` | string | 否 | 图片base64数组 |
| `dimensions` | string | 否 | 比例: PORTRAIT(2:3); SQUARE(1:1); LANDSCAPE(3:2) 枚举: PORTRAIT, SQUARE, LANDSCAPE |
| `quality` | string | 否 | 将生成的图像的质量。`hd`创建具有更精细细节和更高一致性的图像。此参数仅支持`dall-e-3`. |
| `notifyHook` | string | 否 | 回调地址, 为空时使用全局notifyHook |
| `state` | string | 否 | 自定义参数 |

示例：
```json
{
  "botType": "MID_JOURNEY",
  "base64Array": [
    "data:image/png;base64,xxx1",
    "data:image/png;base64,xxx2"
  ],
  "dimensions": "SQUARE",
  "notifyHook": "",
  "state": ""
}
```

## POST `/mj/submit/describe`
_提交Describe任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `botType` | string | 是 | bot类型，mj(默认)或niji 枚举: MID_JOURNEY, NIJI_JOURNEY |
| `base64` | string | 否 | 用于图像生成的模型。 |
| `notifyHook` | integer | 否 | 要生成的图像数。必须介于 1 和 10 之间。 |
| `state` | string | 否 | 将生成的图像的质量。`hd`创建具有更精细细节和更高一致性的图像。此参数仅支持`dall-e-3`. |

示例：
```json
{
  "botType": "MID_JOURNEY",
  "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAElgGNhQlgAASWAanVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNjMnBhAAAANw9qdW1iAAAAR2p1bWRjMm1hABEAEIAAAKoAOJtxA3VybjpjMnBhOmU5OWY4ZDVkLTk0YTktNDRjNy1iY2QxLThjNzk3Yzk3NGY3NQAAAAHhanVtYgAAAClqdW1kYzJhcwARABCAAACqADibcQNjMnBhLmFzc2VydGlvbnMAAAABBWp1bWIAAAApanVtZGNib3IAEQAQgAAAqgA4m3EDYzJwYS5hY3Rpb25zLnYyAAAAANRjYm9yoWdhY3Rpb25zgqNmYWN0aW9ubGMycGEuY3JlYXRlZG1zb2Z0d2FyZUFnZW50v2RuYW1lZkdQVC00b/9xZGlnaXRhbFNvdXJjZVR5cGV4Rmh0dHA6Ly9jdi5pcHRjLm9yZy9uZXdzY29kZXMvZGlnaXRhbHNvdXJjZXR5cGUvdHJhaW5lZEFsZ29yaXRobWljTWVkaWGiZmFjdGlvbm5jMnBhLmNvbnZlcnRlZG1zb2Z0d2FyZUFnZW50v2RuYW1lak9wZW5BSSBBUEn/AAAAq2p1bWIAAAAoanVtZGNib3IAEQAQgAAAqgA4m3EDYzJwYS5oYXNoLmRhdGEAAAAAe2Nib3KlamV4Y2x1c2lvbnOBomVzdGFydBghZmxlbmd0aBk3QWRuYW1lbmp1bWJmIG1hbmlmZXN0Y2FsZ2ZzaGEyNTZkaGFzaFggCGr+u5unlm9dNxSzfrGn1Z6vrscnpGc++QEtDdT3vJpjcGFkSAAAAAAAAAAAAAAB4mp1bWIAAAAnanVtZGMyY2wAEQAQgAAAqgA4m3EDYzJwYS5jbGFpbS52MgAAAAGzY2JvcqZqaW5zdGFuY2VJRHgseG1wOmlpZDo2YzZlNWZiMy0zZDYxLTQ0OWYtYTdlMi05NmQ0M2FmNDNiMmR0Y2xhaW1fZ2VuZXJhdG9yX2luZm+/ZG5hbWVjQVBJb29yZy5jYWkuYzJwYV9yc2YwLjUxLjH/aXNpZ25hdHVyZXhNc2VsZiNqdW1iZj0vYzJwYS91cm46YzJwYTplOTlmOGQ
...(截断)
```

## POST `/mj/submit/imagine`
_提交Imagine任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `botType` | string | 是 | bot类型，mj(默认)或niji 枚举: MID_JOURNEY, NIJI_JOURNEY |
| `prompt` | string | 是 | 提示词 |
| `base64Array` | array | 否 | 垫图base64数组 |
| `notifyHook` | string | 否 | 回调地址, 为空时使用全局notifyHook |
| `state` | string | 否 | 自定义参数 |

示例：
```json
{
  "base64Array": [],
  "notifyHook": "",
  "prompt": "cat",
  "state": "",
  "botType": "MID_JOURNEY"
}
```

## POST `/mj/submit/modal`
_提交Modal_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `maskBase64` | string | 是 | 局部重绘的蒙版base64 |
| `prompt` | string | 否 | 提示词 |
| `taskId` | integer | 否 | 任务ID |

示例：
```json
{
  "maskBase64": "",
  "prompt": "",
  "taskId": "14001934816969359"
}
```

## POST `/mj/submit/upload-discord-images`
_上传图片_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `base64Array` | array | 是 |  |

示例：
```json
{
  "base64Array": [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAEroAAAbTCAYAAACjv0FTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAgAElEQVR4nOzca7Bl6XnQ9+dZ+5zuuesyI82MZHl0sW7IWLItS1iWZEu4wBdsMLZSwUBBiipIoJJKFXwgyTdSVJGkiqIqVXxyEnDIhSQYLIcYG2NsGRlsy7YsW9eRrJmRNPfpe/e57b2efNh7n7P2Pmvfzunpnun+/VpLvfda73rfd60zX86H/mcAAABwS7nwmZ/Opjlz55WnPvNQ7V9572B07ftq/8K7o915ZwxHZ6Lqjsp2UE0TbTURFRGZkVGTGTIyM6rG3+c/T1XVzPcjzcy3tiraqNjKiEG0kTmsiNqt5sx+5Zmnqrn7DwaveMNnmrP3/E6Nhp9rRrtPPfDRv7f7IrwaAAAAAAAAAAAAAAAAAADgBuv7F8kAAAC8TF34zD++uw6uvnl47fz7985/5Xvbneff0YzqjVF1X5vt9jhVlTHKJprMyNqPiIiMNqIiKprxiLmA1aahq/HZisgmRu0o2mqjaSKajIhoo6kmos5GRDuKZrBXg60r1eRjeea+T2/l9i/F9p2frbb9yoM/8A/2XoTXBAAAAAAAAAAAAAAAAAAA3CBCVwAAALeAZ//d/3BPO9x5VzM69+HRzqUP7F89964aXX79VsZ2tGcGbTRN5Cgyxr8IVkQ0mVERUVGR1UREGxU5E7paHLNaZrJKVmQ0UdVGZBsVFVWDqGgiMiOzHc8fTTTRtNG2o8i41DSDx2Lr7t+J7bs/cecbP/zrzZ0PfPW+b/mTdT3fFwAAAAAAAAAAAAAAAAAAcGMIXQEAALyMPfWL//U9Z171yLt2nv30D9fO89+3dXD5W9u27h1VbkVWjBtV01/92sjIcdgqMqKaqHFzKqoyIiOaiKiKtUJXi691Q1fjrFZFjc9VRE0uV1XEJHSV2XQmHrVZdTWa7Utbd73ms4NXvvF/H7btr2y94i1P3f+eP79/nV4dAAAAAAAAAAAAAAAAAABwAwhdAQAAvAw9+a/+5p1xcOX1bcWH2uHOj7S7L7xvkAcPZGydqbayDiNXEVERETn+q2PawJqmqDJzEqZa/KtiN261KnSVURGZ46DV5PN4M+PoVVZzuL3DOafX
...(截断)
```

## GET `/mj/task/1743326750223591/fetch`
_根据任务ID 查询任务状态_

_请求体无显式字段定义，见 swagger 示例。_

示例：
```json
""
```

## POST `/mj/task/list-by-condition`
_根据ID列表查询任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `ids` | array | 是 |  |

示例：
```json
{
  "ids": [
    "1743326750223591"
  ]
}
```

## GET `/mj/task/{id}/image-seed`
_获取任务图片的seed_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `ids` | array | 否 |  |

示例：
```json
""
```
