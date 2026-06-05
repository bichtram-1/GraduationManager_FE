import React, { useMemo, useState } from 'react';
import { Button, Space, Tag, Input, Table, message, Modal } from 'antd';
import { groupHooks } from '../../hooks/useGroups';

const { Search } = Input;

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ duyệt', color: 'orange' },
  APPROVED: { label: 'Đã chấp nhận', color: 'green' },
  DISSOLVED: { label: 'Đã từ chối', color: 'red' },
  WARNING: { label: 'Cảnh báo', color: 'gold' },
};

const ReviewGroupsPage: React.FC = () => {
  const { data: q } = groupHooks.useFetchListGroups();
  const updateGroup = groupHooks.useUpdateGroup();
  const approveGroup = groupHooks.useApproveGroup();
  const rejectGroup = groupHooks.useRejectGroup();
  const groups = (q?.rows ?? []) as any[];

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [savingId, setSavingId] = useState<string | null>(null);
  

  const filtered = useMemo(() => {
    const s = query.trim().toLowerCase();
    return groups.filter((g) => {
      if (statusFilter !== 'all' && g.status !== statusFilter) return false;
      if (!s) return true;
      return [g.code, g.title, g.supervisor].join(' ').toLowerCase().includes(s) || g.members.some((m: any) => m.name.toLowerCase().includes(s));
    });
  }, [groups, query, statusFilter]);

  const pending = groups.filter((g) => g.status === 'PENDING').length;
  const accepted = groups.filter((g) => g.status === 'APPROVED').length;
  const rejected = groups.filter((g) => g.status === 'DISSOLVED').length;

  const doAction = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'reject') {
      Modal.confirm({
        title: 'Xác nhận từ chối nhóm',
        content: 'Bạn có chắc muốn từ chối nhóm này? Hành động sẽ không thể hoàn tác.',
        async onOk() {
          setSavingId(id);
          try {
            await rejectGroup.mutateAsync({ id });
            message.success('Đã từ chối nhóm');
          } catch (e) {
            message.error('Không thể cập nhật trạng thái');
          } finally {
            setSavingId(null);
          }
        },
      });
      return;
    }

    // approve
    setSavingId(id);
    try {
      await approveGroup.mutateAsync({ id });
      message.success('Đã chấp nhận nhóm');
    } catch (e) {
      message.error('Không thể cập nhật trạng thái');
    } finally {
      setSavingId(null);
    }
  };

  const doSetPending = async (id: string) => {
    setSavingId(id);
    try {
      await updateGroup.mutateAsync({ id, body: { status: 'PENDING' }, index: 0, params: { page: 1, limit: 10 } });
      message.success('Đã chuyển về trạng thái Chờ duyệt');
    } catch (e) {
      message.error('Không thể cập nhật trạng thái');
    } finally {
      setSavingId(null);
    }
  };

  

  const columns = [
    { title: 'Mã nhóm', dataIndex: 'code', key: 'code', render: (c: string) => <div style={{ color: '#2563eb', fontWeight: 700 }}>{c}</div> },
    { title: 'Tên đề tài', dataIndex: 'title', key: 'title', render: (t: string) => <div style={{ fontWeight: 600 }}>{t}</div> },
    { title: 'Giảng viên', dataIndex: 'supervisor', key: 'supervisor' },
    { title: 'Thành viên', key: 'members', render: (_: any, r: any) => r.members.map((m: any) => m.name).join(', ') },
    { title: 'Trạng thái', key: 'status', render: (_: any, r: any) => <Tag color={STATUS_META[r.status]?.color}>{STATUS_META[r.status]?.label ?? r.status}</Tag> },
    { title: 'Thao tác', key: 'action', render: (_: any, r: any) => (
      <Space>
        {r.status !== 'APPROVED' && (
          <Button size="small" type="primary" loading={savingId === r.id} disabled={savingId === r.id} onClick={() => doAction(r.id, 'approve')}>Chấp nhận</Button>
        )}
        {r.status !== 'DISSOLVED' && (
          <Button size="small" danger loading={savingId === r.id} disabled={savingId === r.id} onClick={() => doAction(r.id, 'reject')}>Từ chối</Button>
        )}
        {(statusFilter === 'APPROVED' || statusFilter === 'DISSOLVED') && (
          <Button size="small" onClick={() => doSetPending(r.id)} loading={savingId === r.id} disabled={savingId === r.id}>Chờ duyệt</Button>
        )}
        {/* add/merge actions removed from Review page; managed in GroupsAdminPage */}
      </Space>
    ) },
  ];

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Duyệt nhóm đồ án</h1>
        <div style={{ color: '#6b7280' }}>Duyệt các nhóm sinh viên đăng ký vào đề tài (quyền admin hiển thị nhiều nhóm hơn)</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ padding: 12, background: '#fff', borderRadius: 12, boxShadow: '0 8px 20px rgba(15,23,42,0.04)', minWidth: 160 }}>
          <div style={{ color: '#6b7280' }}>Chờ duyệt</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{pending}</div>
        </div>
        <div style={{ padding: 12, background: '#fff', borderRadius: 12, boxShadow: '0 8px 20px rgba(15,23,42,0.04)', minWidth: 160 }}>
          <div style={{ color: '#6b7280' }}>Đã chấp nhận</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{accepted}</div>
        </div>
        <div style={{ padding: 12, background: '#fff', borderRadius: 12, boxShadow: '0 8px 20px rgba(15,23,42,0.04)', minWidth: 160 }}>
          <div style={{ color: '#6b7280' }}>Đã từ chối</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{rejected}</div>
        </div>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <Search placeholder="Tìm mã, đề tài, giảng viên, sinh viên" onSearch={(v) => setQuery(v)} allowClear style={{ width: 420 }} />
        <div>
          <Button type={statusFilter === 'all' ? 'primary' : 'default'} onClick={() => setStatusFilter('all')} style={{ marginRight: 8 }}>Tất cả</Button>
          <Button type={statusFilter === 'PENDING' ? 'primary' : 'default'} onClick={() => setStatusFilter('PENDING')} style={{ marginRight: 8 }}>Chờ duyệt</Button>
          <Button type={statusFilter === 'APPROVED' ? 'primary' : 'default'} onClick={() => setStatusFilter('APPROVED')} style={{ marginRight: 8 }}>Đã chấp nhận</Button>
          <Button type={statusFilter === 'DISSOLVED' ? 'primary' : 'default'} onClick={() => setStatusFilter('DISSOLVED')}>Đã từ chối</Button>
        </div>
      </div>

      <Table rowKey="id" dataSource={filtered} columns={columns} />

      
    </div>
  );
};

export default ReviewGroupsPage;
