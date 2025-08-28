'use client';

import { useState } from 'react';
import { Button, Input } from '@cms/ui';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  success: boolean;
  errorMessage?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'content' | 'user' | 'system' | 'config';
}

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-01-20T10:30:15Z',
    userId: '1',
    userName: 'Nguyễn Văn Admin',
    userRole: 'super_admin',
    action: 'DELETE',
    resource: 'posts',
    resourceId: 'post_123',
    details: {
      title: 'Bài viết cũ không còn liên quan',
      reason: 'Nội dung lỗi thời',
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'sess_abc123',
    success: true,
    severity: 'medium',
    category: 'content',
  },
  {
    id: '2',
    timestamp: '2024-01-20T09:45:22Z',
    userId: '2',
    userName: 'Trần Thị Editor',
    userRole: 'editor',
    action: 'UPDATE',
    resource: 'posts',
    resourceId: 'post_456',
    details: {
      title: 'Cập nhật bài viết về AI',
      changes: {
        status: { from: 'draft', to: 'published' },
        category: { from: 'tech', to: 'artificial-intelligence' },
      },
    },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    sessionId: 'sess_def456',
    success: true,
    severity: 'low',
    category: 'content',
  },
  {
    id: '3',
    timestamp: '2024-01-20T08:20:33Z',
    userId: '3',
    userName: 'Lê Minh User',
    userRole: 'user',
    action: 'LOGIN_FAILED',
    resource: 'auth',
    details: {
      email: 'leminhuser@example.com',
      reason: 'Invalid password',
      attempts: 3,
    },
    ipAddress: '203.162.10.50',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    sessionId: 'sess_failed_123',
    success: false,
    errorMessage: 'Authentication failed: Invalid credentials',
    severity: 'high',
    category: 'auth',
  },
  {
    id: '4',
    timestamp: '2024-01-19T16:30:45Z',
    userId: '1',
    userName: 'Nguyễn Văn Admin',
    userRole: 'super_admin',
    action: 'CREATE',
    resource: 'users',
    resourceId: 'user_789',
    details: {
      email: 'newuser@example.com',
      fullName: 'Người dùng mới',
      roles: ['author'],
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'sess_abc123',
    success: true,
    severity: 'medium',
    category: 'user',
  },
  {
    id: '5',
    timestamp: '2024-01-19T14:15:20Z',
    userId: '1',
    userName: 'Nguyễn Văn Admin',
    userRole: 'super_admin',
    action: 'UPDATE',
    resource: 'system_settings',
    details: {
      setting: 'email_notifications',
      changes: {
        enabled: { from: false, to: true },
        smtp_host: { from: 'old.smtp.com', to: 'new.smtp.com' },
      },
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'sess_abc123',
    success: true,
    severity: 'high',
    category: 'config',
  },
  {
    id: '6',
    timestamp: '2024-01-19T11:45:10Z',
    userId: '2',
    userName: 'Trần Thị Editor',
    userRole: 'editor',
    action: 'BULK_DELETE',
    resource: 'assets',
    details: {
      count: 15,
      totalSize: '45.2 MB',
      reason: 'Cleanup old unused assets',
    },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    sessionId: 'sess_def456',
    success: true,
    severity: 'medium',
    category: 'content',
  },
];

const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case 'create':
      return 'bg-green-100 text-green-800';
    case 'update':
      return 'bg-blue-100 text-blue-800';
    case 'delete':
    case 'bulk_delete':
      return 'bg-red-100 text-red-800';
    case 'login':
    case 'login_success':
      return 'bg-purple-100 text-purple-800';
    case 'login_failed':
    case 'logout':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getSeverityColor = (severity: AuditLog['severity']) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getCategoryIcon = (category: AuditLog['category']) => {
  switch (category) {
    case 'auth':
      return '🔐';
    case 'content':
      return '📝';
    case 'user':
      return '👤';
    case 'system':
      return '⚙️';
    case 'config':
      return '🛠️';
    default:
      return '📄';
  }
};

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AuditLog['category']>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | AuditLog['severity']>('all');
  const [dateRange, setDateRange] = useState<'1d' | '7d' | '30d' | 'all'>('7d');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 3600 * 24));
      
      switch (dateRange) {
        case '1d':
          matchesDate = daysDiff <= 1;
          break;
        case '7d':
          matchesDate = daysDiff <= 7;
          break;
        case '30d':
          matchesDate = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesSeverity && matchesDate;
  });

  const handleExportLogs = () => {
    alert('Tính năng xuất audit logs sẽ được phát triển trong phiên bản tiếp theo.');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const formatDetails = (details: Record<string, any>) => {
    return JSON.stringify(details, null, 2);
  };

  const getTotalLogs = () => auditLogs.length;
  const getFailedActions = () => auditLogs.filter(log => !log.success).length;
  const getCriticalActions = () => auditLogs.filter(log => log.severity === 'critical').length;
  const getUniqueUsers = () => new Set(auditLogs.map(log => log.userId)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Trails</h1>
          <p className="text-gray-600 mt-2">
            Theo dõi và giám sát tất cả các hoạt động trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleExportLogs}>
            📊 Xuất báo cáo
          </Button>
          <Button variant="outline" size="sm">
            ⚙️ Cấu hình
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng sự kiện</p>
              <p className="text-3xl font-bold text-gray-900">{getTotalLogs()}</p>
            </div>
            <div className="text-2xl">📋</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Thất bại</p>
              <p className="text-3xl font-bold text-red-600">{getFailedActions()}</p>
            </div>
            <div className="text-2xl">❌</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nghiêm trọng</p>
              <p className="text-3xl font-bold text-orange-600">{getCriticalActions()}</p>
            </div>
            <div className="text-2xl">🚨</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Người dùng</p>
              <p className="text-3xl font-bold text-blue-600">{getUniqueUsers()}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Tìm kiếm trong audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="auth">🔐 Xác thực</option>
            <option value="content">📝 Nội dung</option>
            <option value="user">👤 Người dùng</option>
            <option value="system">⚙️ Hệ thống</option>
            <option value="config">🛠️ Cấu hình</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="critical">🚨 Nghiêm trọng</option>
            <option value="high">⚠️ Cao</option>
            <option value="medium">📋 Trung bình</option>
            <option value="low">ℹ️ Thấp</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1d">24 giờ qua</option>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="all">Tất cả</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tài nguyên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mức độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chi tiết
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-sm text-gray-500">{log.userRole}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                      {getCategoryIcon(log.category)}
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">{log.resource}</div>
                      {log.resourceId && (
                        <div className="text-xs text-gray-400">{log.resourceId}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.success ? '✅ Thành công' : '❌ Thất bại'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-primary hover:text-primary/80"
                    >
                      👁️ Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy audit log</div>
          <div className="text-gray-500">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Chi tiết Audit Log</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <div className="text-sm text-gray-900 font-mono">{selectedLog.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
                  <div className="text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người dùng</label>
                  <div className="text-sm text-gray-900">{selectedLog.userName} ({selectedLog.userRole})</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hành động</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tài nguyên</label>
                  <div className="text-sm text-gray-900">
                    {selectedLog.resource}
                    {selectedLog.resourceId && (
                      <div className="text-xs text-gray-500">{selectedLog.resourceId}</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedLog.severity)}`}>
                    {selectedLog.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <div className="text-sm text-gray-900 font-mono">{selectedLog.ipAddress}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session ID</label>
                  <div className="text-sm text-gray-900 font-mono">{selectedLog.sessionId}</div>
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lỗi</label>
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {selectedLog.errorMessage}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                <div className="text-sm text-gray-900 font-mono bg-gray-50 p-3 rounded-md break-all">
                  {selectedLog.userAgent}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chi tiết</label>
                <pre className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md overflow-x-auto">
                  {formatDetails(selectedLog.details)}
                </pre>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
