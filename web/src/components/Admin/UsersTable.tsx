'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Tag, Select, App, Tooltip, Button, Space,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface UserRow {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'disabled';
  created_at: string;
}

const ROLE_COLOR: Record<string, string> = { admin: 'gold', user: 'blue' };
const STATUS_COLOR: Record<string, string> = { active: 'green', disabled: 'red' };

export default function UsersTable() {
  const { message } = App.useApp();
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<UserRow[]>('/admin/users');
      setUsers(data ?? []);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdate = async (id: number, patch: { role?: string; status?: string }) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const payload = {
      role: (patch.role ?? user.role) as UserRow['role'],
      status: (patch.status ?? user.status) as UserRow['status'],
    };
    try {
      await api.put(`/admin/users/${id}`, payload);
      message.success('已更新');
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...payload } : u))
      );
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '更新失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      render: (v: string, row: UserRow) => (
        <span>
          {v}
          {row.id === currentUser?.id && (
            <Tag style={{ marginLeft: 6 }} color="purple">我</Tag>
          )}
        </span>
      ),
    },
    { title: '邮箱', dataIndex: 'email' },
    {
      title: '角色',
      dataIndex: 'role',
      width: 120,
      render: (v: string, row: UserRow) => {
        const isSelf = row.id === currentUser?.id;
        return (
          <Tooltip title={isSelf ? '不能修改自己的角色' : ''}>
            <Select
              value={v}
              disabled={isSelf}
              size="small"
              style={{ width: 90 }}
              onChange={(val) => handleUpdate(row.id, { role: val })}
              options={[
                { label: '管理员', value: 'admin' },
                { label: '普通用户', value: 'user' },
              ]}
            />
          </Tooltip>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (v: string, row: UserRow) => {
        const isSelf = row.id === currentUser?.id;
        return (
          <Tooltip title={isSelf ? '不能禁用自己' : ''}>
            <Select
              value={v}
              disabled={isSelf}
              size="small"
              style={{ width: 90 }}
              onChange={(val) => handleUpdate(row.id, { status: val })}
              options={[
                { label: '正常', value: 'active' },
                { label: '已禁用', value: 'disabled' },
              ]}
            />
          </Tooltip>
        );
      },
    },
    {
      title: '角色标签',
      dataIndex: 'role',
      key: 'role_tag',
      width: 100,
      render: (v: string) => <Tag color={ROLE_COLOR[v] ?? 'default'}>{v}</Tag>,
    },
    {
      title: '状态标签',
      dataIndex: 'status',
      key: 'status_tag',
      width: 100,
      render: (v: string) => <Tag color={STATUS_COLOR[v] ?? 'default'}>{v}</Tag>,
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
          刷新
        </Button>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
          共 {users.length} 名用户
        </span>
      </Space>
      <Table<UserRow>
        rowKey="id"
        dataSource={users}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 20 }}
        size="small"
      />
    </div>
  );
}
