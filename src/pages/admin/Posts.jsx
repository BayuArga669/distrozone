import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, Edit, Trash2, Loader2,
    FileText, Calendar, Eye
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
};

const AdminPosts = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getPosts();
            setPosts(response.data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await adminAPI.deletePost(id);
            fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert(error.message);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || post.status === filter;
        return matchesSearch && matchesFilter;
    });

    const publishedCount = posts.filter(p => p.status === 'published').length;
    const draftCount = posts.filter(p => p.status === 'draft').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Blog Posts</h1>
                    <p className="text-slate-500 mt-1">Create and manage your blog content</p>
                </div>
                <button
                    onClick={() => navigate('/admin/posts/new')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-orange-500 transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Write New Post</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    onClick={() => setFilter('all')}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all ${filter === 'all' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                >
                    <FileText size={24} className={filter === 'all' ? 'text-orange-400' : 'text-slate-400'} />
                    <p className="text-3xl font-black mt-3">{posts.length}</p>
                    <p className={`text-sm font-medium ${filter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>All Posts</p>
                </div>
                <div
                    onClick={() => setFilter('published')}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all ${filter === 'published' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                >
                    <Eye size={24} className={filter === 'published' ? 'text-emerald-100' : 'text-emerald-500'} />
                    <p className="text-3xl font-black mt-3">{publishedCount}</p>
                    <p className={`text-sm font-medium ${filter === 'published' ? 'text-emerald-100' : 'text-slate-500'}`}>Published</p>
                </div>
                <div
                    onClick={() => setFilter('draft')}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all ${filter === 'draft' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                >
                    <Calendar size={24} className={filter === 'draft' ? 'text-amber-100' : 'text-amber-500'} />
                    <p className="text-3xl font-black mt-3">{draftCount}</p>
                    <p className={`text-sm font-medium ${filter === 'draft' ? 'text-amber-100' : 'text-slate-500'}`}>Drafts</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 placeholder-slate-400 transition-all"
                />
            </div>

            {/* Posts List */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {filteredPosts.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No posts found</h3>
                        <p className="text-slate-500 mb-6">
                            {searchQuery ? 'Try a different search term' : 'Start by creating your first post'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => navigate('/admin/posts/new')}
                                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-orange-500 transition-colors"
                            >
                                Create Your First Post
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredPosts.map((post) => (
                            <div
                                key={post.id}
                                className="p-6 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                            >
                                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                                    {/* Thumbnail */}
                                    <div className="w-full sm:w-32 h-48 sm:h-20 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                                        {post.featured_image_url ? (
                                            <img
                                                src={getImageUrl(post.featured_image_url)}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <FileText size={24} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg group-hover:text-orange-500 transition-colors line-clamp-1">
                                                    {post.title}
                                                </h3>
                                                <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                                                    {post.excerpt || 'No excerpt'}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide ${post.status === 'published'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {post.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-6 mt-4">
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                            {post.reading_time && (
                                                <span className="text-xs text-slate-400">
                                                    {post.reading_time}
                                                </span>
                                            )}

                                            <div className="flex-1" />

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                                                    className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                {post.status === 'published' && (
                                                    <a
                                                        href={`/blog/${post.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye size={16} />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPosts;
