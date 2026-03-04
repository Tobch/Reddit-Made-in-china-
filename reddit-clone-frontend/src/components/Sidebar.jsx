import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar() {
  const [communities, setCommunities] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/communities');
        setCommunities(res.data);
      } catch (err) {
        print("Error fetching sidebar communities:", err);
      }
    };
    fetchCommunities();
  }, []);

  // Separate communities into "Joined" and "Others"
  const joinedCommunities = communities.filter(c => 
    c.members.includes(user?._id)
  );
  
  const otherCommunities = communities.filter(c => 
    !c.members.includes(user?._id)
  );

  return (
    <aside className="reddit-sidebar">
      <div className="sidebar-section">
        <p className="sidebar-label">FEEDS</p>
        <Link to="/" className="sidebar-link">🏠 Home</Link>
      </div>

      {user && joinedCommunities.length > 0 && (
        <div className="sidebar-section">
          <p className="sidebar-label">YOUR COMMUNITIES</p>
          {joinedCommunities.map(c => (
            <Link key={c._id} to={`/community/${c._id}`} className="sidebar-link">
              r/{c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="sidebar-section">
        <p className="sidebar-label">EXPLORE</p>
        {otherCommunities.map(c => (
          <Link key={c._id} to={`/community/${c._id}`} className="sidebar-link">
            r/{c.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}