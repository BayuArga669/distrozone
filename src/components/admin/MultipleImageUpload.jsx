import React, { useState } from 'react';
import { adminAPI, getImageUrl } from '../../services/api';
import { Upload, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react';

const MultipleImageUpload = ({ images = [], onImagesChange, maxImages = 5 }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState(-1);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Limit to max images
        const remainingSlots = maxImages - images.length;
        const filesToUpload = files.slice(0, remainingSlots);

        setUploading(true);
        const newImages = [...images];

        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            setUploadingIndex(newImages.length);

            try {
                const result = await adminAPI.uploadImage(file, 'products');
                newImages.push(result.url);
            } catch (error) {
                console.error('Upload error:', error);
                alert('Failed to upload: ' + error.message);
            }
        }

        setUploading(false);
        setUploadingIndex(-1);
        onImagesChange(newImages);

        // Reset input
        e.target.value = '';
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const setAsPrimary = (index) => {
        if (index === 0) return;
        const newImages = [...images];
        const [image] = newImages.splice(index, 1);
        newImages.unshift(image);
        onImagesChange(newImages);
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
                Product Images ({images.length}/{maxImages})
            </label>

            {/* Image Grid */}
            <div className="grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 group ${index === 0 ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-slate-200'
                            }`}
                    >
                        <img
                            src={getImageUrl(img)}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay with actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {index !== 0 && (
                                <button
                                    type="button"
                                    onClick={() => setAsPrimary(index)}
                                    className="p-2 bg-white rounded-full text-xs font-bold text-slate-700 hover:bg-orange-100"
                                    title="Set as primary"
                                >
                                    ★
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Primary badge */}
                        {index === 0 && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                                Primary
                            </div>
                        )}
                    </div>
                ))}

                {/* Add more button */}
                {images.length < maxImages && (
                    <label className={`aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                        />
                        {uploading ? (
                            <Loader2 size={24} className="animate-spin text-orange-500" />
                        ) : (
                            <>
                                <Plus size={24} className="text-slate-400" />
                                <span className="text-xs text-slate-500 mt-1">Add Image</span>
                            </>
                        )}
                    </label>
                )}
            </div>

            <p className="text-xs text-slate-500">
                * First image will be the primary/cover image. Click ★ to set as primary.
            </p>
        </div>
    );
};

export default MultipleImageUpload;
