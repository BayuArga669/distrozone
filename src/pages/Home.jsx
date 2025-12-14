import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import { publicAPI } from '../services/api';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            setLoading(true);
            const data = await publicAPI.getFeaturedProducts();
            setFeaturedProducts(data);
        } catch (error) {
            console.error('Error fetching featured products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative">
                <HeroCarousel />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none z-10 transition-colors duration-300"></div>
            </div>

            {/* Featured Section */}
            <section className="py-24 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
                </div>

                <div className="container relative z-10">
                    <div className="text-center mb-16 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            Fresh Arrivals
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Drops</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-500 mt-6 max-w-2xl mx-auto leading-relaxed font-light">
                            Check out the hottest pieces from our latest collection.
                            <br className="hidden md:block" />
                            Premium quality, strictly limited quantities.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-20">
                        <Link
                            to="/shop"
                            className="group relative inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white font-bold rounded-full overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-1"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                View All Products
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 transition-transform group-hover:scale-110"></div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Modern Newsletter Section */}
            <section className="relative py-32 overflow-hidden mx-4 md:mx-8 mb-8 rounded-[3rem]">
                <div className="absolute inset-0 bg-slate-900">
                    <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1552160753-117159d7419d?q=80')] bg-cover bg-center bg-fixed"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>

                <div className="container relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                            Join the <span className="text-orange-500">Movement</span>
                        </h2>
                        <p className="text-slate-300 mb-12 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
                            Be the first to know about exclusive drops, secret sales,
                            and community events. No spam, just fresh gear.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto p-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-1 px-6 py-4 rounded-xl text-white focus:outline-none focus:ring-0 bg-transparent border-none placeholder:text-slate-400 font-medium"
                            />
                            <button
                                type="submit"
                                className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-[0_10px_20px_-5px_rgba(249,115,22,0.5)] hover:shadow-[0_15px_25px_-5px_rgba(249,115,22,0.6)] whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
