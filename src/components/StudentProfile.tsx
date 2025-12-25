import { useState, useEffect } from 'react';
import { User, Building2, Mail, Calendar, Save, Loader2, CheckCircle } from 'lucide-react';
import {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,
  getAuthorizedInstitutions,
  StudentProfile as StudentProfileType,
} from '../utils/supabase';

interface StudentProfileProps {
  walletAddress: string;
}

export default function StudentProfile({ walletAddress }: StudentProfileProps) {
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [institutions, setInstitutions] = useState<Array<{ address: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institutionName: '',
    institutionAddress: '',
  });

  useEffect(() => {
    loadData();
  }, [walletAddress]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileData, institutionsData] = await Promise.all([
        getStudentProfile(walletAddress),
        getAuthorizedInstitutions(),
      ]);

      setProfile(profileData);
      setInstitutions(institutionsData);

      if (profileData) {
        setFormData({
          fullName: profileData.full_name,
          email: profileData.email,
          institutionName: profileData.institution_name,
          institutionAddress: profileData.institution_address,
        });
      } else {
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAddress = e.target.value;
    const selectedInstitution = institutions.find(inst => inst.address === selectedAddress);

    if (selectedInstitution) {
      setFormData({
        ...formData,
        institutionAddress: selectedInstitution.address,
        institutionName: selectedInstitution.name,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      if (!formData.fullName || !formData.email || !formData.institutionAddress) {
        throw new Error('Please fill in all required fields');
      }

      if (profile) {
        await updateStudentProfile(walletAddress, {
          full_name: formData.fullName,
          email: formData.email,
          institution_name: formData.institutionName,
          institution_address: formData.institutionAddress,
        });
      } else {
        await createStudentProfile(
          walletAddress,
          formData.fullName,
          formData.email,
          formData.institutionName,
          formData.institutionAddress
        );
      }

      await loadData();
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Profile</h2>
            <p className="text-sm text-gray-600">Manage your academic information</p>
          </div>
        </div>
        {profile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <span className="text-sm text-green-700">Profile saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!isEditing && profile ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="flex items-center space-x-2 text-gray-900">
                <User className="w-4 h-4 text-gray-400" />
                <span>{profile.full_name}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="flex items-center space-x-2 text-gray-900">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{profile.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
              <div className="flex items-center space-x-2 text-gray-900">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span>{profile.institution_name}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Date</label>
              <div className="flex items-center space-x-2 text-gray-900">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{new Date(profile.enrollment_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
            <div className="bg-gray-50 rounded-lg p-3">
              <code className="text-sm font-mono text-gray-800 break-all">{profile.wallet_address}</code>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="student@university.edu"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.institutionAddress}
                onChange={handleInstitutionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an authorized institution</option>
                {institutions.map((inst) => (
                  <option key={inst.address} value={inst.address}>
                    {inst.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only institutions authorized by the platform are available
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your wallet address will be linked to this profile. Make sure all information is correct.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Profile
                </>
              )}
            </button>
            {profile && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    fullName: profile.full_name,
                    email: profile.email,
                    institutionName: profile.institution_name,
                    institutionAddress: profile.institution_address,
                  });
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
