'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';
import {
  ArrowLeftIcon, EditIcon, TrashIcon, UserIcon, StarIcon, CheckIcon, XIcon,
  CompanyIcon, LocationIcon, CalendarIcon, WebIcon, LinkedinIcon, GithubIcon, TwitterIcon,
  LoadingIcon, ErrorIcon, DocumentIcon, UsersIcon, AwardIcon, BookIcon, TableIcon
} from '@/components/icons';

interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  title: string;
  bio: string;
  expertise: string[];
  company: string;
  position: string;
  experience: number;
  website: string;
  linkedin: string;
  github: string;
  twitter: string;
  location: string;
  isExpert: boolean;
  isActive: boolean;
  joinDate: string;
  certifications: string[];
  articlesCount: number;
  mentoringCount: number;
  articles: Array<{
    id: string;
    title: string;
    publishedAt: string;
    views: number;
    status: string;
  }>;
  mentoringHistory: Array<{
    id: string;
    menteeName: string;
    topic: string;
    date: string;
    duration: number;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}



const getStatusBadge = (status: string) => {
  const statusConfig = {
    published: { label: 'Đã xuất bản', color: 'bg-green-100 text-green-800' },
    draft: { label: 'Bản nháp', color: 'bg-gray-100 text-gray-800' },
    completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    scheduled: { label: 'Đã lên lịch', color: 'bg-blue-100 text-blue-800' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { toast, confirmDelete } = useConfirm();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch member data using React Query
  const { data: member, isLoading, error } = useQuery({
    queryKey: ['member', params.id],
    queryFn: () => apiClient.getMember(params.id as string),
  });

  const handleDelete = async () => {
    if (!member) return;
    
    if ((member.articlesCount || 0) > 0 || (member.mentoringCount || 0) > 0) {
      toast.error(`Không thể xóa thành viên này vì có ${member.articlesCount || 0} bài viết và ${member.mentoringCount || 0} phiên mentoring.`);
      return;
    }

    const confirmed = await confirmDelete({
      title: 'Xác nhận xóa thành viên',
      message: `Bạn có chắc chắn muốn xóa thành viên "${member.fullName}"? Hành động này không thể hoàn tác.`,
    });

    if (!confirmed) return;

    try {
      await apiClient.deleteMember(member.id);
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Thành viên đã được xóa thành công!');
      router.push('/dashboard/members');
    } catch (error) {
      console.error('Delete member error:', error);
      toast.error('Có lỗi xảy ra khi xóa thành viên');
    }
  };

  const TabButton = ({ id, label, isActive, onClick }: {
    id: string;
    label: React.ReactNode;
    isActive: boolean;
    onClick: (id: string) => void;
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <LoadingIcon className="w-12 h-12 text-primary" />
          </div>
          <div className="text-lg font-medium text-gray-900">Đang tải thông tin...</div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <ErrorIcon className="w-12 h-12 text-red-500" />
          </div>
          <div className="text-lg font-medium text-gray-900">
            {error ? 'Lỗi tải dữ liệu' : 'Không tìm thấy thành viên'}
          </div>
          <Button 
            onClick={() => router.push('/dashboard/members')} 
            className="mt-4 inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Quay về danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông tin thành viên</h1>
          <p className="text-gray-600 mt-2">
            Xem chi tiết và quản lý thành viên cộng đồng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/members')}
            className="inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Danh sách thành viên
          </Button>
          <Link href={`/dashboard/members/${member.id}/edit`}>
            <Button variant="outline" className="inline-flex items-center gap-2">
              <EditIcon className="w-4 h-4" />
              Chỉnh sửa
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={(member.articlesCount || 0) > 0 || (member.mentoringCount || 0) > 0}
            className="text-red-600 border-red-600 hover:bg-red-50 inline-flex items-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Member Profile Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="flex items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-32 w-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.fullName}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  member.fullName.charAt(0)
                )}
              </div>
            </div>
            
            {/* Member Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-gray-900">{member.fullName}</h2>
                    {member.isExpert && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        <StarIcon className="w-3 h-3" />
                        Chuyên gia
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                      member.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.isActive ? (
                        <>
                          <CheckIcon className="w-3 h-3" />
                          Kích hoạt
                        </>
                      ) : (
                        <>
                          <XIcon className="w-3 h-3" />
                          Tạm dừng
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-xl text-gray-600 mb-2">{member.title}</div>
                  <div className="flex items-center gap-6 text-gray-600 mb-4">
                    <span className="flex items-center gap-2">
                      <CompanyIcon className="w-4 h-4" />
                      {member.company}
                    </span>
                    <span className="flex items-center gap-2">
                      <LocationIcon className="w-4 h-4" />
                      {member.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {member.experience} năm kinh nghiệm
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>ID: {member.id}</div>
                  <div>Tham gia: {new Date(member.joinDate).toLocaleDateString('vi-VN')}</div>
                </div>
              </div>

              {/* Contact & Social Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                    {member.email}
                  </a>
                </div>
                {member.phone && (
                  <div>
                    <div className="text-sm text-gray-500">Điện thoại</div>
                    <a href={`tel:${member.phone}`} className="text-blue-600 hover:underline">
                      {member.phone}
                    </a>
                  </div>
                )}
                {member.website && (
                  <div>
                    <div className="text-sm text-gray-500">Website</div>
                    <a href={member.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                      <WebIcon className="w-4 h-4" />
                      Portfolio
                    </a>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">Mạng xã hội</div>
                  <div className="flex items-center gap-2">
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" title="LinkedIn">
                        <LinkedinIcon className="w-5 h-5" />
                      </a>
                    )}
                    {member.github && (
                      <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" title="GitHub">
                        <GithubIcon className="w-5 h-5" />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" title="Twitter">
                        <TwitterIcon className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Expertise Tags */}
              <div>
                <div className="text-sm text-gray-500 mb-2">Lĩnh vực chuyên môn</div>
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map(skill => (
                    <span key={skill} className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bài viết</p>
              <p className="text-3xl font-bold text-blue-600">{member.articlesCount || 0}</p>
            </div>
            <div className="text-blue-600">
              <DocumentIcon className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mentoring</p>
              <p className="text-3xl font-bold text-green-600">{member.mentoringCount || 0}</p>
            </div>
            <div className="text-green-600">
              <UsersIcon className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chứng chỉ</p>
              <p className="text-3xl font-bold text-purple-600">{member.certifications?.length || 0}</p>
            </div>
            <div className="text-purple-600">
              <AwardIcon className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kinh nghiệm</p>
              <p className="text-3xl font-bold text-orange-600">{member.experience || 0}</p>
            </div>
            <div className="text-orange-600">
              <StarIcon className="w-8 h-8" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">năm</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="overview"
          label={
            <span className="inline-flex items-center gap-2">
              <TableIcon className="w-4 h-4" />
              Tổng quan
            </span>
          }
          isActive={activeTab === 'overview'}
          onClick={setActiveTab}
        />
        <TabButton
          id="articles"
          label={
            <span className="inline-flex items-center gap-2">
              <DocumentIcon className="w-4 h-4" />
              Bài viết ({member.articlesCount || 0})
            </span>
          }
          isActive={activeTab === 'articles'}
          onClick={setActiveTab}
        />
        <TabButton
          id="mentoring"
          label={
            <span className="inline-flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Mentoring ({member.mentoringCount || 0})
            </span>
          }
          isActive={activeTab === 'mentoring'}
          onClick={setActiveTab}
        />
        <TabButton
          id="credentials"
          label={
            <span className="inline-flex items-center gap-2">
              <AwardIcon className="w-4 h-4" />
              Chứng chỉ & Kỹ năng
            </span>
          }
          isActive={activeTab === 'credentials'}
          onClick={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Giới thiệu</h3>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">
              {member.bio}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'articles' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Bài viết của {member.fullName} ({member.articlesCount})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt xem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày xuất bản
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {member.articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{article.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/posts/${article.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          👁️ Xem
                        </Link>
                        <Link
                          href={`/dashboard/posts/${article.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          ✏️ Sửa
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(!member.articles || member.articles.length === 0) && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <DocumentIcon className="w-16 h-16 text-gray-400" />
              </div>
              <div className="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết</div>
              <div className="text-gray-500">Thành viên chưa đăng bài viết nào</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'mentoring' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Lịch sử mentoring ({member.mentoringCount})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mentee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chủ đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {member.mentoringHistory.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {session.menteeName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{session.menteeName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.topic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.date).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.duration} phút
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(session.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(!member.mentoringHistory || member.mentoringHistory.length === 0) && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <UsersIcon className="w-16 h-16 text-gray-400" />
              </div>
              <div className="text-lg font-medium text-gray-900 mb-2">Chưa có phiên mentoring</div>
              <div className="text-gray-500">Thành viên chưa tham gia mentoring</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Certifications */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Chứng chỉ ({member.certifications.length})
            </h3>
            {(member.certifications && member.certifications.length > 0) ? (
              <div className="space-y-3">
                {member.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-yellow-600 mr-3">
                      <AwardIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{cert}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="flex justify-center mb-2">
                  <AwardIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p>Chưa có chứng chỉ nào</p>
              </div>
            )}
          </div>

          {/* Skills & Expertise */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Kỹ năng chuyên môn ({member.expertise.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {member.expertise.map(skill => (
                <div key={skill} className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 mr-2">⚡</div>
                  <span className="text-sm font-medium text-blue-900">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
