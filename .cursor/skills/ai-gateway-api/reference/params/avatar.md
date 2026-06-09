# 数字人 (/v1/private-avatar, /v1/real-avatar) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/v1/private-avatar/assets`
_⑥ 上传素材_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 路由选择参数（固定传此值） 枚举: doubao-seedance-2-0-260128, doubao-seedance-2-0-fast-260128 |
| `GroupId` | string | 是 | 接口①返回的 Result.Id |
| `URL` | string | 是 | 素材公网可访问地址（字段名全大写 URL） |
| `AssetType` | string | 是 | 首字母大写 枚举: Image, Video, Audio |
| `Name` | string | 否 | 素材备注名（可选） |

示例：
```json
{
  "model": "doubao-seedance-2-0-260128",
  "GroupId": "group-20260602153837-5vm6c",
  "URL": "https://picsum.photos/800/1200.jpg",
  "AssetType": "Image",
  "Name": "full-body"
}
```

## POST `/v1/private-avatar/assets/list`
_⑦ 查询素材列表_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 路由选择参数（固定传此值） 枚举: doubao-seedance-2-0-260128, doubao-seedance-2-0-fast-260128 |
| `Filter` | object | 否 |  |
| `Filter.GroupIds` | array | 否 |  |
| `Filter.GroupType` | string | 否 | 枚举: AIGC, LivenessFace |
| `Filter.Statuses` | array | 否 |  |
| `Filter.Name` | string | 否 |  |
| `PageNumber` | integer | 否 |  |
| `PageSize` | integer | 否 |  |
| `SortBy` | string | 否 |  |
| `SortOrder` | string | 否 | 枚举: Asc, Desc |

示例：
```json
{
  "model": "doubao-seedance-2-0-260128",
  "Filter": {
    "GroupIds": [
      "group-20260601191715-9q47m"
    ],
    "GroupType": "AIGC",
    "Statuses": [
      "Active",
      "Processing"
    ],
    "Name": "雀国华"
  },
  "PageNumber": 1,
  "PageSize": 10,
  "SortBy": "GroupId",
  "SortOrder": "Asc"
}
```

## GET `/v1/private-avatar/assets/{id}`
_⑧ 查询素材状态_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string | AssetId（接口⑥ Result.Id） |
| model | query | 是 | string | 路由模型（必填） |

## PATCH `/v1/private-avatar/assets/{id}`
_⑨ 更新素材_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string | AssetId |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 路由选择参数（固定传此值） 枚举: doubao-seedance-2-0-260128, doubao-seedance-2-0-fast-260128 |
| `Id` | string | 是 | 与路径 id 一致 |
| `Name` | string | 否 |  |

## DELETE `/v1/private-avatar/assets/{id}`
_⑩ 删除素材_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string | AssetId |
| model | query | 是 | string | 路由模型（必填） |

## POST `/v1/private-avatar/groups`
_① 创建素材组_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 路由选择参数（固定传此值） 枚举: doubao-seedance-2-0-260128, doubao-seedance-2-0-fast-260128 |
| `Name` | string | 是 | 素材组名称（必填） |
| `Description` | string | 否 | 素材组描述（可选） |
| `GroupType` | string | 否 | 虚拟人像固定 AIGC，可省略 |

示例：
```json
{
  "model": "doubao-seedance-2-0-260128",
  "Name": "my_virtual_group",
  "Description": "可选描述",
  "GroupType": "AIGC"
}
```

## POST `/v1/private-avatar/groups/list`
_② 查询素材组列表_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 路由选择参数（固定传此值） 枚举: doubao-seedance-2-0-260128, doubao-seedance-2-0-fast-260128 |
| `Filter` | object | 否 |  |
| `Filter.Name` | string | 否 | 组名模糊匹配 |
| `Filter.GroupIds` | array | 否 |  |
| `Filter.GroupType` | string | 否 | 枚举: AIGC, LivenessFace |
| `PageNumber` | integer | 否 |  |
| `PageSize` | integer | 否 |  |

示例：
```json
{
  "model": "doubao-seedance-2-0-260128",
  "Filter": {
    "Name": "暴建军",
    "GroupIds": [
      "group-20260601191715-9q47m"
    ],
    "GroupType": "AIGC"
  },
  "PageNumber": 1,
  "PageSize": 10
}
```

## GET `/v1/private-avatar/groups/{id}`
_③ 查询单个素材组_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string | GroupId |
| model | query | 是 | string | 路由模型（必填） |

## PATCH `/v1/private-avatar/groups/{id}`
_④ 更新素材组_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string | GroupId |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 路由选择参数（固定传此值） 枚举: doubao-seedance-2-0-260128, doubao-seedance-2-0-fast-260128 |
| `Id` | string | 是 | 与路径 id 一致 |
| `Name` | string | 否 |  |
| `Description` | string | 否 |  |

示例：
```json
{
  "model": "doubao-seedance-2-0-260128",
  "Id": "group-20260601191715-9q47m",
  "Name": "renamed_group",
  "Description": "updated"
}
```

## DELETE `/v1/private-avatar/groups/{id}`
_⑤ 删除素材组_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string | GroupId |
| model | query | 是 | string | 路由模型（必填） |

## POST `/v1/real-avatar/auth/session`
_⑪ 生成真人认证链接_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 路由选择参数（固定传此值） 枚举: doubao-seedance-2-0-260128, doubao-seedance-2-0-fast-260128 |
| `CallbackURL` | string | 是 | 演员认证完成后浏览器跳转地址（业务方自己的前端页面，必填） |
| `Lng` | string | 否 | H5 页面语言（可选） 枚举: zh, en, zh-Hant |

## POST `/v1/real-avatar/groups/from-token`
_⑫ BytedToken 换取 GroupId_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 路由选择参数（固定传此值） 枚举: doubao-seedance-2-0-260128, doubao-seedance-2-0-fast-260128 |
| `BytedToken` | string | 是 | 接口⑪ Result.BytedToken（须在 120 秒内调用） |
