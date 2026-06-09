'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, Popconfirm,
  message, Tag, Tabs, Divider, Badge, Checkbox, Empty, Spin,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ApiOutlined, AppstoreOutlined, CheckOutlined,
} from '@ant-design/icons';
import { api } from '@/lib/api';
import type { Provider, AIModel, ProviderModel } from '@/types';

const MODEL_TYPE_COLOR: Record<string, string> = {
  chat: 'blue',
  image: 'purple',
  video: 'orange',
};
const MODEL_TYPE_LABEL: Record<string, string> = {
  chat: '对话',
  image: '图像',
  video: '视频',
};

// ── 供应商关联模型 Tab ────────────────────────────────────────
function ProviderModelAssoc({ provider, onCountChange }: {
  provider: Provider;
  onCountChange?: (count: number) => void;
}) {
  const [allModels, setAllModels] = useState<AIModel[]>([]);
  const [checkedIDs, setCheckedIDs] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Keep a stable ref so `load` doesn't re-create when the parent re-renders
  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [all, pms] = await Promise.all([
        api.get<AIModel[]>('/admin/models'),
        api.get<ProviderModel[]>(`/admin/providers/${provider.id}/models`),
      ]);
      setAllModels(all);
      const ids = new Set(pms.map((pm) => pm.model_id));
      setCheckedIDs(ids);
      onCountChangeRef.current?.(ids.size);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [provider.id]); // only re-create when the provider changes

  useEffect(() => { load(); }, [load]);

  const toggle = (id: number) => {
    setCheckedIDs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/providers/${provider.id}/models`, {
        model_ids: Array.from(checkedIDs),
      });
      message.success('关联模型已保存');
      setDirty(false);
      onCountChangeRef.current?.(checkedIDs.size);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>;
  }

  if (allModels.length === 0) {
    return (
      <Empty
        description={
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>
            暂无全局模型，请先在「模型管理」Tab 中添加模型定义
          </span>
        }
      />
    );
  }

  // Group by type for easier scanning
  const grouped: Record<string, AIModel[]> = {};
  allModels.forEach((m) => {
    (grouped[m.type] ||= []).push(m);
  });

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 16 }}>
        勾选此供应商支持的模型。同一个模型（如 <code>gpt-4o</code>）可同时关联到多个供应商。
      </p>

      {Object.entries(grouped).map(([type, mods]) => (
        <div key={type} style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8, fontSize: 12, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1 }}>
            <Tag color={MODEL_TYPE_COLOR[type]}>{MODEL_TYPE_LABEL[type] ?? type}</Tag>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {mods.map((m) => {
              const checked = checkedIDs.has(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggle(m.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: `1px solid ${checked ? '#7c3aed' : 'rgba(255,255,255,0.12)'}`,
                    background: checked ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    transition: 'all 0.2s',
                    userSelect: 'none',
                  }}
                >
                  <Checkbox
                    checked={checked}
                    onChange={() => toggle(m.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ pointerEvents: 'none' }}
                  />
                  <span style={{ color: checked ? '#c4b5fd' : 'rgba(255,255,255,0.7)' }}>
                    {m.display_name}
                  </span>
                  <code style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{m.model_name}</code>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <Divider style={{ margin: '16px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          已选 {checkedIDs.size} / {allModels.length} 个模型
        </span>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          loading={saving}
          disabled={!dirty}
          onClick={handleSave}
        >
          保存关联
        </Button>
      </div>
    </div>
  );
}

// ── 供应商主表 ────────────────────────────────────────────────
export default function ProvidersTable() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [modelCounts, setModelCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get<Provider[]>('/admin/providers')
      .then(setProviders)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSaveInfo = async (values: { name: string; api_key: string; base_url: string; status: string }) => {
    try {
      if (editingProvider) {
        const updated = await api.put<Provider>(`/admin/providers/${editingProvider.id}`, values);
        setEditingProvider(updated);
        message.success('供应商已更新');
      } else {
        const created = await api.post<Provider>('/admin/providers', values);
        setEditingProvider(created);
        setActiveTab('models');
        message.success('供应商已创建，现在为其关联支持的模型');
        load();
        return;
      }
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
    setActiveTab('info');
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (p: Provider) => {
    setEditingProvider(p);
    setActiveTab('info');
    form.setFieldsValue({ name: p.name, base_url: p.base_url, status: p.status });
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    load();
  };

  const handleModelCountChange = (providerID: number, count: number) => {
    setModelCounts((prev) => ({ ...prev, [providerID]: count }));
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
          { title: '名称', dataIndex: 'name', key: 'name', render: (v) => <strong>{v}</strong> },
          {
            title: 'Base URL',
            dataIndex: 'base_url',
            key: 'base_url',
            render: (v) => v
              ? <code style={{ fontSize: 12 }}>{v}</code>
              : <span style={{ opacity: 0.4 }}>—</span>,
          },
          {
            title: '支持模型',
            key: 'models',
            width: 100,
            render: (_, r) => (
              <Badge
                count={modelCounts[r.id] ?? 0}
                showZero
                style={{ backgroundColor: (modelCounts[r.id] ?? 0) > 0 ? '#7c3aed' : '#555' }}
              />
            ),
          },
          {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (v) => <Tag color={v === 'active' ? 'green' : 'red'}>{v === 'active' ? '启用' : '禁用'}</Tag>,
          },
          {
            title: '操作',
            key: 'action',
            width: 140,
            render: (_, record) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
                <Popconfirm
                  title="删除后供应商的模型关联也将一并清除，确定继续？"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={
          <Space>
            <ApiOutlined />
            {editingProvider ? `编辑供应商：${editingProvider.name}` : '添加供应商'}
          </Space>
        }
        open={modalOpen}
        onCancel={handleClose}
        footer={null}
        width={640}
        destroyOnHidden
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'info',
              label: <Space><ApiOutlined />基本信息</Space>,
              children: (
                <Form form={form} layout="vertical" onFinish={handleSaveInfo} style={{ marginTop: 8 }}>
                  <Form.Item name="name" label="供应商名称" rules={[{ required: true }]}>
                    <Input placeholder="openai / claude / gemini / yunwu" />
                  </Form.Item>
                  <Form.Item name="api_key" label="API Key（编辑时留空则保持原值不变）">
                    <Input.Password placeholder="sk-..." />
                  </Form.Item>
                  <Form.Item name="base_url" label="Base URL（可选，留空使用默认地址）">
                    <Input placeholder="https://api.openai.com/v1" />
                  </Form.Item>
                  <Form.Item name="status" label="状态">
                    <Select
                      options={[
                        { value: 'active', label: '启用' },
                        { value: 'inactive', label: '禁用' },
                      ]}
                    />
                  </Form.Item>
                  <Divider style={{ margin: '12px 0' }} />
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                      {editingProvider && (
                        <Button icon={<AppstoreOutlined />} onClick={() => setActiveTab('models')}>
                          去关联模型
                        </Button>
                      )}
                      <Button type="primary" htmlType="submit">
                        {editingProvider ? '保存信息' : '创建并关联模型 →'}
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'models',
              label: (
                <Space>
                  <AppstoreOutlined />
                  支持的模型
                  {editingProvider && (modelCounts[editingProvider.id] ?? 0) > 0 && (
                    <Badge
                      count={modelCounts[editingProvider.id]}
                      style={{ backgroundColor: '#7c3aed', marginLeft: 4 }}
                    />
                  )}
                </Space>
              ),
              disabled: !editingProvider,
              children: editingProvider ? (
                <div style={{ marginTop: 8 }}>
                  <ProviderModelAssoc
                    provider={editingProvider}
                    onCountChange={(count) => handleModelCountChange(editingProvider.id, count)}
                  />
                </div>
              ) : null,
            },
          ]}
        />
      </Modal>
    </>
  );
}
