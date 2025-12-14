import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, X, CheckCheck, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { adminAPI } from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const getToken = () => localStorage.getItem('token');

const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
};

// Custom API for reply with image using FormData
const replyWithImage = async (chatId, message, image = null) => {
    const formData = new FormData();
    if (message) formData.append('message', message);
    if (image) formData.append('image', image);

    const response = await fetch(`${API_URL}/admin/chats/${chatId}/reply`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
        },
        body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send reply');
    return data;
};

const AdminChats = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const pollingRef = useRef(null);
    const messagePollingRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchChats();
        // Poll for new chats every 3 seconds
        pollingRef.current = setInterval(fetchChatsQuiet, 3000);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (messagePollingRef.current) clearInterval(messagePollingRef.current);
        };
    }, []);

    useEffect(() => {
        if (selectedChat) {
            scrollToBottom();
            // Poll for new messages every 2 seconds when chat is selected
            messagePollingRef.current = setInterval(() => pollMessages(selectedChat.id), 2000);
        } else {
            if (messagePollingRef.current) clearInterval(messagePollingRef.current);
        }
        return () => {
            if (messagePollingRef.current) clearInterval(messagePollingRef.current);
        };
    }, [selectedChat?.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChats = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getChats();
            setChats(data.data || []);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChatsQuiet = async () => {
        try {
            const data = await adminAPI.getChats();
            setChats(data.data || []);
        } catch (error) { }
    };

    const pollMessages = async (chatId) => {
        try {
            const data = await adminAPI.getChatDetail(chatId);
            setSelectedChat(prev => prev?.id === chatId ? data.data : prev);
        } catch (error) { }
    };

    const handleChatSelect = async (chat) => {
        try {
            const data = await adminAPI.getChatDetail(chat.id);
            setSelectedChat(data.data);
            // Update unread count in list
            setChats(prev => prev.map(c =>
                c.id === chat.id ? { ...c, unread_count: 0 } : c
            ));
        } catch (error) {
            console.error('Error fetching chat details:', error);
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

    const handleSendReply = async (e) => {
        e.preventDefault();
        if ((!replyMessage.trim() && !selectedImage) || !selectedChat || sending) return;

        const messageText = replyMessage;
        const imageFile = selectedImage;
        setReplyMessage('');
        clearImage();
        setSending(true);

        try {
            const data = await replyWithImage(selectedChat.id, messageText, imageFile);
            setSelectedChat(prev => ({
                ...prev,
                messages: [...prev.messages, data.data]
            }));
        } catch (error) {
            console.error('Error sending reply:', error);
            setReplyMessage(messageText);
        } finally {
            setSending(false);
        }
    };

    const handleCloseChat = async (chatId) => {
        if (!confirm('Close this chat?')) return;

        try {
            await adminAPI.closeChat(chatId);
            setChats(prev => prev.map(c =>
                c.id === chatId ? { ...c, status: 'closed' } : c
            ));
            if (selectedChat?.id === chatId) {
                setSelectedChat(prev => ({ ...prev, status: 'closed' }));
            }
        } catch (error) {
            console.error('Error closing chat:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex animate-fade-in">
            {/* Chat List Sidebar */}
            <div className={`
                md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50 transition-all duration-300
                ${selectedChat ? 'hidden md:flex w-full' : 'flex w-full'}
            `}>
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Messages</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage customer support</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {chats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                            <MessageCircle size={40} className="text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">No chats started yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {chats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => handleChatSelect(chat)}
                                    className={`p-5 cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-md hover:z-10 relative ${selectedChat?.id === chat.id
                                        ? 'bg-white shadow-md z-10 border-l-4 border-l-orange-500'
                                        : 'border-l-4 border-l-transparent text-slate-600'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-1.5">
                                        <p className={`font-bold text-sm ${selectedChat?.id === chat.id ? 'text-slate-900' : 'text-slate-700'}`}>
                                            {chat.user?.name}
                                        </p>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">
                                            {new Date(chat.last_message_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate mb-2 ${chat.unread_count > 0 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                                        {chat.latest_message?.image ? '📷 Image' : (chat.latest_message?.message || 'No messages yet')}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${chat.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {chat.status}
                                        </span>
                                        {chat.unread_count > 0 && (
                                            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-orange-500/30">
                                                {chat.unread_count} new
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`
                flex-1 flex-col bg-white
                ${selectedChat ? 'flex' : 'hidden md:flex'}
            `}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex items-center gap-3 md:gap-4">
                                {/* Mobile Back Button */}
                                <button
                                    onClick={() => setSelectedChat(null)}
                                    className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </button>

                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                    {(selectedChat.user?.name || 'U')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate">{selectedChat.user?.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium truncate">{selectedChat.user?.email}</p>
                                </div>
                            </div>
                            {selectedChat.status === 'open' && (
                                <button
                                    onClick={() => handleCloseChat(selectedChat.id)}
                                    className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-red-50 text-red-600 text-[10px] md:text-xs font-bold hover:bg-red-100 transition-colors whitespace-nowrap"
                                >
                                    End <span className="hidden md:inline">Conversation</span>
                                </button>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/30">
                            {selectedChat.messages?.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex w-full ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${msg.sender_type === 'admin' ? 'items-end' : 'items-start'}`}>
                                        <div
                                            className={`px-5 py-3.5 shadow-sm text-sm leading-relaxed ${msg.sender_type === 'admin'
                                                ? 'bg-slate-900 text-white rounded-2xl rounded-tr-sm shadow-slate-900/10'
                                                : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm'
                                                }`}
                                        >
                                            {msg.image_url && (
                                                <img
                                                    src={getImageUrl(msg.image_url)}
                                                    alt="Shared image"
                                                    className="rounded-lg mb-2 max-w-full max-h-60 cursor-pointer hover:opacity-90"
                                                    onClick={() => window.open(getImageUrl(msg.image_url), '_blank')}
                                                />
                                            )}
                                            {msg.message && <p>{msg.message}</p>}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {msg.sender_type === 'admin' && (
                                                <CheckCheck size={12} className={`transition-all ${msg.is_read ? 'text-emerald-500' : 'text-slate-300'}`} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        {selectedChat.status === 'open' ? (
                            <div className="p-4 md:p-6 bg-white border-t border-slate-50">
                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="mb-3">
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
                                <form onSubmit={handleSendReply} className="relative flex items-center gap-2 md:gap-3">
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
                                        className="p-3 text-slate-400 hover:text-orange-500 hover:bg-slate-100 rounded-xl transition-colors"
                                        disabled={sending}
                                    >
                                        <ImageIcon size={22} />
                                    </button>
                                    <input
                                        type="text"
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Type..."
                                        className="flex-1 pl-4 md:pl-6 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all text-slate-900 placeholder-slate-400 font-medium"
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={(!replyMessage.trim() && !selectedImage) || sending}
                                        className="p-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center transform"
                                    >
                                        {sending ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <Send size={20} className={replyMessage.trim() || selectedImage ? 'ml-0.5' : ''} />
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/50 text-slate-500 text-sm font-medium">
                                    <CheckCheck size={16} />
                                    <span>This conversation has been marked as resolved</span>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 p-6">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <MessageCircle size={48} className="text-slate-200 md:w-16 md:h-16" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No chat selected</h3>
                        <p className="text-slate-500 max-w-xs text-center">Choose a conversation from the sidebar to view history or reply to customers</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChats;
