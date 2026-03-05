import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ users: [], communities: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Global Socket Connection for Notifications
  useEffect(() => {
    if (!user) return;

    const globalSocket = io(import.meta.env.VITE_API_URL);
    
    // Register the user to receive private notifications
    globalSocket.emit('register_user', user._id);

    // Listen for incoming notifications
    globalSocket.on('new_message_notification', (data) => {
      // Don't show a notification if we are actively chatting with that person
      if (!window.location.pathname.includes(`/chat/${data.senderUsername}`)) {
        setNotifications((prev) => [data, ...prev]);
      }
    });

    return () => {
      globalSocket.disconnect();
    };
  }, [user]);

  // Debounced Search Effect (Unchanged)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/search?q=${searchTerm}`);
          setResults(res.data);
          setShowSearchDropdown(true);
        } catch (err) {
          console.error("Search error", err);
        }
      } else {
        setResults({ users: [], communities: [] });
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifDropdown(false);
  };

  return (
    <nav className="reddit-navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon"></div>
          <span className="logo-text">reddit</span>
        </Link>
      </div>

      {/* SEARCH BAR AREA */}
      <div className="navbar-center" ref={searchRef} style={{ position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Search Reddit" 
          className="search-bar" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => { if(searchTerm) setShowSearchDropdown(true); }}
        />
        
        {showSearchDropdown && (results.users.length > 0 || results.communities.length > 0) && (
          <div className="search-dropdown">
            {results.communities.length > 0 && (
              <div className="search-section">
                <h4>Communities</h4>
                {results.communities.map(c => (
                  <Link key={c._id} to={`/community/${c._id}`} className="search-item" onClick={() => {setShowSearchDropdown(false); setSearchTerm('');}}>
                    r/{c.name}
                  </Link>
                ))}
              </div>
            )}
            {results.users.length > 0 && (
              <div className="search-section">
                <h4>Users</h4>
                {results.users.map(u => (
                  <Link key={u._id} to={`/user/${u.username}`} className="search-item" onClick={() => {setShowSearchDropdown(false); setSearchTerm('');}}>
                   <img src={u.avatar ? (u.avatar.startsWith('http') ? u.avatar : `${import.meta.env.VITE_API_URL}${u.avatar}`) : 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png'} className="search-avatar" alt="avatar"/>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right">
        {user ? (
          <div className="user-menu">
            <Link to="/create-post" className="btn-secondary" style={{ marginRight: '8px', padding: '6px 12px' }}>+</Link>
            <Link to="/create-community" className="btn-secondary" style={{ marginRight: '16px', fontSize: '12px' }}>New Community</Link>
            
            {/* NOTIFICATION BELL */}
            <div className="notification-wrapper" ref={notifRef} style={{ position: 'relative', marginRight: '16px', cursor: 'pointer' }}>
              <div onClick={() => setShowNotifDropdown(!showNotifDropdown)} style={{ fontSize: '20px' }}>
                🔔
                {notifications.length > 0 && (
                  <span className="notification-badge">{notifications.length}</span>
                )}
              </div>

              {/* NOTIFICATION DROPDOWN */}
              {showNotifDropdown && (
                <div className="search-dropdown" style={{ right: '-50px', left: 'auto', width: '250px' }}>
                  <div className="search-section">
                    <h4 style={{ display: 'flex', justifyContent: 'space-between' }}>
                      Notifications 
                      {notifications.length > 0 && <span onClick={clearNotifications} style={{ cursor: 'pointer', color: '#0079d3', textTransform: 'none' }}>Clear All</span>}
                    </h4>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '16px', fontSize: '14px', color: '#878a8c', textAlign: 'center' }}>No new messages</div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <Link 
                          key={idx} 
                          to={`/chat/${notif.senderUsername}`} 
                          className="search-item" 
                          onClick={() => {
                            // Remove this specific notification when clicked
                            setNotifications(notifications.filter((_, i) => i !== idx));
                            setShowNotifDropdown(false);
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ fontSize: '13px' }}>New message from u/{notif.senderUsername}</strong>
                            <span style={{ fontSize: '12px', color: '#7c7c7c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                              "{notif.text}"
                            </span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px', cursor: 'pointer' }}>
              <img 
                src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL}${user.avatar}`) : 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png'} 
                alt="avatar" 
                className="navbar-avatar" 
              />
              <span className="username">{user.username}</span>
            </Link>

            <button onClick={handleLogout} className="btn-primary">Log Out</button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-secondary">Log In</Link>
            <Link to="/register" className="btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}