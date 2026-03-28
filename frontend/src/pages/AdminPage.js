// frontend/src/pages/AdminPage.js
import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
  const { user: adminUser } = useAuth();
  const [users, setUsers]   = useState([]);
  const [posts, setPosts]   = useState([]);
  const [tab, setTab]       = useState('users');
  const [loading, setLoading] = useState(true);

  // ── Messaging state ──────────────────────────────────────────────
  const [conversations, setConversations] = useState({}); // { userId: [messages] }
  const [openThread, setOpenThread]       = useState(null); // userId whose thread is open
  const [replyText, setReplyText]         = useState('');
  const [sendingReply, setSendingReply]   = useState(false);
  const threadEndRef = useRef(null);

  useEffect(() => {
    Promise.all([
      API.get('/admin/users'),
      API.get('/admin/posts'),
    ])
      .then(([usersRes, postsRes]) => {
        setUsers(usersRes.data);
        setPosts(postsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Load messages when a thread is opened
  useEffect(() => {
    if (!openThread) return;
    API.get(`/admin/messages/${openThread}`)
      .then(res => {
        setConversations(prev => ({ ...prev, [openThread]: res.data }));
      })
      .catch(() => {
        // If endpoint doesn't exist yet, seed with empty array
        setConversations(prev => ({ ...prev, [openThread]: prev[openThread] || [] }));
      });
  }, [openThread]);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, openThread]);

  const toggleStatus = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/status`);
      setUsers(users.map(u => u._id === id ? data.user : u));
    } catch {
      alert('Failed to update user status.');
    }
  };

  const removePost = async (id) => {
    if (!window.confirm('Mark this post as removed?')) return;
    try {
      await API.put(`/admin/posts/${id}/remove`);
      setPosts(posts.map(p => p._id === id ? { ...p, status: 'removed' } : p));
    } catch {
      alert('Failed to remove post.');
    }
  };

  const handleOpenThread = (userId) => {
    setOpenThread(prev => (prev === userId ? null : userId));
    setReplyText('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !openThread) return;
    setSendingReply(true);

    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      body: replyText.trim(),
      sender: 'admin',
      senderName: adminUser?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setConversations(prev => ({
      ...prev,
      [openThread]: [...(prev[openThread] || []), optimisticMsg],
    }));
    setReplyText('');

    try {
      const { data } = await API.post(`/admin/messages/${openThread}`, {
        body: optimisticMsg.body,
      });
      // Replace optimistic message with real one
      setConversations(prev => ({
        ...prev,
        [openThread]: [
          ...(prev[openThread] || []).filter(m => m._id !== optimisticMsg._id),
          data,
        ],
      }));
    } catch {
      // Roll back on failure
      setConversations(prev => ({
        ...prev,
        [openThread]: (prev[openThread] || []).filter(m => m._id !== optimisticMsg._id),
      }));
      alert('Failed to send message. (Check that /admin/messages endpoint exists on the backend.)');
    } finally {
      setSendingReply(false);
    }
  };

  // ── Style helpers ─────────────────────────────────────────────────
  const tabBtnStyle = (value) => ({
    padding: '10px 22px',
    background: tab === value ? 'var(--olive)' : 'transparent',
    color: tab === value ? '#f5f0eb' : 'var(--text-main)',
    border: '2px solid var(--olive)',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    fontFamily: "'DM Sans', sans-serif",
  });

  const badgeStyle = (status) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: '700',
    background: status === 'active' || status === 'published'
      ? 'rgba(71,85,34,0.12)' : 'rgba(180,60,60,0.12)',
    color: status === 'active' || status === 'published' ? 'var(--success)' : 'var(--danger)',
    border: `1px solid ${status === 'active' || status === 'published' ? 'var(--success)' : 'var(--danger)'}`,
    letterSpacing: '0.02em',
  });

  const thStyle = {
    padding: '12px 14px',
    textAlign: 'left',
    background: 'var(--olive)',
    color: '#f5f0eb',
    fontWeight: '600',
    fontSize: '0.85rem',
    letterSpacing: '0.03em',
    border: 'none',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border-light)',
    color: 'var(--text-main)',
    verticalAlign: 'middle',
    fontSize: '0.9rem',
  };

  if (loading) return (
    <div className="content" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
      <p>Loading admin data…</p>
    </div>
  );

  return (
    <div className="content">
      {/* Dashboard header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ marginBottom: '6px' }}> Admin Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage members, posts, and send direct messages.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Members', value: users.length, icon: '👥' },
          { label: 'Active Members', value: users.filter(u => u.status === 'active').length, icon: '✅' },
          { label: 'Total Posts', value: posts.length, icon: '📝' },
          { label: 'Published', value: posts.filter(p => p.status === 'published').length, icon: '🚀' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', fontFamily: "'Playfair Display', serif", color: 'var(--text-main)', lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button style={tabBtnStyle('users')} onClick={() => setTab('users')}>
          Members ({users.length})
        </button>
        <button style={tabBtnStyle('posts')} onClick={() => setTab('posts')}>
          All Posts ({posts.length})
        </button>
        <button style={tabBtnStyle('messages')} onClick={() => setTab('messages')}>
          Messages
        </button>
      </div>

      {/* ── Members Tab ── */}
      {tab === 'users' && (
        <>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>Member Accounts</h3>
          {users.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No members registered yet.</p>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Joined</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ background: 'var(--card-bg)' }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--olive), var(--olive-light))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#f5f0eb', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0,
                          }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={tdStyle}>
                        <span style={badgeStyle(u.status)}>{u.status}</span>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => toggleStatus(u._id)}
                            style={{
                              padding: '5px 12px', border: 'none', borderRadius: 'var(--radius-sm)',
                              fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem',
                              background: u.status === 'active' ? 'var(--danger)' : 'var(--success)',
                              color: '#fff', transition: 'opacity 0.2s',
                            }}
                          >
                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => { setTab('messages'); handleOpenThread(u._id); }}
                            style={{
                              padding: '5px 12px', border: '1.5px solid var(--olive)',
                              borderRadius: 'var(--radius-sm)', fontWeight: '600',
                              cursor: 'pointer', fontSize: '0.82rem',
                              background: 'transparent', color: 'var(--olive)',
                              transition: 'all 0.2s',
                            }}
                          >
                            💬 Message
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Posts Tab ── */}
      {tab === 'posts' && (
        <>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>All Posts</h3>
          {posts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No posts yet.</p>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Title</th>
                    <th style={thStyle}>Author</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(p => (
                    <tr key={p._id} style={{ background: 'var(--card-bg)' }}>
                      <td style={{ ...tdStyle, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </td>
                      <td style={tdStyle}>{p.author?.name}</td>
                      <td style={tdStyle}>
                        <span style={badgeStyle(p.status)}>{p.status}</span>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>
                        {p.status === 'published' ? (
                          <button
                            onClick={() => removePost(p._id)}
                            style={{
                              padding: '5px 14px', border: 'none', borderRadius: 'var(--radius-sm)',
                              fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem',
                              background: 'var(--danger)', color: '#fff',
                            }}
                          >
                            🗑 Remove
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Messages Tab ── */}
      {tab === 'messages' && (
        <>
          <h3 style={{ marginBottom: '6px', color: 'var(--text-main)' }}>Direct Messages</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
            Select a member to open a private conversation thread.
          </p>

          {users.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No members to message yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: '20px', alignItems: 'flex-start' }}>

              {/* Member list sidebar */}
              <div style={{
                background: 'var(--card-bg)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ padding: '14px 16px', background: 'var(--olive)', color: '#f5f0eb', fontSize: '0.85rem', fontWeight: '600' }}>
                  👥 Members
                </div>
                {users.map(u => {
                  const isOpen = openThread === u._id;
                  const msgCount = conversations[u._id]?.length || 0;
                  return (
                    <button
                      key={u._id}
                      onClick={() => handleOpenThread(u._id)}
                      style={{
                        width: '100%', padding: '12px 16px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: isOpen ? 'var(--olive-pale)' : 'transparent',
                        border: 'none', borderBottom: '1px solid var(--border-light)',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s',
                        borderLeft: isOpen ? '3px solid var(--olive)' : '3px solid transparent',
                      }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--olive), var(--olive-light))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#f5f0eb', fontWeight: '700', fontSize: '0.9rem',
                      }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {msgCount > 0 ? `${msgCount} message${msgCount !== 1 ? 's' : ''}` : 'No messages yet'}
                        </div>
                      </div>
                      {isOpen && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--olive)', flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Thread panel */}
              <div>
                {!openThread ? (
                  <div style={{
                    background: 'var(--card-bg)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)', padding: '48px 24px',
                    textAlign: 'center', color: 'var(--text-muted)',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💬</div>
                    <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>No conversation selected</p>
                    <p style={{ fontSize: '0.88rem' }}>Click a member on the left to open their thread.</p>
                  </div>
                ) : (
                  (() => {
                    const member = users.find(u => u._id === openThread);
                    const thread = conversations[openThread] || [];
                    return (
                      <div style={{
                        background: 'var(--card-bg)', border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)', overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)',
                      }}>
                        {/* Thread header */}
                        <div style={{
                          padding: '14px 18px', background: 'var(--olive)',
                          display: 'flex', alignItems: 'center', gap: '12px',
                        }}>
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#f5f0eb', fontWeight: '700',
                          }}>
                            {member?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#f5f0eb', fontSize: '0.95rem' }}>{member?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(245,240,235,0.7)' }}>{member?.email}</div>
                          </div>
                        </div>

                        {/* Message thread */}
                        <div style={{
                          padding: '20px 18px', minHeight: '220px', maxHeight: '340px',
                          overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px',
                          background: 'var(--cream-light)',
                        }}>
                          {thread.length === 0 ? (
                            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                              <p>No messages yet.</p>
                              <p style={{ marginTop: '4px' }}>Send a message to start the conversation.</p>
                            </div>
                          ) : (
                            thread.map(msg => {
                              const isAdmin = msg.sender === 'admin';
                              return (
                                <div key={msg._id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                                  <div style={{
                                    maxWidth: '78%',
                                    padding: '10px 14px',
                                    borderRadius: isAdmin ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                                    background: isAdmin ? 'var(--olive)' : 'var(--card-bg)',
                                    color: isAdmin ? '#f5f0eb' : 'var(--text-main)',
                                    border: isAdmin ? 'none' : '1px solid var(--border-light)',
                                    boxShadow: 'var(--shadow-sm)',
                                    fontSize: '0.9rem', lineHeight: '1.5',
                                  }}>
                                    <div>{msg.body}</div>
                                    <div style={{
                                      fontSize: '0.7rem', marginTop: '5px',
                                      color: isAdmin ? 'rgba(245,240,235,0.65)' : 'var(--text-muted)',
                                      textAlign: isAdmin ? 'right' : 'left',
                                    }}>
                                      {isAdmin ? `You · ` : `${msg.senderName || member?.name} · `}
                                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      {' · '}
                                      {new Date(msg.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={threadEndRef} />
                        </div>

                        {/* Reply composer */}
                        <form
                          onSubmit={handleSendReply}
                          style={{
                            display: 'flex', gap: '10px', padding: '14px 18px',
                            borderTop: '1px solid var(--border-light)',
                            background: 'var(--card-bg)', alignItems: 'flex-end',
                          }}
                        >
                          <textarea
                            rows="2"
                            placeholder={`Reply to ${member?.name}…`}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(e); } }}
                            style={{
                              flex: 1, resize: 'none', minHeight: '60px',
                              padding: '10px 12px',
                              border: '1.5px solid var(--border-light)',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--card-bg)',
                              color: 'var(--text-main)',
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '0.9rem', outline: 'none', lineHeight: '1.5',
                            }}
                          />
                          <button
                            type="submit"
                            disabled={sendingReply || !replyText.trim()}
                            style={{
                              padding: '10px 20px',
                              background: 'var(--olive)',
                              color: '#f5f0eb', border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: '700', cursor: 'pointer',
                              fontSize: '0.9rem', transition: 'all 0.2s',
                              display: 'flex', alignItems: 'center', gap: '6px',
                              opacity: sendingReply || !replyText.trim() ? 0.55 : 1,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {sendingReply ? '…' : '➤ Send'}
                          </button>
                        </form>
                        <p style={{ padding: '6px 18px 10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Press Enter to send · Shift+Enter for new line
                        </p>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;