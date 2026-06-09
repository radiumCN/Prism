# 令牌/账号/额度 (/api) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/api/token/`
_新增令牌_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| new-api-user | header | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 令牌名字 |
| `remain_quota` | integer | 是 | 50w为1刀 |
| `expired_time` | integer | 是 | 到期时间戳 单位秒 没有到期限制设置为-1 |
| `unlimited_quota` | boolean | 是 | 无限额度设置 |
| `model_limits_enabled` | boolean | 是 | 可用模型限制设置 |
| `model_limits` | string | 是 | 可用模型列表: 模型名字按,号分割 |
| `allow_ips` | string | 是 | 白名单IP列表: 按\n号分割 |
| `group` | string | 是 | 支持分组 按,号分割 |

示例：
```json
{
  "remain_quota": 250000000000,
  "expired_time": -1,
  "unlimited_quota": false,
  "model_limits_enabled": false,
  "model_limits": "",
  "group": "",
  "mj_image_mode": "default",
  "mj_custom_proxy": "",
  "selected_groups": [],
  "name": "令牌名字",
  "allow_ips": ""
}
```

## GET `/api/token/`
_获取令牌列表_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| p | query | 是 | string |  |
| size | query | 是 | string |  |
| new-api-user | header | 是 | string | 你的账户id |

## PUT `/api/token/`
_修改令牌_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| new-api-user | header | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 令牌名字 |
| `remain_quota` | integer | 是 | 50w为1刀 |
| `expired_time` | integer | 是 | 到期时间戳 单位秒 没有到期限制设置为-1 |
| `unlimited_quota` | boolean | 是 | 无限额度设置 |
| `model_limits_enabled` | boolean | 是 | 可用模型限制设置 |
| `model_limits` | string | 是 | 可用模型列表: 模型名字按,号分割 |
| `allow_ips` | string | 是 | 白名单IP列表: 按\n号分割 |
| `group` | string | 是 | 支持分组 按,号分割 |

示例：
```json
{
  "id": 194804,
  "remain_quota": 250000000000,
  "expired_time": -1,
  "unlimited_quota": false,
  "model_limits_enabled": false,
  "model_limits": "",
  "group": "",
  "mj_image_mode": "default",
  "mj_custom_proxy": "",
  "selected_groups": [],
  "name": "令牌22名字",
  "allow_ips": ""
}
```

## DELETE `/api/token/194804/`
_删除令牌_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| new-api-user | header | 是 | string |  |

## PUT `/api/token/batch`
_批量修改令牌_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| new-api-user | header | 否 | string | 你的账户id |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `ids` | object | 是 | 这里是要修改的token id，多个以逗号分隔 |
| `ids.873,869` | string | 是 | 某个id 或多个id，用逗号分隔 |
| `group` | string | 是 | 【可选】分组 多个逗号分隔，顺序优先 |
| `expired_time` | integer | 是 | 【可选】过期时间 |
| `remain_quota` | integer | 是 | 【可选】额度 50w为1刀 |
| `unlimited_quota` | boolean | 是 | 【可选】true 为无限额度,false 则填写 remain_quota有效 |
| `model_limits` | string | 是 | 【可选】模型限制列表 多个以逗号分隔 |
| `model_limits_enabled` | boolean | 是 | 【可选】访问限制【可用模型限制设置】 |
| `allow_ips` | string | 是 | 【可选】白名单 按\n号分割 |
| `mj_image_mode` | string | 是 | 【可选】配置图片代理方式 暂时只有 origin 和 proxy 两种 |
| `mj_custom_proxy` | string | 是 | 【可选】自定义图片代理地址 只有 mj_image_mode 为 |
| `update_fields` | object | 是 | 修改的 |
| `update_fields.group` | string | 是 | 【可选】分组 |
| `update_fields.expired_time` | string | 是 | 【可选】过期时间 |
| `update_fields.remain_quota` | string | 是 | 【可选】额度 50w为1刀 |
| `update_fields.unlimited_quota` | string | 是 | 【可选】true 为无限额度,false 则填写 remain_quota有效 |
| `update_fields.model_limits` | string | 是 | 【可选】模型限制列表 |
| `update_fields.allow_ips` | string | 是 | 【可选】白名单 按\n号分割 |
| `update_fields.mj_image_mode` | string | 是 | 【可选】配置图片代理方式 |
| `update_fields.mj_custom_proxy` | string | 是 | 【可选】自定义图片代理地址 |
| `update_fields.model_limits_enabled` | string | 是 | 【可选】访问限制【可用模型限制设置】 |

示例：
```json
{
  "ids": [
    873,
    869
  ],
  "group": "default",
  "expired_time": 1776410923,
  "remain_quota": 0,
  "unlimited_quota": true,
  "model_limits": "gpt-4o,gpt-4o-2024-11-20",
  "model_limits_enabled": true,
  "allow_ips": "192.168.1.1",
  "mj_image_mode": "origin",
  "mj_custom_proxy": "",
  "update_fields": [
    "group",
    "expired_time",
    "remain_quota",
    "unlimited_quota",
    "model_limits",
    "allow_ips",
    "mj_image_mode",
    "mj_custom_proxy"
  ]
}
```

## GET `/api/token/search`
_搜索令牌_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| keyword | query | 否 | string | 搜索令牌名字 |
| token | query | 否 | string | 搜索令牌密钥 |
| new-api-user | header | 是 | string | 你的账户id |

## POST `/api/upload`
_上传图片到图床_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | string | 否 |  |

## GET `/api/usage/token/`
_获取令牌使用情况_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| new-api-user | header | 是 | string |  |

## GET `/api/user/self`
_获取账号信息_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| new-api-user | header | 是 | string | 你的账户id |
