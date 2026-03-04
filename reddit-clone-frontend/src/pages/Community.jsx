import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';

export default function Community() {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const commRes = await axios.get(`http://localhost:5000/api/communities/${id}`);
        const postsRes = await axios.get(`http://localhost:5000/api/posts/community/${id}`);
        
        setCommunity(commRes.data);
        setPosts(postsRes.data);

        // Check membership
        if (user?._id && commRes.data.members) {
          const userIsMember = commRes.data.members.some(memberId => 
            String(memberId).trim() === String(user._id).trim()
          );
          setIsMember(userIsMember);
        }
      } catch (err) {
        console.error("Error fetching community data", err);
      }
    };
    fetchCommunityData();
  }, [id, user]);

  const handleJoinLeave = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/communities/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsMember(!isMember);
      setCommunity(res.data.community); // Update to get the fresh member count
    } catch (err) {
      alert("Action failed. Are you logged in?");
    }
  };

  if (!community) return <div className="main-content">Loading community...</div>;

  return (
    <div className="main-content" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
      
      {/* Left Column: Post Feed */}
      <div style={{ flex: 1 }}>
        <div className="community-header-bar" style={{ marginBottom: '16px' }}>
          <h2>r/{community.name}</h2>
          {user && (
            <button 
              onClick={handleJoinLeave} 
              className={isMember ? "btn-secondary" : "btn-primary"}
              style={{ marginLeft: '15px', padding: '6px 16px' }}
            >
              {isMember ? "Leave" : "Join"}
            </button>
          )}
        </div>

        {posts.length === 0 ? (
          <p>There are no posts here yet. Be the first!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {posts.map(post => <PostCard key={post._id} post={post} />)}
          </div>
        )}
      </div>

      {/* Right Column: Community Info Sidebar */}
      <div style={{ width: '300px' }}>
        <div className="auth-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '10px' }}>About Community</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '15px' }}>{community.description}</p>
          <div style={{ borderTop: '1px solid #edeff1', paddingTop: '10px', fontSize: '14px' }}>
            <strong>{community.members?.length || 0}</strong> Members
          </div>
        </div>
      </div>

    </div>
  );
}