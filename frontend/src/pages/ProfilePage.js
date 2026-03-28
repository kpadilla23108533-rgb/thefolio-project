// frontend/src/pages/ProfilePage.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio]   = useState(user?.bio  || '');
  const [pic, setPic]   = useState(null);

  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const [profileMsg, setProfileMsg]     = useState('');
  const [profileError, setProfileError] = useState('');
  const [passMsg, setPassMsg]           = useState('');
  const [passError, setPassError]       = useState('');

  const picSrc = user?.profilePic
    ? `http://localhost:5000/uploads/${user.profilePic}`
    : null;

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    const fd = new FormData();
    fd.append('name', name);
    fd.append('bio', bio);
    if (pic) fd.append('profilePic', pic);
    try {
      const { data } = await API.put('/auth/profile', fd);
      setUser(data);
      setProfileMsg('✅ Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassError('');
    // FIX: validate min 8 chars on frontend to match the backend rule
    if (newPw.length < 8) {
      setPassError('New password must be at least 8 characters.');
      return;
    }
    try {
      await API.put('/auth/change-password', {
        currentPassword: curPw,
        newPassword: newPw,
      });
      setPassMsg('✅ Password changed successfully!');
      setCurPw('');
      setNewPw('');
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const msgStyle = (isError) => ({
    padding: '10px 16px',
    borderRadius: '8px',
    marginBottom: '12px',
    fontWeight: '600',
    background: isError ? 'rgba(220, 53, 69, 0.12)' : 'rgba(71, 85, 34, 0.12)',
    border: `1px solid ${isError ? '#b43c3c' : '#475522'}`,
    color: isError ? '#b43c3c' : '#475522',
  });

  return (
    <div className="content">
      <h2>My Profile</h2>

      {/* Profile picture preview */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        {picSrc ? (
          <img
            src={picSrc}
            alt="Profile"
            style={{
              width: '100px', height: '100px',
              borderRadius: '50%', objectFit: 'cover',
              border: '3px solid #223555',
            }}
          />
        ) : (
          <div style={{
            width: '100px', height: '100px',
            borderRadius: '50%', background: '#224d55',
            color: '#E2DCD6', fontSize: '2.5rem',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid #2D221A',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <p style={{ marginTop: '8px', color: '#8C7E72', fontSize: '0.9rem' }}>
          {user?.email} · <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
        </p>
      </div>

      {/* ── Edit Profile Form ── */}
      <section style={{ marginBottom: '40px' }}>
        <h3>Edit Profile</h3>
        {profileMsg   && <p style={msgStyle(false)}>{profileMsg}</p>}
        {profileError && <p style={msgStyle(true)}>{profileError}</p>}
        <form onSubmit={handleProfile}>
          <label htmlFor="p-name">Display Name:</label>
          <input
            id="p-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your display name"
          />

          <label htmlFor="p-bio">Short Bio:</label>
          <textarea
            id="p-bio"
            rows="3"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
          />

          <label htmlFor="p-pic">Change Profile Picture:</label>
          <input
            id="p-pic"
            type="file"
            accept="image/*"
            onChange={e => setPic(e.target.files[0])}
          />

          <input type="submit" id="newcolor" value="Save Profile" />
        </form>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid #d2b48c', marginBottom: '32px' }} />

      {/* ── Change Password Form ── */}
      <section>
        <h3>Change Password</h3>
        {passMsg   && <p style={msgStyle(false)}>{passMsg}</p>}
        {passError && <p style={msgStyle(true)}>{passError}</p>}
        <form onSubmit={handlePassword}>
          <label htmlFor="cur-pw">Current Password:</label>
          <input
            id="cur-pw"
            type="password"
            placeholder="Enter current password"
            value={curPw}
            onChange={e => setCurPw(e.target.value)}
            required
          />

          {/* FIX: label and minLength now correctly say 8 (was 6) */}
          <label htmlFor="new-pw">New Password (min 8 characters):</label>
          <input
            id="new-pw"
            type="password"
            placeholder="Enter new password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            required
            minLength={8}
          />

          <input type="submit" id="newcolor" value="Change Password" />
        </form>
      </section>
    </div>
  );
};

export default ProfilePage;