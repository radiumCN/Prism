"""从 swagger 抽取每个端点的参数字段，按服务商分组生成 reference/params/<group>.md。
用法: python scripts/gen_params.py <swagger.json> <输出目录>
重新生成: swagger 更新后重跑。
"""
import json
import io
import os
import re
import sys

swagger = sys.argv[1] if len(sys.argv) > 1 else "默认模块.swagger.json"
outdir = sys.argv[2] if len(sys.argv) > 2 else "params"

with io.open(swagger, encoding="utf-8") as f:
    doc = json.load(f)

GROUPS = [
    ("openai-text", "OpenAI 兼容 · 文本/嵌入/重排序", ["/v1/chat/completions", "/v1/completions", "/v1/responses", "/v1/embeddings", "/v1/rerank", "/v1/messages", "/v1/models"]),
    ("openai-audio", "OpenAI 兼容 · 音频", ["/v1/audio/"]),
    ("openai-image", "OpenAI 兼容 · 图片", ["/v1/images/"]),
    ("openai-sora-video", "OpenAI/Sora · 视频", ["/v1/video/", "/v1/videos", "/sora/"]),
    ("gemini", "Gemini 原生 (/v1beta)", ["/v1beta/"]),
    ("midjourney", "Midjourney (/mj)", ["/mj/"]),
    ("ideogram", "Ideogram (/ideogram)", ["/ideogram/"]),
    ("fal-ai", "fal-ai (/fal-ai)", ["/fal-ai/"]),
    ("replicate", "Replicate (/replicate)", ["/replicate/"]),
    ("kling", "Kling (/kling)", ["/kling/"]),
    ("luma", "Luma (/luma)", ["/luma/"]),
    ("runway", "Runway (/runwayml)", ["/runwayml/"]),
    ("jimeng", "即梦 Jimeng (/jimeng)", ["/jimeng/"]),
    ("hailuo", "海螺 Hailuo (/openapi/v2)", ["/openapi/"]),
    ("minimax", "MiniMax (/minimax)", ["/minimax/"]),
    ("suno", "Suno (/suno)", ["/suno/"]),
    ("vidu", "Vidu (/ent/v2, /vidu-native)", ["/ent/", "/vidu-native/"]),
    ("volc-doubao", "豆包/火山 Volc (/volc, /api/v3)", ["/volc/", "/api/v3/"]),
    ("alibailian", "阿里百炼 (/alibailian)", ["/alibailian/"]),
    ("tencent-vod", "腾讯云 VOD (/tencent-vod)", ["/tencent-vod/"]),
    ("avatar", "数字人 (/v1/private-avatar, /v1/real-avatar)", ["/v1/private-avatar/", "/v1/real-avatar/"]),
    ("admin", "令牌/账号/额度 (/api)", ["/api/token", "/api/user", "/api/usage", "/api/upload"]),
]
METHOD_ORDER = {"post": 0, "get": 1, "put": 2, "patch": 3, "delete": 4}
STD_HEADERS = {"content-type", "accept", "authorization"}
MAXLEN = 160  # 描述截断长度


def clean(s):
    if not s:
        return ""
    s = str(s).replace("|", "\\|").replace("\r", " ").replace("\n", " ")
    s = re.sub(r"\s+", " ", s).strip()
    if len(s) > MAXLEN:
        s = s[:MAXLEN].rstrip() + "…"
    return s


def classify(path):
    for key, title, prefixes in GROUPS:
        for pre in prefixes:
            if path == pre or path.startswith(pre):
                return key
    return "other"


def flatten(schema, prefix="", depth=0, rows=None):
    """把 JSON schema 的 properties 展平为 (字段, 类型, 必填, 说明) 列表。"""
    if rows is None:
        rows = []
    if not isinstance(schema, dict) or depth > 6:
        return rows
    props = schema.get("properties")
    if not isinstance(props, dict):
        return rows
    required = set(schema.get("required", []) or [])
    for name, sub in props.items():
        if not isinstance(sub, dict):
            rows.append((prefix + name, "", name in required, ""))
            continue
        typ = sub.get("type", "") or ("enum" if "enum" in sub else "")
        desc = sub.get("description", "")
        if sub.get("enum"):
            desc = (desc + " 枚举: " + ", ".join(map(str, sub["enum"]))).strip()
        rows.append((prefix + name, typ, name in required, desc))
        if typ == "object" and isinstance(sub.get("properties"), dict):
            flatten(sub, prefix + name + ".", depth + 1, rows)
        elif typ == "array":
            items = sub.get("items")
            if isinstance(items, dict) and isinstance(items.get("properties"), dict):
                flatten(items, prefix + name + "[].", depth + 1, rows)
    return rows


def body_schema(op):
    rb = op.get("requestBody") or {}
    content = rb.get("content") or {}
    for ct in ("application/json", "application/json; charset=utf-8"):
        if ct in content:
            return content[ct].get("schema"), content[ct]
    # 任取一个
    for ct, val in content.items():
        return val.get("schema"), val
    return None, None


def first_example(media):
    if not media:
        return None
    if "example" in media:
        return media["example"]
    ex = media.get("examples")
    if isinstance(ex, dict):
        for v in ex.values():
            if isinstance(v, dict) and "value" in v:
                return v["value"]
    return None


buckets = {key: [] for key, _, _ in GROUPS}
buckets["other"] = []
for path, methods in doc["paths"].items():
    for method, op in methods.items():
        if isinstance(op, dict):
            buckets[classify(path)].append((path, method, op))

os.makedirs(outdir, exist_ok=True)
index_rows = []
for key, title, _ in GROUPS:
    ops = buckets[key]
    if not ops:
        continue
    ops.sort(key=lambda x: (x[0], METHOD_ORDER.get(x[1], 9)))
    lines = [f"# {title} · 参数字段", "",
             "> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。",
             "> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。", ""]
    for path, method, op in ops:
        lines.append(f"## {method.upper()} `{path}`")
        summ = clean(op.get("summary"))
        if summ:
            lines.append(f"_{summ}_")
        lines.append("")
        # 路径/查询参数 + 非标准 header
        params = [p for p in (op.get("parameters") or []) if isinstance(p, dict)]
        shown = [p for p in params if not (p.get("in") == "header" and (p.get("name", "").lower() in STD_HEADERS))]
        if shown:
            lines.append("**路径/查询/头参数**")
            lines.append("")
            lines.append("| 参数 | 位置 | 必填 | 类型 | 说明 |")
            lines.append("|------|------|------|------|------|")
            for p in shown:
                sch = p.get("schema") or {}
                lines.append("| {0} | {1} | {2} | {3} | {4} |".format(
                    clean(p.get("name")), p.get("in", ""),
                    "是" if p.get("required") else "否",
                    sch.get("type", ""), clean(p.get("description"))))
            lines.append("")
        # 请求体字段
        schema, media = body_schema(op)
        rows = flatten(schema) if schema else []
        if rows:
            lines.append("**请求体字段**")
            lines.append("")
            lines.append("| 字段 | 类型 | 必填 | 说明 |")
            lines.append("|------|------|------|------|")
            for fname, ftype, freq, fdesc in rows:
                lines.append("| `{0}` | {1} | {2} | {3} |".format(
                    fname, ftype, "是" if freq else "否", clean(fdesc)))
            lines.append("")
        elif op.get("requestBody"):
            lines.append("_请求体无显式字段定义，见 swagger 示例。_")
            lines.append("")
        # 示例
        ex = first_example(media)
        if ex is not None:
            try:
                txt = json.dumps(ex, ensure_ascii=False, indent=2)
            except Exception:
                txt = str(ex)
            if len(txt) > 1200:
                txt = txt[:1200] + "\n...(截断)"
            lines.append("示例：")
            lines.append("```json")
            lines.append(txt)
            lines.append("```")
            lines.append("")
    path_out = os.path.join(outdir, key + ".md")
    with io.open(path_out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    index_rows.append((title, key + ".md", len(ops)))
    print(f"  {key}.md  ({len(ops)} ops)")

# 索引
idx = ["# 参数字段文档索引", "",
       "> 由 `scripts/gen_params.py` 生成。按服务商拆分，每个端点含路径/查询参数、请求体字段（展平）与示例。", ""]
idx.append("| 服务商 | 文件 | 端点数 |")
idx.append("|--------|------|--------|")
for title, fn, n in index_rows:
    idx.append(f"| {title} | [{fn}]({fn}) | {n} |")
idx.append("")
with io.open(os.path.join(outdir, "README.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(idx))
print("INDEX -> " + os.path.join(outdir, "README.md"))
