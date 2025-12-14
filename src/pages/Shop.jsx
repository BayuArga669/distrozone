import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import { publicAPI } from '../services/api';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [selectedGender, setSelectedGender] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(debounce);
    }, [selectedCategory, sortOption, selectedGender, searchQuery]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedCategory) params.category = selectedCategory;
            if (selectedGender) params.gender = selectedGender;
            if (searchQuery) params.search = searchQuery;

            // Sorting logic
            switch (sortOption) {
                case 'price_asc':
                    params.sort = 'price';
                    params.order = 'asc';
                    break;
                case 'price_desc':
                    params.sort = 'price';
                    params.order = 'desc';
                    break;
                case 'name_asc':
                    params.sort = 'name';
                    params.order = 'asc';
                    break;
                case 'newest':
                default:
                    params.sort = 'created_at';
                    params.order = 'desc';
                    break;
            }

            const data = await publicAPI.getProducts(params);
            setProducts(data.data || data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await publicAPI.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const filterBtnClass = "text-left py-2 px-4 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all w-full font-medium flex items-center justify-between group";
    const activeFilterBtnClass = "text-left py-2 px-4 bg-orange-50 text-orange-600 rounded-lg w-full font-bold shadow-sm ring-1 ring-orange-100 flex items-center justify-between";

    return (
        <div className="min-h-screen bg-slate-50 transition-colors duration-300">
            <div className="bg-slate-900 text-white py-20 mb-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                <div className="container relative z-10">
                    <span className="text-orange-500 font-bold tracking-widest uppercase text-xs mb-3 block">Our Collection</span>
                    <h1 className="text-5xl font-black tracking-tight mb-4">Shop All</h1>
                    <p className="text-slate-400 max-w-xl text-lg font-light">
                        Discover our premium collection of streetwear essentials.
                        Designed for those who dare to stand out.
                    </p>
                </div>
            </div>

            <div className="container pb-20">
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12">
                    <aside className="hidden md:block">
                        <div className="sticky top-24 space-y-8">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 px-2">Categories</h3>
                                <ul className="space-y-1">
                                    <li>
                                        <button
                                            onClick={() => setSelectedCategory('')}
                                            className={selectedCategory === '' ? activeFilterBtnClass : filterBtnClass}
                                        >
                                            All Products
                                            {selectedCategory === '' && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                                        </button>
                                    </li>
                                    {categories.map(category => (
                                        <li key={category.id}>
                                            <button
                                                onClick={() => setSelectedCategory(category.slug)}
                                                className={selectedCategory === category.slug ? activeFilterBtnClass : filterBtnClass}
                                            >
                                                {category.name}
                                                {selectedCategory === category.slug && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-6 bg-slate-100 rounded-2xl">
                                <h4 className="font-bold text-slate-900 mb-2">Need Help?</h4>
                                <p className="text-sm text-slate-500 mb-4">
                                    Can't find what you're looking for?
                                    Contact our support team.
                                </p>
                                <button className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">
                                    Contact Support →
                                </button>
                            </div>
                        </div>
                    </aside>

                    <main>
                        {/* Sorting and Filtering Header */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
                            {/* Search Bar */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 focus:bg-white transition-all outline-none"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-slate-500 font-medium self-start sm:self-center pl-2">
                                    {searchQuery ? (
                                        <>Showing <span className="font-bold text-slate-900">{products.length}</span> results for "<span className="font-bold text-slate-900">{searchQuery}</span>"</>
                                    ) : (
                                        <>Showing <span className="font-bold text-slate-900">{products.length}</span> results</>
                                    )}
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                    {/* Gender Filter */}
                                    <div className="relative w-full sm:w-auto">
                                        <select
                                            value={selectedGender}
                                            onChange={(e) => setSelectedGender(e.target.value)}
                                            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 block w-full pl-4 pr-10 py-2.5 outline-none cursor-pointer transition-all hover:bg-white font-medium"
                                        >
                                            <option value="">All Genders</option>
                                            <option value="men">Men's Collection</option>
                                            <option value="women">Women's Collection</option>
                                            <option value="unisex">Unisex Items</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>

                                    {/* Sorting */}
                                    <div className="relative w-full sm:w-auto">
                                        <select
                                            value={sortOption}
                                            onChange={(e) => setSortOption(e.target.value)}
                                            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 block w-full pl-4 pr-10 py-2.5 outline-none cursor-pointer transition-all hover:bg-white font-medium"
                                        >
                                            <option value="newest">Newest Arrivals</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                            <option value="name_asc">Name: A to Z</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}

                        {!loading && products.length === 0 && (
                            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                                <p className="text-slate-500 max-w-xs mx-auto">
                                    We couldn't find any products matching your current filters.
                                    Try adjusting your search or categories.
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('');
                                        setSelectedGender('');
                                        setSortOption('newest');
                                    }}
                                    className="mt-6 px-6 py-2 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Shop;
