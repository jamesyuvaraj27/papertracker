import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api, { getFileUrl } from '../api/api';
import {
  Send,
  Paperclip,
  MessageSquare,
  FileText,
  User,
  CheckCheck,
  FolderOpen,
} from 'lucide-react';

export const ChatPage = () => {
  const { teamId } = useParams();
  const { user, isGuide, isAdmin } = useAuth();
  const { socket } = useSocket();

  const [teamsList, setTeamsList] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(teamId && teamId !== 'all' && teamId !== 'direct' ? teamId : '');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load teams list for sidebar selection if guide/admin
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await api.get('/teams');
        if (res.data.success && res.data.data.length > 0) {
          setTeamsList(res.data.data);
          if (!selectedTeamId) {
            setSelectedTeamId(res.data.data[0]._id);
          }
        }
      } catch (err) {
        // Silently catch
      }
    };
    fetchTeams();
  }, []);

  // Fetch messages for selected team
  useEffect(() => {
    if (!selectedTeamId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${selectedTeamId}`);
        if (res.data.success) {
          setMessages(res.data.data);
          scrollToBottom();
        }
      } catch (err) {
        // Silently catch
      }
    };

    fetchMessages();

    // Join team socket room
    if (socket) {
      socket.emit('join_team_chat', selectedTeamId);

      socket.on('receive_message', (msg) => {
        if (msg.team === selectedTeamId || msg.team?._id === selectedTeamId) {
          setMessages((prev) => [...prev, msg]);
          scrollToBottom();
        }
      });

      return () => {
        socket.emit('leave_team_chat', selectedTeamId);
        socket.off('receive_message');
      };
    }
  }, [selectedTeamId, socket]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('teamId', selectedTeamId);
      if (inputText.trim()) formData.append('message', inputText);
      if (selectedFile) formData.append('file', selectedFile);

      const res = await api.post('/chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setInputText('');
        setSelectedFile(null);
        if (socket) {
          socket.emit('send_message', res.data.data);
        } else {
          setMessages((prev) => [...prev, res.data.data]);
        }
        scrollToBottom();
      }
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const currentTeam = teamsList.find((t) => t._id === selectedTeamId);

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="saas-card p-4 bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-sky-600" />
          <h1 className="text-base font-bold text-slate-900">Project Discussion Channel</h1>
        </div>
      </div>

      {teamsList.length === 0 ? (
        <div className="saas-card p-12 text-center bg-white border border-slate-200">
          <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No active discussions</p>
          <p className="text-xs text-slate-500 mt-0.5">Project teams and guides can communicate once teams are registered.</p>
        </div>
      ) : (
        <div className="saas-card overflow-hidden bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-4 min-h-[550px] max-h-[650px]">
          {/* Teams Sidebar */}
          {(isGuide || isAdmin) && (
            <div className="border-r border-slate-200 p-3 space-y-2 overflow-y-auto bg-slate-50/50">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                Assigned Teams
              </span>
              {teamsList.map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTeamId(t._id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition flex flex-col gap-0.5 ${
                    selectedTeamId === t._id
                      ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate">{t.teamName}</span>
                  <span className="text-[10px] text-slate-400 font-normal truncate">{t.projectTitle}</span>
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages Surface */}
          <div className={`${isGuide || isAdmin ? 'md:col-span-3' : 'md:col-span-4'} flex flex-col justify-between bg-white`}>
            {/* Top Channel Bar */}
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  {currentTeam ? currentTeam.teamName : 'Project Discussion'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {currentTeam ? currentTeam.projectTitle : 'Direct feedback channel'}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[440px]">
              {messages.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  No messages yet. Send a message or upload an attachment to start the conversation.
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender?._id === user?._id;

                  return (
                    <div
                      key={m._id || Math.random()}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md rounded-xl p-3 text-xs space-y-1 ${
                          isMine
                            ? 'bg-sky-600 text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] opacity-80">
                          <span className="font-semibold">{m.sender?.name || 'User'}</span>
                          <span>
                            {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {m.message && <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>}

                        {m.fileUrl && (
                          <div className="pt-1">
                            <a
                              href={getFileUrl(m.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium ${
                                isMine ? 'bg-sky-700 text-white hover:bg-sky-800' : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{m.fileName || 'Download Attachment'}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white">
              {selectedFile && (
                <div className="mb-2 p-1.5 rounded bg-slate-100 text-[11px] text-slate-700 flex items-center justify-between border border-slate-200">
                  <span className="truncate max-w-xs font-medium">Attachment: {selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-500 hover:text-slate-800 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition">
                  <Paperclip className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                </label>

                <input
                  type="text"
                  placeholder="Type a message to project supervisor..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="saas-input py-1.5"
                />

                <button
                  type="submit"
                  disabled={sending || (!inputText.trim() && !selectedFile)}
                  className="saas-btn-primary py-2 px-3.5"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
