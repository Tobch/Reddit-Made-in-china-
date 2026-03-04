import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function PostCard({ post }) {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Vote State
  const [votes, setVotes] = useState({
    upvotes: post.upvotes || [],
    downvotes: post.downvotes || []
  });
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);

  // Check if the currently logged-in user is the author of this post
  const isAuthor = user && post.author && (user._id === (post.author._id || post.author));

  const handleVote = async (value) => {
    if (!token) return alert("You must be logged in to vote!");
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/vote`, 
        { value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state with the response from server
      setVotes({
        upvotes: res.data.upvotes || [],
        downvotes: res.data.downvotes || []
      });
    } catch (err) {
      console.error("Voting failed", err);
      alert("Failed to vote. Make sure you're logged in.");
    }
  };

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/posts/${post._id}/summarize`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data.summary);
    } catch (err) {
      alert("AI Summarization failed.");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload(); // Refresh to remove the post from the feed
    } catch (err) {
      alert("Failed to delete post.");
    }
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/posts/${post._id}`, 
        { title: editTitle, content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
      window.location.reload(); // Refresh to show updated content
    } catch (err) {
      alert("Failed to update post.");
    }
  };

  return (
    <div className="post-card">
    <div className="post-votes">
        <button className="vote-btn" onClick={() => handleVote(1)}>▲</button>
        <span className="vote-count">{votes.upvotes?.length - votes.downvotes?.length || 0}</span>
        <button className="vote-btn" onClick={() => handleVote(-1)}>▼</button>
      </div>
      
      <div className="post-content-area">
        <div className="post-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <img 
            src={post.author?.avatar ? `http://localhost:5000${post.author.avatar}` : 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png'}
            alt="author avatar"
            className="post-avatar"
          />
          <span>
            Posted in <strong>r/{post.community?.name}</strong> by u/{post.author?.username} {isAuthor && "(You)"}
          </span>
        </div>
        
        {/* INLINE EDIT FORM OR STANDARD POST DISPLAY */}
        {isEditing ? (
          <div className="edit-post-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
            <input 
              type="text" 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              style={{ padding: '8px', fontSize: '16px', fontWeight: 'bold' }}
            />
            <textarea 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)} 
              style={{ padding: '8px', minHeight: '80px', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSaveEdit} className="btn-primary" style={{ padding: '4px 12px' }}>Save</button>
              <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{ padding: '4px 12px' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <Link to={`/post/${post._id}`}>
                <h3 className="post-title">{post.title}</h3>
            </Link>
            {post.content && <p className="post-body-text">{post.content}</p>}
            
            {/* Media Gallery */}
            {post.media && post.media.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: post.media.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px',
                marginTop: '12px',
                marginBottom: '12px'
              }}>
                {post.media.map((media, idx) => (
                  <div key={idx} style={{ borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-dark-hover)' }}>
                    {media.type === 'image' ? (
                      <img 
                        src={`http://localhost:5000${media.url}`} 
                        alt="post media"
                        style={{ width: '100%', height: '250px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => window.open(`http://localhost:5000${media.url}`)}
                      />
                    ) : (
                      <video 
                        src={`http://localhost:5000${media.url}`}
                        controls
                        style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="post-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={handleSummarize} className="action-btn" disabled={loading}>
            {loading ? "Thinking..." : "✨ Summarize (AI)"}
          </button>
          
          <Link to={`/post/${post._id}`} className="action-btn">
            💬 Comments
          </Link>

          {/* AUTHOR CONTROLS */}
          {isAuthor && !isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} className="action-btn" style={{ color: '#0079D3' }}>✏️ Edit</button>
              <button onClick={handleDelete} className="action-btn" style={{ color: '#D93A00' }}>🗑️ Delete</button>
            </>
          )}
        </div>

        {summary && (
          <div className="ai-summary-box">
            <strong>AI Summary:</strong>
            <p>{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}