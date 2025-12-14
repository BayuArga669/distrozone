import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, getImageUrl } from '../../services/api';
import { User, Mail, Lock, Camera, Save, Loader2 } from 'lucide-react';

const UserProfile = () => {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        birth_date: '',
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                gender: user?.gender || '',
                birth_date: user?.birth_date || '',
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await authAPI.updateProfile(profileData);
            await refreshUser(); // Refresh user data
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.password !== passwordData.password_confirmation) {
            setError('New passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await authAPI.updatePassword(
                passwordData.current_password,
                passwordData.password,
                passwordData.password_confirmation
            );
            setMessage('Password updated successfully!');
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError('');

        try {
            await authAPI.uploadPhoto(file);
            await refreshUser(); // Refresh user data
            setMessage('Profile photo updated!');
        } catch (err) {
            setError(err.message || 'Failed to upload photo');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container max-w-4xl">
                <h1 className="text-3xl font-black text-slate-900 mb-8">Account Settings</h1>

                {message && (
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl mb-6 border border-emerald-200 font-medium">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 border border-red-200 font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column - Photo */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
                            <div className="relative w-32 h-32 mx-auto mb-4">
                                <img
                                    src={user?.profile_photo_url || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=f97316&color=fff`}
                                    alt={user?.name}
                                    className="w-full h-full rounded-full object-cover border-4 border-slate-50"
                                />
                                <label className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full cursor-pointer hover:bg-orange-500 transition-colors shadow-lg">
                                    <Camera size={16} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </label>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                            <p className="text-slate-500 text-sm">{user?.email}</p>
                        </div>
                    </div>

                    {/* Right Column - Forms */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Profile Form */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <User size={20} className="text-orange-500" />
                                Personal Information
                            </h3>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleProfileChange}
                                            placeholder="08123456789"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Gender</label>
                                        <select
                                            name="gender"
                                            value={profileData.gender}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium bg-white"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="birth_date"
                                        value={profileData.birth_date}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading || authLoading}
                                        className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-orange-500 transition-colors flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Password Form */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Lock size={20} className="text-orange-500" />
                                Change Password
                            </h3>
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={passwordData.current_password}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={passwordData.password}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            value={passwordData.password_confirmation}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading || authLoading}
                                        className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-orange-500 transition-colors flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
