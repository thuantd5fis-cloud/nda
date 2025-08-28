'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@cms/ui';
import { apiClient } from '@/lib/api';
import { useConfirm } from '@/hooks/use-confirm';
import { 
  ArrowLeftIcon, UserIcon, BriefcaseIcon, TargetIcon, PlusIcon, XIcon, 
  CheckIcon, AwardIcon, WebIcon, LinkedinIcon, GithubIcon, TwitterIcon,
  LoadingIcon, LightBulbIcon
} from '@/components/icons';

interface MemberFormData {
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
}

const expertiseAreas = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot',
  'C#', '.NET', 'Go', 'Rust', 'PHP', 'Laravel',
  'DevOps', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'Machine Learning', 'AI', 'Data Science', 'Blockchain',
  'Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android',
  'UI/UX Design', 'Product Management', 'System Architecture',
  'Database', 'PostgreSQL', 'MongoDB', 'Redis'
];

export default function CreateMemberPage() {
  const router = useRouter();
  const { toast } = useConfirm();
  const [formData, setFormData] = useState<MemberFormData>({
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
    title: '',
    bio: '',
    expertise: [],
    company: '',
    position: '',
    experience: 0,
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    location: '',
    isExpert: false,
    isActive: true,
    joinDate: new Date().toISOString().slice(0, 10),
    certifications: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (field: keyof MemberFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExpertiseToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(skill)
        ? prev.expertise.filter(s => s !== skill)
        : [...prev.expertise, skill]
    }));
  };

  const handleAddCertification = () => {
    const certification = prompt('Nhập tên chứng chỉ:');
    if (certification && certification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, certification.trim()]
      }));
    }
  };

  const handleRemoveCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email) {
      toast.error('Vui lòng nhập tên đầy đủ và email');
      return;
    }

    if (formData.expertise.length === 0) {
      toast.error('Vui lòng chọn ít nhất một lĩnh vực chuyên môn');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      const memberData = { 
        ...formData,
        createdAt: new Date().toISOString()
      };
      console.log('Creating member:', memberData);
      
      // Clean data for API
      const cleanData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        avatar: formData.avatar || undefined,
        title: formData.title || undefined,
        bio: formData.bio || undefined,
        expertise: formData.expertise,
        company: formData.company || undefined,
        position: formData.position || undefined,
        experience: formData.experience || undefined,
        website: formData.website || undefined,
        linkedin: formData.linkedin || undefined,
        github: formData.github || undefined,
        twitter: formData.twitter || undefined,
        location: formData.location || undefined,
        isExpert: formData.isExpert || undefined,
        isActive: formData.isActive || undefined,
        joinDate: formData.joinDate || undefined,
        certifications: formData.certifications?.length > 0 ? formData.certifications : undefined,
      };

      // Remove undefined values
      const finalData = Object.fromEntries(
        Object.entries(cleanData).filter(([_, value]) => value !== undefined && value !== '')
      );

      console.log('Final data being sent:', finalData);

      // Real API call
      const createdMember = await apiClient.createMember(finalData);
      
      console.log('✅ Member created successfully:', createdMember);
      toast.success('Thành viên đã được tạo thành công!');
      router.push('/dashboard/members');
    } catch (error) {
      console.error('Create member error:', error);
      toast.error('Có lỗi xảy ra khi tạo thành viên');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thêm thành viên mới</h1>
          <p className="text-gray-600 mt-2">
            Thêm chuyên gia hoặc thành viên cộng đồng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Quay lại
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          id="basic"
          label={
            <span className="inline-flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Thông tin cơ bản
            </span>
          }
          isActive={activeTab === 'basic'}
          onClick={setActiveTab}
        />
        <TabButton
          id="professional"
          label={
            <span className="inline-flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4" />
              Thông tin nghề nghiệp
            </span>
          }
          isActive={activeTab === 'professional'}
          onClick={setActiveTab}
        />
        <TabButton
          id="expertise"
          label={
            <span className="inline-flex items-center gap-2">
              <TargetIcon className="w-4 h-4" />
              Chuyên môn & Kỹ năng
            </span>
          }
          isActive={activeTab === 'expertise'}
          onClick={setActiveTab}
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
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
                      <UserIcon className="w-8 h-8 text-gray-400" />
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
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <WebIcon className="w-4 h-4" />
                      Website
                    </label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://mywebsite.com"
                    />
                  </div>

                  <div>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <LinkedinIcon className="w-4 h-4" />
                      LinkedIn
                    </label>
                    <Input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <GithubIcon className="w-4 h-4" />
                      GitHub
                    </label>
                    <Input
                      type="url"
                      value={formData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <TwitterIcon className="w-4 h-4" />
                      Twitter
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
                  placeholder="5"
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
                    className="inline-flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Thêm chứng chỉ
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
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="flex justify-center mb-2">
                      <AwardIcon className="w-8 h-8 text-gray-400" />
                    </div>
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
          {/* Member Type */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Loại thành viên</h3>
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

          {/* Preview */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Xem trước</h3>
            <div className="text-center">
              <div className="h-16 w-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  formData.fullName.charAt(0) || <UserIcon className="w-6 h-6" />
                )}
              </div>
              <div className="font-medium text-gray-900">
                {formData.fullName || 'Họ và tên'}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                {formData.title || 'Chức danh'}
              </div>
              <div className="text-sm text-gray-500 mb-3">
                {formData.company && `${formData.company} • `}
                {formData.location}
              </div>
              
              {formData.isExpert && (
                <span className="inline-flex px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold mb-3">
                  ⭐ Chuyên gia
                </span>
              )}

              <div className="text-xs text-gray-500">
                {formData.expertise.length} lĩnh vực chuyên môn
                {formData.experience > 0 && ` • ${formData.experience} năm kinh nghiệm`}
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
                className="w-full inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingIcon className="w-4 h-4" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Tạo thành viên
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/members')}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2"
              >
                <XIcon className="w-4 h-4" />
                Hủy bỏ
              </Button>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="inline-flex items-center gap-2 font-semibold text-blue-900 mb-3">
              <LightBulbIcon className="w-5 h-5" />
              Hướng dẫn
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Tên đầy đủ và email là bắt buộc</li>
              <li>• Chọn ít nhất 1 lĩnh vực chuyên môn</li>
              <li>• Avatar tăng tính chuyên nghiệp</li>
              <li>• Giới thiệu chi tiết giúp kết nối tốt hơn</li>
              <li>• Chuyên gia có thể mentoring và tư vấn</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
