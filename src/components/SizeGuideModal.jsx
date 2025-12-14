import React, { useState, useEffect } from 'react';
import { X, Ruler, Info } from 'lucide-react';

const SizeGuideModal = ({ isOpen, onClose, category }) => {
    const [unit, setUnit] = useState('cm'); // 'cm' or 'inch'
    const [activeTab, setActiveTab] = useState('tops');

    // Determine initial tab based on category
    useEffect(() => {
        if (category) {
            const categoryLower = category.toLowerCase();
            if (['t-shirts', 'hoodies', 'outerwear'].includes(categoryLower)) {
                setActiveTab('tops');
            } else if (['pants', 'shorts'].includes(categoryLower)) {
                setActiveTab('bottoms');
            } else {
                setActiveTab('tops');
            }
        }
    }, [category]);

    // Convert cm to inch
    const toInch = (cm) => (cm / 2.54).toFixed(1);

    // Size data for tops (T-Shirts, Hoodies, Outerwear)
    const topsData = [
        { size: 'S', chest: 96, length: 68, shoulder: 44, sleeve: 20 },
        { size: 'M', chest: 100, length: 70, shoulder: 46, sleeve: 21 },
        { size: 'L', chest: 104, length: 72, shoulder: 48, sleeve: 22 },
        { size: 'XL', chest: 108, length: 74, shoulder: 50, sleeve: 23 },
        { size: 'XXL', chest: 112, length: 76, shoulder: 52, sleeve: 24 },
    ];

    // Size data for bottoms (Pants, Shorts)
    const bottomsData = [
        { size: 'S', waist: 72, hips: 94, length: 100, inseam: 76 },
        { size: 'M', waist: 76, hips: 98, length: 102, inseam: 77 },
        { size: 'L', waist: 80, hips: 102, length: 104, inseam: 78 },
        { size: 'XL', waist: 84, hips: 106, length: 106, inseam: 79 },
        { size: 'XXL', waist: 88, hips: 110, length: 108, inseam: 80 },
    ];

    // Size data for shorts
    const shortsData = [
        { size: 'S', waist: 72, hips: 94, length: 42, inseam: 18 },
        { size: 'M', waist: 76, hips: 98, length: 44, inseam: 19 },
        { size: 'L', waist: 80, hips: 102, length: 46, inseam: 20 },
        { size: 'XL', waist: 84, hips: 106, length: 48, inseam: 21 },
        { size: 'XXL', waist: 88, hips: 110, length: 50, inseam: 22 },
    ];

    const getValue = (cm) => {
        return unit === 'cm' ? cm : toInch(cm);
    };

    const getUnit = () => unit;

    if (!isOpen) return null;

    const renderTopsTable = () => (
        <table className="w-full text-sm">
            <thead>
                <tr className="bg-slate-100">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Size</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">
                        Chest ({getUnit()})
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">
                        Length ({getUnit()})
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">
                        Shoulder ({getUnit()})
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">
                        Sleeve ({getUnit()})
                    </th>
                </tr>
            </thead>
            <tbody>
                {topsData.map((row, idx) => (
                    <tr
                        key={row.size}
                        className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-orange-50 transition-colors`}
                    >
                        <td className="px-4 py-3 font-bold text-slate-900">{row.size}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{getValue(row.chest)}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{getValue(row.length)}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{getValue(row.shoulder)}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{getValue(row.sleeve)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderBottomsTable = () => {
        const data = category?.toLowerCase() === 'shorts' ? shortsData : bottomsData;
        return (
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Size</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">
                            Waist ({getUnit()})
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">
                            Hips ({getUnit()})
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">
                            Length ({getUnit()})
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">
                            Inseam ({getUnit()})
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr
                            key={row.size}
                            className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-orange-50 transition-colors`}
                        >
                            <td className="px-4 py-3 font-bold text-slate-900">{row.size}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{getValue(row.waist)}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{getValue(row.hips)}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{getValue(row.length)}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{getValue(row.inseam)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-xl">
                                <Ruler className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Size Guide</h2>
                                <p className="text-sm text-slate-500">Find your perfect fit</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Unit Toggle */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActiveTab('tops')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'tops'
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    Tops
                                </button>
                                <button
                                    onClick={() => setActiveTab('bottoms')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'bottoms'
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    Bottoms
                                </button>
                            </div>
                            <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                <button
                                    onClick={() => setUnit('cm')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${unit === 'cm'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    CM
                                </button>
                                <button
                                    onClick={() => setUnit('inch')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${unit === 'inch'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Inch
                                </button>
                            </div>
                        </div>

                        {/* Size Table */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
                            {activeTab === 'tops' ? renderTopsTable() : renderBottomsTable()}
                        </div>

                        {/* How to Measure Section */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-orange-500" />
                                <h3 className="font-bold text-slate-900">How to Measure</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {activeTab === 'tops' ? (
                                    <>
                                        <div className="flex items-start gap-3">
                                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                            <div>
                                                <p className="font-semibold text-slate-900">Chest / Lingkar Dada</p>
                                                <p className="text-slate-600">Ukur keliling bagian terlebar dada Anda</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                            <div>
                                                <p className="font-semibold text-slate-900">Length / Panjang</p>
                                                <p className="text-slate-600">Ukur dari bahu hingga bagian bawah baju</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                            <div>
                                                <p className="font-semibold text-slate-900">Shoulder / Lebar Bahu</p>
                                                <p className="text-slate-600">Ukur dari ujung bahu kiri ke ujung bahu kanan</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                                            <div>
                                                <p className="font-semibold text-slate-900">Sleeve / Panjang Lengan</p>
                                                <p className="text-slate-600">Ukur dari bahu hingga pergelangan tangan</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-3">
                                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                            <div>
                                                <p className="font-semibold text-slate-900">Waist / Lingkar Pinggang</p>
                                                <p className="text-slate-600">Ukur keliling pinggang pada bagian tersempit</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                            <div>
                                                <p className="font-semibold text-slate-900">Hips / Lingkar Pinggul</p>
                                                <p className="text-slate-600">Ukur keliling pinggul pada bagian terlebar</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                            <div>
                                                <p className="font-semibold text-slate-900">Length / Panjang</p>
                                                <p className="text-slate-600">Ukur dari pinggang hingga bagian bawah</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                                            <div>
                                                <p className="font-semibold text-slate-900">Inseam / Panjang Dalam</p>
                                                <p className="text-slate-600">Ukur dari selangkangan hingga bagian bawah</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                            <p className="text-sm text-blue-800">
                                <span className="font-semibold">💡 Tips:</span> Jika ukuran Anda berada di antara dua ukuran, pilih ukuran yang lebih besar untuk kenyamanan atau ukuran yang lebih kecil untuk tampilan yang lebih fitted.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SizeGuideModal;
