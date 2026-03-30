import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { getApiBase, getServerOrigin } from '../utils/api';

function parseTime(ts) {
  if (!ts) return '';
  const date = Array.isArray(ts)
    ? new Date(ts[0], ts[1] - 1, ts[2], ts[3] || 0, ts[4] || 0)
    : new Date(ts);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function ChatPage() {
  const { requestId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggle, label } = useTheme();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const stompRef = useRef(null);
  const role = useMemo(() => {
    const stored = localStorage.getItem('mentorshipRole');
    return stored || (localStorage.getItem('alumniId') ? 'ALUMNI' : 'STUDENT');
  }, []);

  const apiChat = useMemo(() => `${getApiBase()}/chat/${requestId}`, [requestId]);

  const connectSocket = useCallback(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${getServerOrigin()}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/chat/${requestId}`, (payload) => {
          const body = JSON.parse(payload.body);
          if (body.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((m) => m.id !== body.id));
            return;
          }
          setMessages((prev) => [...prev, body]);
        });
      },
    });
    client.activate();
    stompRef.current = client;
  }, [requestId]);

  const loadMessages = useCallback(async () => {
    const res = await fetch(apiChat);
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  }, [apiChat]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadMessages();
    connectSocket();
    return () => stompRef.current?.deactivate();
  }, [user, navigate, loadMessages, connectSocket]);

  const sendMessage = () => {
    if (!stompRef.current || !text.trim()) return;
    const payload = {
      senderId: user.id,
      senderRole: role,
      message: text,
      replyToId: replyTo?.id,
      replyToAuthor: replyTo?.author,
      replyToContent: replyTo?.content,
    };
    stompRef.current.publish({ destination: `/app/chat.send/${requestId}`, body: JSON.stringify(payload) });
    setText('');
    setReplyTo(null);
  };

  const sendFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', user.id);
    formData.append('senderRole', role);
    formData.append('message', text);
    if (replyTo?.id) {
      formData.append('replyToId', replyTo.id);
      formData.append('replyToAuthor', replyTo.author);
      formData.append('replyToContent', replyTo.content);
    }
    await fetch(`${apiChat}/upload`, { method: 'POST', body: formData });
    setFile(null);
    setText('');
    setReplyTo(null);
  };

  const deleteMessage = async (id) => {
    await fetch(`${getApiBase()}/chat/message/${id}?userId=${user.id}`, { method: 'DELETE' });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const actions = [
    { label: 'Recent Chats', onClick: () => navigate('/recent-chats') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  return (
    <>
      <Header title="Mentorship Chat" actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <section className="card" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
          {messages.map((m) => {
            const mine = m.senderId === user?.id;
            return (
              <div key={m.id} className={`msg-row ${mine ? 'mine' : 'theirs'}`}>
                <div className="msg-bubble">
                  <div className="msg-author">{m.senderName}</div>
                  {m.replyToId && (
                    <div className="msg-quote">
                      <div className="quote-author">↩ {m.replyToAuthor}</div>
                      <div className="quote-text">{m.replyToContent}</div>
                    </div>
                  )}
                  {m.message && <div className="msg-content">{m.message}</div>}
                  {m.fileUrl && (
                    m.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                      <img className="msg-image" src={`${getServerOrigin()}${m.fileUrl}`} alt="Attachment" />
                    ) : (
                      <a className="msg-file" href={`${getServerOrigin()}${m.fileUrl}`} target="_blank" rel="noreferrer">
                        📎 {m.fileName || 'Attachment'}
                      </a>
                    )
                  )}
                  <div className="msg-time">{parseTime(m.createdAt)}</div>
                  <div className="msg-actions">
                    <button className="action-icon reply" type="button" onClick={() => setReplyTo({ id: m.id, author: m.senderName, content: m.message || '' })}>↩️</button>
                    {mine && <button className="action-icon delete" type="button" onClick={() => deleteMessage(m.id)}>🗑️</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {replyTo && (
          <div className="msg-quote">
            <div className="quote-author">Replying to {replyTo.author}</div>
            <div className="quote-text">{replyTo.content}</div>
            <button type="button" onClick={() => setReplyTo(null)}>Cancel</button>
          </div>
        )}

        <section className="card">
          <div className="input-wrapper">
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" style={{ width: '100%', minHeight: '70px' }} />
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button type="button" onClick={sendMessage}>Send</button>
              <button type="button" onClick={sendFile} disabled={!file}>Send Attachment</button>
            </div>
          </div>
        </section>
      </main>
      <Footer text="© 2025 Campus Connect | Chat" />
    </>
  );
}
