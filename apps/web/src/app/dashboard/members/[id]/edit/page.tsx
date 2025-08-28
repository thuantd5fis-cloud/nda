'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';
import {
  ArrowLeftIcon, UserIcon, BriefcaseIcon, TargetIcon, PlusIcon, XIcon,
  CheckIcon, AwardIcon, WebIcon, LinkedinIcon, GithubIcon, TwitterIcon,
  LoadingIcon, ErrorIcon, TrashIcon, LightBulbIcon
} from '@/components/icons';

interface MemberFormData {
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
  createdAt: string;
  updatedAt: string;
}

const expertiseAreas = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot',
  'C#', '.NET', 'Go', 'Rust', 'PHP', 'Laravel',
  'DevOps', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'Machine Learning', 'AI', 'Data Science', 'Blockchain',
  'Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android',
  'UI/UX Design', 'Product Management', 'System Architecture',
  'Database', 'PostgreSQL', 'MongoDB'
];



export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { toast, confirmDelete } = useConfirm();
  const [formData, setFormData] = useState<MemberFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Fetch member data using React Query
  const { data: member, isLoading, error } = useQuery({
    queryKey: ['member', params.id],
    queryFn: () => apiClient.getMember(params.id as string),
    onSuccess: (data) => {
      setFormData(data);
    },
  });

  const handleInputChange = (field: keyof MemberFormData, value: any) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, [field]: value }));
  };

  const handleExpertiseToggle = (skill: string) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      expertise: prev!.expertise.includes(skill)
        ? prev!.expertise.filter(s => s !== skill)
        : [...prev!.expertise, skill]
    }));
  };

  const handleAddCertification = () => {
    if (!formData) return;
    const certification = prompt('Nhập tên chứng chỉ:');
    if (certification && certification.trim()) {
      setFormData(prev => ({
        ...prev!,
        certifications: [...prev!.certifications, certification.trim()]
      }));
    }
  };

  const handleRemoveCertification = (index: number) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      certifications: prev!.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !formData.fullName || !formData.email) {
      toast.error('Vui lòng nhập tên đầy đủ và email');
      return;
    }

    if (!formData.expertise || formData.expertise.length === 0) {
      toast.error('Vui lòng chọn ít nhất một lĩnh vực chuyên môn');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Real API call
      await apiClient.updateMember(formData.id, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
        title: formData.title,
        bio: formData.bio,
        expertise: formData.expertise,
        company: formData.company,
        position: formData.position,
        experience: formData.experience,
        website: formData.website,
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
        location: formData.location,
        isExpert: formData.isExpert,
        isActive: formData.isActive,
        joinDate: formData.joinDate,
        certifications: formData.certifications,
      });
      
      queryClient.invalidateQueries({ queryKey: ['member', formData.id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      
      toast.success('Thông tin thành viên đã được cập nhật thành công!');
      router.push('/dashboard/members');
    } catch (error) {
      console.error('Update member error:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thành viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!formData) return;
    
    if ((formData.articlesCount || 0) > 0 || (formData.mentoringCount || 0) > 0) {
      toast.error(`Không thể xóa thành viên này vì có ${formData.articlesCount || 0} bài viết và ${formData.mentoringCount || 0} phiên mentoring. Vui lòng chuyển nhượng hoặc hoàn thành trước.`);
      return;
    }

    const confirmed = await confirmDelete({
      title: 'Xác nhận xóa thành viên',
      message: `Bạn có chắc chắn muốn xóa thành viên "${formData.fullName}"? Hành động này không thể hoàn tác.`,
    });

    if (!confirmed) return;

    setIsSubmitting(true);
    
    try {
      await apiClient.deleteMember(formData.id);
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Thành viên đã được xóa thành công!');
      router.push('/dashboard/members');
    } catch (error) {
      console.error('Delete member error:', error);
      toast.error('Có lỗi xảy ra khi xóa thành viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const TabButton = ({ id, label, isActive, onClick }: {
    id: string;
    label: string;
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

  if (error || !member || !formData) {
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
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa thành viên</h1>
          <p className="text-gray-600 mt-2">
            Cập nhật thông tin và chuyên môn thành viên
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            ← Quay lại
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isSubmitting || (formData.articlesCount || 0) > 0 || (formData.mentoringCount || 0) > 0}
            className="text-red-600 border-red-600 hover:bg-red-50 inline-flex items-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            Xóa thành viên
          </Button>
        </div>
      </div>

      {/* Member Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={formData.fullName}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                formData.fullName.charAt(0)
              )}
            </div>
            <div>
              <div className="font-bold text-blue-900">{formData.fullName}</div>
              <div className="text-sm text-blue-600">{formData.title}</div>
              <div className="flex items-center gap-4 mt-1 text-sm text-blue-600">
                <span>ID: {formData.id}</span>
                <span>Tham gia: {new Date(formData.joinDate).toLocaleDateString('vi-VN')}</span>
                <span>Bài viết: {formData.articlesCount}</span>
                <span>Mentoring: {formData.mentoringCount}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              {formData.isExpert && (
                <span className="inline-flex px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  ⭐ Chuyên gia
                </span>
              )}
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                formData.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {formData.isActive ? '✅ Kích hoạt' : '❌ Tạm dừng'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="basic"
          label="👤 Thông tin cơ bản"
          isActive={activeTab === 'basic'}
          onClick={setActiveTab}
        />
        <TabButton
          id="professional"
          label="💼 Thông tin nghề nghiệp"
          isActive={activeTab === 'professional'}
          onClick={setActiveTab}
        />
        <TabButton
          id="expertise"
          label="🎯 Chuyên môn & Kỹ năng"
          isActive={activeTab === 'expertise'}
          onClick={setActiveTab}
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Similar to create but with existing data */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'basic' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
              
              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Avatar preview"
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-2xl text-gray-400">👤</span>
                    )}
                    {!formData.avatar && formData.fullName && (
                      <div className="absolute h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {formData.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <Input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => handleInputChange('avatar', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chức danh
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Senior Developer, Tech Lead, ..."
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Thay đổi email có thể ảnh hưởng đến đăng nhập
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0901234567"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Hà Nội, TP.HCM, ..."
                  />
                </div>

                {/* Join Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày tham gia
                  </label>
                  <Input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => handleInputChange('joinDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới thiệu bản thân
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Giới thiệu về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Social Links */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Liên kết mạng xã hội</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🌐 Website
                    </label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://mywebsite.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      💼 LinkedIn
                    </label>
                    <Input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🐱 GitHub
                    </label>
                    <Input
                      type="url"
                      value={formData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🐦 Twitter
                    </label>
                    <Input
                      type="url"
                      value={formData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin nghề nghiệp</h3>
              
              {/* Company & Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Công ty hiện tại
                  </label>
                  <Input
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Tên công ty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vị trí công việc
                  </label>
                  <Input
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="Software Engineer, Product Manager, ..."
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số năm kinh nghiệm
                </label>
                <Input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                  min="0"
                  max="50"
                  placeholder="8"
                />
              </div>

              {/* Certifications */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Chứng chỉ
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCertification}
                  >
                    ➕ Thêm chứng chỉ
                  </Button>
                </div>
                
                {formData.certifications.length > 0 ? (
                  <div className="space-y-2">
                    {formData.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{cert}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCertification(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-2xl mb-2">🏆</div>
                    <p>Chưa có chứng chỉ nào</p>
                    <p className="text-sm">Thêm chứng chỉ để tăng uy tín chuyên môn</p>
                  </div>
                )}
              </div>

              {/* Expert Status */}
              <div className="pt-6 border-t border-gray-200">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isExpert}
                    onChange={(e) => handleInputChange('isExpert', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium">Đánh dấu là chuyên gia</div>
                    <div className="text-sm text-gray-500">
                      Thành viên này có kinh nghiệm và kiến thức chuyên sâu trong lĩnh vực
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'expertise' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Chuyên môn & Kỹ năng</h3>
              
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Chọn các lĩnh vực chuyên môn và kỹ năng. Tối thiểu 1 lĩnh vực.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {expertiseAreas.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleExpertiseToggle(skill)}
                      className={`p-3 text-sm rounded-lg border-2 transition-all text-center ${
                        formData.expertise.includes(skill)
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>

                {formData.expertise.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Đã chọn ({formData.expertise.length} lĩnh vực):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.expertise.map(skill => (
                        <span key={skill} className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Member Status */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Trạng thái thành viên</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isExpert}
                  onChange={(e) => handleInputChange('isExpert', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <div>
                  <div className="font-medium">Chuyên gia</div>
                  <div className="text-sm text-gray-500">Có thể tư vấn và chia sẻ kiến thức</div>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <div>
                  <div className="font-medium">Kích hoạt</div>
                  <div className="text-sm text-gray-500">Hiển thị trong danh sách công khai</div>
                </div>
              </label>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Thống kê hoạt động</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bài viết:</span>
                <span className="font-medium">{formData.articlesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phiên mentoring:</span>
                <span className="font-medium">{formData.mentoringCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kinh nghiệm:</span>
                <span className="font-medium">{formData.experience} năm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chứng chỉ:</span>
                <span className="font-medium">{formData.certifications.length}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Thao tác</h3>
            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? '⏳ Đang cập nhật...' : '✅ Cập nhật thành viên'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/members')}
                disabled={isSubmitting}
                className="w-full"
              >
                ❌ Hủy bỏ
              </Button>
            </div>
          </div>

          {/* Warning */}
          {(formData.articlesCount > 0 || formData.mentoringCount > 0) && (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-3">⚠️ Lưu ý</h3>
              <p className="text-sm text-yellow-800">
                Thành viên này có {formData.articlesCount} bài viết và {formData.mentoringCount} phiên mentoring. Không thể xóa cho đến khi chuyển nhượng hoặc hoàn thành.
              </p>
            </div>
          )}

          {/* History */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Lịch sử</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">Tham gia</div>
                <div className="text-gray-500">
                  {new Date(formData.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Cập nhật gần nhất</div>
                <div className="text-gray-500">
                  {new Date(formData.updatedAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
