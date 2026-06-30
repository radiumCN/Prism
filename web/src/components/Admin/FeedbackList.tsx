'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Tag, Select, Button, Space, Input, App, Tooltip, Drawer,
  Form, Typography, Image,
} from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { api, BASE } from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';

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
const TYPE_LABEL: Record<string, string> = { general: '\u5efa\u8bae', bug: '\u95ee\u9898\u53cd\u9988', feature: '\u529f\u80fd\u5efa\u8bae' };
const STATUS_COLOR: Record<string, string> = { pending: 'orange', reviewed: 'blue', closed: 'default' };
const STATUS_LABEL: Record<string, string> = { pending: '\u5f85\u5904\u7406', reviewed: '\u5df2\u5904\u7406', closed: '\u5df2\u5173\u95ed' };

export default function FeedbackList() {
  const { message } = App.useApp();
  const [list, setList] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FeedbackRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const isMobile = useIsMobile();

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<FeedbackRow[]>('/admin/feedback');
      setList(data ?? []);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '\u52a0\u8f7d\u5931\u8d25');
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
      message.success('\u5df2\u4fdd\u5b58');
      setList((prev) =>
        prev.map((f) => (f.id === selected.id ? { ...f, ...values } : f))
      );
      setDrawerOpen(false);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '\u4fdd\u5b58\u5931\u8d25');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '\u7528\u6237',
      dataIndex: 'user',
      render: (_: unknown, row: FeedbackRow) =>
        row.user ? `${row.user.username} (${row.user.email})` : `UID:${row.user_id}`,
    },
    {
      title: '\u7c7b\u578b',
      dataIndex: 'type',
      width: 110,
      render: (v: string) => <Tag color={TYPE_COLOR[v] ?? 'default'}>{TYPE_LABEL[v] ?? v}</Tag>,
    },
    {
      title: '\u5185\u5bb9',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '\u72b6\u6001',
      dataIndex: 'status',
      width: 90,
      render: (v: string) => <Tag color={STATUS_COLOR[v] ?? 'default'}>{STATUS_LABEL[v] ?? v}</Tag>,
    },
    {
      title: '\u63d0\u4ea4\u65f6\u95f4',
      dataIndex: 'created_at',
      width: 160,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '\u64cd\u4f5c',
      width: 80,
      render: (_: unknown, row: FeedbackRow) => (
        <Tooltip title={'\u67e5\u770b / \u5904\u7406'}>
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
          {'\u5237\u65b0'}
        </Button>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
          {'\u5171'} {list.length} {'\u6761'}
        </span>
      </Space>

      {isMobile ? (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.45)' }}>
              {'\u52a0\u8f7d\u4e2d\u2026'}
            </div>
          ) : list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.35)' }}>
              {'\u6682\u65e0\u53cd\u9988'}
            </div>
          ) : list.map((row) => (
            <div key={row.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '12px 14px',
              marginBottom: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                      {row.user ? row.user.username : `UID:${row.user_id}`}
                    </span>
                    <Tag color={TYPE_COLOR[row.type] ?? 'default'} style={{ margin: 0 }}>
                      {TYPE_LABEL[row.type] ?? row.type}
                    </Tag>
                    <Tag color={STATUS_COLOR[row.status] ?? 'default'} style={{ margin: 0 }}>
                      {STATUS_LABEL[row.status] ?? row.status}
                    </Tag>
                  </div>
                  {row.content && (
                    <div style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.55)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: 6,
                    }}>
                      {row.content}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(row.created_at).toLocaleString('zh-CN')}
                  </div>
                </div>
                <Tooltip title={'\u67e5\u770b / \u5904\u7406'}>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => openDrawer(row)}
                    style={{ flexShrink: 0 }}
                  />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table<FeedbackRow>
          rowKey="id"
          dataSource={list}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
          scroll={{ x: 'max-content' }}
        />
      )}

      <Drawer
        title={'\u67e5\u770b / \u5904\u7406'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width="min(480px, calc(100vw - 24px))"
        extra={
          <Button type="primary" loading={saving} onClick={handleSave}>
            {'\u4fdd\u5b58'}
          </Button>
        }
      >
        {selected && (
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {selected.user?.username ?? `UID:${selected.user_id}`}
              &nbsp;&middot;&nbsp;
              <Tag color={TYPE_COLOR[selected.type] ?? 'default'}>
                {TYPE_LABEL[selected.type] ?? selected.type}
              </Tag>
              &nbsp;&middot;&nbsp;{new Date(selected.created_at).toLocaleString('zh-CN')}
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
                  {'\u9644\u56fe'}
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
                        alt={`\u56fe\u7247${idx + 1}`}
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}

            <Form form={form} layout="vertical">
              <Form.Item
                name="status"
                label={'\u5904\u7406\u72b6\u6001'}
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: '\u5f85\u5904\u7406', value: 'pending' },
                    { label: '\u5df2\u5904\u7406', value: 'reviewed' },
                    { label: '\u5df2\u5173\u95ed', value: 'closed' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="admin_note" label={'\u7ba1\u7406\u5458\u5907\u6ce8'}>
                <Input.TextArea rows={4} placeholder={'\u8f93\u5165\u5904\u7406\u5907\u6ce8\u2026'} />
              </Form.Item>
            </Form>
          </div>
        )}
      </Drawer>
    </div>
  );
}
