import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { getApiBase, getServerOrigin } from '../utils/api';

function parseSpringDate(dateData) {
  if (!dateData) return 'Just now';
  const dateObj = Array.isArray(dateData)
    ? new Date(dateData[0], dateData[1] - 1, dateData[2], dateData[3] || 0, dateData[4] || 0)
    : new Date(dateData);
  return `${dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })} • ${dateObj.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function GroupRoomPage() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggle, label } = useTheme();
  const apiBase = useMemo(() => `${getApiBase()}/study-groups`, []);
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const myEmail = user?.email || user?.username || '';
  const myName = user?.name || user?.username || 'Student';

  const loadRoom = useCallback(async () => {
    const res = await fetch(`${apiBase}/${id}`);
    const data = await res.json();
    setRoom(data);
  }, [apiBase, id]);

  const loadMembers = useCallback(async () => {
    const res = await fetch(`${apiBase}/${id}/members`);
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
  }, [apiBase, id]);

  const loadPosts = useCallback(async () => {
    const res = await fetch(`${apiBase}/${id}/posts`);
    const data = await res.json();
    setPosts(Array.isArray(data) ? data.reverse() : []);
  }, [apiBase, id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadRoom();
    loadMembers();
    loadPosts();
  }, [user, navigate, loadRoom, loadMembers, loadPosts]);

  const sendMessage = async () => {
    if (!message.trim() && !file) return;
    const formData = new FormData();
    formData.append('authorEmail', myEmail);
    formData.append('authorName', myName);
    formData.append('content', message);
    if (replyTo?.id) {
      formData.append('replyToId', replyTo.id);
      formData.append('replyToAuthor', replyTo.author);
      formData.append('replyToContent', replyTo.content);
    }
    if (file) formData.append('file', file);

    const res = await fetch(`${apiBase}/${id}/posts`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      alert('Failed to send');
      return;
    }
    setMessage('');
    setFile(null);
    setReplyTo(null);
    loadPosts();
  };

  const deletePost = async (postId) => {
    await fetch(`${apiBase}/posts/${postId}?email=${encodeURIComponent(myEmail)}`, { method: 'DELETE' });
    loadPosts();
  };

  const actions = [
    { label: '🏠 Home', onClick: () => navigate('/') },
    { label: '🚪 Logout', variant: 'logout-btn', onClick: () => { logout(); navigate('/login'); } },
  ];

  const isAdmin = room && room.createdBy && room.createdBy.toLowerCase() === myEmail.toLowerCase();

  return (
    <>
      <Header title={`${room?.emoji || '🚀'} ${room?.name || 'Club Room'}`} actions={actions} onToggleTheme={toggle} themeLabel={label} />
      <main className="container">
        <div className="card">
          <h3>{room?.description}</h3>
          <p style={{ color: 'var(--text-muted)' }}>{members.length} members</p>
        </div>

        <div className="card">
          <h3>Members</h3>
          <div id="membersList">
            {members.map((m) => (
              <div key={m.id} className="member-item">
                <div className="member-avatar">{(m.userName || '?').charAt(0).toUpperCase()}</div>
                <div className="member-name">
                  {m.userName}
                  {m.userEmail === room?.createdBy ? ' 👑' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Chat</h3>
          {replyTo && (
            <div className="msg-quote" style={{ marginBottom: '10px' }}>
              <div className="quote-author">Replying to {replyTo.author}</div>
              <div className="quote-text">{replyTo.content}</div>
              <button type="button" onClick={() => setReplyTo(null)}>
                Cancel
              </button>
            </div>
          )}
          <div className="input-wrapper" style={{ marginBottom: '12px' }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              style={{ width: '100%', minHeight: '80px' }}
            />
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button type="button" onClick={sendMessage}>
              Send
            </button>
          </div>

          <div id="feedContainer">
            {posts.map((post) => {
              const mine = (post.authorEmail || '').toLowerCase() === myEmail.toLowerCase();
              return (
                <div key={post.id} className={`msg-row ${mine ? 'mine' : 'theirs'}`} style={{ marginBottom: '12px' }}>
                  <div className="msg-bubble">
                    <div className="msg-actions">
                      <button
                        className="action-icon reply"
                        type="button"
                        onClick={() =>
                          setReplyTo({
                            id: post.id,
                            author: post.authorName,
                            content: post.content || '',
                          })
                        }
                      >
                        ↩️
                      </button>
                      {(mine || isAdmin) && (
                        <button className="action-icon delete" type="button" onClick={() => deletePost(post.id)}>
                          🗑️
                        </button>
                      )}
                    </div>
                    {post.replyToId && (
                      <div className="msg-quote">
                        <div className="quote-author">↩ {post.replyToAuthor}</div>
                        <div className="quote-text">{post.replyToContent}</div>
                      </div>
                    )}
                    <div className="msg-author">{post.authorName}</div>
                    {post.fileUrl ? (
                      post.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <img
                          className="msg-image"
                          src={`${getServerOrigin()}${post.fileUrl}`}
                          alt="Attached"
                          onClick={() => window.open(`${getServerOrigin()}${post.fileUrl}`, '_blank')}
                        />
                      ) : (
                        <a
                          href={`${getServerOrigin()}${post.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}
                        >
                          📎 View Attached File
                        </a>
                      )
                    ) : null}
                    <div className="msg-content">{post.content}</div>
                    <div className="msg-time">{parseSpringDate(post.postedAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer text="© 2025 Campus Connect | Club Room" />
    </>
  );
}
