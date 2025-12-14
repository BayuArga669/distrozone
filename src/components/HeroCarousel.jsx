import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

const SLIDES = [
    {
        id: 1,
        title: "Streetwear Redefined",
        subtitle: "New Collection 2025",
        description: "Discover the latest trends in urban fashion. High-quality materials, bold designs, and comfort that lasts all day.",
        bgClass: "bg-slate-900",
        textClass: "text-white",
        accentClass: "text-orange-500",
        btnClass: "bg-orange-500 text-white hover:bg-orange-600",
        image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=2535&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Essentials for Creator",
        subtitle: "Premium Basics",
        description: "Elevate your daily rotation with our premium heavyweight cotton essentials. Designed for those who create.",
        bgClass: "bg-orange-500",
        textClass: "text-white",
        accentClass: "text-slate-900",
        btnClass: "bg-slate-900 text-white hover:bg-slate-800",
        image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=2606&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Urban Accessories",
        subtitle: "Complete The Look",
        description: "From buckets hats to cross-body bags, find the perfect accessories to finish your streetwear fit.",
        bgClass: "bg-slate-100",
        textClass: "text-slate-900",
        accentClass: "text-orange-500",
        btnClass: "bg-slate-900 text-white hover:bg-slate-800",
        image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2669&auto=format&fit=crop"
    }
];

const HeroCarousel = () => {
    return (
        <div className="relative h-screen w-full overflow-hidden">
            <Swiper
                modules={[Autoplay, Pagination, EffectFade, Navigation]}
                effect="fade"
                loop={true}
                spaceBetween={0}
                slidesPerView={1}
                pagination={{ clickable: true }}
                navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                className="h-full w-full"
            >
                {SLIDES.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className={`relative h-full w-full flex items-center`}>
                            {/* Background Image with Overlay */}
                            <div
                                className="absolute inset-0 bg-cover bg-center z-0"
                                style={{ backgroundImage: `url(${slide.image})` }}
                            >
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                            </div>

                            <div className="container relative z-10 px-4">
                                <div className="max-w-2xl animate-fade-in-up">
                                    <span className={`inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold tracking-widest uppercase mb-6 text-white`}>
                                        {slide.subtitle}
                                    </span>
                                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                                        {slide.title}
                                    </h1>
                                    <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-lg leading-relaxed font-medium">
                                        {slide.description}
                                    </p>
                                    <div className="flex gap-4">
                                        <Link to="/shop" className={`inline-flex items-center justify-center px-8 py-4 rounded-full font-bold transition-all transform hover:-translate-y-1 hover:shadow-lg ${slide.btnClass}`}>
                                            Shop Now <ArrowRight size={20} className="ml-2" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            <div className="swiper-button-prev-custom absolute left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-orange-500 hover:border-orange-500 transition-all duration-300 -translate-x-0">
                <ChevronLeft size={24} />
            </div>
            <div className="swiper-button-next-custom absolute right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-orange-500 hover:border-orange-500 transition-all duration-300 translate-x-0">
                <ChevronRight size={24} />
            </div>

            {/* Custom Styles for Swiper Pagination */}
            <style>{`
        .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
            background: white;
            opacity: 0.5;
            transition: all 0.3s;
        }
        .swiper-pagination-bullet-active {
            width: 30px;
            border-radius: 6px;
            opacity: 1;
            background: #f97316;
        }
      `}</style>
        </div>
    );
};

export default HeroCarousel;
