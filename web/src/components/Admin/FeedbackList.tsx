'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Tag, Select, Button, Space, Input, App, Tooltip, Drawer,
  Form, Typography, Image,
} from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { api, BASE } from '@/lib/api';

const IMG_BASE = BASE.replace(/\/api$/, '');

interface FeedbackRow {
  id: number;
  user_id: number;
  user?: { username: string; email: string };
  type: string;
  content: string;
  images: string[];
  status: string;
  admin_note: string;
  created_at: string;
}

const TYPE_COLOR: Record<string, string> = { general: 'blue', bug: 'red', feature: 'green' };
const TYPE_LABEL: Record<string, string> = { general: '一般', bug: '问题反馈', feature: '功能建议' };
const STATUS_COLOR: Record<string, string> = { pending: 'orange', reviewed: 'blue', closed: 'default' };
const STATUS_LABEL: Record<string, string> = { pending: '待处理', reviewed: '已查阅', closed: '已关闭' };

export default function FeedbackList() {
  const { message } = App.useApp();
  const [list, setList] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FeedbackRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<FeedbackRow[]>('/admin/feedback');
      setList(data ?? []);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const openDrawer = (row: FeedbackRow) => {
    setSelected(row);
    form.setFieldsValue({ status: row.status, admin_note: row.admin_note });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const values = await form.validateFields();
      await api.put(`/admin/feedback/${selected.id}`, values);
      message.success('已更新');
      setList((prev) =>
        prev.map((f) => (f.id === selected.id ? { ...f, ...values } : f))
      );
      setDrawerOpen(false);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '更新失败');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '用户',
      dataIndex: 'user',
      render: (_: unknown, row: FeedbackRow) =>
        row.user ? `${row.user.username} (${row.user.email})` : `UID:${row.user_id}`,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 110,
      render: (v: string) => <Tag color={TYPE_COLOR[v] ?? 'default'}>{TYPE_LABEL[v] ?? v}</Tag>,
    },
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v: string) => <Tag color={STATUS_COLOR[v] ?? 'default'}>{STATUS_LABEL[v] ?? v}</Tag>,
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      width: 160,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 80,
      render: (_: unknown, row: FeedbackRow) => (
        <Tooltip title="查看 / 处理">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => openDrawer(row)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button icon={<ReloadOutlined />} onClick={fetchList} loading={loading}>
          刷新
        </Button>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
          共 {list.length} 条
        </span>
      </Space>

      <Table<FeedbackRow>
        rowKey="id"
        dataSource={list}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 20 }}
        size="small"
      />

      <Drawer
        title="反馈详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        extra={
          <Button type="primary" loading={saving} onClick={handleSave}>
            保存
          </Button>
        }
      >
        {selected && (
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {selected.user?.username ?? `UID:${selected.user_id}`}
              &nbsp;·&nbsp;
              <Tag color={TYPE_COLOR[selected.type] ?? 'default'}>
                {TYPE_LABEL[selected.type] ?? selected.type}
              </Tag>
              &nbsp;·&nbsp;{new Date(selected.created_at).toLocaleString('zh-CN')}
            </Typography.Text>

            <div
              style={{
                margin: '12px 0 12px',
                background: 'rgba(255,255,255,0.05)',
                padding: 12,
                borderRadius: 8,
                fontSize: 14,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {selected.content}
            </div>

            {selected.images && selected.images.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  附件截图
                </Typography.Text>
                <Image.PreviewGroup>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selected.images.map((url, idx) => (
                      <Image
                        key={idx}
                        src={`${IMG_BASE}${url}`}
                        width={90}
                        height={90}
                        style={{ objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                        alt={`截图${idx + 1}`}
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}

            <Form form={form} layout="vertical">
              <Form.Item
                name="status"
                label="处理状态"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: '待处理', value: 'pending' },
                    { label: '已查阅', value: 'reviewed' },
                    { label: '已关闭', value: 'closed' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="admin_note" label="管理员备注">
                <Input.TextArea rows={4} placeholder="可填写处理说明..." />
              </Form.Item>
            </Form>
          </div>
        )}
      </Drawer>
    </div>
  );
}
