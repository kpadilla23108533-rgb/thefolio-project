import { useState, useEffect } from 'react';
import API from '../api/axios';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching all admin data in parallel
        const [usersRes, postsRes, contactRes] = await Promise.all([
          API.get('/admin/users'),
          API.get('/admin/posts'),
          API.get('/contact'), 
        ]);

        setUsers(usersRes.data);
        setPosts(postsRes.data);
        setRecommendations(contactRes.data);
      } catch (err) {
        console.error("Error loading admin data:", err);
        setError('Failed to load dashboard data. Please check your permissions.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Actions ── */
  const toggleStatus = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/status`);
      setUsers(prev => prev.map(u => u._id === id ? data.user : u));
    } catch {
      alert('Failed to update user status.');
    }
  };

  const removePost = async (id) => {
    if (!window.confirm('Mark this post as removed?')) return;
    try {
      await API.put(`/admin/posts/${id}/remove`);
      setPosts(prev => prev.map(p => p._id === id ? { ...p, status: 'removed' } : p));
    } catch {
      alert('Failed to remove post.');
    }
  };

  const deleteRecommendation = async (id) => {
    if (!window.confirm('Delete this recommendation forever?')) return;
    try {
      await API.delete(`/contact/${id}`);
      setRecommendations(prev => prev.filter(r => r._id !== id));
    } catch {
      alert('Failed to delete recommendation.');
    }
  };

  /* ── Styles ── */
  const tabBtnStyle = (active) => ({
    padding: '12px 24px',
    background: active ? 'var(--olive)' : 'transparent',
    color: active ? '#f5f0eb' : 'var(--text-main)',
    border: '2px solid var(--olive)',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
  });

  const tableHeaderStyle = {
    padding: '15px',
    textAlign: 'left',
    background: 'var(--olive)',
    color: '#fff',
    fontSize: '0.9rem',
  };

  if (loading) return <div className="content" style={{ textAlign: 'center', padding: '100px' }}>Loading Admin Dashboard...</div>;

  return (
    <main className="main-content">
      <div className="content">
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-main)' }}>🛡️ Admin Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Overview of community members, content, and visitor feedback.</p>
        </div>

        {error && <div style={{ color: '#e53935', background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '35px' }}>
          <button onClick={() => setTab('users')} style={tabBtnStyle(tab === 'users')}>Members</button>
          <button onClick={() => setTab('posts')} style={tabBtnStyle(tab === 'posts')}>Posts</button>
          <button onClick={() => setTab('recommendations')} style={tabBtnStyle(tab === 'recommendations')}>
            Recommendations {recommendations.length > 0 && `(${recommendations.length})`}
          </button>
        </div>

        {/* ── Members Tab ── */}
        {tab === 'users' && (
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--card-bg)' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>User Details</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '700' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                        background: u.status === 'active' ? '#e8f5e9' : '#ffebee',
                        color: u.status === 'active' ? '#2e7d32' : '#c62828'
                      }}>
                        {u.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      {u.role !== 'admin' ? (
                        <button 
                          onClick={() => toggleStatus(u._id)}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'var(--olive)', color: 'white' }}
                        >
                          Toggle Status
                        </button>
                      ) : <span style={{ opacity: 0.5 }}>Admin</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Posts Tab ── */}
        {tab === 'posts' && (
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--card-bg)' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Post Title</th>
                  <th style={tableHeaderStyle}>Author</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: '30px', textAlign: 'center', opacity: 0.5 }}>No posts found.</td></tr>
                ) : (
                  posts.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '15px', fontWeight: '600' }}>{p.title}</td>
                      <td style={{ padding: '15px' }}>{p.author?.name || 'Anonymous'}</td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <button 
                          onClick={() => removePost(p._id)}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #c62828', background: 'transparent', color: '#c62828', cursor: 'pointer' }}
                        >
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

        {/* ── Recommendations Tab ── */}
        {tab === 'recommendations' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {recommendations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', background: 'var(--card-bg)', borderRadius: '12px', opacity: 0.6 }}>
                No visitor recommendations yet.
              </div>
            ) : (
              recommendations.map(rec => (
                <div key={rec._id} style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-light)', position: 'relative' }}>
                  <button 
                    onClick={() => deleteRecommendation(rec._id)}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    🗑️
                  </button>
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--olive)' }}>{rec.name}</strong>
                    <span style={{ margin: '0 10px', opacity: 0.3 }}>|</span>
                    <small style={{ color: 'var(--text-muted)' }}>{rec.email}</small>
                  </div>
                  <p style={{ margin: 0, padding: '15px', background: 'var(--cream-light)', borderRadius: '8px', fontStyle: 'italic', color: 'var(--text-main)' }}>
                    "{rec.message || "No content provided."}"
                  </p>
                  <div style={{ marginTop: '15px', fontSize: '0.75rem', opacity: 0.5, textAlign: 'right' }}>
                    Received: {new Date(rec.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminPage;