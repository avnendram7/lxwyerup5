
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, FileText, Download, X, MoreVertical, Search, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../../../App';
import LawyerProfileModal from './LawyerProfileModal';

export default function LxwyerNetwork({ currentUser, darkMode }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const token = sessionStorage.getItem('token');

    // Get current user's ID
    useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUserId(user.id);
        }
    }, []);

    // Poll for messages
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [fetchMessages]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/network/messages?limit=50`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data.reverse());
        } catch (error) {
            console.error("Error fetching network messages", error);
        }
    }, [token]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error("File size too large (max 10MB)");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || loading) return;

        setLoading(true);
        try {
            let fileData = {};

            // Upload file first if selected
            if (selectedFile) {
                setUploading(true);
                const formData = new FormData();
                formData.append('file', selectedFile);

                const uploadRes = await axios.post(`${API}/documents/upload`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                fileData = {
                    file_url: uploadRes.data.url || uploadRes.data.file_url,
                    file_name: selectedFile.name,
                    file_type: selectedFile.type
                };
                setUploading(false);
            }

            await axios.post(`${API}/network/messages`, {
                content: newMessage,
                ...fileData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNewMessage('');
            setSelectedFile(null);
            fetchMessages(); // Instant refresh
        } catch (error) {
            console.error("Failed to send message", error);
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`flex h-full rounded-[2rem] overflow-hidden border shadow-sm relative ${darkMode ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200'}`}>

            {/* Profile Modal */}
            {selectedProfile && (
                <LawyerProfileModal
                    user={selectedProfile}
                    onClose={() => setSelectedProfile(null)}
                    darkMode={darkMode}
                    allowEditing={selectedProfile.id === currentUser?.id}
                    onBook={(user) => {
                        toast.success(`Booking request sent to ${user.full_name || 'Lawyer'}`);
                        // Future: Navigate to booking page or open booking modal
                        setSelectedProfile(null);
                    }}
                // Read-only mode: omit onLogout/onImageUpdate
                />
            )}

            {/* Sidebar (Group/Members List) - Hidden on mobile if viewing chat */}
            <div className={`w-80 border-r flex flex-col hidden md:flex ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-slate-200'}`}>
                {/* Header */}
                <div className={`p-4 border-b ${darkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-white'}`}>
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            Lxwyer Network
                            <span className={`block text-xs font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {currentUser?.state || 'Global'} Chapter
                            </span>
                        </div>
                    </h2>
                </div>

                {/* Search */}
                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`pl-9 border-none h-9 text-sm ${darkMode ? 'bg-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}
                        />
                    </div>
                </div>

                {/* Groups List (Single Group for now) */}
                <div className="flex-1 overflow-y-auto">
                    <div className={`p-3 border-l-4 border-blue-500 cursor-pointer ${darkMode ? 'bg-white/5' : 'bg-blue-50/50'}`}>
                        <div className="flex justify-between items-start">
                            <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>General Discussion</h3>
                            <span className="text-[10px] text-slate-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-1">
                            {messages[messages.length - 1]?.sender_name}: {messages[messages.length - 1]?.content || 'Shared a file'}
                        </p>
                    </div>
                    {/* Placeholder for other groups */}
                    <div className={`p-3 cursor-pointer opacity-60 ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                        <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Legal Updates</h3>
                        <p className="text-xs text-slate-500 truncate mt-1">No new messages</p>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col relative ${darkMode ? 'bg-[#0b141a]' : 'bg-white'}`}>
                {/* Chat Background Pattern */}
                <div className={`absolute inset-0 opacity-[0.06] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none ${!darkMode && 'invert'}`}></div>

                {/* Chat Header (Mobile Only) */}
                <div className={`md:hidden p-3 flex items-center gap-3 border-b z-10 ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-slate-200'}`}>
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Lxwyer Network</h3>
                        <p className="text-xs text-slate-500">{currentUser?.state}</p>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 z-0 pb-24"> {/* Added padding bottom for input area */}
                    {filteredMessages.map((msg, idx) => {
                        const isMe = msg.sender_id === currentUser?.id;
                        // Group consecutive messages from same sender check could be added
                        const showSender = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-1`}
                            >
                                {!isMe && showSender && (
                                    <div
                                        onClick={() => setSelectedProfile({
                                            full_name: msg.sender_name,
                                            photo: msg.sender_photo,
                                            // Construct partial user obj for modal
                                            id: msg.sender_id,
                                            unique_id: msg.sender_unique_id,
                                            bio: msg.sender_bio,
                                            education: msg.sender_education, // if available
                                            specialization: msg.sender_specialization,
                                            email: 'Hidden (Connect to view)'
                                        })}
                                        className="w-8 h-8 rounded-full overflow-hidden mr-2 mt-1 cursor-pointer flex-shrink-0 hover:opacity-80 transition-opacity bg-slate-300"
                                    >
                                        {msg.sender_photo ? (
                                            <img src={msg.sender_photo.startsWith('http') ? msg.sender_photo : `http://localhost:8000${msg.sender_photo}`} alt={msg.sender_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600">{msg.sender_name[0]}</div>
                                        )}
                                    </div>
                                )}
                                {!isMe && !showSender && <div className="w-10 mr-0" />}

                                <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-3 py-2 shadow-sm relative border ${isMe
                                    ? `bg-blue-50 border-blue-100 rounded-tr-none text-slate-800 ${darkMode ? 'bg-blue-600 border-transparent text-white' : ''}`
                                    : darkMode
                                        ? 'bg-[#202c33] border-transparent rounded-tl-none text-white'
                                        : 'bg-white border-slate-200 rounded-tl-none text-slate-800'
                                    }`}>

                                    {/* Sender Name (only for others in group chat) */}
                                    {!isMe && showSender && (
                                        <p className={`text-[10px] font-bold mb-1 cursor-pointer hover:underline ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}
                                            onClick={() => setSelectedProfile({
                                                full_name: msg.sender_name,
                                                photo: msg.sender_photo,
                                                id: msg.sender_id,
                                                unique_id: msg.sender_unique_id,
                                                bio: msg.sender_bio,
                                                specialization: msg.sender_specialization
                                            })}
                                        >
                                            {msg.sender_name}
                                            {msg.sender_unique_id && <span className="ml-1 font-mono font-normal opacity-70">({msg.sender_unique_id})</span>}
                                        </p>
                                    )}

                                    {/* File Attachment */}
                                    {msg.file_url && (
                                        <div className={`mb-2 rounded-lg overflow-hidden border border-black/5 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                                            {msg.file_type?.startsWith('image/') ? (
                                                <a href={msg.file_url.startsWith('http') ? msg.file_url : `http://localhost:8000${msg.file_url}`} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                        src={msg.file_url.startsWith('http') ? msg.file_url : `http://localhost:8000${msg.file_url}`}
                                                        alt="attachment"
                                                        className="w-full max-h-48 object-cover"
                                                    />
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-3 p-3">
                                                    <FileText className="w-8 h-8 text-blue-500" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold truncate">{msg.file_name || 'Document'}</p>
                                                        <p className="text-[10px] opacity-70 uppercase">{msg.file_type?.split('/')[1] || 'FILE'}</p>
                                                    </div>
                                                    <a
                                                        href={msg.file_url.startsWith('http') ? msg.file_url : `http://localhost:8000${msg.file_url}`}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 hover:bg-black/10 rounded-full transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Message Content */}
                                    {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                                    <div className="flex justify-end mt-1">
                                        <span className={`text-[10px] ${isMe ? `text-slate-500 ${darkMode ? 'text-white/60' : ''}` : 'text-slate-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Selected File Preview */}
                {selectedFile && (
                    <div className={`p-2 flex items-center justify-between border-t absolute bottom-[70px] left-4 right-4 rounded-xl shadow-lg z-20 ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${darkMode ? 'bg-white/10 border-none' : 'bg-white border border-slate-100'}`}>
                                {selectedFile.type?.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-purple-500" /> : <FileText className="w-5 h-5 text-blue-500" />}
                            </div>
                            <div className="text-xs min-w-0">
                                <p className={`font-semibold truncate max-w-[200px] ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{selectedFile.name}</p>
                                <p className="text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="p-1.5 hover:bg-black/10 rounded-full transition-colors">
                            <X className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                )}

                {/* Input Area */}
                <div className={`p-3 border-t flex items-end gap-2 z-30 relative ${darkMode ? 'bg-[#1c1c1c] border-white/5' : 'bg-white border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'}`}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    // accept="image/*,application/pdf,.doc,.docx" // Optional restriction
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 rounded-full transition-colors shrink-0 ${darkMode ? 'text-slate-500 hover:bg-white/10' : 'text-slate-400 hover:bg-slate-100'}`}
                        title="Attach text/file"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <div className={`flex-1 rounded-2xl px-4 py-3 flex items-center min-h-[44px] focus-within:border-blue-500/50 transition-colors ${darkMode ? 'bg-[#2a3942] border-transparent' : 'bg-white border border-slate-200 shadow-sm'}`}>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Type a message"
                            className={`w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm resize-none max-h-24 placeholder:text-slate-400 ${darkMode ? 'text-white' : 'text-slate-800'}`}
                            rows={1}
                        />
                    </div>

                    <Button
                        onClick={handleSendMessage}
                        disabled={loading || (!newMessage.trim() && !selectedFile)}
                        className={`w-11 h-11 rounded-full p-0 flex items-center justify-center transition-all shrink-0 ${(!newMessage.trim() && !selectedFile)
                            ? `text-slate-400 ${darkMode ? 'bg-white/10 text-white/20' : 'bg-slate-100'}`
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                            }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 ml-0.5" />
                        )}
                    </Button>
                </div>

            </div>
        </div >
    );
}
