'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag, Switch, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import type { AIModel, Provider } from '@/types';

export default function ModelsTable() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<AIModel[]>('/admin/models'),
      api.get<Provider[]>('/admin/providers'),
    ]).then(([m, p]) => {
      setModels(m);
      setProviders(p);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (values: Partial<AIModel> & { api_key?: string }) => {
    try {
      if (editingModel) {
        await api.put(`/admin/models/${editingModel.id}`, values);
        message.success('模型已更新');
      } else {
        await api.post('/admin/models', values);
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
    const newStatus = model.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/admin/models/${model.id}`, { ...model, status: newStatus });
      load();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/models/${id}`);
      message.success('已删除');
      load();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  const openCreate = () => {
    setEditingModel(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active', type: 'chat', max_tokens: 4096, supports_streaming: true });
    setModalOpen(true);
  };

  const openEdit = (m: AIModel) => {
    setEditingModel(m);
    form.setFieldsValue(m);
    setModalOpen(true);
  };

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>添加模型</Button>
      </div>

      <Table
        dataSource={models}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
        columns={[
          { title: '供应商', key: 'provider', render: (_, r) => r.provider?.name || r.provider_id },
          { title: '模型名称', dataIndex: 'model_name', key: 'model_name' },
          { title: '显示名称', dataIndex: 'display_name', key: 'display_name' },
          { title: '类型', dataIndex: 'type', key: 'type', render: (v) => <Tag>{v}</Tag> },
          { title: 'Max Tokens', dataIndex: 'max_tokens', key: 'max_tokens' },
          {
            title: '启用',
            key: 'status',
            render: (_, record) => (
              <Switch
                checked={record.status === 'active'}
                onChange={() => handleToggleStatus(record)}
              />
            ),
          },
          {
            title: '操作', key: 'action',
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
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="provider_id" label="供应商" rules={[{ required: true }]}>
            <Select options={providers.map((p) => ({ value: p.id, label: p.name }))} />
          </Form.Item>
          <Form.Item name="model_name" label="模型标识符" rules={[{ required: true }]}>
            <Input placeholder="gpt-4o / claude-3-5-sonnet-20241022" />
          </Form.Item>
          <Form.Item name="display_name" label="显示名称" rules={[{ required: true }]}>
            <Input placeholder="GPT-4o" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={[
              { value: 'chat', label: '对话' },
              { value: 'image', label: '图像生成' },
              { value: 'video', label: '视频生成' },
            ]} />
          </Form.Item>
          <Form.Item name="max_tokens" label="最大 Token 数">
            <InputNumber min={256} max={200000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="supports_streaming" label="支持流式" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="supports_vision" label="支持视觉" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ value: 'active', label: '启用' }, { value: 'inactive', label: '禁用' }]} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
