import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
import { publicAPI, getImageUrl } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchPosts();
    }, [debouncedSearch]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const params = {};
            if (debouncedSearch) params.search = debouncedSearch;

            const response = await publicAPI.getPosts(params);
            setPosts(response.data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Header */}
            <div className="pt-32 pb-16 px-4 bg-slate-900">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                        Our Stories & Updates
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
                        Discover the latest trends, styling tips, and news from our team.
                    </p>

                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="text-slate-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-800 border-none rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Featured Post (if any) */}
            {!loading && !searchQuery && posts.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10 mb-16">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden bg-slate-100">
                            {posts[0].featured_image_url ? (
                                <img
                                    src={posts[0].featured_image_url}
                                    alt={posts[0].title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-2xl">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="w-full md:w-1/2 flex flex-col items-start">
                            <div className="flex items-center gap-3 text-sm text-slate-500 mb-4 font-medium">
                                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Featured</span>
                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(posts[0].published_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><User size={14} /> {posts[0].author?.name}</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4 hover:text-orange-500 transition-colors">
                                <Link to={`/blog/${posts[0].slug}`}>{posts[0].title}</Link>
                            </h2>
                            <p className="text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                                {posts[0].excerpt || posts[0].content.substring(0, 150) + '...'}
                            </p>
                            <Link
                                to={`/blog/${posts[0].slug}`}
                                className="inline-flex items-center gap-2 text-slate-900 font-bold hover:gap-3 hover:text-orange-500 transition-all"
                            >
                                Read Article <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Posts Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-24">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                        <p className="text-slate-500 font-medium">Loading stories...</p>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Skip first post if featured logic is active and no search query */}
                        {posts.slice(searchQuery ? 0 : 1).map((post) => (
                            <Link key={post.id} to={`/blog/${post.slug}`} className="group flex flex-col h-full">
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-5 relative">
                                    {post.featured_image_url ? (
                                        <img
                                            src={post.featured_image_url}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">No Image</div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                                        {post.reading_time || '5 min read'}
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 font-medium">
                                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span>{post.author?.name}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                                        {post.excerpt || post.content.substring(0, 100).replace(/<[^>]*>?/gm, '') + '...'}
                                    </p>
                                    <span className="text-slate-900 text-sm font-bold flex items-center gap-2 group-hover:text-orange-500 transition-colors mt-auto">
                                        Read More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-500">
                        <p className="text-lg font-medium">No stories found matching your search.</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-4 text-orange-500 font-bold hover:underline"
                        >
                            Clear search
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Blog;
