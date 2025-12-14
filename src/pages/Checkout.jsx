import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Truck, CheckCircle, Package, Loader2, ShoppingBag, AlertCircle, Ticket, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, shippingAPI, addressAPI, couponAPI, getImageUrl } from '../services/api';

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, subtotal, clearCart, loading: cartLoading, itemCount } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [shippingLoading, setShippingLoading] = useState(false);
    const [shippingError, setShippingError] = useState(null);
    const [shippingData, setShippingData] = useState(null);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const shipping = shippingData?.shipping_cost || 0;
    const discount = appliedCoupon?.discount_amount || 0;
    const total = subtotal + shipping - discount;

    // Location Data - Hanya Pulau Jawa
    const locationData = {
        'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur'],
        'Jawa Barat': ['Bandung', 'Bogor', 'Bekasi', 'Depok', 'Cirebon', 'Tasikmalaya', 'Sukabumi', 'Karawang', 'Garut', 'Cianjur'],
        'Banten': ['Tangerang', 'Tangerang Selatan', 'Serang', 'Cilegon'],
        'Jawa Tengah': ['Semarang', 'Solo', 'Surakarta', 'Magelang', 'Tegal', 'Pekalongan', 'Purwokerto', 'Kudus', 'Kebumen'],
        'DI Yogyakarta': ['Yogyakarta', 'Sleman', 'Bantul', 'Gunungkidul', 'Kulonprogo'],
        'Jawa Timur': ['Surabaya', 'Malang', 'Sidoarjo', 'Banyuwangi', 'Kediri', 'Madiun', 'Jember', 'Pasuruan', 'Mojokerto']
    };

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: '',
        province: '',
        city: '',
        postal_code: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('');

    // Payment Methods - Individual options with logos
    const paymentMethods = [
        {
            id: 'gopay',
            name: 'GoPay',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg'
        },
        {
            id: 'dana',
            name: 'DANA',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg'
        },
        {
            id: 'ovo',
            name: 'OVO',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg'
        },
        {
            id: 'shopeepay',
            name: 'ShopeePay',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg'
        },
        {
            id: 'credit_card',
            name: 'Kartu Kredit',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg'
        },
        {
            id: 'bca_va',
            name: 'BCA VA',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg'
        },
        {
            id: 'bni_va',
            name: 'BNI VA',
            logo: 'https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg'
        },
        {
            id: 'bri_va',
            name: 'BRI VA',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg'
        },
        {
            id: 'mandiri_va',
            name: 'Mandiri VA',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg'
        },
        {
            id: 'cod',
            name: 'COD',
            logo: null // No logo for COD
        }
    ];

    // Fetch saved addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            if (user) {
                try {
                    const addresses = await addressAPI.getAddresses();
                    setSavedAddresses(addresses);

                    // Auto-select default address if exists
                    const defaultAddr = addresses.find(addr => addr.is_default);
                    if (defaultAddr && addresses.length > 0) {
                        setSelectedAddressId(defaultAddr.id);
                        setFormData({
                            name: defaultAddr.recipient_name,
                            phone: defaultAddr.phone,
                            address: defaultAddr.address,
                            province: defaultAddr.province,
                            city: defaultAddr.city,
                            postal_code: defaultAddr.postal_code
                        });
                    } else {
                        // No saved addresses, use user data
                        setUseNewAddress(true);
                        setFormData(prev => ({
                            ...prev,
                            name: user.name || prev.name,
                            phone: user.phone || prev.phone,
                        }));
                    }
                } catch (err) {
                    console.error('Failed to fetch addresses:', err);
                    setUseNewAddress(true);
                }
            }
        };
        fetchAddresses();
    }, [user]);

    // Calculate shipping when city changes
    useEffect(() => {
        const calculateShipping = async () => {
            if (!formData.city || itemCount === 0) {
                setShippingData(null);
                setShippingError(null);
                return;
            }

            setShippingLoading(true);
            setShippingError(null);

            try {
                const result = await shippingAPI.calculate(
                    formData.city,
                    formData.province,
                    itemCount
                );
                setShippingData(result);
            } catch (err) {
                console.error('Failed to calculate shipping:', err);
                setShippingError(err.message || 'Gagal menghitung ongkos kirim');
                setShippingData(null);
            } finally {
                setShippingLoading(false);
            }
        };

        calculateShipping();
    }, [formData.city, formData.province, itemCount]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            // Reset city if province changes
            if (name === 'province') {
                return { ...prev, [name]: value, city: '' };
            }
            return { ...prev, [name]: value };
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // Handle coupon validation
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setCouponLoading(true);
        setCouponError('');

        try {
            const result = await couponAPI.validateCoupon(couponCode, subtotal);
            setAppliedCoupon(result.coupon);
            setCouponError('');
        } catch (err) {
            setCouponError(err.message || 'Kode kupon tidak valid');
            setAppliedCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (items.length === 0) {
            setError('Your cart is empty');
            return;
        }

        if (shippingError || !shippingData) {
            setError('Pilih kota pengiriman yang valid');
            return;
        }

        if (!paymentMethod) {
            setError('Pilih metode pembayaran');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const orderData = {
                shipping_address: {
                    name: formData.name,
                    phone: formData.phone,
                    address: `${formData.address}, ${formData.city}, ${formData.province}`,
                    city: formData.city,
                    postal_code: formData.postal_code,
                },
                shipping_cost: shipping,
                payment_method: paymentMethod,
                coupon_code: appliedCoupon?.code || null,
                notes: '',
            };

            const response = await orderAPI.createOrder(orderData);

            // Clear cart after successful order
            await clearCart();

            // Redirect based on payment method
            if (response.redirect_url) {
                // Redirect to Midtrans payment page for online payments
                window.location.href = response.redirect_url;
            } else {
                // For COD, go to orders page with success message
                navigate(`/orders?success=${response.data?.id || ''}&payment=${response.payment_method}`);
            }
        } catch (err) {
            console.error('Failed to place order:', err);
            setError(err.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Redirect if cart is empty and not loading
    if (!cartLoading && items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <main className="flex-grow container mx-auto px-4 py-16">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="text-slate-300" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
                        <p className="text-slate-500 mb-8">Add some items to your cart before checking out.</p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
                        >
                            Browse Products
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <main className="flex-grow container px-4 py-12">
                <div className="mb-8">
                    <Link to="/cart" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors font-medium group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Cart
                    </Link>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 animate-fade-in">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Left Column - Forms */}
                    <div className="animate-slide-up">
                        <div className="mb-10">
                            <span className="text-orange-500 font-bold tracking-widest uppercase text-xs mb-2 block">Secure Checkout</span>
                            <h1 className="text-4xl font-black text-slate-900 mb-2">Checkout</h1>
                            <p className="text-slate-500 text-lg">Complete your order details below.</p>
                        </div>

                        {/* Steps Indicator */}
                        <div className="flex items-center gap-4 mb-10 overflow-x-auto whitespace-nowrap pb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-lg shadow-slate-900/20">1</div>
                                <span className="font-bold text-slate-900">Information</span>
                            </div>
                            <div className="h-1 w-12 bg-slate-200 rounded-full"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center font-bold">2</div>
                                <span className="font-medium text-slate-400">Shipping</span>
                            </div>
                            <div className="h-1 w-12 bg-slate-200 rounded-full"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center font-bold">3</div>
                                <span className="font-medium text-slate-400">Payment</span>
                            </div>
                        </div>

                        <form onSubmit={handlePlaceOrder} className="space-y-8">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                                        <MapPin size={24} />
                                    </div>
                                    Shipping Address
                                </h3>

                                {/* Saved Addresses Selection */}
                                {savedAddresses.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="block text-sm font-bold text-slate-700">Select Saved Address</label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUseNewAddress(!useNewAddress);
                                                    if (!useNewAddress) {
                                                        setSelectedAddressId(null);
                                                        setFormData({
                                                            name: user?.name || '',
                                                            phone: user?.phone || '',
                                                            address: '',
                                                            province: '',
                                                            city: '',
                                                            postal_code: ''
                                                        });
                                                    } else if (savedAddresses.length > 0) {
                                                        const defaultAddr = savedAddresses.find(addr => addr.is_default) || savedAddresses[0];
                                                        setSelectedAddressId(defaultAddr.id);
                                                        setFormData({
                                                            name: defaultAddr.recipient_name,
                                                            phone: defaultAddr.phone,
                                                            address: defaultAddr.address,
                                                            province: defaultAddr.province,
                                                            city: defaultAddr.city,
                                                            postal_code: defaultAddr.postal_code
                                                        });
                                                    }
                                                }}
                                                className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
                                            >
                                                {useNewAddress ? '← Use Saved Address' : '+ New Address'}
                                            </button>
                                        </div>

                                        {!useNewAddress && (
                                            <div className="space-y-3 mb-6">
                                                {savedAddresses.map((address) => (
                                                    <label
                                                        key={address.id}
                                                        className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === address.id
                                                            ? 'border-orange-500 bg-orange-50'
                                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="savedAddress"
                                                            value={address.id}
                                                            checked={selectedAddressId === address.id}
                                                            onChange={() => {
                                                                setSelectedAddressId(address.id);
                                                                setFormData({
                                                                    name: address.recipient_name,
                                                                    phone: address.phone,
                                                                    address: address.address,
                                                                    province: address.province,
                                                                    city: address.city,
                                                                    postal_code: address.postal_code
                                                                });
                                                            }}
                                                            className="sr-only"
                                                        />
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className={`font-bold ${selectedAddressId === address.id ? 'text-orange-600' : 'text-slate-900'}`}>
                                                                        {address.label}
                                                                    </span>
                                                                    {address.is_default && (
                                                                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Default</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-slate-700 font-medium">{address.recipient_name}</p>
                                                                <p className="text-sm text-slate-500">{address.phone}</p>
                                                                <p className="text-sm text-slate-500 mt-1">{address.address}</p>
                                                                <p className="text-sm text-slate-500">{address.city}, {address.province} {address.postal_code}</p>
                                                            </div>
                                                            {selectedAddressId === address.id && (
                                                                <CheckCircle className="text-orange-500 flex-shrink-0" size={20} />
                                                            )}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Address Form (always visible for new address or editing) */}
                                {(useNewAddress || savedAddresses.length === 0) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                                placeholder="0812..."
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                                rows="3"
                                                placeholder="Street, House No, etc."
                                                required
                                            ></textarea>
                                        </div>

                                        {/* Province Dropdown */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Province</label>
                                            <div className="relative">
                                                <select
                                                    name="province"
                                                    value={formData.province}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none bg-white font-medium cursor-pointer hover:bg-slate-50"
                                                    required
                                                >
                                                    <option value="">Select Province</option>
                                                    {Object.keys(locationData).map(prov => (
                                                        <option key={prov} value={prov}>{prov}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* City Dropdown */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                                            <div className="relative">
                                                <select
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none bg-white font-medium cursor-pointer hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400"
                                                    required
                                                    disabled={!formData.province}
                                                >
                                                    <option value="">Select City</option>
                                                    {formData.province && locationData[formData.province].map(city => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Postal Code</label>
                                            <input
                                                type="text"
                                                name="postal_code"
                                                value={formData.postal_code}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                                placeholder="12345"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Shipping Method - Auto Calculated */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                        <Truck size={24} />
                                    </div>
                                    Shipping Cost
                                </h3>

                                {shippingLoading ? (
                                    <div className="flex items-center gap-3 text-slate-500 py-6 bg-slate-50 rounded-2xl justify-center">
                                        <Loader2 size={24} className="animate-spin text-orange-500" />
                                        <span className="font-medium animate-pulse">Calculating shipping cost...</span>
                                    </div>
                                ) : shippingError ? (
                                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2">
                                        <AlertCircle size={20} />
                                        {shippingError}
                                    </div>
                                ) : shippingData ? (
                                    <div className="p-5 border-2 border-orange-500 bg-orange-50/50 rounded-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Selected</div>
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                                    <Truck className="text-slate-900" size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-lg">JNE Regular</p>
                                                    <p className="text-sm text-slate-500">Estimasi 2-4 hari kerja</p>
                                                    <p className="text-xs text-orange-600 font-medium mt-1">
                                                        {shippingData.weight_kg} kg × {formatPrice(shippingData.rate_per_kg)}/kg
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-black text-xl text-orange-500">
                                                {formatPrice(shippingData.shipping_cost)}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-center font-medium">
                                        Please select your city to calculate shipping
                                    </div>
                                )}

                                <p className="mt-4 text-xs text-slate-500 flex items-center gap-2">
                                    <AlertCircle size={14} className="text-slate-400" />
                                    1 kg = 3 kaos. Kurang dari 3 kaos dihitung 1 kg. Only serving Pulau Jawa.
                                </p>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                                        <span className="text-xl">💳</span>
                                    </div>
                                    Payment Method
                                </h3>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {paymentMethods.map((method) => (
                                        <label
                                            key={method.id}
                                            className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all text-center group ${paymentMethod === method.id
                                                ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/10'
                                                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={paymentMethod === method.id}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="sr-only"
                                            />
                                            {paymentMethod === method.id && (
                                                <div className="absolute top-2 right-2 text-orange-500">
                                                    <CheckCircle size={16} fill="currentColor" className="text-white" />
                                                </div>
                                            )}
                                            {method.logo ? (
                                                <div className="h-10 flex items-center justify-center mb-2 grayscale group-hover:grayscale-0 transition-all duration-300">
                                                    <img
                                                        src={method.logo}
                                                        alt={method.name}
                                                        className="max-h-full w-auto object-contain"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'block';
                                                        }}
                                                    />
                                                    <span className="hidden text-sm font-bold text-slate-700">{method.name}</span>
                                                </div>
                                            ) : (
                                                <div className="h-10 flex items-center justify-center mb-2">
                                                    <span className="text-sm font-bold text-slate-700">{method.name}</span>
                                                </div>
                                            )}
                                            <span className={`text-xs font-bold ${paymentMethod === method.id ? 'text-orange-600' : 'text-slate-500 group-hover:text-slate-700'
                                                }`}>
                                                {method.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || items.length === 0 || !shippingData || shippingError || !paymentMethod}
                                className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 hover:shadow-orange-500/30 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Processing Order...
                                    </>
                                ) : (
                                    <>
                                        Place Order
                                        <ArrowRight size={24} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:sticky top-8 h-fit animate-slide-up animation-delay-200">
                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3 pb-6 border-b border-slate-100">
                                <ShoppingBag className="text-orange-500" size={24} />
                                Order Summary <span className="text-slate-400 text-sm font-normal ml-auto">{items.length} items</span>
                            </h2>

                            <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => {
                                    const product = item.product || item;
                                    const variant = item.variant;
                                    const imageUrl = variant?.image ? getImageUrl(variant.image) : getImageUrl(product.image);
                                    const itemPrice = variant
                                        ? parseFloat(product.price) + parseFloat(variant.price_adjustment || 0)
                                        : parseFloat(product.price);

                                    return (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 group-hover:border-orange-500/30 transition-colors">
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div
                                                        className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                                                        style={{ backgroundColor: variant?.color_hex || product.color || '#94a3b8' }}
                                                    >
                                                        {product.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-grow py-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{product.name}</h4>
                                                    <span className="font-bold text-sm text-slate-900 whitespace-nowrap ml-2">{formatPrice(itemPrice * item.quantity)}</span>
                                                </div>
                                                {variant && (
                                                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: variant.color_hex }}></span>
                                                        {variant.color} / {variant.size}
                                                    </p>
                                                )}
                                                <div className="flex justify-between items-center text-xs text-slate-400">
                                                    <span>{formatPrice(itemPrice)} × {item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Coupon Input */}
                            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Ticket size={18} className="text-orange-500" />
                                    <span className="font-bold text-slate-700 text-sm">Punya kode kupon?</span>
                                </div>

                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={18} className="text-emerald-500" />
                                            <div>
                                                <span className="font-bold text-emerald-700">{appliedCoupon.code}</span>
                                                <p className="text-xs text-emerald-600">
                                                    {appliedCoupon.type === 'percentage'
                                                        ? `Diskon ${appliedCoupon.value}%`
                                                        : `Diskon ${formatPrice(appliedCoupon.value)}`}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors"
                                        >
                                            <X size={16} className="text-emerald-600" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Masukkan kode kupon"
                                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 uppercase"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading || !couponCode.trim()}
                                            className="px-4 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {couponLoading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                                        </button>
                                    </div>
                                )}

                                {couponError && (
                                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {couponError}
                                    </p>
                                )}
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                                <div className="flex justify-between text-slate-600 text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 text-sm">
                                    <span>Shipping</span>
                                    <span className="font-bold text-slate-900">
                                        {shippingLoading ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : shippingData ? (
                                            formatPrice(shipping)
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-emerald-600 text-sm">
                                        <span className="flex items-center gap-1">
                                            <Ticket size={14} />
                                            Discount ({appliedCoupon.code})
                                        </span>
                                        <span className="font-bold">-{formatPrice(discount)}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-slate-200 mt-4 flex justify-between items-end">
                                    <span className="font-bold text-slate-900 text-lg">Total</span>
                                    <div className="text-right">
                                        <span className="font-black text-3xl text-orange-500 tracking-tight">{formatPrice(total)}</span>
                                        <p className="text-xs text-slate-400 mt-1">Include all taxes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
