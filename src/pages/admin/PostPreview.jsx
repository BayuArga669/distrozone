import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Monitor, Smartphone, Tablet } from 'lucide-react';
import BlockRenderer from '../../components/BlockRenderer';

const PostPreview = () => {
    const [post, setPost] = useState(null);
    const [viewMode, setViewMode] = useState('desktop');

    useEffect(() => {
        // Get post data from localStorage
        const storedData = localStorage.getItem('postPreview');
        if (storedData) {
            try {
                setPost(JSON.parse(storedData));
            } catch (e) {
                console.error('Failed to parse preview data');
            }
        }
    }, []);

    if (!post) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">No Preview Data</h2>
                    <p className="text-slate-600 mb-6">Please go back to the editor and try again.</p>
                    <button
                        onClick={() => window.close()}
                        className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        );
    }

    const viewModes = {
        desktop: 'max-w-4xl',
        tablet: 'max-w-2xl',
        mobile: 'max-w-sm'
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Preview Toolbar */}
            <div className="fixed top-0 left-0 right-0 bg-slate-800 border-b border-slate-700 z-50">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.close()}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="h-6 w-px bg-slate-600" />
                        <span className="text-white font-bold">Preview Mode</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${post.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {post.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Device Selector */}
                        <div className="flex gap-1 bg-slate-700 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('desktop')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'desktop' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                title="Desktop"
                            >
                                <Monitor size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('tablet')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'tablet' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                title="Tablet"
                            >
                                <Tablet size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'mobile' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                title="Mobile"
                            >
                                <Smartphone size={18} />
                            </button>
                        </div>

                        <button
                            onClick={() => window.close()}
                            className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Container */}
            <div className="pt-20 pb-10 px-4 flex justify-center">
                <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${viewModes[viewMode]} w-full`}>
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

export default PostPreview;
