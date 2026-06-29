'use client';

import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, Popconfirm,
  App, Tag, Switch, InputNumber, Alert, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  CheckCircleFilled, WarningFilled,
} from '@ant-design/icons';
import { api } from '@/lib/api';
import type { AIModel } from '@/types';

// ── Supported format matrix ───────────────────────────────────────────────────
// Defines which api_format values are actually implemented in the backend adapter.
const SUPPORTED_FORMATS: Record<string, string[]> = {
  chat:  ['openai_chat', 'openai_responses', 'anthropic_messages', 'gemini_generate'],
  image: ['openai_image', 'gemini_image'],
  video: ['alibailian_video'],
};

const DEFAULT_FORMAT: Record<string, string> = {
  chat:  'openai_chat',
  image: 'openai_image',
  video: 'alibailian_video',
};

// ── Format metadata ───────────────────────────────────────────────────────────
interface FormatMeta {
  label: string;
  color: string;
  short: string;
  hint: string;        // tooltip shown in the select
  forTypes: string[];  // which model types this format applies to
}

const FORMAT_META: Record<string, FormatMeta> = {
  openai_chat: {
    label: 'OpenAI Chat Completions',
    short: 'OAI Chat',
    color: 'blue',
    hint: 'POST /v1/chat/completions — 兼容所有 OpenAI 格式网关（new-api / one-api / yunwu 等）',
    forTypes: ['chat'],
  },
  openai_responses: {
    label: 'OpenAI Responses API',
    short: 'OAI Resp',
    color: 'cyan',
    hint: 'POST /v1/responses — 走 OpenAI 适配器，与 openai_chat 实现相同',
    forTypes: ['chat'],
  },
  anthropic_messages: {
    label: 'Anthropic Messages',
    short: 'Anthropic',
    color: 'orange',
    hint: 'POST /v1/messages — 原生 Claude API，支持 Claude 3/3.5/4 系列',
    forTypes: ['chat'],
  },
  gemini_generate: {
    label: 'Gemini generateContent',
    short: 'Gemini',
    color: 'green',
    hint: 'POST /v1beta/models/:model:generateContent — Google Gemini 原生接口',
    forTypes: ['chat'],
  },
  openai_image: {
    label: 'OpenAI Images',
    short: 'DALL-E',
    color: 'magenta',
    hint: 'POST /v1/images/generations — DALL-E 3 / DALL-E 2，兼容 OpenAI 图像网关',
    forTypes: ['image'],
  },
  gemini_image: {
    label: 'Gemini Imagen',
    short: 'Imagen',
    color: 'lime',
    hint: 'Google Gemini Imagen 图像生成接口',
    forTypes: ['image'],
  },
  alibailian_video: {
    label: 'Alibaba Bailian 视频生成',
    short: '百炼视频',
    color: 'gold',
    hint: '阿里云百炼 happyhorse 系列视频模型，异步任务轮询，默认地址 dashscope.aliyuncs.com',
    forTypes: ['video'],
  },
};

const MODEL_TYPES = [
  { value: 'chat',  label: '对话' },
  { value: 'image', label: '图像生成' },
  { value: 'video', label: '视频生成' },
];

// Check whether a (type, api_format) combo is actually implemented
function isSupported(type: string, apiFormat: string): boolean {
  return (SUPPORTED_FORMATS[type] ?? []).includes(apiFormat);
}

export default function ModelsTable() {
  const { message } = App.useApp();
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [selectedType, setSelectedType] = useState<string>('chat');
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get<AIModel[]>('/models/manage')
      .then(setModels)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (values: Partial<AIModel>) => {
    try {
      if (editingModel) {
        await api.put(`/models/${editingModel.id}`, values);
        message.success('模型已更新');
      } else {
        await api.post('/models', values);
        message.success('模型已创建');
      }
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleToggleStatus = async (model: AIModel) => {
    try {
      await api.put(`/models/${model.id}`, {
        ...model,
        status: model.status === 'active' ? 'inactive' : 'active',
      });
      load();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/models/${id}`);
      message.success('已删除');
      load();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  const openCreate = () => {
    setEditingModel(null);
    setSelectedType('chat');
    form.resetFields();
    form.setFieldsValue({
      status: 'active',
      type: 'chat',
      api_format: 'openai_chat',
      max_tokens: 4096,
      supports_streaming: true,
    });
    setModalOpen(true);
  };

  const openEdit = (m: AIModel) => {
    setEditingModel(m);
    setSelectedType(m.type);
    form.setFieldsValue(m);
    setModalOpen(true);
  };

  // When user changes model type, reset api_format to the default for that type
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    form.setFieldValue('api_format', DEFAULT_FORMAT[type] ?? 'openai_chat');
  };

  // Build the api_format options filtered by the currently selected type
  const formatOptions = (SUPPORTED_FORMATS[selectedType] ?? []).map((key) => {
    const meta = FORMAT_META[key];
    return {
      value: key,
      label: (
        <Tooltip title={meta?.hint} placement="right">
          <span>{meta?.label ?? key}</span>
        </Tooltip>
      ),
    };
  });

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          在此定义模型，再从各供应商的「支持的模型」Tab 中关联。
        </span>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>添加模型</Button>
      </div>

      <Table
        dataSource={models}
        rowKey="id"
        loading={loading}
        scroll={{ x: 860 }}
        columns={[
          {
            title: '模型标识符',
            dataIndex: 'model_name',
            key: 'model_name',
            render: (v) => <code style={{ fontSize: 12 }}>{v}</code>,
          },
          { title: '显示名称', dataIndex: 'display_name', key: 'display_name' },
          {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 90,
            render: (v) => (
              <Tag color={v === 'chat' ? 'blue' : v === 'image' ? 'purple' : 'orange'}>
                {MODEL_TYPES.find((t) => t.value === v)?.label ?? v}
              </Tag>
            ),
          },
          {
            title: 'API 格式',
            dataIndex: 'api_format',
            key: 'api_format',
            width: 110,
            render: (v: string) => {
              const meta = FORMAT_META[v];
              return meta
                ? <Tag color={meta.color}>{meta.short}</Tag>
                : <Tag>{v || 'openai_chat'}</Tag>;
            },
          },
          {
            title: (
              <Tooltip title="该类型 + API 格式组合是否已有后端适配器支持">
                适配器
              </Tooltip>
            ),
            key: 'support',
            width: 80,
            render: (_, record) => {
              const ok = isSupported(record.type, record.api_format || 'openai_chat');
              return ok ? (
                <Tooltip title="已支持，可正常使用">
                  <CheckCircleFilled style={{ color: '#52c41a', fontSize: 16 }} />
                </Tooltip>
              ) : (
                <Tooltip title="当前版本暂不支持此组合，调用时会报错">
                  <WarningFilled style={{ color: '#faad14', fontSize: 16 }} />
                </Tooltip>
              );
            },
          },
          { title: 'Max Tokens', dataIndex: 'max_tokens', key: 'max_tokens', width: 110 },
          {
            title: '流式',
            dataIndex: 'supports_streaming',
            key: 'supports_streaming',
            width: 60,
            render: (v) => v ? <Tag color="green">✓</Tag> : <Tag>—</Tag>,
          },
          {
            title: '视觉',
            dataIndex: 'supports_vision',
            key: 'supports_vision',
            width: 60,
            render: (v) => v ? <Tag color="purple">✓</Tag> : <Tag>—</Tag>,
          },
          {
            title: '启用',
            key: 'status',
            width: 70,
            render: (_, record) => (
              <Switch
                size="small"
                checked={record.status === 'active'}
                onChange={() => handleToggleStatus(record)}
              />
            ),
          },
          {
            title: '操作',
            key: 'action',
            width: 120,
            render: (_, record) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
                <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
                  <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editingModel ? '编辑模型' : '添加模型'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={540}
        destroyOnHidden
      >
        {/* Supported combinations reference */}
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16, fontSize: 12 }}
          description={
            <div style={{ lineHeight: 1.8 }}>
              <div><Tag color="blue">对话</Tag>OpenAI Chat · OpenAI Responses · Anthropic · Gemini</div>
              <div><Tag color="purple">图像</Tag>OpenAI Images (DALL-E) · Gemini Imagen</div>
              <div><Tag color="orange">视频</Tag>Alibaba Bailian 视频生成</div>
              <div style={{ marginTop: 6, color: '#d46b08', fontWeight: 600, fontSize: 12 }}>
                ⚠️ 选择类型后，下方 API 格式将自动过滤为当前版本已支持的选项。
              </div>
            </div>
          }
        />

        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 4 }}>
          <Form.Item
            name="model_name"
            label="模型标识符"
            extra="填写 API 请求中使用的实际模型 ID，如 gpt-4o、claude-3-5-sonnet-20241022"
            rules={[{ required: true, message: '请输入模型标识符' }]}
          >
            <Input placeholder="gpt-4o" />
          </Form.Item>

          <Form.Item
            name="display_name"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="GPT-4o" />
          </Form.Item>

          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={MODEL_TYPES} onChange={handleTypeChange} />
          </Form.Item>

          <Form.Item
            name="api_format"
            label="API 格式"
            tooltip="决定后端走哪个 HTTP 协议适配器。切换「类型」后选项会自动过滤为已实现的适配器。"
            rules={[{ required: true, message: '请选择 API 格式' }]}
          >
            <Select
              options={formatOptions}
              optionLabelProp="label"
              placeholder="请选择"
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="max_tokens" label="最大 Token 数">
              <InputNumber min={256} max={200000} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { value: 'active', label: '启用' },
                  { value: 'inactive', label: '禁用' },
                ]}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            <Form.Item name="supports_streaming" label="支持流式输出" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="supports_vision" label="支持视觉（多模态）" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0, marginTop: 4 }}>
            <Button type="primary" htmlType="submit" block>
              {editingModel ? '保存更改' : '添加模型'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
