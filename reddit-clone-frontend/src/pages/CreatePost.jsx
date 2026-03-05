import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunities = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/communities`);
      const joinedOnly = res.data.filter(c => 
        c.members.includes(user?._id)
      );
      setCommunities(joinedOnly);
      if (joinedOnly.length > 0) setSelectedCommunity(joinedOnly[0]._id);
    };
    if (user) fetchCommunities();
  }, [user]);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      const isImage = f.type.startsWith('image/');
      const isVideo = f.type.startsWith('video/');
      const isUnder50MB = f.size <= 50 * 1024 * 1024;
      return (isImage || isVideo) && isUnder50MB;
    });

    if (validFiles.length + mediaFiles.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }

    setMediaFiles([...mediaFiles, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMediaPreviews(prev => [...prev, {
          src: event.target.result,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('communityId', selectedCommunity);
      
      // Add all media files
      mediaFiles.forEach(file => {
        formData.append('media', file);
      });

      await axios.post(`${import.meta.env.VITE_API_URL}/api/posts`, 
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`
          } 
        }
      );
      navigate('/');
    } catch (err) {
      alert("Failed to create post: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="auth-card" style={{ margin: 'auto', width: '600px' }}>
      <h2>Create a Post</h2>
      
      {communities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
            You haven't joined any communities yet. You must be a member of a community to post there.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="btn-secondary"
          >
            Browse Communities
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>
            Choose a community
          </label>
          <select 
            value={selectedCommunity} 
            onChange={e => setSelectedCommunity(e.target.value)}
            style={{ 
              padding: '10px', 
              marginBottom: '15px', 
              borderRadius: '4px', 
              border: '1px solid var(--border)',
              background: 'var(--bg-dark-hover)',
              color: 'var(--text-main)',
              fontFamily: 'inherit'
            }}
          >
            {communities.map(c => (
              <option key={c._id} value={c._id}>
                r/{c.name}
              </option>
            ))}
          </select>

          <input 
            placeholder="Title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            style={{ marginBottom: '15px' }}
          />

          <textarea 
            placeholder="Text (optional)" 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            style={{ 
              padding: '12px', 
              minHeight: '150px', 
              marginBottom: '20px',
              fontFamily: 'inherit',
              resize: 'vertical',
              background: 'var(--bg-dark-hover)',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              borderRadius: '4px'
            }}
          />

          {/* Media Upload Section */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              📸 Add Photos or Videos (up to 5, 50MB each)
            </label>
            <input 
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaChange}
              disabled={mediaFiles.length >= 5}
              style={{ 
                padding: '10px',
                border: '2px dashed var(--border)',
                borderRadius: '4px',
                cursor: mediaFiles.length >= 5 ? 'not-allowed' : 'pointer',
                opacity: mediaFiles.length >= 5 ? 0.5 : 1
              }}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {mediaFiles.length}/5 files selected
            </p>
          </div>

          {/* Media Previews */}
          {mediaPreviews.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '10px',
              marginBottom: '20px'
            }}>
              {mediaPreviews.map((preview, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  {preview.type === 'image' ? (
                    <img 
                      src={preview.src} 
                      alt="preview"
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <video 
                      src={preview.src}
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(idx)}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={uploading}
            >
              {uploading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
