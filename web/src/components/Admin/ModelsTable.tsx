'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, App, Tag, Switch, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import type { AIModel } from '@/types';

const MODEL_TYPES = [
  { value: 'chat', label: '对话' },
  { value: 'image', label: '图像生成' },
  { value: 'video', label: '视频生成' },
];

const API_FORMATS = [
  { value: 'openai_chat',         label: 'OpenAI Chat Completions  (/v1/chat/completions)' },
  { value: 'openai_responses',    label: 'OpenAI Responses API  (/v1/responses)' },
  { value: 'anthropic_messages',  label: 'Anthropic Messages  (/v1/messages)' },
  { value: 'gemini_generate',     label: 'Gemini generateContent  (/v1beta/models/…:generateContent)' },
  { value: 'openai_image',        label: 'OpenAI Images  (/v1/images/generations)  — DALL-E' },
  { value: 'gemini_image',        label: 'Gemini Imagen  (Google 图像生成)' },
  { value: 'alibailian_video',    label: 'Alibaba Bailian 视频生成  — happyhorse 系列' },
];

const API_FORMAT_TAG: Record<string, { color: string; short: string }> = {
  openai_chat:        { color: 'blue',    short: 'OAI Chat' },
  openai_responses:   { color: 'cyan',    short: 'OAI Resp' },
  anthropic_messages: { color: 'orange',  short: 'Anthropic' },
  gemini_generate:    { color: 'green',   short: 'Gemini' },
  openai_image:       { color: 'magenta', short: 'DALL-E' },
  gemini_image:       { color: 'lime',    short: 'Imagen' },
  alibailian_video:   { color: 'gold',    short: '视频生成' },
};

export default function ModelsTable() {
  const { message } = App.useApp();
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
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
      await api.put(`/models/${model.id}`, { ...model, status: model.status === 'active' ? 'inactive' : 'active' });
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
    form.resetFields();
    form.setFieldsValue({ status: 'active', type: 'chat', api_format: 'openai_chat', max_tokens: 4096, supports_streaming: true });
    setModalOpen(true);
  };

  const openEdit = (m: AIModel) => {
    setEditingModel(m);
    form.setFieldsValue(m);
    setModalOpen(true);
  };

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          在此定义全局模型，再从各供应商的「支持的模型」Tab 中关联。
        </span>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>添加模型</Button>
      </div>

      <Table
        dataSource={models}
        rowKey="id"
        loading={loading}
        scroll={{ x: 800 }}
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
            width: 80,
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
              const fmt = API_FORMAT_TAG[v] ?? { color: 'default', short: v || 'openai_chat' };
              return <Tag color={fmt.color}>{fmt.short}</Tag>;
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
        width={520}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 8 }}>
          <Form.Item
            name="model_name"
            label="模型标识符"
            extra="填写 API 请求中使用的实际模型 ID，如 gpt-4o、claude-3-5-sonnet-20241022"
            rules={[{ required: true, message: '请输入模型标识符' }]}
          >
            <Input placeholder="gpt-4o" />
          </Form.Item>
          <Form.Item name="display_name" label="显示名称" rules={[{ required: true, message: '请输入显示名称' }]}>
            <Input placeholder="GPT-4o" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={MODEL_TYPES} />
          </Form.Item>
          <Form.Item
            name="api_format"
            label="API 格式"
            tooltip="决定对话时走哪个 HTTP 端点协议。OpenAI 兼容网关（new-api / one-api 等）选 OpenAI Chat Completions。"
          >
            <Select options={API_FORMATS} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="max_tokens" label="最大 Token 数">
              <InputNumber min={256} max={200000} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select options={[{ value: 'active', label: '启用' }, { value: 'inactive', label: '禁用' }]} />
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
