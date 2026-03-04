import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const { user, token, login } = useContext(AuthContext);
  
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch the latest user data (including avatar) when the page loads
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsername(res.data.username);
        setEmail(res.data.email);
        if (res.data.avatar) {
          setPreview(res.data.avatar.startsWith('http') ? res.data.avatar : `${import.meta.env.VITE_API_URL}${res.data.avatar}`);
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // Handle file selection and create a preview URL
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    // Must use FormData when uploading files
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    if (file) {
      formData.append('avatar', file);
    }

    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      // Update global context so the Navbar instantly sees the new name/avatar
      login(res.data, token); 
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile.");
    }
  };

  if (!user) return <div className="main-content">Please log in to view your profile.</div>;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ width: '500px' }}>
        <h2>User Profile</h2>
        {message && <div className={message.includes('success') ? "success-message" : "error-message"}>{message}</div>}
        
        <form onSubmit={handleUpdate} className="auth-form" style={{ marginTop: '20px' }}>
          
          <div className="avatar-section" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img 
              src={preview || 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png'} 
              alt="Avatar Preview" 
              className="avatar-preview"
            />
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ marginTop: '10px' }}
            />
          </div>

          <label>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          
          <button type="submit" className="btn-primary full-width">Save Changes</button>
        </form>
      </div>
    </div>
  );
}