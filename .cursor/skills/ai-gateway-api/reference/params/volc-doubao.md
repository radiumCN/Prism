# 豆包/火山 Volc (/volc, /api/v3) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/api/v3/contents/generations/tasks`
_创建视频生成任务 API（doubao-2.0)_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 |  |
| `content` | array | 是 |  |
| `content[].type` | string | 是 |  |
| `content[].text` | string | 否 |  |
| `content[].image_url` | object | 是 |  |
| `content[].image_url.url` | string | 是 |  |
| `content[].role` | string | 是 |  |
| `content[].video_url` | object | 否 |  |
| `content[].video_url.url` | string | 是 |  |
| `content[].audio_url` | object | 否 |  |
| `content[].audio_url.url` | string | 是 |  |
| `generate_audio` | boolean | 否 |  |
| `ratio` | string | 否 |  |
| `duration` | integer | 否 |  |
| `watermark` | boolean | 否 |  |

示例：
```json
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    {
      "type": "text",
      "text": "全程使用视频1的第一视角构图，全程使用音频1作为背景音乐。第一人称视角果茶宣传广告，seedance牌「苹苹安安」苹果果茶限定款；首帧为图片1，你的手摘下一颗带晨露的阿克苏红苹果，轻脆的苹果碰撞声；2-4 秒：快速切镜，你的手将苹果块投入雪克杯，加入冰块与茶底，用力摇晃，冰块碰撞声与摇晃声卡点轻快鼓点，背景音：「鲜切现摇」；4-6 秒：第一人称成品特写，分层果茶倒入透明杯，你的手轻挤奶盖在顶部铺展，在杯身贴上粉红包标，镜头拉近看奶盖与果茶的分层纹理；6-8 秒：第一人称手持举杯，你将图片2中的果茶举到镜头前（模拟递到观众面前的视角），杯身标签清晰可见，背景音「来一口鲜爽」，尾帧定格为图片2。背景声音统一为女生音色。"
    },
    {
      "type": "image_url",
      "image_url": {
        "url": "https://ark-project.tos-cn-beijing.volces.com/doc_image/r2v_tea_pic1.jpg"
      },
      "role": "reference_image"
    },
    {
      "type": "image_url",
      "image_url": {
        "url": "https://ark-project.tos-cn-beijing.volces.com/doc_image/r2v_tea_pic2.jpg"
      },
      "role": "reference_image"
    },
    {
      "type": "video_url",
      "video_url": {
        "url": "https://pro.filesystem.site/cdn/20260403/0e80a635b859e7716671a40d836135.mp4"
      },
      "role": "reference_video"
    },
    {
      "type": "audio_url",
      "audio_url": {
        "url": "https://ark-project.tos-cn-beijing.volces.com/doc_audio/r2v_tea_audio1.mp3"
      },
      "role": "reference_audio"
    }
  ],
  
...(截断)
```

## GET `/api/v3/contents/generations/tasks`
_doubao-2.0 查询视频生成任务列表_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| page_size | query | 否 | string |  |
| filter.status | query | 否 | string |  |

## GET `/api/v3/contents/generations/tasks/{id}`
_doubao-2.0 查询视频生成任务 API_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/volc/v1/contents/generations/tasks`
_seedance-1-5-pro_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 您需要调用的模型的 ID |
| `content` | array | 是 | 输入给模型，生成视频的信息，支持文本信息和图片信息。 |
| `content[].type` | string | 是 | 输入内容的类型 |
| `content[].text` | string | 否 | 输入给模型的文本内容，描述期望生成的视频 |
| `content[].image_url` | object | 是 |  |
| `content[].image_url.url` | string | 是 | 输入给模型的图片对象，图片URL |
| `content[].role` | string | 是 | 图片的位置或用途。 |

示例：
```json
{
  "model": "doubao-seedance-1-5-pro-251215",
  "content": [
    {
      "type": "text",
      "text": "女孩抱着狐狸，女孩睁开眼，温柔地看向镜头，狐狸友善地抱着，镜头缓缓拉出，女孩的头发被风吹动，可以听到风声"
    },
    {
      "type": "image_url",
      "image_url": {
        "url": "https://ark-project.tos-cn-beijing.volces.com/doc_image/i2v_foxrgirl.png"
      }
    }
  ],
  "ratio": "adaptive",
  "duration": 4,
  "watermark": false
}
```

## GET `/volc/v1/contents/generations/tasks`
_查询视频生成任务列表-搜索多个任务 ID_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| filter.task_ids | query | 否 | array |  |

## GET `/volc/v1/contents/generations/tasks/{task_id}`
_查询单个任务_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| task_id | path | 是 | string |  |
