import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Chat API helpers
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const getToken = () => localStorage.getItem('token');

const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
};

const chatAPI = {
    getOrCreate: async () => {
        const response = await fetch(`${API_URL}/chat`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            }
        });
        return response.json();
    },
    getChat: async (id) => {
        const response = await fetch(`${API_URL}/chat/${id}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            }
        });
        return response.json();
    },
    sendMessage: async (id, message, image = null) => {
        const formData = new FormData();
        if (message) formData.append('message', message);
        if (image) formData.append('image', image);

        const response = await fetch(`${API_URL}/chat/${id}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
            },
            body: formData
        });
        return response.json();
    }
};

const ChatWidget = () => {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    // Fetch or create chat
    const fetchChat = async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const data = await chatAPI.getOrCreate();
            setChatId(data.data.id);
            setMessages(data.data.messages || []);
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error('Error fetching chat:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Clear selected image
    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedImage) || !chatId || sending) return;

        const messageText = newMessage;
        const imageFile = selectedImage;
        setNewMessage('');
        clearImage();
        setSending(true);

        try {
            const data = await chatAPI.sendMessage(chatId, messageText, imageFile);
            setMessages(prev => [...prev, data.data]);
        } catch (error) {
            console.error('Error sending message:', error);
            setNewMessage(messageText); // Restore message on error
        } finally {
            setSending(false);
        }
    };

    // Poll for new messages
    const pollMessages = async () => {
        if (!chatId || !isAuthenticated) return;

        try {
            const data = await chatAPI.getChat(chatId);
            setMessages(data.data.messages || []);
        } catch (error) {
            console.log('Error polling messages');
        }
    };

    // Start/stop polling based on widget state
    useEffect(() => {
        if (isOpen && chatId && !isMinimized) {
            // Poll every 3 seconds
            pollingIntervalRef.current = setInterval(pollMessages, 3000);
        } else {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [isOpen, chatId, isMinimized]);

    // Load chat when opened
    useEffect(() => {
        if (isOpen && !chatId) {
            fetchChat();
        }
    }, [isOpen]);

    if (!isAuthenticated) return null;

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50 group"
                    aria-label="Open chat"
                >
                    <MessageCircle size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
                    }`}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <div>
                                <h3 className="font-bold text-white">Customer Support</h3>
                                <p className="text-xs text-orange-100">We're here to help</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="text-white hover:bg-orange-600 p-1 rounded transition-colors"
                            >
                                <Minimize2 size={18} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-orange-600 p-1 rounded transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="animate-spin text-orange-500" size={32} />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <MessageCircle size={48} className="text-slate-300 mb-3" />
                                        <p className="text-slate-500 text-sm">No messages yet</p>
                                        <p className="text-slate-400 text-xs mt-1">Send a message to start the conversation</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.sender_type === 'customer'
                                                    ? 'bg-orange-500 text-white rounded-br-sm'
                                                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                                                    }`}
                                            >
                                                {msg.image_url && (
                                                    <img
                                                        src={getImageUrl(msg.image_url)}
                                                        alt="Shared image"
                                                        className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90"
                                                        onClick={() => window.open(getImageUrl(msg.image_url), '_blank')}
                                                    />
                                                )}
                                                {msg.message && <p className="text-sm">{msg.message}</p>}
                                                <p className={`text-xs mt-1 ${msg.sender_type === 'customer' ? 'text-orange-100' : 'text-slate-400'
                                                    }`}>
                                                    {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="px-4 py-2 bg-slate-100 border-t border-slate-200">
                                    <div className="relative inline-block">
                                        <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
                                        <button
                                            onClick={clearImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Input */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 rounded-b-2xl">
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageSelect}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-slate-400 hover:text-orange-500 hover:bg-slate-100 rounded-full transition-colors"
                                        disabled={sending}
                                    >
                                        <ImageIcon size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:border-orange-500 text-sm"
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={(!newMessage.trim() && !selectedImage) || sending}
                                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white p-2 rounded-full transition-colors"
                                    >
                                        {sending ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <Send size={20} />
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default ChatWidget;

