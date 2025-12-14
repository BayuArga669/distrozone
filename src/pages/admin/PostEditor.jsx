import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Eye, Image as ImageIcon, Trash2,
    Loader2, Check, Globe, FileText, X,
    ChevronLeft, ChevronRight, Monitor, Smartphone, Tablet, Clock
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import VisualBlockEditor from '../../components/VisualBlockEditor';
import BlockRenderer from '../../components/BlockRenderer';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Preview Modal Component
const PreviewModal = ({ isOpen, onClose, post }) => {
    const [viewMode, setViewMode] = useState('desktop');

    if (!isOpen) return null;

    const viewModes = {
        desktop: 'max-w-4xl',
        tablet: 'max-w-2xl',
        mobile: 'max-w-sm'
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl px-4 py-2 flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-700">Preview</span>
                <div className="h-6 w-px bg-slate-200" />
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'desktop' ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}
                        title="Desktop"
                    >
                        <Monitor size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('tablet')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'tablet' ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}
                        title="Tablet"
                    >
                        <Tablet size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'mobile' ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}
                        title="Mobile"
                    >
                        <Smartphone size={18} />
                    </button>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Preview Container */}
            <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${viewModes[viewMode]} w-full h-[85vh]`}>
                <div className="h-full overflow-y-auto">
                    <div className="p-8 md:p-12 lg:p-16">
                        <div className="max-w-3xl mx-auto">
                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">
                                {post.title || 'Untitled Post'}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {post.status === 'published' ? 'Published' : 'Draft'}
                                </div>
                            </div>

                            {/* Excerpt */}
                            {post.excerpt && (
                                <p className="text-xl text-slate-600 leading-relaxed mb-8 italic border-l-4 border-orange-500 pl-4">
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Content */}
                            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-orange-500">
                                <BlockRenderer content={post.content} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PostEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);
    const [showSettings, setShowSettings] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        status: 'draft',
        featured_image: null,
        preview_image: null
    });

    useEffect(() => {
        if (id) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getPost(id);
            const post = response.data;
            setFormData({
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt || '',
                content: post.content,
                status: post.status,
                featured_image: post.featured_image,
                preview_image: post.featured_image_url
            });
        } catch (error) {
            console.error('Error fetching post:', error);
            navigate('/admin/posts');
        } finally {
            setLoading(false);
        }
    };

    const handleContentChange = useCallback((data) => {
        setFormData(prev => ({
            ...prev,
            content: JSON.stringify(data)
        }));
        setHasChanges(true);
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const response = await adminAPI.uploadImage(file, 'posts');
            setFormData(prev => ({
                ...prev,
                featured_image: response.path,
                preview_image: response.url || `${BACKEND_URL}${response.path}`
            }));
            setHasChanges(true);
        } catch (error) {
            alert('Failed to upload image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (publishStatus = null) => {
        setSaving(true);
        try {
            const dataToSubmit = {
                ...formData,
                status: publishStatus || formData.status
            };

            if (id) {
                await adminAPI.updatePost(id, dataToSubmit);
            } else {
                const response = await adminAPI.createPost(dataToSubmit);
                navigate(`/admin/posts/${response.data.id}/edit`, { replace: true });
            }

            setLastSaved(new Date());
            setHasChanges(false);
            if (publishStatus) {
                setFormData(prev => ({ ...prev, status: publishStatus }));
            }
        } catch (error) {
            console.error('Error saving post:', error);
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col transition-colors duration-300">
            {/* Preview Modal */}
            <PreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                post={formData}
            />

            {/* Top Toolbar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/posts')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="h-8 w-px bg-slate-200" />
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                            setFormData(prev => ({
                                ...prev,
                                title: e.target.value,
                                slug: prev.slug || generateSlug(e.target.value)
                            }));
                            setHasChanges(true);
                        }}
                        placeholder="Post title..."
                        className="text-xl font-bold text-slate-900 bg-transparent border-none focus:outline-none w-96 placeholder-slate-300"
                    />

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        {saving ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : hasChanges ? (
                            <span className="text-orange-500 font-medium">• Unsaved changes</span>
                        ) : lastSaved ? (
                            <>
                                <Check size={14} className="text-emerald-500" />
                                <span className="text-emerald-600">Saved</span>
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleSave()}
                        disabled={saving || !hasChanges}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Save Draft
                    </button>

                    {/* Preview Button */}
                    <button
                        onClick={() => setShowPreview(true)}
                        className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Eye size={16} />
                        Preview
                    </button>

                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${showSettings ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        {showSettings ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        Settings
                    </button>

                    <button
                        onClick={() => handleSave('published')}
                        disabled={saving}
                        className="px-6 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/20"
                    >
                        {formData.status === 'published' ? 'Update' : 'Publish'}
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 overflow-hidden">
                    <VisualBlockEditor
                        key={id || 'new'}
                        initialData={formData.content}
                        onChange={handleContentChange}
                    />
                </div>

                {/* Right Sidebar - Document Settings */}
                <div className={`${showSettings ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-l border-slate-200 bg-white shrink-0`}>
                    <div className="w-80 h-full overflow-y-auto">
                        <div className="p-5 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Post Settings</h3>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {/* Status */}
                            <div className="p-5">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Status</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Globe size={16} />
                                            <span>Visibility</span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-900">Public</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <FileText size={16} />
                                            <span>Status</span>
                                        </div>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => {
                                                setFormData(prev => ({ ...prev, status: e.target.value }));
                                                setHasChanges(true);
                                            }}
                                            className="text-sm font-medium text-slate-900 border-none bg-transparent focus:ring-0 cursor-pointer pr-8"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* URL */}
                            <div className="p-5">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">URL Slug</h4>
                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                                    <span className="text-sm text-slate-400">/blog/</span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, slug: e.target.value }));
                                            setHasChanges(true);
                                        }}
                                        className="flex-1 text-sm bg-transparent border-none focus:outline-none text-slate-900 font-medium"
                                        placeholder="post-url"
                                    />
                                </div>
                            </div>

                            {/* Excerpt */}
                            <div className="p-5">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Excerpt</h4>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, excerpt: e.target.value }));
                                        setHasChanges(true);
                                    }}
                                    placeholder="Short description for previews..."
                                    rows={3}
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 resize-none"
                                />
                            </div>

                            {/* Featured Image */}
                            <div className="p-5">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Featured Image</h4>
                                {formData.preview_image ? (
                                    <div className="relative group">
                                        <img
                                            src={formData.preview_image}
                                            alt="Featured"
                                            className="w-full aspect-video object-cover rounded-xl"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                                            <label className="p-2.5 bg-white rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                                <ImageIcon size={18} className="text-slate-700" />
                                                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                            </label>
                                            <button
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, featured_image: null, preview_image: null }));
                                                    setHasChanges(true);
                                                }}
                                                className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="block cursor-pointer">
                                        <div className="aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition-colors">
                                            {uploading ? (
                                                <Loader2 size={24} className="text-orange-500 animate-spin" />
                                            ) : (
                                                <>
                                                    <ImageIcon size={28} className="text-slate-400 mb-2" />
                                                    <span className="text-sm font-medium text-slate-500">Click to upload</span>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostEditor;
