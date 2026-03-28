// frontend/src/pages/HomePage.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    API.get('/posts')
      .then(res => setPosts(res.data))
      .catch(() => setError('Failed to load posts. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="content">
      {/* Hero banner */}
      <div className="container" style={{ textAlign: 'center', padding: '40px 24px 28px' }}>
        <h1 style={{ marginBottom: '8px' }}>✈️ Travel Journal</h1>
        <p style={{ color: '#8C7E72', maxWidth: '520px', margin: '0 auto 20px' }}>
          Explore local gems, share your adventures, and discover stories from fellow travelers.
        </p>
        {user ? (
          <Link
            to="/create-post"
            style={{
              display: 'inline-block',
              padding: '10px 28px',
              background: '#475522',
              color: '#E2DCD6',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '0.95rem',
            }}
          >
            Write a Post
          </Link>
        ) : (
          <Link
            to="/register"
            style={{
              display: 'inline-block',
              padding: '10px 28px',
              background: '#475522',
              color: '#E2DCD6',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '0.95rem',
            }}
          >
            Join the Community
          </Link>
        )}
      </div>

      {/* Posts feed */}
      <div className="container">
        <h2 style={{ marginBottom: '20px' }}>📝 Recent Stories</h2>

        {loading && (
          <p style={{ color: '#8C7E72', fontStyle: 'italic' }}>Loading posts…</p>
        )}

        {error && (
          <p style={{
            color: '#7a1a1a',
            background: 'rgba(180,60,60,0.1)',
            padding: '12px',
            borderRadius: '8px',
          }}>
            {error}
          </p>
        )}

        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8C7E72' }}>
            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🗺️</p>
            <p>No stories yet. Be the first to share one!</p>
            {user && (
              <Link to="/create-post" style={{ color: '#475522', fontWeight: 'bold' }}>
                Write the first post →
              </Link>
            )}
          </div>
        )}

        {/* Post cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {posts.map(post => (
            <Link
              key={post._id}
              to={`/posts/${post._id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <article style={{
                border: '1px solid #d2b48c',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'var(--content-bg)',
                transition: 'box-shadow 0.2s, transform 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Cover image */}
                {post.image ? (
                  <img
                    src={`http://localhost:5000/uploads/${post.image}`}
                    alt={post.title}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100px',
                    background: 'linear-gradient(135deg, #475522, #2a8fac)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                  }}>
                    🌏
                  </div>
                )}

                {/* Card body */}
                <div style={{ padding: '18px' }}>
                  <h3 style={{
                    margin: '0 0 8px',
                    fontSize: '1.05rem',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {post.title}
                  </h3>
                  <p style={{
                    margin: '0 0 12px',
                    color: '#8C7E72',
                    fontSize: '0.88rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.6',
                  }}>
                    {post.body}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.82rem',
                    color: '#8C7E72',
                    borderTop: '1px solid #e8ddd3',
                    paddingTop: '10px',
                  }}>
                    <span>✍️ {post.author?.name || 'Unknown'}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default HomePage;