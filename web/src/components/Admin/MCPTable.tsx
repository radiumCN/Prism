'use client';

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Tag, Space,
  Popconfirm, App, Tooltip, Tabs, Card,
  Row, Col, Badge, Divider, Typography, Alert,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SafetyOutlined,
  ShopOutlined, SettingOutlined, CheckCircleFilled, LinkOutlined,
  ThunderboltOutlined, CodeOutlined,
} from '@ant-design/icons';
import { api } from '@/lib/api';
import type { MCPServer } from '@/types';

const { Text, Paragraph } = Typography;

const STATUS_OPTIONS = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '禁用' },
];

// ─── Marketplace catalog ─────────────────────────────────────────────────────
interface MarketItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  url_hint: string;
  auth_hint?: string;
  docs?: string;
  tags: string[];
  popular?: boolean;
}

const MARKETPLACE: MarketItem[] = [
  // ── 开发工具 ──────────────────────────────────────────────────────────────
  {
    id: 'github',
    name: 'GitHub',
    description: '管理仓库、Issues、Pull Request、代码搜索、CI 状态',
    icon: '🐙',
    category: '开发',
    url_hint: 'https://api.githubcopilot.com/mcp',
    auth_hint: 'Bearer ghp_xxxxxxxxxx',
    docs: 'https://docs.github.com/',
    tags: ['git', '代码', '开源'],
    popular: true,
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: '管理 GitLab 仓库、MR、CI/CD Pipeline',
    icon: '🦊',
    category: '开发',
    url_hint: 'https://gitlab.com/api/v4/mcp',
    auth_hint: 'Bearer glpat-xxxxxxxxxx',
    docs: 'https://docs.gitlab.com/',
    tags: ['git', '代码', 'CI/CD'],
  },
  {
    id: 'jira',
    name: 'Jira',
    description: '查询和创建 Jira 任务、Sprint 管理',
    icon: '📋',
    category: '开发',
    url_hint: 'https://your-domain.atlassian.net/mcp',
    auth_hint: 'Bearer atlassian_token_xxx',
    docs: 'https://developer.atlassian.com/cloud/jira/',
    tags: ['任务', '敏捷', 'Scrum'],
    popular: true,
  },
  {
    id: 'linear',
    name: 'Linear',
    description: '查询和操作 Linear Issues、项目进度',
    icon: '📐',
    category: '开发',
    url_hint: 'https://api.linear.app/mcp',
    auth_hint: 'Bearer lin_api_xxxxxxxxxx',
    docs: 'https://developers.linear.app/',
    tags: ['任务', '项目管理'],
  },
  {
    id: 'sentry',
    name: 'Sentry',
    description: '查询错误报告、异常追踪、性能监控数据',
    icon: '🐛',
    category: '开发',
    url_hint: 'https://sentry.io/api/mcp',
    auth_hint: 'Bearer sentry_token_xxx',
    docs: 'https://docs.sentry.io/api/',
    tags: ['错误监控', '性能'],
  },
  {
    id: 'docker',
    name: 'Docker',
    description: '管理容器、镜像、Docker Compose 服务',
    icon: '🐳',
    category: '开发',
    url_hint: 'http://localhost:3200/mcp',
    tags: ['容器', 'DevOps'],
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    description: '查询集群状态、Pod、Service、Deployment',
    icon: '☸️',
    category: '开发',
    url_hint: 'http://localhost:3201/mcp',
    tags: ['k8s', '运维', '容器'],
  },
  {
    id: 'npm',
    name: 'npm Registry',
    description: '搜索 npm 包信息、版本历史、依赖关系',
    icon: '📦',
    category: '开发',
    url_hint: 'https://registry.npmjs.org/mcp',
    tags: ['npm', 'Node.js', '包管理'],
  },
  // ── 搜索 / 信息 ───────────────────────────────────────────────────────────
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: '实时网页搜索，无跟踪、隐私保护',
    icon: '🔍',
    category: '搜索',
    url_hint: 'https://api.search.brave.com/mcp',
    auth_hint: 'Bearer BSA_xxxxxxxxxx',
    docs: 'https://brave.com/search/api/',
    tags: ['搜索', '网页', '实时'],
    popular: true,
  },
  {
    id: 'google-search',
    name: 'Google Search',
    description: '通过 Google Custom Search API 进行网页搜索',
    icon: '🔎',
    category: '搜索',
    url_hint: 'https://www.googleapis.com/customsearch/mcp',
    auth_hint: 'Bearer AIza_xxxxxxxxxx',
    docs: 'https://developers.google.com/custom-search',
    tags: ['搜索', 'Google'],
    popular: true,
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    description: '搜索并读取维基百科文章内容',
    icon: '📚',
    category: '搜索',
    url_hint: 'http://localhost:3300/mcp',
    docs: 'https://www.mediawiki.org/wiki/API:Main_page',
    tags: ['百科', '知识库'],
  },
  {
    id: 'arxiv',
    name: 'arXiv',
    description: '搜索学术论文（物理、数学、CS、AI 等领域）',
    icon: '📄',
    category: '搜索',
    url_hint: 'http://localhost:3301/mcp',
    docs: 'https://info.arxiv.org/help/api/',
    tags: ['论文', '学术', 'AI'],
  },
  {
    id: 'hackernews',
    name: 'Hacker News',
    description: '读取 HN 热点文章、评论',
    icon: '🟠',
    category: '搜索',
    url_hint: 'http://localhost:3302/mcp',
    tags: ['科技新闻', '社区'],
  },
  // ── 数据库 ────────────────────────────────────────────────────────────────
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: '连接 PostgreSQL 数据库，执行 SQL 查询',
    icon: '🐘',
    category: '数据库',
    url_hint: 'http://localhost:3400/mcp',
    auth_hint: 'Bearer <db-token>',
    tags: ['数据库', 'SQL'],
    popular: true,
  },
  {
    id: 'mysql',
    name: 'MySQL',
    description: '连接 MySQL / MariaDB 数据库',
    icon: '🐬',
    category: '数据库',
    url_hint: 'http://localhost:3401/mcp',
    tags: ['数据库', 'SQL'],
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    description: '读写本地 SQLite 数据库文件',
    icon: '🗄️',
    category: '数据库',
    url_hint: 'http://localhost:3402/mcp',
    tags: ['数据库', 'SQL', '本地'],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: '查询和操作 MongoDB 集合、文档',
    icon: '🍃',
    category: '数据库',
    url_hint: 'http://localhost:3403/mcp',
    tags: ['数据库', 'NoSQL'],
  },
  {
    id: 'redis',
    name: 'Redis',
    description: '操作 Redis 缓存，键值读写、发布订阅',
    icon: '⚡',
    category: '数据库',
    url_hint: 'http://localhost:3404/mcp',
    tags: ['缓存', 'Redis'],
  },
  {
    id: 'elasticsearch',
    name: 'Elasticsearch',
    description: '全文搜索、日志分析、聚合查询',
    icon: '🔬',
    category: '数据库',
    url_hint: 'http://localhost:9200/mcp',
    auth_hint: 'Bearer elastic_token_xxx',
    tags: ['搜索', '日志', '分析'],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: '查询 Supabase 数据库、存储、Auth 用户',
    icon: '💚',
    category: '数据库',
    url_hint: 'https://your-project.supabase.co/mcp',
    auth_hint: 'Bearer sbp_xxxxxxxxxx',
    docs: 'https://supabase.com/docs',
    tags: ['数据库', 'BaaS'],
  },
  // ── 文件 / 存储 ───────────────────────────────────────────────────────────
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: '读写本地文件系统，适合搭配本地 MCP 代理使用',
    icon: '📁',
    category: '存储',
    url_hint: 'http://localhost:3500/mcp',
    tags: ['文件', '本地'],
    popular: true,
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: '上传、下载、列出 S3 Bucket 中的对象',
    icon: '🪣',
    category: '存储',
    url_hint: 'http://localhost:3501/mcp',
    auth_hint: 'Bearer AWS_ACCESS_KEY:SECRET',
    docs: 'https://docs.aws.amazon.com/s3/',
    tags: ['云存储', 'AWS'],
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: '读写 Google Drive 文档和文件',
    icon: '📂',
    category: '存储',
    url_hint: 'https://www.googleapis.com/drive/mcp',
    auth_hint: 'Bearer ya29_xxxxxxxxxx',
    tags: ['云存储', 'Google'],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: '读写 Notion 页面、数据库，搜索文档',
    icon: '📓',
    category: '存储',
    url_hint: 'https://api.notion.com/mcp',
    auth_hint: 'Bearer secret_xxxxxxxxxx',
    docs: 'https://developers.notion.com/',
    tags: ['笔记', '知识库'],
    popular: true,
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: '读写本地 Obsidian Vault 中的 Markdown 笔记',
    icon: '💎',
    category: '存储',
    url_hint: 'http://localhost:27123/mcp',
    tags: ['笔记', '本地', 'Markdown'],
  },
  // ── 通信 / 协作 ───────────────────────────────────────────────────────────
  {
    id: 'slack',
    name: 'Slack',
    description: '发送消息、管理频道、搜索 Slack 工作区',
    icon: '💬',
    category: '协作',
    url_hint: 'https://slack.com/api/mcp',
    auth_hint: 'Bearer xoxb-xxxxxxxxxx',
    docs: 'https://api.slack.com/',
    tags: ['消息', '团队'],
    popular: true,
  },
  {
    id: 'discord',
    name: 'Discord',
    description: '发送消息到 Discord 频道、读取服务器信息',
    icon: '🎮',
    category: '协作',
    url_hint: 'https://discord.com/api/mcp',
    auth_hint: 'Bearer discord_bot_token',
    tags: ['消息', '社区'],
  },
  {
    id: 'email',
    name: 'Email (SMTP/IMAP)',
    description: '发送邮件、读取收件箱、搜索邮件',
    icon: '📧',
    category: '协作',
    url_hint: 'http://localhost:3600/mcp',
    tags: ['邮件', '通知'],
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    description: '通过 Telegram Bot 发送消息、接收命令',
    icon: '✈️',
    category: '协作',
    url_hint: 'http://localhost:3601/mcp',
    auth_hint: 'Bearer bot_token_xxxxxxxxxx',
    tags: ['消息', '机器人'],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: '查询日历事件、创建会议、提醒',
    icon: '📅',
    category: '协作',
    url_hint: 'https://www.googleapis.com/calendar/mcp',
    auth_hint: 'Bearer ya29_xxxxxxxxxx',
    tags: ['日历', '会议'],
  },
  // ── 数据 / 分析 ───────────────────────────────────────────────────────────
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: '读写 Google 表格数据，执行公式计算',
    icon: '📊',
    category: '数据',
    url_hint: 'https://sheets.googleapis.com/mcp',
    auth_hint: 'Bearer ya29_xxxxxxxxxx',
    tags: ['表格', '数据分析'],
    popular: true,
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: '读写 Airtable 数据库记录',
    icon: '🌀',
    category: '数据',
    url_hint: 'https://api.airtable.com/mcp',
    auth_hint: 'Bearer pat_xxxxxxxxxx',
    docs: 'https://airtable.com/developers/web/api/introduction',
    tags: ['表格', '数据库'],
  },
  {
    id: 'bigquery',
    name: 'BigQuery',
    description: '执行 Google BigQuery SQL 查询，分析大规模数据',
    icon: '🔭',
    category: '数据',
    url_hint: 'https://bigquery.googleapis.com/mcp',
    auth_hint: 'Bearer ya29_xxxxxxxxxx',
    tags: ['大数据', 'SQL', 'Google'],
  },
  // ── AI / 向量 ─────────────────────────────────────────────────────────────
  {
    id: 'memory',
    name: 'Memory',
    description: '持久化记忆存储，跨对话保持上下文',
    icon: '🧠',
    category: 'AI 工具',
    url_hint: 'http://localhost:3700/mcp',
    tags: ['记忆', '上下文'],
    popular: true,
  },
  {
    id: 'pinecone',
    name: 'Pinecone',
    description: '向量数据库，语义搜索、RAG 知识库',
    icon: '🌲',
    category: 'AI 工具',
    url_hint: 'https://api.pinecone.io/mcp',
    auth_hint: 'Bearer pc-xxxxxxxxxx',
    docs: 'https://docs.pinecone.io/',
    tags: ['向量', '语义搜索', 'RAG'],
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: '调用 HF 推理 API，运行开源模型',
    icon: '🤗',
    category: 'AI 工具',
    url_hint: 'https://api-inference.huggingface.co/mcp',
    auth_hint: 'Bearer hf_xxxxxxxxxx',
    docs: 'https://huggingface.co/docs/api-inference/',
    tags: ['模型', 'AI', '开源'],
  },
  // ── 自动化 ────────────────────────────────────────────────────────────────
  {
    id: 'puppeteer',
    name: 'Puppeteer',
    description: '浏览器自动化，截图、点击、表单填写',
    icon: '🤖',
    category: '自动化',
    url_hint: 'http://localhost:3800/mcp',
    tags: ['浏览器', '自动化', '截图'],
    popular: true,
  },
  {
    id: 'playwright',
    name: 'Playwright',
    description: '跨浏览器自动化测试，支持 Chromium/Firefox/WebKit',
    icon: '🎭',
    category: '自动化',
    url_hint: 'http://localhost:3801/mcp',
    tags: ['浏览器', '测试', '自动化'],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: '触发 Zapier Zap，连接 5000+ 应用',
    icon: '⚡',
    category: '自动化',
    url_hint: 'https://hooks.zapier.com/mcp',
    auth_hint: 'Bearer zapier_token_xxx',
    docs: 'https://zapier.com/developer/',
    tags: ['流程自动化', '集成'],
  },
  // ── 工具 / 实用 ───────────────────────────────────────────────────────────
  {
    id: 'fetch',
    name: 'Fetch / HTTP',
    description: '发起任意 HTTP 请求，抓取网页和 API 数据',
    icon: '🌐',
    category: '工具',
    url_hint: 'http://localhost:3900/mcp',
    tags: ['HTTP', '爬取'],
    popular: true,
  },
  {
    id: 'time',
    name: 'Time',
    description: '获取当前时间、时区转换、日期计算',
    icon: '🕐',
    category: '工具',
    url_hint: 'http://localhost:3901/mcp',
    tags: ['时间', '时区'],
  },
  {
    id: 'weather',
    name: 'OpenWeatherMap',
    description: '实时天气、预报、空气质量数据',
    icon: '🌤️',
    category: '工具',
    url_hint: 'https://api.openweathermap.org/mcp',
    auth_hint: 'Bearer owm_xxxxxxxxxx',
    docs: 'https://openweathermap.org/api',
    tags: ['天气', '实时'],
  },
  {
    id: 'currency',
    name: 'Currency Exchange',
    description: '实时汇率换算，支持 170+ 货币',
    icon: '💱',
    category: '工具',
    url_hint: 'https://api.exchangerate.host/mcp',
    tags: ['汇率', '金融'],
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    description: '地图搜索、地点详情、路线规划、距离计算',
    icon: '🗺️',
    category: '工具',
    url_hint: 'https://maps.googleapis.com/mcp',
    auth_hint: 'Bearer AIza_xxxxxxxxxx',
    tags: ['地图', '位置', '导航'],
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: '安全数学计算、公式求值、单位转换',
    icon: '🧮',
    category: '工具',
    url_hint: 'http://localhost:3902/mcp',
    tags: ['计算', '数学'],
  },
];

const CATEGORIES = ['全部', '热门', ...Array.from(new Set(MARKETPLACE.map((m) => m.category)))];

// ─── Component ────────────────────────────────────────────────────────────────
export default function MCPTable() {
  const { message: antMessage } = App.useApp();
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MCPServer | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [jsonConfigOpen, setJsonConfigOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  // marketplace filter
  const [marketCat, setMarketCat] = useState('全部');
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());

  const load = () => {
    setLoading(true);
    api.get<MCPServer[]>('/admin/mcp-servers')
      .then((list) => {
        const safe = list ?? [];
        setServers(safe);
        setInstalledIds(new Set(safe.map((s) => s.name.toLowerCase())));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = (prefill?: Partial<MCPServer & { auth_header?: string }>) => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active', ...prefill });
    setModalOpen(true);
  };

  const openEdit = (sv: MCPServer) => {
    setEditing(sv);
    form.setFieldsValue({ ...sv, auth_header: '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.put<MCPServer>(`/admin/mcp-servers/${editing.id}`, values);
        setServers((prev) => prev.map((s) => (s.id === editing.id ? { ...s, ...updated } : s)));
      } else {
        const created = await api.post<MCPServer>('/admin/mcp-servers', values);
        setServers((prev) => [created, ...prev]);
        setInstalledIds((prev) => new Set([...prev, values.name.toLowerCase()]));
      }
      setModalOpen(false);
      antMessage.success(editing ? '已更新' : '已创建');
    } catch (err: unknown) {
      antMessage.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/mcp-servers/${id}`);
      setServers((prev) => prev.filter((s) => s.id !== id));
      antMessage.success('已删除');
    } catch {
      antMessage.error('删除失败');
    }
  };

  // Parse standard MCP JSON config format
  const handleJsonImport = () => {
    try {
      const obj = JSON.parse(jsonText);
      // Support: { mcpServers: { name: { url, headers } } } or direct array
      const entries: Array<{ name: string; url: string; auth_header?: string; description?: string }> = [];
      if (obj.mcpServers && typeof obj.mcpServers === 'object') {
        for (const [name, cfg] of Object.entries(obj.mcpServers as Record<string, { url?: string; headers?: Record<string, string> }>)) {
          const url = cfg.url || '';
          const authHeader = cfg.headers?.Authorization || cfg.headers?.authorization || '';
          entries.push({ name, url, auth_header: authHeader || undefined });
        }
      } else if (Array.isArray(obj)) {
        entries.push(...obj);
      }
      if (entries.length === 0) {
        antMessage.error('未找到有效的 MCP Server 配置');
        return;
      }
      // Open first as create
      const first = entries[0];
      setJsonConfigOpen(false);
      setJsonText('');
      openCreate({ name: first.name, url: first.url, auth_header: first.auth_header, description: first.description });
      if (entries.length > 1) {
        antMessage.info(`共解析 ${entries.length} 个服务，已为第一个打开配置窗口，其余请逐个添加。`);
      }
    } catch {
      antMessage.error('JSON 格式错误，请检查后重试');
    }
  };

  const columns = [
    {
      title: '名称', dataIndex: 'name', key: 'name', width: 160,
      render: (v: string) => {
        const m = MARKETPLACE.find((x) => x.name.toLowerCase() === v.toLowerCase());
        return (
          <Space>
            <span style={{ fontSize: 16 }}>{m?.icon || '🔌'}</span>
            <Text strong style={{ color: 'rgba(255,255,255,0.9)' }}>{v}</Text>
          </Space>
        );
      },
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'URL', dataIndex: 'url', key: 'url', ellipsis: true,
      render: (v: string) => <Text code style={{ fontSize: 11 }}>{v}</Text>,
    },
    {
      title: '鉴权', dataIndex: 'has_auth', key: 'has_auth', width: 70,
      render: (v: boolean) => v
        ? <Tooltip title="已配置 Authorization"><SafetyOutlined style={{ color: '#52c41a' }} /></Tooltip>
        : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: unknown, record: MCPServer) => (
        <Space>
          <Tooltip title="编辑">
            <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)} okText="删除" okType="danger" cancelText="取消">
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const marketItems = marketCat === '全部'
    ? MARKETPLACE
    : marketCat === '热门'
      ? MARKETPLACE.filter((m) => m.popular)
      : MARKETPLACE.filter((m) => m.category === marketCat);

  const myServersTab = (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          已配置 {servers.length} 个 MCP Server
        </Text>
        <Space>
          <Button
            icon={<CodeOutlined />}
            onClick={() => { setJsonText(''); setJsonConfigOpen(true); }}
          >
            从 JSON 配置导入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
            手动添加
          </Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        dataSource={servers}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 20 }}
        size="small"
        locale={{ emptyText: '暂无 MCP Server，从市场安装或手动添加' }}
      />
    </>
  );

  const marketplaceTab = (
    <>
      {/* Category filter */}
      <Space wrap style={{ marginBottom: 16 }}>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            size="small"
            type={marketCat === cat ? 'primary' : 'default'}
            onClick={() => setMarketCat(cat)}
            style={marketCat !== cat ? { color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.15)' } : {}}
          >
            {cat}
          </Button>
        ))}
      </Space>

      <Row gutter={[12, 12]}>
        {marketItems.map((item) => {
          const installed = installedIds.has(item.name.toLowerCase());
          return (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <Card
                size="small"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: installed
                    ? '1px solid rgba(82,196,26,0.4)'
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  cursor: 'default',
                }}
                bodyStyle={{ padding: '12px 14px' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Text strong style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{item.name}</Text>
                      {item.popular && (
                        <Tag color="purple" style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>热门</Tag>
                      )}
                      {installed && (
                        <CheckCircleFilled style={{ color: '#52c41a', fontSize: 13 }} />
                      )}
                    </div>
                    <Paragraph
                      style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 8px' }}
                      ellipsis={{ rows: 2 }}
                    >
                      {item.description}
                    </Paragraph>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                      {item.tags.map((t) => (
                        <Tag key={t} style={{ fontSize: 10, padding: '0 5px', margin: 0, borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.05)' }}>{t}</Tag>
                      ))}
                    </div>
                    <Text
                      code
                      style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 10, wordBreak: 'break-all' }}
                    >
                      {item.url_hint}
                    </Text>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button
                        size="small"
                        type={installed ? 'default' : 'primary'}
                        icon={installed ? <EditOutlined /> : <ThunderboltOutlined />}
                        disabled={installed}
                        onClick={() => openCreate({
                          name: item.name,
                          description: item.description,
                          url: item.url_hint,
                          auth_header: item.auth_hint,
                        })}
                        style={{ flex: 1 }}
                      >
                        {installed ? '已安装' : '安装配置'}
                      </Button>
                      {item.docs && (
                        <Tooltip title="查看文档">
                          <Button
                            size="small"
                            icon={<LinkOutlined />}
                            href={item.docs}
                            target="_blank"
                          />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );

  return (
    <>
      <Alert
        type="info"
        showIcon
        title="MCP (Model Context Protocol)"
        description="MCP Server 使用 Streamable HTTP 协议（JSON-RPC 2.0）。在对话中选择 MCP 后，AI 会自动获取可用工具并在需要时调用。"
        style={{ marginBottom: 16 }}
      />

      <Tabs
        items={[
          {
            key: 'my',
            label: (
              <Space>
                <SettingOutlined />
                我的配置
                {servers.length > 0 && <Badge count={servers.length} style={{ backgroundColor: '#7c3aed' }} />}
              </Space>
            ),
            children: myServersTab,
          },
          {
            key: 'market',
            label: (
              <Space>
                <ShopOutlined />
                MCP 市场
              </Space>
            ),
            children: marketplaceTab,
          },
        ]}
      />

      {/* Manual create / edit modal */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            {editing ? '编辑 MCP Server' : '添加 MCP Server'}
          </Space>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        width={580}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder="如：GitHub" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态">
                <Select options={STATUS_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="描述（可选）">
            <Input placeholder="简短描述此 MCP Server 的能力" />
          </Form.Item>
          <Form.Item
            name="url"
            label={
              <Space>
                服务地址
                <Text type="secondary" style={{ fontSize: 12 }}>Streamable HTTP endpoint</Text>
              </Space>
            }
            rules={[{ required: true, message: '请输入 URL' }]}
            extra={
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                本地服务示例：http://localhost:3100/mcp &nbsp;·&nbsp; 远程服务示例：https://api.example.com/mcp
              </Text>
            }
          >
            <Input prefix={<LinkOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />} placeholder="https://..." />
          </Form.Item>
          <Form.Item
            name="auth_header"
            label="鉴权 Token（可选）"
            tooltip="填写后以 Authorization 请求头发送。编辑时留空表示不修改已保存的值。"
            extra={
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                填写完整 Authorization 值，如：Bearer sk-xxx &nbsp;或&nbsp; Token abc123
              </Text>
            }
          >
            <Input.Password
              prefix={<SafetyOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />}
              placeholder="Bearer sk-xxxxx（可选）"
            />
          </Form.Item>
        </Form>
        <Divider style={{ margin: '4px 0 8px', borderColor: 'rgba(255,255,255,0.06)' }} />
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          💡 如何运行本地 MCP Server？参考 <a href="https://modelcontextprotocol.io/docs/tools/inspector" target="_blank" rel="noreferrer" style={{ color: '#a78bfa' }}>MCP 官方文档</a> 使用 <code>npx @modelcontextprotocol/server-xxx</code> 启动，配合 HTTP 代理暴露端口。
        </Text>
      </Modal>

      {/* JSON config import modal */}
      <Modal
        title={<Space><CodeOutlined />从 JSON 配置导入</Space>}
        open={jsonConfigOpen}
        onOk={handleJsonImport}
        onCancel={() => setJsonConfigOpen(false)}
        okText="解析并配置"
        cancelText="取消"
        width={560}
        destroyOnHidden
      >
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 12 }}>
          粘贴标准 MCP 客户端配置 JSON（支持 <code>mcpServers</code> 格式）：
        </Text>
        <Input.TextArea
          rows={10}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={`{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp",
      "headers": {
        "Authorization": "Bearer ghp_xxxx"
      }
    }
  }
}`}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8, display: 'block' }}>
          解析后将为第一个服务打开配置窗口，可修改后保存。
        </Text>
      </Modal>
    </>
  );
}
