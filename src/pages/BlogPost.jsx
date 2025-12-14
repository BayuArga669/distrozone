import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowLeft, Loader2, Share2 } from 'lucide-react';
import { publicAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BlockRenderer from '../components/BlockRenderer';

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost();
        window.scrollTo(0, 0);
    }, [slug]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await publicAPI.getPost(slug);
            setPost(response.data);
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Article not found');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">404 - Article Not Found</h1>
                <Link to="/blog" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-orange-500 transition-colors">
                    Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Image / Header */}
            <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
                <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-500 font-medium mb-8 transition-colors">
                    <ArrowLeft size={18} /> Back to Blog
                </Link>

                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 mb-6">
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Article</span>
                    <span className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(post.published_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock size={16} /> {post.reading_time || '5 min read'}</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                    {post.title}
                </h1>

                <div className="flex items-center justify-between border-y border-slate-100 py-6 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                            {post.author?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">{post.author?.name || 'Unknown Author'}</p>
                            <p className="text-slate-500 text-xs">Editor & Content Writer</p>
                        </div>
                    </div>

                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors" title="Share">
                        <Share2 size={20} />
                    </button>
                </div>


                {/* Content */}
                <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-orange-500 hover:prose-a:text-orange-600 prose-img:rounded-2xl">
                    <BlockRenderer content={post.content} />
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BlogPost;
