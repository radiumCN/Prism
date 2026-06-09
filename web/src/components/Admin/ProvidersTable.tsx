'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import type { Provider } from '@/types';

export default function ProvidersTable() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get<Provider[]>('/admin/providers').then(setProviders).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (values: { name: string; api_key: string; base_url: string; status: string }) => {
    try {
      if (editingProvider) {
        await api.put(`/admin/providers/${editingProvider.id}`, values);
        message.success('供应商已更新');
      } else {
        await api.post('/admin/providers', values);
        message.success('供应商已创建');
      }
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/providers/${id}`);
      message.success('已删除');
      load();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  const openCreate = () => {
    setEditingProvider(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (p: Provider) => {
    setEditingProvider(p);
    form.setFieldsValue({ name: p.name, base_url: p.base_url, status: p.status });
    setModalOpen(true);
  };

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          添加供应商
        </Button>
      </div>

      <Table
        dataSource={providers}
        rowKey="id"
        loading={loading}
        columns={[
          { title: '名称', dataIndex: 'name', key: 'name' },
          { title: 'Base URL', dataIndex: 'base_url', key: 'base_url', render: (v) => v || '—' },
          {
            title: '状态', dataIndex: 'status', key: 'status',
            render: (v) => <Tag color={v === 'active' ? 'green' : 'red'}>{v}</Tag>,
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
        title={editingProvider ? '编辑供应商' : '添加供应商'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="openai / claude / gemini" />
          </Form.Item>
          <Form.Item name="api_key" label="API Key（留空保持不变）">
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item name="base_url" label="Base URL（可选）">
            <Input placeholder="https://api.openai.com/v1" />
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
