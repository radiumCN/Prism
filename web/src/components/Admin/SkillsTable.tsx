'use client';

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Tag, Space,
  Popconfirm, App, Tooltip, Upload, Alert,
} from 'antd';
import type { UploadFile } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ImportOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import type { Skill } from '@/types';

const STATUS_OPTIONS = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '禁用' },
];

export default function SkillsTable() {
  const { message: antMessage } = App.useApp();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  // Import state
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<UploadFile | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; failed: string[] | null; total: number } | null>(null);

  const load = () => {
    setLoading(true);
    api.get<Skill[]>('/admin/skills')
      .then((list) => setSkills(list ?? []))
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

  const openEdit = (sk: Skill) => {
    setEditing(sk);
    form.setFieldsValue(sk);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.put<Skill>(`/admin/skills/${editing.id}`, values);
        setSkills((prev) => prev.map((s) => (s.id === editing.id ? updated : s)));
      } else {
        const created = await api.post<Skill>('/admin/skills', values);
        setSkills((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      antMessage.success(editing ? '已更新' : '已创建');
    } catch (err: unknown) {
      antMessage.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async () => {
    if (!importFile?.originFileObj) return;
    setImporting(true);
    setImportResult(null);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', importFile.originFileObj as File);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/admin/skills/import`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token ?? ''}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '导入失败');
      setImportResult(data);
      load(); // refresh list
    } catch (err: unknown) {
      antMessage.error(err instanceof Error ? err.message : '导入失败');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/skills/${id}`);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      antMessage.success('已删除');
    } catch {
      antMessage.error('删除失败');
    }
  };

  const columns = [
    {
      title: '图标', dataIndex: 'icon', key: 'icon', width: 60,
      render: (v: string) => <span style={{ fontSize: 20 }}>{v || '🤖'}</span>,
    },
    { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: unknown, record: Skill) => (
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button
          icon={<ImportOutlined />}
          onClick={() => { setImportOpen(true); setImportFile(null); setImportResult(null); }}
        >
          导入
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建 Skill
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={skills}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 20 }}
        size="small"
      />

      {/* Import modal */}
      <Modal
        title="从文件导入 Skill"
        open={importOpen}
        onOk={handleImport}
        onCancel={() => setImportOpen(false)}
        confirmLoading={importing}
        okText="开始导入"
        cancelText="取消"
        okButtonProps={{ disabled: !importFile }}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title="支持格式"
          description={
            <div style={{ lineHeight: '1.8' }}>
              <div>
                <b>.md（推荐）</b> — 标准 <code>SKILL.md</code> 格式，头部 YAML frontmatter 含 <code>name</code>、<code>description</code>，正文 Markdown 作为系统提示词。
              </div>
              <div>
                <b>.json</b> — 单对象或数组，字段：<code>name</code>、<code>system_prompt</code>（必填），<code>description</code>、<code>icon</code>、<code>status</code>（选填）。
              </div>
              <div>
                <b>.zip</b> — 压缩包内含任意数量的 <code>.md</code> 或 <code>.json</code> 文件，逐一解析导入。
              </div>
            </div>
          }
        />
        <Upload
          accept=".md,.json,.zip"
          maxCount={1}
          beforeUpload={() => false}
          fileList={importFile ? [importFile] : []}
          onChange={({ fileList }) => setImportFile(fileList[0] ?? null)}
        >
          <Button icon={<ImportOutlined />}>选择文件（.md / .json / .zip）</Button>
        </Upload>
        {importResult && (
          <Alert
            style={{ marginTop: 16 }}
            type={(importResult.failed?.length ?? 0) === 0 ? 'success' : 'warning'}
            title={`成功导入 ${importResult.created} / ${importResult.total} 个 Skill`}
            description={
              (importResult.failed?.length ?? 0) > 0
                ? <ul style={{ margin: 0, paddingLeft: 16 }}>{(importResult.failed ?? []).map((e, i) => <li key={i}>{e}</li>)}</ul>
                : undefined
            }
          />
        )}
      </Modal>

      {/* Create / Edit modal */}
      <Modal
        title={editing ? '编辑 Skill' : '新建 Skill'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="icon" label="图标（Emoji）">
            <Input placeholder="🤖" maxLength={4} style={{ width: 80 }} />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：翻译助手" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="简短描述此 Skill 的用途" />
          </Form.Item>
          <Form.Item
            name="system_prompt"
            label="系统提示词 (System Prompt)"
            rules={[{ required: true, message: '请输入系统提示词' }]}
          >
            <Input.TextArea
              rows={6}
              placeholder="你是一名专业的中英互译专家，请将用户输入的内容翻译为简体中文..."
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
