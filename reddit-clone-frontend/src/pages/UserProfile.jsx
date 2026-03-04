import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';

export default function UserProfile() {
  const { username } = useParams();
  const { user } = useContext(AuthContext);
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const userRes = await axios.get(`http://localhost:5000/api/users/${username}`);
        const postsRes = await axios.get(`http://localhost:5000/api/posts/user/${username}`);
        
        setProfileUser(userRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndPosts();
  }, [username]);

  if (loading) return <div className="main-content">Loading profile...</div>;
  if (!profileUser) return <div className="main-content">User not found.</div>;

  return (
    <div className="main-content" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
      
      {/* Left Column: Post Feed */}
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: '16px' }}>Posts by u/{profileUser.username}</h3>
        {posts.length === 0 ? (
          <p>This user hasn't posted anything yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {posts.map(post => <PostCard key={post._id} post={post} />)}
          </div>
        )}
      </div>

      {/* Right Column: User Info Sidebar */}
      <div style={{ width: '300px' }}>
        <div className="auth-card" style={{ padding: '20px', textAlign: 'center' }}>
          <img 
            src={profileUser.avatar ? `http://localhost:5000${profileUser.avatar}` : 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png'} 
            alt="avatar" 
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }}
          />
          <h2>u/{profileUser.username}</h2>
          {profileUser.bio && <p style={{ fontSize: '14px', color: '#7c7c7c', marginTop: '10px' }}>{profileUser.bio}</p>}
          
          {/* CHAT BUTTON */}
          {user && user.username !== profileUser.username && (
            <Link 
              to={`/chat/${profileUser.username}`} 
              className="btn-primary" 
              style={{ display: 'inline-block', marginTop: '15px', padding: '8px 24px' }}
            >
              💬 Chat
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}