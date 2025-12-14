import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Settings as SettingsIcon, Key, Save, Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showKeys, setShowKeys] = useState(false);

    const [settings, setSettings] = useState({
        midtrans_server_key: '',
        midtrans_client_key: '',
        midtrans_is_production: false,
        midtrans_is_sanitized: true,
        midtrans_is_3ds: true,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getSettings('midtrans');

            if (response.settings) {
                const newSettings = {};
                Object.entries(response.settings).forEach(([key, data]) => {
                    newSettings[key] = data.value;
                });
                setSettings(prev => ({ ...prev, ...newSettings }));
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            setError('Gagal memuat settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setError(null);
        setSuccess(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const settingsArray = Object.entries(settings).map(([key, value]) => ({
                key,
                value,
            }));

            await adminAPI.updateSettings(settingsArray);
            setSuccess('Settings berhasil disimpan!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to save settings:', err);
            setError('Gagal menyimpan settings: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                    <div className="p-3 bg-orange-100 rounded-2xl">
                        <SettingsIcon className="text-orange-600" size={32} />
                    </div>
                    System Settings
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Configure payment gateways and system preferences</p>
            </div>

            {/* Midtrans Settings Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                            <Key size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Midtrans Configuration</h2>
                            <p className="text-slate-500 font-medium">Payment gateway API keys and environment settings</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Error/Success Messages */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 font-medium animate-in slide-in-from-top-2">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-600 font-medium animate-in slide-in-from-top-2">
                            <CheckCircle size={20} />
                            {success}
                        </div>
                    )}

                    {/* Environment Toggle */}
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-base font-bold text-slate-900 mb-1">
                                    Environment Mode
                                </label>
                                <p className="text-sm text-slate-500 font-medium">
                                    {settings.midtrans_is_production
                                        ? '🔴 PRODUCTION MODE - Real transactions enabled'
                                        : '🟢 SANDBOX MODE - Testing environment only'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleChange('midtrans_is_production', !settings.midtrans_is_production)}
                                className={`relative inline-flex h-9 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 ${settings.midtrans_is_production ? 'bg-slate-900' : 'bg-emerald-500'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-lg transition-transform ${settings.midtrans_is_production ? 'translate-x-8' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Server Key */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Server Key
                                <span className="text-orange-500 ml-1">*</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type={showKeys ? 'text' : 'password'}
                                    value={settings.midtrans_server_key}
                                    onChange={(e) => handleChange('midtrans_server_key', e.target.value)}
                                    className="w-full pl-5 pr-12 py-4 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 font-mono text-sm transition-all focus:bg-white"
                                    placeholder="SB-Mid-server-xxx..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKeys(!showKeys)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    {showKeys ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 font-medium">
                                Used for secure server-side API calls
                            </p>
                        </div>

                        {/* Client Key */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Client Key
                                <span className="text-orange-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showKeys ? 'text' : 'password'}
                                    value={settings.midtrans_client_key}
                                    onChange={(e) => handleChange('midtrans_client_key', e.target.value)}
                                    className="w-full pl-5 pr-12 py-4 rounded-xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 font-mono text-sm transition-all focus:bg-white"
                                    placeholder="SB-Mid-client-xxx..."
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2 font-medium">
                                Used for frontend Snap.js integration
                            </p>
                        </div>
                    </div>

                    {/* Additional Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group">
                            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${settings.midtrans_is_sanitized ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'}`}>
                                {settings.midtrans_is_sanitized && <div className="w-2.5 h-2.5 bg-white rounded animate-in zoom-in" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.midtrans_is_sanitized}
                                onChange={(e) => handleChange('midtrans_is_sanitized', e.target.checked)}
                                className="sr-only"
                            />
                            <div>
                                <span className="block font-bold text-slate-900 group-hover:text-orange-600 transition-colors">Sanitized Mode</span>
                                <span className="text-xs text-slate-500 font-medium">Enable automatic input filtering</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group">
                            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${settings.midtrans_is_3ds ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'}`}>
                                {settings.midtrans_is_3ds && <div className="w-2.5 h-2.5 bg-white rounded animate-in zoom-in" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.midtrans_is_3ds}
                                onChange={(e) => handleChange('midtrans_is_3ds', e.target.checked)}
                                className="sr-only"
                            />
                            <div>
                                <span className="block font-bold text-slate-900 group-hover:text-orange-600 transition-colors">3D Secure</span>
                                <span className="text-xs text-slate-500 font-medium">Enforce Two-Factor Authentication</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-orange-500 transition-all shadow-xl shadow-slate-900/10 hover:shadow-orange-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">?</span>
                    How to get API Keys
                </h3>
                <ol className="space-y-3 text-sm text-slate-600 font-medium list-decimal list-inside ml-2">
                    <li className="pl-2 marker:font-bold marker:text-slate-400">Login to your <a href="https://dashboard.midtrans.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">Midtrans Dashboard</a></li>
                    <li className="pl-2 marker:font-bold marker:text-slate-400">Navigate to <strong>Settings &gt; Access Keys</strong> in the sidebar</li>
                    <li className="pl-2 marker:font-bold marker:text-slate-400">Copy the <strong>Server Key</strong> and <strong>Client Key</strong> shown there</li>
                    <li className="pl-2 marker:font-bold marker:text-slate-400">Ensure you are using the correct keys for <strong>Sandbox</strong> or <strong>Production</strong></li>
                </ol>
            </div>
        </div>
    );
};

export default Settings;
