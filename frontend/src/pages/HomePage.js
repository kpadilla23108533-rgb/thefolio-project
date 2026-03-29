import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts]     = useState([]); // Initialized as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // 1. Determine the Image Base URL (removes /api from the end)
  const IMAGE_BASE_URL = API.defaults.baseURL 
    ? API.defaults.baseURL.replace('/api', '') 
    : 'http://localhost:5000';

  useEffect(() => {
    API.get('/posts')
      .then(res => {
        // 2. PROTECT THE DATA: Handle both [data] and { posts: [data] }
        const data = Array.isArray(res.data) ? res.data : (res.data.posts || []);
        setPosts(data);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setError('Unable to reach the travel logs. Please try again later.');
        setPosts([]); // Ensure posts remains an array on error
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="content">
      {/* Hero Section */}
      <div className="container" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✈️ Travel Journal</h1>
        <p style={{ color: '#8C7E72', maxWidth: '600px', margin: '0 auto 30px', fontSize: '1.1rem' }}>
          Explore local gems, share your adventures, and discover stories from fellow travelers.
        </p>
        <Link
          to={user ? "/create-post" : "/register"}
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: '#475522',
            color: '#E2DCD6',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(71, 85, 34, 0.2)'
          }}
        >
          {user ? 'Share Your Story' : 'Start Your Journal'}
        </Link>
      </div>

      <div className="container">
        <h2 style={{ marginBottom: '24px', borderBottom: '2px solid #e8ddd3', pb: '10px' }}>
          📝 Recent Stories
        </h2>

        {loading && <p style={{ textAlign: 'center', color: '#8C7E72' }}>Loading adventures...</p>}

        {error && (
          <div style={{ padding: '20px', background: '#fdf2f2', border: '1px solid #facccc', borderRadius: '8px', color: '#a94442', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* 3. THE GUARDED GRID: Only map if posts is a valid array */}
        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '30px',
            paddingBottom: '60px'
          }}>
            {Array.isArray(posts) && posts.length > 0 ? (
              posts.map(post => (
                <Link key={post._id} to={`/posts/${post._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <article style={{
                    background: '#fff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #e8ddd3',
                    transition: 'all 0.3s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {post.image ? (
                      <img
                        src={`${IMAGE_BASE_URL}/uploads/${post.image}`}
                        alt={post.title}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
                      />
                    ) : (
                      <div style={{ height: '200px', background: '#f5f1ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                        🌏
                      </div>
                    )}

                    <div style={{ padding: '20px' }}>
                      <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', color: '#2c3e50' }}>{post.title}</h3>
                      <p style={{ color: '#7f8c8d', fontSize: '0.9rem', lineHeight: '1.6', height: '4.8em', overflow: 'hidden' }}>
                        {post.body}
                      </p>
                      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#95a5a6' }}>
                        <span>👤 {post.author?.username || 'Traveler'}</span>
                        <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px' }}>
                <p style={{ fontSize: '1.2rem', color: '#95a5a6' }}>The map is currently empty. Be the first to add a pin!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default HomePage;