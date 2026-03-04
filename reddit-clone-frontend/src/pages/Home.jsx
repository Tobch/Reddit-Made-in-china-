import { useEffect, useState } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import NewsSidebar from '../components/NewsSidebar';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts`);
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '24px', width: '100%' }}>
      <div className="feed-container">
        {posts.length === 0 ? (
          <div className="empty-state">
            <h2>No posts yet!</h2>
            <p>Be the first to share something interesting.</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
      
      <div className="sidebar-wrapper">
        <NewsSidebar />
      </div>
    </div>
  );
}