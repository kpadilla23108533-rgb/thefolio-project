import { useState, useEffect } from 'react';
import API from '../api/axios';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ur, pr, mr] = await Promise.allSettled([
          API.get('/admin/users'),
          API.get('/admin/posts'),
          API.get('/admin/messages'),
        ]);

        // Using fulfilled checks to ensure partial data still loads
        if (ur.status === 'fulfilled') setUsers(ur.value.data);
        if (pr.status === 'fulfilled') setPosts(pr.value.data);
        if (mr.status === 'fulfilled') setMessages(mr.value.data);
      } catch (err) {
        setError('Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Handlers ── */
  const toggleStatus = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/status`);
      setUsers(prev => prev.map(u => u._id === id ? data.user : u));
    } catch { alert('Failed to update user status.'); }
  };

  const removePost = async (id) => {
    if (!window.confirm('Mark this post as removed?')) return;
    try {
      await API.put(`/admin/posts/${id}/remove`);
      setPosts(prev => prev.map(p => p._id === id ? { ...p, status: 'removed' } : p));
    } catch { alert('Failed to remove post.'); }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message forever?')) return;
    try {
      await API.delete(`/admin/messages/${id}`);
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch { alert('Failed to delete message.'); }
  };

  /* ── Stats Calculations ── */
  const activeUsers = users.filter(u => u.status === 'active').length;
  const deactivatedUsers = users.filter(u => u.status !== 'active' && u.role !== 'admin').length;

  /* ── Modern Styles ── */
  const navContainerStyle = {
    display: 'inline-flex',
    background: 'rgba(0, 0, 0, 0.05)',
    padding: '6px',
    borderRadius: '14px',
    marginBottom: '35px',
    border: '1px solid var(--border-clr)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  };

  const navButtonStyle = (active) => ({
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.3s ease',
    background: active ? 'var(--snd-bg-color)' : 'transparent',
    color: active ? '#fff' : 'var(--text-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  const cardStyle = {
    background: 'var(--content-bg)',
    border: '1px solid var(--border-clr)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    transition: 'transform 0.2s',
  };

  if (loading) return <div className="content" style={{textAlign: 'center', padding: '50px'}}>Loading Admin Dashboard...</div>;

  return (
    <main className="main-content">
      <div className="content">
        <h2 style={{ marginBottom: '25px' }}>🛡️ Admin Management</h2>

        {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

        {/* Dashboard Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: 'Total Members', value: users.length, icon: '👥', color: 'var(--text-color)' },
            { label: 'Active', value: activeUsers, icon: '✅', color: '#2e7d32' },
            { label: 'Deactivated', value: deactivatedUsers, icon: '🚫', color: '#e53935' },
            { label: 'Messages', value: messages.length, icon: '✉️', color: '#1976d2' },
          ].map(card => (
            <div 
                key={card.label} 
                style={cardStyle} 
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} 
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{card.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: card.color }}>{card.value}</div>
              <div style={{ opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase' }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={navContainerStyle}>
          <button onClick={() => setTab('users')} style={navButtonStyle(tab === 'users')}>
            <span>👥</span> Members
          </button>
          <button onClick={() => setTab('posts')} style={navButtonStyle(tab === 'posts')}>
            <span>📝</span> Posts
          </button>
          <button onClick={() => setTab('messages')} style={navButtonStyle(tab === 'messages')}>
            <span>✉️</span> Inbox 
            {messages.length > 0 && (
              <span style={{ marginLeft: '8px', background: tab === 'messages' ? 'rgba(255,255,255,0.3)' : 'var(--snd-bg-color)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', color: 'white' }}>
                {messages.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Area */}
        <div style={{ background: 'var(--content-bg)', border: '1px solid var(--border-clr)', borderRadius: '15px', padding: '25px' }}>
          
          {/* Members Table */}
          {tab === 'users' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-clr)' }}>
                    <th style={{ textAlign: 'left', padding: '15px' }}>Member</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '15px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-clr)' }}>
                      <td style={{ padding: '15px' }}>
                        <strong>{u.name}</strong><br/><small style={{opacity: 0.6}}>{u.email}</small>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800',
                          background: u.status === 'active' ? 'rgba(46,125,50,0.1)' : 'rgba(229,57,53,0.1)',
                          color: u.status === 'active' ? '#2e7d32' : '#e53935'
                        }}>
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        {u.role !== 'admin' ? (
                          <button onClick={() => toggleStatus(u._id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: 'white', background: u.status === 'active' ? '#e53935' : '#2e7d32' }}>
                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Posts Table */}
          {tab === 'posts' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-clr)' }}>
                    <th style={{ textAlign: 'left', padding: '15px' }}>Post Title</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>Author</th>
                    <th style={{ textAlign: 'right', padding: '15px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px', opacity: 0.5 }}>No posts found.</td></tr>
                  ) : (
                    posts.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid var(--border-clr)' }}>
                        <td style={{ padding: '15px', fontWeight: '600' }}>{p.title}</td>
                        <td style={{ padding: '15px' }}>{p.author?.name || 'Unknown Author'}</td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                          <button onClick={() => removePost(p._id)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e53935', background: 'none', color: '#e53935', cursor: 'pointer' }}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Inbox Content */}
          {tab === 'messages' && (
            <div style={{ display: 'grid', gap: '15px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', opacity: 0.5 }}>Your inbox is empty.</div>
              ) : (
                messages.map(m => (
                  <div key={m._id} style={{ border: '1px solid var(--border-clr)', padding: '20px', borderRadius: '12px', position: 'relative' }}>
                    <button onClick={() => deleteMessage(m._id)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>{m.name}</strong> <small style={{ opacity: 0.6 }}>({m.email})</small>
                    </div>
                    <p style={{ margin: 0, padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', fontStyle: 'italic' }}>"{m.message}"</p>
                    <div style={{ textAlign: 'right', fontSize: '0.7rem', opacity: 0.4, marginTop: '10px' }}>
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

export default AdminPage;