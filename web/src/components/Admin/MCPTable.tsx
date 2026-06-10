'use client';

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Tag, Space,
  Popconfirm, message as antMessage, Tooltip, Alert,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SafetyOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import type { MCPServer } from '@/types';

const STATUS_OPTIONS = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '禁用' },
];

export default function MCPTable() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MCPServer | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get<MCPServer[]>('/admin/mcp-servers')
      .then((list) => setServers(list ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (sv: MCPServer) => {
    setEditing(sv);
    form.setFieldsValue({ ...sv, auth_header: '' }); // don't pre-fill auth header
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

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 140 },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'URL', dataIndex: 'url', key: 'url', ellipsis: true,
      render: (v: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</span>,
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

  return (
    <>
      <Alert
        type="info"
        showIcon
        message="MCP Server 使用 Streamable HTTP 传输协议（JSON-RPC 2.0），在对话中选择后会自动列出可用工具并在 AI 请求中注入。"
        style={{ marginBottom: 16 }}
      />
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建 MCP Server
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={servers}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 20 }}
        size="small"
      />

      <Modal
        title={editing ? '编辑 MCP Server' : '新建 MCP Server'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：文件系统工具" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="简短描述此 MCP Server 的能力" />
          </Form.Item>
          <Form.Item
            name="url"
            label="服务地址 (HTTP endpoint)"
            rules={[{ required: true, message: '请输入 URL' }]}
          >
            <Input placeholder="https://mcp.example.com/mcp" />
          </Form.Item>
          <Form.Item
            name="auth_header"
            label="Authorization Header"
            tooltip="可选，如需鉴权请填写完整的 Authorization 值，如 Bearer sk-xxx。编辑时留空表示不修改。"
          >
            <Input.Password placeholder="Bearer sk-xxx（可选）" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
