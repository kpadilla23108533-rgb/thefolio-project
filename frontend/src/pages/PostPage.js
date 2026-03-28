// frontend/src/pages/PostPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost]         = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get(`/posts/${id}`),
      API.get(`/comments/${id}`),
    ])
      .then(([postRes, commentRes]) => {
        setPost(postRes.data);
        setComments(commentRes.data);
      })
      .catch(() => setError('Post not found or server error.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/posts/${id}`);
      navigate('/home');
    } catch {
      alert('Failed to delete post.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await API.post(`/comments/${id}`, { body: newComment });
      setComments(prev => [...prev, data]);
      setNewComment('');
    } catch {
      alert('Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch {
      alert('Failed to delete comment.');
    }
  };

  if (loading) return <div className="content"><p>Loading post...</p></div>;
  if (error)   return <div className="content"><p style={{ color: '#7a1a1a' }}>{error}</p></div>;

  const isOwner = user && post.author?._id === user._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="content">
      {/* Post header */}
      {post.image && (
        <img
          src={`http://localhost:5000/uploads/${post.image}`}
          alt={post.title}
          style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', marginBottom: '24px' }}
        />
      )}

      <h2>{post.title}</h2>
      <p style={{ color: '#8C7E72', fontSize: '0.9rem', marginBottom: '20px' }}>
        By <strong>{post.author?.name}</strong> · {new Date(post.createdAt).toLocaleDateString()}
      </p>

      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', marginBottom: '24px' }}>
        {post.body}
      </div>

      {/* Edit / Delete — owner or admin */}
      {(isOwner || isAdmin) && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          {isOwner && (
            <Link
              to={`/edit-post/${post._id}`}
              style={{
                padding: '8px 20px',
                background: '#475522',
                color: '#E2DCD6',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
            >
              ✏️ Edit Post
            </Link>
          )}
          <button
            onClick={handleDelete}
            style={{
              padding: '8px 20px',
              background: '#b43c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            🗑️ Delete Post
          </button>
        </div>
      )}

      <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #d2b48c' }} />

      {/* Comments section */}
      <h3>Comments ({comments.length})</h3>

      {/* Add comment form — logged-in users only */}
      {user ? (
        <form onSubmit={handleCommentSubmit} style={{ marginBottom: '24px' }}>
          <textarea
            rows="3"
            placeholder="Leave a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            required
            style={{ width: '100%' }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '8px',
              padding: '10px 24px',
              background: '#475522',
              color: '#E2DCD6',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p style={{ marginBottom: '20px' }}>
          <Link to="/login" style={{ color: '#475522', fontWeight: 'bold' }}>Login</Link> to leave a comment.
        </p>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <p style={{ color: '#8C7E72', fontStyle: 'italic' }}>No comments yet. Be the first!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map(comment => {
            const canDelete = user && (comment.author?._id === user._id || isAdmin);
            return (
              <div
                key={comment._id}
                style={{
                  padding: '14px 18px',
                  border: '1px solid #d2b48c',
                  borderRadius: '8px',
                  background: 'var(--content-bg)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{comment.author?.name}</strong>
                  <small style={{ color: '#8C7E72' }}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <p style={{ margin: 0 }}>{comment.body}</p>
                {canDelete && (
                  <button
                    onClick={() => handleCommentDelete(comment._id)}
                    style={{
                      marginTop: '8px',
                      padding: '4px 12px',
                      background: 'transparent',
                      border: '1px solid #b43c3c',
                      color: '#b43c3c',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '32px' }}>
       <Link to="/home" style={{ color: 'var(--primary-blue)', fontWeight: 'bold' }}>
       ← Back to Home
      </Link>
      </div>
    </div>
  );
};

export default PostPage;