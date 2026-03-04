import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Community from './pages/Community';
import CreateCommunity from './pages/CreateCommunity';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Chat from './pages/Chat';

function App() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', background: 'var(--bg-dark-p)' }}>
      <Navbar />
      
      {/* Updated layout with only 2 children: Sidebar and Main */}
      <div className="main-layout">
        <Sidebar />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-community" element={<CreateCommunity />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:username" element={<UserProfile />} />
            <Route path="/community/:id" element={<Community />} />
            <Route path="/chat/:username" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;