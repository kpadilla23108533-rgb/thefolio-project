// frontend/src/pages/AdminPage.js
import { useState, useEffect } from 'react';
import API from '../api/axios';

const AdminPage = () => {
  const [users, setUsers]     = useState([]);
  const [posts, setPosts]     = useState([]);
  const [messages, setMessages] = useState([]);
  const [tab, setTab]         = useState('users');
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    Promise.all([
      API.get('/admin/users'),
      API.get('/admin/posts'),
      API.get('/admin/contacts'),
    ])
      .then(([usersRes, postsRes, msgRes]) => {
        setUsers(usersRes.data);
        setPosts(postsRes.data);
        setMessages(msgRes.data);
      })
      .catch(() => {
        // If /admin/contacts isn't wired yet, just log and continue
        console.warn('Could not load one or more admin endpoints.');
      })
      .finally(() => setLoading(false));
  }, []);

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

  // ── Style helpers ──────────────────────────────────────────────────
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
        <h2 style={{ marginBottom: '6px' }}>🛡️ Admin Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage members, posts, and view contact recommendations.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Members',   value: users.length,                                     icon: '👥' },
          { label: 'Active Members',  value: users.filter(u => u.status === 'active').length,  icon: '✅' },
          { label: 'Total Posts',     value: posts.length,                                     icon: '📝' },
          { label: 'Published',       value: posts.filter(p => p.status === 'published').length, icon: '🚀' },
          { label: 'Messages',        value: messages.length,                                  icon: '✉️' },
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
        <button style={tabBtnStyle('messages')} onClick={() => { setTab('messages'); setSelectedMsg(null); }}>
          📬 Messages ({messages.length})
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

      {/* ── Messages / Contact Inbox Tab (VIEW ONLY) ── */}
      {tab === 'messages' && (
        <>
          <h3 style={{ marginBottom: '6px', color: 'var(--text-main)' }}>📬 Contact Recommendations</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
            Messages submitted by visitors through the Contact page. Read-only.
          </p>

          {messages.length === 0 ? (
            <div style={{
              background: 'var(--card-bg)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)', padding: '48px 24px',
              textAlign: 'center', color: 'var(--text-muted)', boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
              <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>No messages yet</p>
              <p style={{ fontSize: '0.88rem' }}>When visitors submit the contact form, their messages will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: '20px', alignItems: 'flex-start' }}>

              {/* Message list sidebar */}
              <div style={{
                background: 'var(--card-bg)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  padding: '12px 16px', background: 'var(--olive)', color: '#f5f0eb',
                  fontSize: '0.85rem', fontWeight: '600',
                }}>
                  ✉️ All Messages
                </div>
                {messages.map(msg => {
                  const isOpen = selectedMsg?._id === msg._id;
                  return (
                    <button
                      key={msg._id}
                      onClick={() => setSelectedMsg(msg)}
                      style={{
                        width: '100%', padding: '14px 16px', textAlign: 'left',
                        display: 'flex', flexDirection: 'column', gap: '3px',
                        background: isOpen ? 'var(--olive-pale)' : 'transparent',
                        border: 'none', borderBottom: '1px solid var(--border-light)',
                        cursor: 'pointer', transition: 'background 0.15s',
                        borderLeft: isOpen ? '3px solid var(--olive)' : '3px solid transparent',
                      }}
                    >
                      <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {msg.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {msg.message ? msg.message.slice(0, 40) + (msg.message.length > 40 ? '…' : '') : '(no message)'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ''}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Message detail panel */}
              <div>
                {!selectedMsg ? (
                  <div style={{
                    background: 'var(--card-bg)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)', padding: '48px 24px',
                    textAlign: 'center', color: 'var(--text-muted)', boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📩</div>
                    <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>No message selected</p>
                    <p style={{ fontSize: '0.88rem' }}>Click a message on the left to read it.</p>
                  </div>
                ) : (
                  <div style={{
                    background: 'var(--card-bg)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
                  }}>
                    {/* Message header */}
                    <div style={{
                      padding: '16px 20px', background: 'var(--olive)',
                      display: 'flex', alignItems: 'center', gap: '14px',
                    }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#f5f0eb', fontWeight: '700', fontSize: '1rem',
                      }}>
                        {selectedMsg.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#f5f0eb', fontSize: '1rem' }}>{selectedMsg.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(245,240,235,0.75)' }}>{selectedMsg.email}</div>
                      </div>
                      {selectedMsg.createdAt && (
                        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'rgba(245,240,235,0.65)' }}>
                          {new Date(selectedMsg.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Message body */}
                    <div style={{ padding: '24px 20px' }}>
                      <div style={{
                        fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px',
                      }}>
                        Message / Recommendation
                      </div>
                      <div style={{
                        background: 'var(--cream-light)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '18px 20px',
                        color: 'var(--text-main)',
                        lineHeight: '1.75',
                        fontSize: '0.96rem',
                        whiteSpace: 'pre-wrap',
                        minHeight: '120px',
                      }}>
                        {selectedMsg.message || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No message body.</span>}
                      </div>

                      {/* Read-only badge */}
                      <div style={{
                        marginTop: '20px',
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'var(--olive-pale)',
                        border: '1px solid var(--olive)',
                        borderRadius: '20px',
                        padding: '4px 14px',
                        fontSize: '0.78rem', fontWeight: '600', color: 'var(--olive-dark)',
                      }}>
                        🔒 View Only — replies are not supported
                      </div>
                    </div>
                  </div>
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
