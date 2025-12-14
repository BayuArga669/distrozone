import React from 'react';

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`}></div>
);

export const ProductCardSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 h-full flex flex-col">
        <div className="relative aspect-[4/5] bg-slate-200 animate-pulse" />
        <div className="p-5 space-y-3 flex-1">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <div className="flex items-center justify-between mt-4">
                <Skeleton className="h-7 w-24 rounded-md" />
                <Skeleton className="h-4 w-16" />
            </div>
        </div>
    </div>
);

export const ProductDetailSkeleton = () => (
    <div className="min-h-screen bg-slate-50 py-12">
        <div className="container">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-8">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 md:p-8 rounded-3xl shadow-sm">
                {/* Image Gallery Skeleton */}
                <div className="space-y-4">
                    <div className="aspect-square rounded-2xl bg-slate-200 animate-pulse" />
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="aspect-square rounded-xl" />
                        ))}
                    </div>
                </div>

                {/* Product Info Skeleton */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-12 w-48" />
                    </div>

                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>

                    <div className="space-y-4">
                        <Skeleton className="h-6 w-24" />
                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-12 w-12 rounded-xl" />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Skeleton className="h-14 w-32 rounded-xl" />
                        <Skeleton className="h-14 flex-1 rounded-xl" />
                        <Skeleton className="h-14 w-14 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default Skeleton;
