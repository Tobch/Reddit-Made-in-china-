import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import CommentItem from '../components/CommentItem';

export default function PostDetail() {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
  const fetchPostAndComments = async () => {
    try {
      const postRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/${id}`);
      const commentsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/comments/post/${id}`);
      
      const postData = postRes.data;
      setPost(postData);
      setComments(commentsRes.data);
      
      // Check if the current user is a member of the community
      if (user?._id && postData.community?.members) {
        const userIsMember = postData.community.members.some(member => {
          // Handle both object and string formats
          const memberId = typeof member === 'object' ? member._id : member;
          return String(memberId).toLowerCase() === String(user._id).toLowerCase();
        });
        
        setIsMember(userIsMember);
      }
    } catch (err) {
      console.error("Error fetching post data", err);
    }
  };
  fetchPostAndComments();
}, [id, user]);

  const handleJoinLeave = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/communities/${post.community._id}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Join/Leave response:', res.data);
      
      // Refetch the post to get updated community members
      const updatedPostRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/${id}`);
      const updatedPost = updatedPostRes.data;
      setPost(updatedPost);
      
      // Check membership with fresh data
      if (updatedPost.community?.members && user?._id) {
        const userIsMember = updatedPost.community.members.some(member => {
          const memberId = typeof member === 'object' ? member._id : member;
          const comparison = String(memberId).toLowerCase() === String(user._id).toLowerCase();
          console.log(`Comparing ${memberId} with ${user._id}: ${comparison}`);
          return comparison;
        });
        console.log('User is member after join:', userIsMember);
        setIsMember(userIsMember);
      }
      
      alert(res.data.message);
    } catch (err) {
      console.error("Error details:", err.response?.data);
      alert("Action failed. Are you logged in?");
    }
  };

  // Update this function to handle both main comments and nested replies
  const handleCommentSubmit = async (text, parentCommentId = null) => {
    if (!text || !text.trim()) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/comments/post/${id}`, 
        { text, parentCommentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refetch comments to get the newly updated tree from the DB
      const commentsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/comments/post/${id}`);
      setComments(commentsRes.data);
      
      // Only clear the main box if it was a main comment
      if (!parentCommentId) setNewComment(''); 
    } catch (err) {
      alert("Failed to post comment.");
    }
  };

    if (!post) return <div className="main-content">Loading post...</div>;

  // Helper function to build the tree
  const buildCommentTree = (flatComments) => {
    const commentMap = {};
    const roots = [];
    
    // Create a map of all comments and add an empty children array
    flatComments.forEach(c => { commentMap[c._id] = { ...c, children: [] }; });
    
    // Connect children to their parents
    flatComments.forEach(c => {
      if (c.parentComment && commentMap[c.parentComment]) {
         commentMap[c.parentComment].children.push(commentMap[c._id]);
      } else {
         roots.push(commentMap[c._id]);
      }
    });
    return roots;
  };

  // Build the tree right before rendering
  const commentTree = buildCommentTree(comments);

  return (
    <div className="post-detail-container">
      {/* Community Header with Join/Leave */}
      <div className="community-header-bar">
        <span>r/{post.community?.name}</span>
        {user && (
          <button 
            onClick={handleJoinLeave} 
            className={isMember ? "btn-secondary" : "btn-primary"}
            style={{ marginLeft: '15px', padding: '4px 12px' }}
          >
            {isMember ? "Leave" : "Join"}
          </button>
        )}
      </div>

      <PostCard post={post} />
      
      <div className="comment-section">
        {user ? (
          // Only show the comment form if they are a member
          isMember ? (
            <form 
            onSubmit={(e) => { 
                e.preventDefault(); // This stops the page from reloading!
                handleCommentSubmit(newComment); 
            }} 
            className="comment-form"
            >
            <textarea 
                placeholder="What are your thoughts?" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="btn-primary">Comment</button>
            </form>
          ) : (
            <div className="join-notice">
              <p>You must join <strong>r/{post.community?.name}</strong> to comment or post.</p>
            </div>
          )
        ) : (
          <p className="login-prompt">Log in or sign up to leave a comment</p>
        )}

        <div className="comments-list" style={{ marginTop: '20px' }}>
          {commentTree.map((comment) => (
            <CommentItem 
              key={comment._id} 
              comment={comment} 
              postId={id} 
              onReplySubmit={handleCommentSubmit} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}