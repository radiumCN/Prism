# OpenAI 兼容 · 文本/嵌入/重排序 · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/v1/chat/completions`
_文生音乐（Chat格式）_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 要使用的模型的 ID。有关哪些模型可与聊天 API 一起使用的详细信息,请参阅模型端点兼容性表。 |
| `messages` | array | 是 | 至今为止对话所包含的消息列表。Python 代码示例。 |
| `messages[].role` | string | 否 |  |
| `messages[].content` | string | 否 |  |
| `temperature` | integer | 否 | 使用什么采样温度，介于 0 和 2 之间。较高的值（如 0.8）将使输出更加随机，而较低的值（如 0.2）将使输出更加集中和确定。 我们通常建议改变这个或`top_p`但不是两者。 |
| `top_p` | integer | 否 | 一种替代温度采样的方法，称为核采样，其中模型考虑具有 top_p 概率质量的标记的结果。所以 0.1 意味着只考虑构成前 10% 概率质量的标记。 我们通常建议改变这个或`temperature`但不是两者。 |
| `n` | integer | 否 | 默认为 1 为每个输入消息生成多少个聊天补全选择。 |
| `stream` | boolean | 否 | 默认为 false 如果设置,则像在 ChatGPT 中一样会发送部分消息增量。标记将以仅数据的服务器发送事件的形式发送,这些事件在可用时,并在 data: [DONE] 消息终止流。Python 代码示例。 |
| `stop` | string | 否 | 默认为 null 最多 4 个序列,API 将停止进一步生成标记。 |
| `max_tokens` | integer | 否 | 默认为 inf 在聊天补全中生成的最大标记数。 输入标记和生成标记的总长度受模型的上下文长度限制。计算标记的 Python 代码示例。 |
| `presence_penalty` | number | 否 | -2.0 和 2.0 之间的数字。正值会根据到目前为止是否出现在文本中来惩罚新标记，从而增加模型谈论新主题的可能性。 [查看有关频率和存在惩罚的更多信息。](https://platform.openai.com/docs/api-reference/parameter-details) |
| `frequency_penalty` | number | 否 | 默认为 0 -2.0 到 2.0 之间的数字。正值根据文本目前的存在频率惩罚新标记,降低模型重复相同行的可能性。 有关频率和存在惩罚的更多信息。 |
| `logit_bias` | null | 否 | 修改指定标记出现在补全中的可能性。 接受一个 JSON 对象,该对象将标记(由标记器指定的标记 ID)映射到相关的偏差值(-100 到 100)。从数学上讲,偏差在对模型进行采样之前添加到模型生成的 logit 中。确切效果因模型而异,但-1 和 1 之间的值应减少或增加相关标记的选择可能性;如-100 或 100 这… |
| `user` | string | 否 | 代表您的最终用户的唯一标识符，可以帮助 OpenAI 监控和检测滥用行为。[了解更多](https://platform.openai.com/docs/guides/safety-best-practices/end-user-ids)。 |
| `response_format` | object | 否 | 指定模型必须输出的格式的对象。 将 { "type": "json_object" } 启用 JSON 模式,这可以确保模型生成的消息是有效的 JSON。 重要提示:使用 JSON 模式时,还必须通过系统或用户消息指示模型生成 JSON。如果不这样做,模型可能会生成无休止的空白流,直到生成达到令牌限制,从而导致延迟增加… |
| `seen` | integer | 否 | 此功能处于测试阶段。如果指定,我们的系统将尽最大努力确定性地进行采样,以便使用相同的种子和参数进行重复请求应返回相同的结果。不能保证确定性,您应该参考 system_fingerprint 响应参数来监控后端的更改。 |
| `tools` | array | 是 | 模型可以调用的一组工具列表。目前,只支持作为工具的函数。使用此功能来提供模型可以为之生成 JSON 输入的函数列表。 |
| `tool_choice` | object | 是 | 控制模型调用哪个函数(如果有的话)。none 表示模型不会调用函数,而是生成消息。auto 表示模型可以在生成消息和调用函数之间进行选择。通过 {"type": "function", "function": {"name": "my_function"}} 强制模型调用该函数。 如果没有函数存在,默认为 none。如… |

示例：
```json
{
  "model": "suno-v3",
  "messages": [
    {
      "role": "user",
      "content": "写一首动听的情歌,送给我的老婆"
    }
  ],
  "stream": false
}
```

## POST `/v1/completions`
_创建完成_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 要使用的模型的 ID。您可以使用[List models](https://platform.openai.com/docs/api-reference/models/list) API 来查看所有可用模型，或查看我们的[模型概述](https://platform.openai.com/docs/models/ove… |
| `prompt` | string | 是 | 生成完成的提示，编码为字符串、字符串数组、标记数组或标记数组数组。 请注意，<\|endoftext\|> 是模型在训练期间看到的文档分隔符，因此如果未指定提示，模型将生成新文档的开头。 |
| `best_of` | integer | 否 | 默认为1 在服务器端生成best_of个补全,并返回“最佳”补全(每个令牌的日志概率最高的那个)。无法流式传输结果。 与n一起使用时,best_of控制候选补全的数量,n指定要返回的数量 – best_of必须大于n。 注意:因为这个参数会生成许多补全,所以它可以快速消耗您的令牌配额。请谨慎使用,并确保您对max_to… |
| `echo` | boolean | 否 | 默认为false 除了补全之外,还回显提示 |
| `frequency_penalty` | number | 否 | 默认为0 -2.0和2.0之间的数字。正值根据文本目前的现有频率处罚新令牌,降低模型逐字重复相同行的可能性。 |
| `logit_bias` | object | 否 | 默认为null 修改完成中指定令牌出现的可能性。 接受一个JSON对象,该对象将令牌(由GPT令牌化器中的令牌ID指定)映射到关联偏差值,-100到100。您可以使用这个令牌化器工具(适用于GPT-2和GPT-3)将文本转换为令牌ID。从数学上讲,偏差在对模型进行采样之前添加到生成的logit中。确切效果因模型而异,但… |
| `logprobs` | null | 否 | 默认为null 包括logprobs个最可能令牌的日志概率,以及所选令牌。例如,如果logprobs为5,API将返回5个最有可能令牌的列表。 API总会返回采样令牌的logprob,因此响应中最多可能有logprobs+1个元素。 logprobs的最大值是5。 |
| `max_tokens` | integer | 否 | 默认为16 在补全中生成的最大令牌数。 提示的令牌计数加上max_tokens不能超过模型的上下文长度。 计数令牌的Python代码示例。 |
| `n` | integer | 否 | 默认为1 为每个提示生成的补全数量。 注意:因为这个参数会生成许多补全,所以它可以快速消耗您的令牌配额。请谨慎使用,并确保您对max_tokens和stop有合理的设置。 |
| `presence_penalty` | number | 否 | 默认为0 -2.0和2.0之间的数字。正值根据它们是否出现在目前的文本中来惩罚新令牌,增加模型讨论新话题的可能性。 有关频率和存在惩罚的更多信息,请参阅。 |
| `seed` | integer | 否 | 如果指定,我们的系统将尽最大努力确定性地进行采样,以便使用相同的种子和参数的重复请求应返回相同的结果。 不保证确定性,您应该参考system_fingerprint响应参数来监视后端的更改。 |
| `stop` | string | 否 | 默认为null 最多4个序列,API将停止在其中生成更多令牌。返回的文本不会包含停止序列。 |
| `stream` | boolean | 否 | 默认为false 是否流回部分进度。如果设置,令牌将作为可用时发送为仅数据的服务器发送事件,流由数据 Terminated by a data: [DONE] message. 对象消息终止。 Python代码示例。 |
| `suffix` | string | 否 | 默认为null 在插入文本的补全之后出现的后缀。 |
| `temperature` | integer | 否 | 默认为1 要使用的采样温度,介于0和2之间。更高的值(如0.8)将使输出更随机,而更低的值(如0.2)将使其更集中和确定。 我们通常建议更改这个或top_p,而不是两者都更改。 |
| `user` | string | 是 |  |
| `top_p` | integer | 否 | 表示最终用户的唯一标识符,这可以帮助OpenAI监控和检测滥用。 了解更多。 |

示例：
```json
{
  "model": "gpt-3.5-turbo-instruct",
  "prompt": "你好,",
  "max_tokens": 30,
  "temperature": 0
}
```

## POST `/v1/embeddings`
_文本嵌入 [chat兼容格式]_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 |  |
| `input` | string | 是 |  |
| `dimensions` | integer | 否 |  |

## POST `/v1/messages`
_文本合成_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 |  |
| `messages` | array | 是 |  |
| `messages[].role` | string | 是 |  |
| `messages[].name` | string | 是 |  |
| `messages[].content` | string | 是 |  |
| `stream` | boolean | 否 |  |
| `max_completion_tokens` | integer | 否 |  |
| `temperature` | number | 否 |  |
| `top_p` | number | 否 |  |
| `stream_options` | object | 否 |  |
| `stream_options.include_usage` | boolean | 是 |  |

示例：
```json
{
  "model": "MiniMax-M2.1",
  "messages": [
    {
      "role": "system",
      "name": "AI助手",
      "content": "你是一个专业、友好的AI助手。"
    },
    {
      "role": "user",
      "name": "张三",
      "content": "帮我写一首关于秋天的诗。"
    }
  ],
  "stream": true,
  "max_completion_tokens": 2048,
  "temperature": 0.9,
  "top_p": 0.95,
  "stream_options": {
    "include_usage": true
  }
}
```

## GET `/v1/models`
_获取令牌支持模型_

## POST `/v1/rerank`
_重排序_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| X-Forwarded-Host | header | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 |  |
| `documents` | array | 是 |  |
| `query` | string | 是 |  |
| `top_n` | integer | 是 |  |
| `instruct` | string | 是 |  |

示例：
```json
{
  "model": "qwen3-rerank",
  "documents": [
    "文本排序模型广泛用于搜索引擎 and 推荐系统中，它们根据文本相关性对候选文本进行排序",
    "量子计算是计算科学的一个前沿领域",
    "预训练语言模型的发展给文本排序模型带来了新的进展"
  ],
  "query": "什么是文本排序模型",
  "top_n": 2,
  "instruct": "Given a web search query, retrieve relevant passages that answer the query."
}
```

## POST `/v1/responses`
_创建函数调用 Copy_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 否 | 要使用的模型的 ID。有关哪些模型可与聊天 API 一起使用的详细信息,请参阅模型端点兼容性表。 |
| `input` | array | 否 |  |
| `input[].role` | string | 否 |  |
| `input[].content` | string | 否 |  |

示例：
```json
{
  "input": [
    {
      "role": "user",
      "content": "请同时帮我做以下几件事：\n1. 获取当前系统时间\n2. 查看系统信息（操作系统、内存等）\n3. 帮我计算 123.5 + 456.7 的结果\n4. 生成3个1-100之间的随机数\n\n这是一个并行工具调用测试，请同时执行这些任务。"
    }
  ],
  "metadata": {
    "model_id": "32"
  },
  "model": "gpt-4.1",
  "tool_choice": "auto",
  "tools": [
    {
      "type": "function",
      "name": "random_generator",
      "description": "生成指定范围内的随机数，支持批量生成",
      "parameters": {
        "type": "object",
        "properties": {
          "min": {
            "description": "最小值（默认1）",
            "type": "integer"
          },
          "max": {
            "description": "最大值（默认100）",
            "type": "integer"
          },
          "count": {
            "description": "生成数量（默认1，最大10）",
            "type": "integer"
          }
        }
      }
    },
    {
      "type": "function",
      "name": "system_info",
      "description": "获取当前系统的基本信息，包括操作系统、Java版本、内存使用情况等",
      "parameters": {
        "type": "object",
        "properties": {}
      }
    },
    {
      "type": "function",
      "name": "math_calculator",
      "description": "执行基本数学运算，支持加减乘除和幂运算",
      "parameters": {
        "type": "object",
        "properties": 
...(截断)
```

## POST `/v1/responses/compact`
_gpt 上下文压缩_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称，例如 gpt-5-codex |
| `input` | array | 是 | 需要压缩的历史消息列表 |
| `input[].type` | string | 是 | 消息类型，固定值为 message |
| `input[].role` | string | 是 | 消息角色，可选值：user / assistant / system |
| `input[].content` | string | 是 | 消息内容 |

示例：
```json
{
  "model": "gpt-5.4",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Hello, this is a compact test."
        }
      ]
    }
  ]
}
```
