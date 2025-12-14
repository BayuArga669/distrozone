import React from 'react';
import { Facebook, Twitter, Instagram, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
    const linkClass = "hover:text-orange-500 transition-colors";
    const socialClass = "w-9 h-9 bg-white/10 flex items-center justify-center rounded-full text-white hover:bg-orange-500 hover:-translate-y-0.5 transition-all";

    return (
        <footer className="bg-slate-900 text-slate-400 pt-16 mt-auto">
            <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-12 pb-16">
                <div className="flex flex-col">
                    <h3 className="text-white text-2xl font-extrabold mb-4">DISTRO<span className="text-orange-500">ZONE</span></h3>
                    <p className="mb-6 leading-relaxed">
                        Your premium destination for urban streetwear and lifestyle fashion.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className={socialClass}><Instagram size={20} /></a>
                        <a href="#" className={socialClass}><Twitter size={20} /></a>
                        <a href="#" className={socialClass}><Facebook size={20} /></a>
                    </div>
                </div>

                <div>
                    <h4 className="text-white text-lg font-semibold mb-6">Shop</h4>
                    <ul className="space-y-3">
                        <li><a href="#" className={linkClass}>New Arrivals</a></li>
                        <li><a href="#" className={linkClass}>Best Sellers</a></li>
                        <li><a href="#" className={linkClass}>Men's Fashion</a></li>
                        <li><a href="#" className={linkClass}>Women's Fashion</a></li>
                        <li><a href="#" className={linkClass}>Accessories</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white text-lg font-semibold mb-6">Support</h4>
                    <ul className="space-y-3">
                        <li><a href="#" className={linkClass}>Contact Us</a></li>
                        <li><a href="#" className={linkClass}>Shipping Policy</a></li>
                        <li><a href="#" className={linkClass}>Returns & Exchanges</a></li>
                        <li><a href="#" className={linkClass}>FAQs</a></li>
                        <li><a href="#" className={linkClass}>Privacy Policy</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white text-lg font-semibold mb-6">Contact</h4>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                            <MapPin size={16} />
                            <span>123 Distro St, Jakarta, ID</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={16} />
                            <span>+62 812 3456 7890</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={16} />
                            <span>hello@distrozone.com</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-white/10 py-6 text-center text-sm">
                <div className="container">
                    <p>&copy; 2025 DistroZone. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
