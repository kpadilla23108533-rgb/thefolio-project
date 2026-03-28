// frontend/src/pages/CreatePostPage.js
import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES    = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const CreatePostPage = () => {
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const processFile = (file) => {
    setFileError('');
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only JPG, PNG, WebP, or GIF images are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBodyChange = (e) => {
    setBody(e.target.value);
    setCharCount(e.target.value.length);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!title || !body) {
    setError('Title and content are required.');
    return;
  }

  setLoading(true);
  const fd = new FormData();
  fd.append('title', title);
  fd.append('body', body);
  if (image) {
    fd.append('image', image); // The file object
  }

  try {
    // Note: Axios automatically sets multipart/form-data headers for FormData
    await API.post('/posts', fd);
    navigate('/home');
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to create post.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="content create-post-page">
      <div className="create-post-header">
        <h2>✏️ Write a New Post</h2>
        <p className="create-post-sub">Share your travel story with the community</p>
      </div>

      {error && (
        <div className="form-error-banner">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-post-form">

        {/* Title */}
        <div className="form-group">
          <label htmlFor="post-title" className="form-label">Post Title</label>
          <input
            id="post-title"
            type="text"
            placeholder="Give your adventure a memorable title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="form-input"
            maxLength={120}
          />
          <span className="input-hint">{title.length}/120 characters</span>
        </div>

        {/* Body */}
        <div className="form-group">
          <label htmlFor="post-body" className="form-label">Post Content</label>
          <textarea
            id="post-body"
            rows="14"
            placeholder="Tell your story... Where did you go? What did you see? What surprised you?"
            value={body}
            onChange={handleBodyChange}
            required
            className="form-input form-textarea"
          />
          <span className="input-hint">{charCount} characters · ~{Math.max(1, Math.ceil(charCount / 1000))} min read</span>
        </div>

        {/* Image upload — members and admins */}
        {user && (
          <div className="form-group">
            <label className="form-label">Cover Image <span className="form-badge">Optional</span></label>

            {/* Drop zone */}
            {!preview ? (
              <div
                className={`drop-zone${dragOver ? ' drag-over' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="drop-zone-icon">🖼️</div>
                <p className="drop-zone-text">
                  <strong>Drag & drop</strong> an image here, or <span className="drop-zone-link">click to browse</span>
                </p>
                <p className="drop-zone-sub">JPG, PNG, WebP, GIF · Max {MAX_FILE_SIZE_MB}MB</p>
                <input
                  ref={fileInputRef}
                  id="post-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="image-preview-wrap">
                <img src={preview} alt="Preview" className="image-preview" />
                <div className="image-preview-info">
                  <span className="image-preview-name">📎 {image?.name}</span>
                  <span className="image-preview-size">
                    {(image?.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button type="button" onClick={removeImage} className="remove-image-btn">
                    ✕ Remove
                  </button>
                </div>
              </div>
            )}
            {fileError && <span className="error">{fileError}</span>}
          </div>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || !!fileError}
            className="btn-publish"
          >
            {loading ? (
              <><span className="btn-spinner" /> Publishing…</>
            ) : (
              '🚀 Publish Post'
            )}
          </button>
          <Link to="/home" className="btn-cancel">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;