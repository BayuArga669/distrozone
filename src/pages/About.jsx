import React from 'react';
import { Award, Users, Zap, TrendingUp } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-slate-900">
                    <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80')] bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                </div>
                <div className="container relative z-10 text-center">
                    <span className="text-orange-500 font-bold tracking-widest uppercase text-sm mb-4 block animate-fade-in-up">Est. 2024</span>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight animate-fade-in-up delay-100">
                        REDEFINING <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">STREET STYLE</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                        More than just a brand. It's a movement. We curate the finest streetwear for those who dare to stand out.
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-100 relative z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80"
                                    alt="Urban culture"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -z-0"></div>
                            <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-0"></div>
                        </div>
                        <div>
                            <span className="text-orange-500 font-bold uppercase tracking-wider text-sm mb-2 block">Our Story</span>
                            <h2 className="text-4xl font-black text-slate-900 mb-8">Born from the Streets,<br />Built for Culture.</h2>
                            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                                <p>
                                    DistroZone started as a small project in a garage, fueled by a passion for urban fashion and underground culture. We noticed a gap between high-end streetwear and accessible fashion.
                                </p>
                                <p>
                                    Our mission is simple: provide premium quality fits that speak to the soul of the city. We collaborate with local artists and designers to bring you unique pieces that tell a story.
                                </p>
                                <p>
                                    Every stitch, every fabric, every design is chosen with purpose. We don't just sell clothes; we sell confidence and identity.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-24 bg-slate-50">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">Why DistroZone?</h2>
                        <div className="w-20 h-1.5 bg-orange-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                <Award size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Premium Quality</h3>
                            <p className="text-slate-500 leading-relaxed">
                                We source only the finest fabrics. Durability and comfort are non-negotiable in our design process.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Authentic Style</h3>
                            <p className="text-slate-500 leading-relaxed">
                                No copycats here. Our designs are original, bold, and unapologetically urban. Stand out from the crowd.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                            <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <Users size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Community First</h3>
                            <p className="text-slate-500 leading-relaxed">
                                We are nothing without you. We support local artists and give back to the community that raised us.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl md:text-5xl font-black text-orange-500 mb-2">2024</div>
                            <div className="text-slate-400 font-medium tracking-wide">ESTABLISHED</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-black text-white mb-2">10k+</div>
                            <div className="text-slate-400 font-medium tracking-wide">HAPPY CUSTOMERS</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-black text-white mb-2">50+</div>
                            <div className="text-slate-400 font-medium tracking-wide">PARTNERS</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-black text-white mb-2">100%</div>
                            <div className="text-slate-400 font-medium tracking-wide">AUTHENTIC</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
