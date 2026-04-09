import { useState, useEffect } from 'react';
import API from '../api/axios';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [recommendations, setRecommendations] = useState([]); // New state for contact messages
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/admin/users'),
      API.get('/admin/posts'),
      API.get('/contact'), // Fetching the messages submitted via the ContactPage
    ])
      .then(([usersRes, postsRes, contactRes]) => {
        setUsers(usersRes.data);
        setPosts(postsRes.data);
        setRecommendations(contactRes.data);
      })
      .catch((err) => console.error("Error loading admin data:", err))
      .finally(() => setLoading(false));
  }, []);

  // ── Actions ────────────────────────────────────────────────────────
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

  // ── Style helpers (Shared) ─────────────────────────────────────────
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
  });

  const thStyle = {
    padding: '12px 14px',
    textAlign: 'left',
    background: 'var(--olive)',
    color: '#f5f0eb',
    fontSize: '0.85rem',
  };

  const tdStyle = {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border-light)',
    fontSize: '0.9rem',
  };

  if (loading) return <div className="content" style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;

  return (
    <div className="content">
      <div style={{ marginBottom: '28px' }}>
        <h2>Admin Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your community and view local recommendations.</p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button style={tabBtnStyle('users')} onClick={() => setTab('users')}>Members</button>
        <button style={tabBtnStyle('posts')} onClick={() => setTab('posts')}>Posts</button>
        <button style={tabBtnStyle('recommendations')} onClick={() => setTab('recommendations')}>Recommendations</button>
      </div>

      {/* ── Members Tab ── */}
      {tab === 'users' && (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ background: 'var(--card-bg)' }}>
                  <td style={tdStyle}><strong>{u.name}</strong><br/><small>{u.email}</small></td>
                  <td style={tdStyle}>{u.status}</td>
                  <td style={tdStyle}>
                    <button onClick={() => toggleStatus(u._id)} style={{ background: 'var(--olive)', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Recommendations Tab (Replaced Direct Messages) ── */}
      {tab === 'recommendations' && (
        <>
          <h3 style={{ marginBottom: '16px' }}>Visitor Recommendations</h3>
          {recommendations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No recommendations received yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {recommendations.map((rec) => (
                <div 
                  key={rec._id} 
                  style={{ 
                    background: 'var(--card-bg)', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ color: 'var(--olive)', fontSize: '1.1rem' }}>{rec.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
                    Email: {rec.email}
                  </div>
                  <p style={{ 
                    lineHeight: '1.6', 
                    color: 'var(--text-main)', 
                    fontStyle: rec.message ? 'normal' : 'italic',
                    background: 'var(--cream-light)',
                    padding: '12px',
                    borderRadius: '4px'
                  }}>
                    {rec.message || "No message provided."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Posts Tab ── */}
      {tab === 'posts' && (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Author</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p._id} style={{ background: 'var(--card-bg)' }}>
                  <td style={tdStyle}>{p.title}</td>
                  <td style={tdStyle}>{p.author?.name}</td>
                  <td style={tdStyle}>
                    <button onClick={() => removePost(p._id)} style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;